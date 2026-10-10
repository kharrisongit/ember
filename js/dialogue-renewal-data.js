/* Authored in assets/dialogue/renewal; rebuild with tools/build-dialogue-renewal.mjs. */
const DIALOGUE_RENEWAL_CAST = {
  "Hettie": {
    "name": "Hettie",
    "home": "Millwood",
    "role": "Cattle farmer",
    "source": "01-millwood.txt:2",
    "topics": [
      {
        "title": "The milk argument",
        "opening": "Why does everyone argue about whose milk is best?",
        "first": "Joss says our milk tastes of clover. Tam says grass. I said it tastes of getting up before either of them.",
        "replies": [
          [
            "What did they say to that?",
            "Asked for another jug. Critics are thirsty people."
          ],
          [
            "Can you tell the difference?",
            "Between pastures, yes. Between their opinions, no."
          ],
          [
            "I'd have said milk.",
            "And that's why you're welcome at breakfast."
          ]
        ]
      },
      {
        "title": "Hettie's day off",
        "opening": "What would you do with a whole day off?",
        "first": "I'd go somewhere nobody knew me. Order an enormous breakfast. Let someone else ask whether I'd had enough.",
        "replies": [
          [
            "Would you get bored?",
            "By noon, probably. But I mean to enjoy the morning."
          ],
          [
            "You could do that here.",
            "Here they'd ask me to look at a sick hen between courses."
          ],
          [
            "Would you take Gwil?",
            "If he promised to discuss something besides the farm. We've yet to agree on a subject."
          ]
        ]
      },
      {
        "title": "An unwelcome title",
        "opening": "Who started calling you the mayor of the cows?",
        "first": "Hal. At a wedding. He made a speech and everything. I hadn't even finished my pudding.",
        "replies": [
          [
            "Did you give a speech back?",
            "I thanked my constituents. One had just eaten his hat."
          ],
          [
            "Do you mind the name?",
            "Only when people say it instead of listening to me."
          ],
          [
            "It does sound quite important.",
            "Then remember it next time I ask you to shut a gate."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, have you been eating Nan's burnt bits again? She says you prefer them.",
      "I prefer them to telling her they're burnt.",
      "Ah, my favourite interruption.",
      "I'll try to live up to it.",
      "Good heavens. Does Nan know about the dragon?",
      "She's getting used to the idea. Slowly."
    ]
  },
  "Gwil": {
    "name": "Gwil",
    "home": "Millwood",
    "role": "Farmhand and woodworker",
    "source": "01-millwood.txt:7",
    "topics": [
      {
        "title": "The village play",
        "opening": "Were you really a tree in Nan's village play?",
        "first": "An oak. Three evenings of rehearsal, and my only direction was to stop scratching.",
        "replies": [
          [
            "Why did you agree?",
            "Nan said I had presence. She meant I was wide enough to hide the curtain."
          ],
          [
            "Did the play go well?",
            "Until a child tried to climb me. I broke character rather loudly."
          ],
          [
            "Would you do it again?",
            "Only as something with a chair. A seated oak, perhaps."
          ]
        ]
      },
      {
        "title": "The missing whistle",
        "opening": "Why don't you whistle while you work anymore?",
        "first": "Swallowed a fly halfway through a tune. Put me off the whole performance.",
        "replies": [
          [
            "Surely not forever?",
            "I'm considering humming. Less room for an audience to get in."
          ],
          [
            "Was it a good tune?",
            "It had been. The ending surprised everyone."
          ],
          [
            "Hettie must miss it.",
            "She said the peace was lovely. Rather too quickly, I thought."
          ]
        ]
      },
      {
        "title": "A secret purchase",
        "opening": "Have you ever bought something completely useless?",
        "first": "A telescope. Wanted to see the moon properly. Spent my first evening looking through the wrong end.",
        "replies": [
          [
            "What did you see?",
            "A very disappointing moon. Excellent distance on it, though."
          ],
          [
            "Do you still have it?",
            "At home. Clear nights, I drag a stool outside and forget my back aches."
          ],
          [
            "Could I look sometime?",
            "When we're both home on a clear evening, ask me. No promises from the weather."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin! Tell me you've come with gossip. Mine's gone stale.",
      "How old is it?",
      "Still here, lad. Still claiming I'm nearly finished.",
      "Does Hettie believe that yet?",
      "I was about to ask you to lend a hand. You've brought rather more than that.",
      "I'll do the lifting. He gets distracted."
    ]
  },
  "Odo": {
    "name": "Odo",
    "home": "Millwood",
    "role": "Fisher and Calder's grandfather",
    "source": "01-millwood.txt:12",
    "topics": [
      {
        "title": "The birthday lie",
        "opening": "How old are you actually, Odo?",
        "first": "Old enough to have stopped correcting people. Someone gave me an extra birthday once. Nice cake. Seemed rude to object.",
        "replies": [
          [
            "You accepted the presents too?",
            "I wasn't going to embarrass them by stopping halfway."
          ],
          [
            "Does Calder know?",
            "He knows the proper date. He's threatened to count my rings."
          ],
          [
            "Nan would know.",
            "Nan knows far too much. Don't involve her."
          ]
        ]
      },
      {
        "title": "The wedding speech",
        "opening": "Why does Nan laugh about your wedding speech?",
        "first": "Because I proposed a toast to the wrong bride. I'd rehearsed with my sister's name and couldn't get rid of it.",
        "replies": [
          [
            "What did the bride do?",
            "Said she'd answer to anything if I'd sit down."
          ],
          [
            "Were you nervous?",
            "Terrified. Fish never ask you to address a room."
          ],
          [
            "Did you finish the speech?",
            "Mercifully, no. Someone started clapping and rescued the marriage."
          ]
        ]
      },
      {
        "title": "A place at supper",
        "opening": "Do you ever wish Calder lived closer?",
        "first": "There's a cup I still put out for him sometimes. Force of habit. I put it back before anyone comes in.",
        "replies": [
          [
            "You can miss him, Odo.",
            "I know, lad. Doesn't mean I want him to see it every time he leaves."
          ],
          [
            "Have you told him?",
            "In a letter. It took up less space than I expected."
          ],
          [
            "Does he visit much?",
            "When he can. He comes hungry, which is considerate of him."
          ]
        ]
      }
    ],
    "greetings": [
      "Don't tell me the time, Corin. I'm having a very good morning in ignorance.",
      "I'll let it stay morning, then.",
      "Ah, you again. I was just winning an argument with myself.",
      "Which side were you on?",
      "That dragon looks interested in my catch. So am I. We may have a problem.",
      "I'll explain the ownership rules."
    ]
  },
  "Elder Maddock": {
    "name": "Elder Maddock",
    "home": "Millwood",
    "role": "Elder and Corin's mentor",
    "source": "01-millwood.txt:17",
    "topics": [
      {
        "title": "A locked drawer",
        "opening": "Why did you keep your old letters tied up?",
        "first": "Because untied letters get read. I wasn't always proud of the fellow who wrote my half of them.",
        "replies": [
          [
            "Have you read them since?",
            "Yes. He was less foolish than I remembered. More frightened, mostly."
          ],
          [
            "Who were they from?",
            "People I thought I'd have years to answer."
          ],
          [
            "Would you throw them out?",
            "No. I've forgiven him enough to keep them."
          ]
        ]
      },
      {
        "title": "Maddock's temper",
        "opening": "Did Nan ever stop speaking to you?",
        "first": "For nine days. I'd said she worried too much. On the tenth, I discovered how much she did without mentioning it.",
        "replies": [
          [
            "Did you apologise?",
            "On day two. Being sorry didn't entitle me to be forgiven immediately."
          ],
          [
            "What made her speak again?",
            "She asked whether I intended to eat that dreadful stew. I chose to hear affection."
          ],
          [
            "What had you done?",
            "Made light of something that frightened her. It's an easy cruelty when you're not the frightened one."
          ]
        ]
      },
      {
        "title": "The names beneath the crown",
        "opening": "Why are there so few stories about the riders as people?",
        "first": "Halvard wants six rivals remembered, not six people he betrayed at Wingfall. It makes the silence easier to defend.",
        "replies": [
          [
            "What should we remember instead?",
            "That they trusted him. Betrayal needs that part, however inconvenient it is to the victor."
          ],
          [
            "Did you know any of them?",
            "No. I won't borrow someone else's grief to make my account sound weightier."
          ],
          [
            "Can their stories come back?",
            "Some can. Listen for names when people speak. Names survive in surprising places."
          ]
        ]
      },
      {
        "title": "A frightened adviser",
        "opening": "Do you ever give advice you're afraid to follow yourself?",
        "first": "Frequently. Courage is much easier to recommend from a comfortable room.",
        "replies": [
          [
            "Then how can I trust you?",
            "Ask me what I would risk. And whether I'm asking you to risk more."
          ],
          [
            "Are you afraid for me?",
            "Yes, Corin. I can say that without deciding your life for you."
          ],
          [
            "I'm frightened too.",
            "Then neither of us needs to waste strength pretending otherwise."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. Good. I've been arguing with a thought and could use another person.",
      "Am I allowed to take the thought's side?",
      "You've found me in a charitable mood. Ask before it passes.",
      "I'll try not to waste it.",
      "Well, Corin. I imagine privacy has become rather difficult.",
      "He does notice when I try to slip away."
    ]
  },
  "Nan Ferrow": {
    "name": "Nan Ferrow",
    "home": "Millwood",
    "role": "Corin's grandmother",
    "source": "01-millwood.txt:23",
    "topics": [
      {
        "title": "The borrowed surname",
        "opening": "Did Mum ever get into trouble she couldn't talk her way out of?",
        "first": "She gave a neighbour a false name after breaking his window. Unfortunately, she borrowed mine.",
        "replies": [
          [
            "He came to you?",
            "With the bill. I said my throwing arm must be improving."
          ],
          [
            "What did you do to her?",
            "Made her tell him herself. She spent longer outside his door than she'd spent inventing the lie."
          ],
          [
            "Was she sorry?",
            "Very. Mostly because he'd been kind about it. That finished her."
          ]
        ]
      },
      {
        "title": "Dad's terrible dancing",
        "opening": "Was Dad any good at dancing?",
        "first": "Your father counted out loud. Your mother said she felt as though she were being measured for curtains.",
        "replies": [
          [
            "Did she dance with him anyway?",
            "Always. She'd pull him out before he could invent an excuse."
          ],
          [
            "Did he ever get better?",
            "He got quieter. We counted that as progress."
          ],
          [
            "I wish I'd seen them.",
            "So do I, darling. They laughed a great deal together."
          ]
        ]
      },
      {
        "title": "My first word",
        "opening": "What was the first thing I called you?",
        "first": "You called everyone Nan for a while. Even Maddock. He answered without a murmur.",
        "replies": [
          [
            "That must have pleased him.",
            "He said it was a promotion."
          ],
          [
            "When did I stop?",
            "When you discovered 'no'. A busy week for both of us."
          ],
          [
            "Did you want me to call you something else?",
            "Never. I liked being the name you reached for."
          ]
        ]
      },
      {
        "title": "Nan's hidden money",
        "opening": "Did you really hide money inside a cabbage?",
        "first": "Once. I was saving for a day out and didn't want to be sensible with it.",
        "replies": [
          [
            "What happened to the cabbage?",
            "Winnie nearly made soup. I arrived at the thrilling part."
          ],
          [
            "Did you get your day out?",
            "Yes. Bought a ribbon I didn't need and ate something somebody else had cooked."
          ],
          [
            "Why hide it from yourself?",
            "Because I knew exactly where the roof leaked. Sometimes I wanted to forget."
          ]
        ]
      },
      {
        "title": "The unasked question",
        "opening": "Is there anything you're afraid to ask me?",
        "first": "Whether you're happy, love. I can fuss over a torn sleeve. I wouldn't know where to begin with an unhappy life.",
        "replies": [
          [
            "You could still ask.",
            "Then I will. And you needn't give me a reassuring answer."
          ],
          [
            "I'm not always sure.",
            "Neither was I at your age. There were good days inside difficult years."
          ],
          [
            "Would you be disappointed?",
            "In you? No. I'd be cross with anyone who made you think you couldn't tell me."
          ]
        ]
      }
    ],
    "greetings": [
      "There you are. I was just about to worry properly.",
      "You haven't started yet?",
      "Come close enough for a kiss. You can survive the embarrassment.",
      "I'm not making any promises.",
      "Oh, love. He's bigger every time I look away.",
      "I think he takes it as a challenge."
    ]
  },
  "Winnie": {
    "name": "Winnie",
    "home": "Millwood",
    "role": "Nan's old friend",
    "source": "01-millwood.txt:30",
    "topics": [
      {
        "title": "The imaginary admirer",
        "opening": "Did you ever have a secret admirer?",
        "first": "I invented one to annoy my sister. Then she insisted on meeting him. I spent a month claiming he was away on business.",
        "replies": [
          [
            "How did you get out of it?",
            "I broke my own heart very publicly. Best acting I've ever done."
          ],
          [
            "Did Nan know?",
            "Nan suggested making him taller. She's always had useful instincts."
          ],
          [
            "Did your sister believe you?",
            "Not for a moment. She was enjoying my predicament."
          ]
        ]
      },
      {
        "title": "The seat at the wedding",
        "opening": "Why won't you sit beside Hal at weddings?",
        "first": "He critiques the ceremony. Last time he whispered that the groom could have made better use of the pause.",
        "replies": [
          [
            "Did you tell him off?",
            "I moved his pudding. Silence followed."
          ],
          [
            "Does he know why you avoid him?",
            "He thinks I can't hear him properly. He's started speaking louder."
          ],
          [
            "You could sit beside me.",
            "Dangerous offer, Corin. I'll remember it."
          ]
        ]
      },
      {
        "title": "An ordinary photograph",
        "opening": "What do you remember most about being young here?",
        "first": "Not the grand occasions. Nan with flour on her nose, trying to look furious. I can see that better than my own wedding.",
        "replies": [
          [
            "What had made her angry?",
            "Me laughing at the flour. I wasn't helping my case."
          ],
          [
            "Does remembering it make you sad?",
            "Sometimes. Then she says something absurd and I remember she's still here."
          ],
          [
            "Have you told her?",
            "She'd say there wasn't that much flour. We disagree about the important details."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, you're just in time to hear my side of something.",
      "Should I hear Nan's first?",
      "I've thought of a much better answer since you left.",
      "To which question?",
      "A dragon! Well. I shall have to improve my gossip considerably.",
      "Please don't improve this part. It's already complicated."
    ]
  },
  "Ned": {
    "name": "Ned",
    "home": "Millwood",
    "role": "Leatherworker",
    "source": "01-millwood.txt:35",
    "topics": [
      {
        "title": "The splendid moustache",
        "opening": "Did you really grow a moustache once?",
        "first": "For seventeen days. I kept a record because your father said it looked like a frightened caterpillar.",
        "replies": [
          [
            "What did Nan say?",
            "Asked whether it needed feeding."
          ],
          [
            "Did you like it?",
            "I liked the idea. The execution disappointed us all."
          ],
          [
            "Would you try again?",
            "Not while anyone in Millwood remembers the first one."
          ]
        ]
      },
      {
        "title": "The father's favour",
        "opening": "What was Dad like when nobody was watching?",
        "first": "He'd bring a repair and pretend it could wait. Then ask whether I'd eaten. He knew I skipped meals when work was thin.",
        "replies": [
          [
            "Did you mind him asking?",
            "Fiercely. I miss it now."
          ],
          [
            "Did he do that often?",
            "Often enough that I learned to keep bread in the house before he called."
          ],
          [
            "I don't know how to picture him.",
            "Picture someone trying to help without making you feel small. He didn't always manage it. He tried."
          ]
        ]
      },
      {
        "title": "The price of a name",
        "opening": "Why don't you put your name on your work?",
        "first": "So a man can afford a decent belt without paying extra for knowing who made it.",
        "replies": [
          [
            "Wouldn't you like people to know?",
            "They find me when it breaks. That's recognition enough."
          ],
          [
            "Other makers charge for the name.",
            "Other makers enjoy hearing themselves discussed."
          ],
          [
            "I'd recognise your stitching.",
            "That'll do, Corin. That'll do very nicely."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. Boots holding together? That's my preferred sort of conversation starter.",
      "You've set a reassuringly low bar.",
      "You've caught me thinking. Don't look so surprised.",
      "I was trying to look respectful.",
      "Those claws would make short work of good leather. Keep him off my feet.",
      "I'll keep both of us clear."
    ]
  },
  "Joss": {
    "name": "Joss",
    "home": "Millwood",
    "role": "Apple grower and cider maker",
    "source": "01-millwood.txt:40",
    "topics": [
      {
        "title": "The counterfeit ghost",
        "opening": "Were you the ghost people saw in the orchard?",
        "first": "A sheet on a pole. I wanted to frighten Emmet. Unfortunately, Tam came past first.",
        "replies": [
          [
            "Did she scream?",
            "She asked why her clean sheet was muddy. I was the frightened one."
          ],
          [
            "Did Emmet ever find out?",
            "He helped me wash it. At a price."
          ],
          [
            "Why frighten him?",
            "He'd put an onion in my apple basket. Our feud lacked dignity."
          ]
        ]
      },
      {
        "title": "A name for the baby",
        "opening": "How did you choose your children's names?",
        "first": "Tam chose sensible names. I kept suggesting names that sounded magnificent shouted across a field.",
        "replies": [
          [
            "Such as?",
            "I'll spare the children. They may still forgive me."
          ],
          [
            "Did any of yours survive?",
            "One middle name. I invoke it only when I'm losing an argument."
          ],
          [
            "Was choosing difficult?",
            "Terrifying. You meet someone smaller than a loaf and they're yours to name."
          ]
        ]
      },
      {
        "title": "The thing you can't grow",
        "opening": "What would you like that the orchard can't give you?",
        "first": "One week by the sea. No counting baskets. I'd probably count waves. But I'd like to find out.",
        "replies": [
          [
            "Have you been before?",
            "Once as a boy. I remember the noise more than the water."
          ],
          [
            "Would Tam come?",
            "She'd already be packed before I finished asking."
          ],
          [
            "What's stopping you?",
            "There's always another season. That's becoming a rather poor answer."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin! Settle something: is tasting your own cider work?",
      "How much tasting are we discussing?",
      "I've saved you from a very long story. Tam said to shorten it.",
      "How much is left?",
      "I suppose a dragon makes a decent scarecrow, if nobody minds the fire.",
      "That's a fairly large if."
    ]
  },
  "Tam": {
    "name": "Tam",
    "home": "Millwood",
    "role": "Apple grower and mother",
    "source": "01-millwood.txt:45",
    "topics": [
      {
        "title": "The forbidden drawer",
        "opening": "What did your children always want to get into?",
        "first": "My drawer of things I'd forbidden them to touch. Mainly buttons. The prohibition made them priceless.",
        "replies": [
          [
            "Why forbid buttons?",
            "Because one went up a nose. I refuse to say whose."
          ],
          [
            "Did hiding them work?",
            "Until they formed a committee. Nothing defeats a determined committee of children."
          ],
          [
            "I remember wanting to look.",
            "Yes, Corin. You chaired the committee."
          ]
        ]
      },
      {
        "title": "A midnight celebration",
        "opening": "What's the strangest party you've had?",
        "first": "Joss forgot a birthday until bedtime. We ate breakfast in our nightclothes at midnight and pretended that was the plan.",
        "replies": [
          [
            "Whose birthday?",
            "Mine. He's very fortunate I like breakfast."
          ],
          [
            "Were the children awake?",
            "By the second pan he dropped, everyone was."
          ],
          [
            "Was it a good birthday?",
            "Lovely. Disorganised affection still counts."
          ]
        ]
      },
      {
        "title": "The afternoon alone",
        "opening": "Do you ever get tired of everyone needing you?",
        "first": "Yes. Then they all go out and I wonder when they're coming back. Irritating arrangement.",
        "replies": [
          [
            "What do you do alone?",
            "Finish a cup of tea while it's hot. You'd think that was a small ambition."
          ],
          [
            "Do you tell Joss?",
            "I tell him plainly. Guessing isn't one of his gifts."
          ],
          [
            "Does that make you feel guilty?",
            "Sometimes. Being tired doesn't mean I love them less."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, don't let Joss feed you a story before I've checked it.",
      "Does he submit many for approval?",
      "Good, someone who might let me finish a sentence.",
      "I'll give it my best effort.",
      "I thought my children brought home difficult pets. You've surpassed them.",
      "I hadn't realised we were competing."
    ]
  },
  "Tilda": {
    "name": "Tilda",
    "home": "Millwood",
    "role": "Spinner and knitter",
    "source": "01-millwood.txt:50",
    "topics": [
      {
        "title": "The wrong funeral",
        "opening": "Have you ever gone somewhere you weren't invited?",
        "first": "A funeral. Wrong day, wrong family. I stayed because an elderly woman had taken my hand.",
        "replies": [
          [
            "Did you know her?",
            "Not then. We became quite fond of each other afterward."
          ],
          [
            "Did you admit your mistake?",
            "Over tea. She laughed until she cried, and then cried properly."
          ],
          [
            "Why didn't you leave?",
            "She needed someone beside her. I happened to be there."
          ]
        ]
      },
      {
        "title": "A private song",
        "opening": "Why do you stop singing when people come near?",
        "first": "Because I can sing beautifully until somebody hears me. A curious affliction.",
        "replies": [
          [
            "Even if it's only me?",
            "Especially you. You remember things."
          ],
          [
            "What do you sing?",
            "Nonsense mostly. It's difficult to forget words you invented."
          ],
          [
            "I could pretend not to hear.",
            "You may. I shall pretend to believe you."
          ]
        ]
      },
      {
        "title": "The impossible scarf",
        "opening": "What's the strangest thing anyone asked you to make?",
        "first": "A scarf that wouldn't get wet. I suggested staying indoors. Apparently that wasn't the service he wanted.",
        "replies": [
          [
            "Did you try?",
            "No. Wool has enough troubles without impossible expectations."
          ],
          [
            "What did he buy?",
            "A hat. An imperfect solution to a very damp man."
          ],
          [
            "Would you make something for a dragon?",
            "I'd need measurements and a very long winter."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, stand still. No, there's nothing wrong. I just like people still occasionally.",
      "I'll try not to fidget.",
      "Back already? Good. I hadn't finished being interested.",
      "In what?",
      "That's a dragon. I had a perfectly ordinary remark ready, and now it's useless.",
      "Keep it. We could use something ordinary."
    ]
  },
  "Emmet": {
    "name": "Emmet",
    "home": "Millwood",
    "role": "Orchard worker",
    "source": "01-millwood.txt:55",
    "topics": [
      {
        "title": "An excellent excuse",
        "opening": "What's the worst excuse you've given for being late?",
        "first": "Said I'd lost my boot. Arrived wearing both. Had to claim I'd found it, which ruined the tragic effect.",
        "replies": [
          [
            "Who were you telling?",
            "Hettie. She looked at my feet until I confessed."
          ],
          [
            "Where had you been?",
            "Asleep. The truth lacked adventure."
          ],
          [
            "Did it work at all?",
            "I was allowed to finish speaking. That's the generous part."
          ]
        ]
      },
      {
        "title": "The dance lesson",
        "opening": "Who taught you to dance?",
        "first": "Winnie. She kept saying I was leading with the wrong foot. I appeared to have two of them.",
        "replies": [
          [
            "Did you improve?",
            "I stopped looking at my feet. Still stepped on hers, but with confidence."
          ],
          [
            "Was she patient?",
            "She wore her thickest shoes to the second lesson."
          ],
          [
            "Why did you want to learn?",
            "There was someone I wanted to ask. No, I'm not saying who."
          ]
        ]
      },
      {
        "title": "A different life",
        "opening": "If you weren't working in the orchard, what would you do?",
        "first": "Keep an inn. I'd like hearing where people had been. I'd hate changing the beds, which may be a flaw.",
        "replies": [
          [
            "You'd have plenty of gossip.",
            "And no time to pass it on. Another flaw."
          ],
          [
            "Would you leave Millwood?",
            "I used to think I would. Now I want somewhere that feels like it."
          ],
          [
            "What would you call the inn?",
            "The Early Finish. Entirely misleading, I imagine."
          ]
        ]
      }
    ],
    "greetings": [
      "Ah, Corin. You look like someone who's avoided my morning so far.",
      "Is there still time to keep avoiding it?",
      "I was hoping you'd come past. I've had nobody to complain to.",
      "That's a warm welcome.",
      "Does he eat apples? I'd rather ask before offering my hand.",
      "Let's start with the apple at a distance."
    ]
  },
  "Lark": {
    "name": "Lark",
    "home": "Millwood",
    "role": "Baker",
    "source": "01-millwood.txt:60",
    "topics": [
      {
        "title": "The pie tribunal",
        "opening": "Why did Hal refuse to judge the pie contest again?",
        "first": "Because he said all the pies were equally good. Six bakers spent an hour explaining why that was insulting.",
        "replies": [
          [
            "Who won?",
            "Nobody. We ate the evidence before agreement could be reached."
          ],
          [
            "Was your pie there?",
            "Yes. Mine was clearly the best."
          ],
          [
            "Would you ask him again?",
            "No. Next time we need someone with less concern for survival."
          ]
        ]
      },
      {
        "title": "Flour on the doorstep",
        "opening": "Why did you leave flour outside your door once?",
        "first": "I thought something was stealing my cooling bread. Wanted footprints. Found my own from a midnight snack I'd forgotten.",
        "replies": [
          [
            "You'd forgotten eating it?",
            "I'd been half asleep. Apparently still quite hungry."
          ],
          [
            "Did you accuse anybody?",
            "Only a cat. It declined to accept my apology."
          ],
          [
            "Was the bread good?",
            "Evidently. I left myself no evidence to taste."
          ]
        ]
      },
      {
        "title": "A quiet celebration",
        "opening": "What makes a really good celebration for you?",
        "first": "People staying after the food's gone. That's when I know they've come for each other.",
        "replies": [
          [
            "You don't mind the mess?",
            "I mind it in the morning. At night I'm wonderfully generous."
          ],
          [
            "What's your favourite part?",
            "Hearing laughter from another room while I'm washing up."
          ],
          [
            "Do you ever sit down?",
            "Nan makes me. Usually by hiding the cloth."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, you're looking suspiciously innocent. What have you smelled?",
      "I was hoping you wouldn't notice.",
      "There you are. I have an opinion nobody's asked for.",
      "That sounds promising.",
      "Oh! Please tell your dragon the village ovens are not a challenge.",
      "I'll make that very clear."
    ]
  },
  "Hal": {
    "name": "Hal",
    "home": "Millwood",
    "role": "Retired miller",
    "source": "01-millwood.txt:65",
    "topics": [
      {
        "title": "A pocketful of screws",
        "opening": "Why do you always keep screws in your pockets?",
        "first": "Because once, forty years ago, I needed one and hadn't got it. I've spent the rest of my life preparing for the rematch.",
        "replies": [
          [
            "Has it happened again?",
            "No. That's how you know I'm ready."
          ],
          [
            "Doesn't it spoil your clothes?",
            "Winnie has expressed that concern in considerable detail."
          ],
          [
            "How many have you got?",
            "I don't count them. That would make it seem peculiar."
          ]
        ]
      },
      {
        "title": "The visitor from nowhere",
        "opening": "Who's the most interesting person you've met?",
        "first": "A traveller who wouldn't say where he'd come from. Turned out he'd forgotten the name of the village and was embarrassed.",
        "replies": [
          [
            "Did you work it out?",
            "After he described every pig in it. Remarkable memory for pigs."
          ],
          [
            "Why was that interesting?",
            "I'd invented a royal exile. Reality had much better pigs."
          ],
          [
            "Did he stay long?",
            "Long enough to learn Millwood. I tested him before he left."
          ]
        ]
      },
      {
        "title": "An old man's envy",
        "opening": "Do you miss being young?",
        "first": "I miss bending down without planning how to get up. The rest varies.",
        "replies": [
          [
            "Even the adventures?",
            "Especially the things I refused because I thought I'd have time later."
          ],
          [
            "What did you refuse?",
            "A journey with friends. Had a perfectly sensible reason. I've forgotten it."
          ],
          [
            "You could still go somewhere.",
            "Yes. Keep saying that. I get stubborn when left alone with a chair."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. I've been told I repeat myself. Have I told you that?",
      "Not today.",
      "Sit—well, stand if you're in a hurry. Young people make conversation athletic.",
      "I can slow down.",
      "I remember when bringing home a stray dog caused a stir.",
      "I may have raised expectations."
    ]
  },
  "Edwin": {
    "name": "Edwin",
    "home": "Millwood",
    "role": "Poultry keeper",
    "source": "01-millwood.txt:70",
    "topics": [
      {
        "title": "The goose with a grievance",
        "opening": "Why are you so suspicious of geese?",
        "first": "One chased me through a wedding. I was carrying the flowers. Everybody thought it was part of the entertainment.",
        "replies": [
          [
            "Why did it chase you?",
            "I don't know. That uncertainty troubles me most."
          ],
          [
            "Did anyone help?",
            "The bride hit it with her bouquet. I remain devoted to her memory."
          ],
          [
            "Would you keep a goose now?",
            "I'd sooner keep a grudge. Takes less feeding."
          ]
        ]
      },
      {
        "title": "A very small kingdom",
        "opening": "Do your hens actually recognise you?",
        "first": "They recognise the person with breakfast. I like to imagine a little affection has crept into the arrangement.",
        "replies": [
          [
            "Would they notice you gone?",
            "They'd notice breakfast gone. Let's not press the distinction."
          ],
          [
            "Have you got a favourite?",
            "Yes, but I tell each of them a different answer."
          ],
          [
            "Does talking to them help?",
            "It helps me. They're discreet listeners."
          ]
        ]
      },
      {
        "title": "Edwin's surprise",
        "opening": "What would surprise people about you?",
        "first": "I can stand on my hands. Could, anyway. Please don't ask for a demonstration on this ground.",
        "replies": [
          [
            "How did you learn?",
            "Trying to impress someone who'd already gone home."
          ],
          [
            "Did they ever see?",
            "Eventually. They asked why my face was so red."
          ],
          [
            "Will you teach anyone?",
            "If my wrists agree to it. They've become rather independent."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin, if you hear anybody calling me timid, ask what they think of geese.",
      "I don't think I'd argue with one.",
      "I've had a peaceful ten minutes. Don't tell the hens.",
      "Your secret's safe.",
      "That dragon and I need an understanding about poultry.",
      "I'll translate. Please keep it polite."
    ]
  },
  "Tolan": {
    "name": "Tolan",
    "home": "Millwood",
    "role": "Village guard",
    "source": "01-millwood.txt:75",
    "topics": [
      {
        "title": "The stolen helmet",
        "opening": "Who put flowers in your helmet?",
        "first": "Winnie. Said I looked gloomy. I spent half a patrol shedding petals.",
        "replies": [
          [
            "Did anyone warn you?",
            "They smiled. I thought I was becoming popular."
          ],
          [
            "Were you angry?",
            "Until Nan said it suited me. Then I lost the argument entirely."
          ],
          [
            "Did you get her back?",
            "I haven't found a dignified way. She's safe for now."
          ]
        ]
      },
      {
        "title": "The guard's nightmare",
        "opening": "What do you dream about when you're worried?",
        "first": "Being called to an emergency and finding I've put my boots on the wrong feet. The danger waits politely while I struggle.",
        "replies": [
          [
            "Does that happen often?",
            "The dream does. The boots have behaved so far."
          ],
          [
            "What are you actually afraid of?",
            "Someone needing me and discovering I'm not enough."
          ],
          [
            "I think they'd be glad you came.",
            "Perhaps. It's easier to believe that in daylight."
          ]
        ]
      },
      {
        "title": "Who watches the watcher",
        "opening": "Who looks after you when you're tired?",
        "first": "Nan notices. I can fool almost everyone else.",
        "replies": [
          [
            "What does she do?",
            "Hands me food and asks a question that requires sitting down."
          ],
          [
            "Do you let her?",
            "With a convincing show of reluctance."
          ],
          [
            "You could ask for help yourself.",
            "Yes. Knowing that and doing it are different jobs."
          ]
        ]
      }
    ],
    "greetings": [
      "Corin. Nothing to report, which is how I like my reports.",
      "I'll try to keep yours short.",
      "There you are. Nan asked whether I'd seen you. I can stop looking alert now.",
      "She has the whole village working for her.",
      "I was prepared for trouble. I wasn't prepared for wings.",
      "Neither was I, honestly."
    ]
  },
  "Pip": {
    "name": "Pip",
    "home": "Sporehollow",
    "role": "Mushroom villager",
    "source": "02-shrooms-roads.txt:1",
    "topics": [
      {
        "title": "The pocket problem",
        "opening": "Why are you so interested in pockets?",
        "first": "You carry little rooms in your clothes. Anything could be in them. A stone. Breakfast. A smaller pair of trousers.",
        "replies": [
          [
            "Usually crumbs.",
            "A room for crumbs! Humans are astonishing hosts."
          ],
          [
            "Would you want pockets?",
            "Six. I'd forget what was in them and have surprises all day."
          ],
          [
            "You can just ask what's inside.",
            "That spoils the best bit. I like the possibility of trousers."
          ]
        ]
      },
      {
        "title": "A borrowed sneeze",
        "opening": "Can mushrooms sneeze?",
        "first": "No. I tried making the noise after a visitor did it. Everyone thought I'd fallen apart.",
        "replies": [
          [
            "Did you explain?",
            "They kept asking which bit hurt. Eventually I said my dignity."
          ],
          [
            "Why copy it?",
            "It looked terribly satisfying. Such a dramatic interruption."
          ],
          [
            "You're not missing much.",
            "Easy for someone who can do it whenever he likes."
          ]
        ]
      },
      {
        "title": "Pip's expedition",
        "opening": "How far would you like to travel?",
        "first": "Far enough to see the forest end. I'm not sure I want to step out of it.",
        "replies": [
          [
            "What do you think is beyond it?",
            "Too much sky. It might feel like a ceiling had fallen off."
          ],
          [
            "Would you go alone?",
            "Absolutely. With someone else nearby, in case absolutely went wrong."
          ],
          [
            "You could turn back.",
            "Yes. That's my favourite part of the plan."
          ]
        ]
      }
    ],
    "greetings": [
      "Oh! A person with knees. Do they ever go the wrong way?",
      "I'm Corin. I try very hard to prevent it.",
      "I've thought of another question about your face.",
      "Should I be worried?",
      "That one's got knees AND wings. You're rather plain by comparison.",
      "I'm Corin. I've been trying not to notice."
    ]
  },
  "Mycella": {
    "name": "Mycella",
    "home": "Sporehollow",
    "role": "Keeper of the hollow's memories",
    "source": "02-shrooms-roads.txt:6",
    "topics": [
      {
        "title": "A memory with no owner",
        "opening": "Can you remember something that happened to someone else?",
        "first": "A little. A cold season, a patch of sunlight. Not a whole life. More like finding a familiar scent in an unfamiliar room.",
        "replies": [
          [
            "Does it frighten you?",
            "Sometimes I miss a place I've never stood. That's a lonely feeling."
          ],
          [
            "Can you choose what you remember?",
            "No more than you choose which dream stays after waking."
          ],
          [
            "How do you know it's real?",
            "I don't always. I tell the young ones when I'm uncertain."
          ]
        ]
      },
      {
        "title": "The empty place in the ring",
        "opening": "Does everyone stay in the hollow forever?",
        "first": "No. Some settle farther among the roots. We leave space when we gather. A visitor shouldn't have to ask whether they still belong.",
        "replies": [
          [
            "Do they come back?",
            "Some do. Changed, generally. So are we."
          ],
          [
            "What if nobody returns?",
            "Then the space is useful to someone new."
          ],
          [
            "Would you ever leave?",
            "I've wondered. Being needed can become a comfortable excuse."
          ]
        ]
      },
      {
        "title": "The story nobody finishes",
        "opening": "Is there a story the hollow refuses to tell?",
        "first": "There is one whose ending we disagree about. We stop at the disagreement and let the young ones argue.",
        "replies": [
          [
            "Why not choose an ending?",
            "Because the people who were there are gone. Agreement wouldn't bring them back."
          ],
          [
            "What's it about?",
            "A traveller who heard someone calling beneath a hill. Whether he answered depends on the teller."
          ],
          [
            "Which ending do you believe?",
            "That he was afraid. Both tellings agree on that, though neither says it plainly."
          ]
        ]
      }
    ],
    "greetings": [
      "Walk gently, visitor. Some of us are listening below the soil.",
      "I'm Corin. I'll mind my feet.",
      "Your footsteps are becoming familiar.",
      "I hope that's a good thing.",
      "The roots went quiet before I saw your dragon. Even old things can be surprised.",
      "I'm Corin. He's surprised me a few times too."
    ]
  },
  "Bolete": {
    "name": "Bolete",
    "home": "Sporehollow",
    "role": "Path tender",
    "source": "02-shrooms-roads.txt:11",
    "topics": [
      {
        "title": "A path nobody takes",
        "opening": "Why keep a path clear if nobody uses it?",
        "first": "An old neighbour used to come that way. I still find myself clearing it before I remember.",
        "replies": [
          [
            "Could somebody else use it?",
            "Perhaps. Mostly it's something my hands know how to do."
          ],
          [
            "Does clearing it help?",
            "Some mornings. Other mornings I leave it alone."
          ],
          [
            "What was the neighbour like?",
            "Complained about every puddle. I miss being criticised so thoroughly."
          ]
        ]
      },
      {
        "title": "The boot collection",
        "opening": "What's the oddest thing you've found on a path?",
        "first": "Three left boots. Different sizes. I'm still troubled by the mathematics.",
        "replies": [
          [
            "Perhaps three people lost one.",
            "That's the sensible explanation. I was hoping for a stranger one."
          ],
          [
            "Did you keep them?",
            "For a time. A beetle family took the smallest."
          ],
          [
            "Could you ask the travellers?",
            "I do. It makes an unusual first question."
          ]
        ]
      },
      {
        "title": "Visitors after dark",
        "opening": "Do humans frighten you?",
        "first": "The ones who whisper do. They think they're being gentle. It sounds as though they're arranging something.",
        "replies": [
          [
            "What should we do instead?",
            "Say hello in your ordinary voice. We understand hello."
          ],
          [
            "Even noisy visitors?",
            "Noise tells me where to look. Sneaking tells me to worry."
          ],
          [
            "I'll remember that.",
            "Good. I'd rather meet a clumsy guest than a mysterious boot."
          ]
        ]
      }
    ],
    "greetings": [
      "Mind the soft ground. It looks obliging until it has your boot.",
      "I'm Corin. Thanks. I'd like to keep both.",
      "You found the path again. I shall take some credit.",
      "I'll leave you the difficult parts.",
      "Please keep the dragon's tail out of the young growth.",
      "I'm Corin. I'll watch his tail if he watches my feet."
    ]
  },
  "Truffle": {
    "name": "Truffle",
    "home": "Sporehollow",
    "role": "Tender of young growth",
    "source": "02-shrooms-roads.txt:16",
    "topics": [
      {
        "title": "The question after bedtime",
        "opening": "What do the young ones ask when they should be sleeping?",
        "first": "Whether the moon follows everyone or only them. I said everyone. They were rather disappointed to share.",
        "replies": [
          [
            "What did you say next?",
            "That it was a very busy moon. This restored some respect."
          ],
          [
            "Did they go to sleep?",
            "No. They began organising its route."
          ],
          [
            "Did you believe things like that?",
            "I thought roots were holding the trees down so they wouldn't wander off."
          ]
        ]
      },
      {
        "title": "Truffle's bad mood",
        "opening": "Are you ever tired of being patient?",
        "first": "Yesterday I told a leaf to get out of my way. A leaf, Corin. It had no means of complying.",
        "replies": [
          [
            "Did anyone hear?",
            "One little one. Now they all apologise to leaves."
          ],
          [
            "What do you do when you're cross?",
            "Find a quiet place until my thoughts stop arriving elbow-first."
          ],
          [
            "You don't have to be patient with me.",
            "Thank you. I'll try to deserve the offer without using it too often."
          ]
        ]
      },
      {
        "title": "A celebration underground",
        "opening": "How do you celebrate something in the hollow?",
        "first": "We tell everyone the good news. Repeatedly. The young ones enjoy being important messengers.",
        "replies": [
          [
            "What counts as good news?",
            "A recovery. A return. Someone learning a difficult thing."
          ],
          [
            "Do you have music?",
            "Voices, and feet against the earth. You feel some of it more than hear it."
          ],
          [
            "I'd like to hear that.",
            "Then listen when the hollow is happy. We're not particularly secretive about it."
          ]
        ]
      }
    ],
    "greetings": [
      "Oh, a visitor. Give me a moment to stop thinking about everybody else.",
      "I'm Corin. Take your time.",
      "You've come back. The little ones will want a full report.",
      "About me?",
      "Such a large creature to look after. Do you get any sleep?",
      "I'm Corin. We take turns being restless."
    ]
  },
  "The Shroom King": {
    "name": "The Shroom King",
    "home": "Sporehollow",
    "role": "Speaker for the mushroom ring",
    "source": "02-shrooms-roads.txt:21",
    "topics": [
      {
        "title": "The royal nap",
        "opening": "Does a king ever get to sleep undisturbed?",
        "first": "They wake me for disputes. Once, two neighbours woke me to decide which had woken me first.",
        "replies": [
          [
            "How did you decide?",
            "I went back to sleep. They considered it an unsatisfactory judgement."
          ],
          [
            "What were they really arguing about?",
            "Who had disturbed whom. The matter had become beautifully circular."
          ],
          [
            "Does everyone argue here?",
            "Of course. Peace isn't the absence of irritating neighbours."
          ]
        ]
      },
      {
        "title": "The name of the forest",
        "opening": "What did you call these woods before humans named them?",
        "first": "We didn't require one name. A place changes from root to root. Humans ask a great deal of a single word.",
        "replies": [
          [
            "How do you give directions?",
            "By things we know together. Damp ground, old growth, a particular bend."
          ],
          [
            "Does our name offend you?",
            "No. It simply tells me where the speaker comes from."
          ],
          [
            "What would you call my home?",
            "I'd have to know it first. That seems only courteous."
          ]
        ]
      },
      {
        "title": "The visitor who bowed",
        "opening": "Has anyone mistaken you for Halvard's equal?",
        "first": "A traveller once bowed so deeply that he couldn't see my answer. I had to ask him to look up before refusing his taxes.",
        "replies": [
          [
            "He offered you money?",
            "He offered to collect it. A rather different appetite."
          ],
          [
            "What did you tell him?",
            "That my neighbours knew exactly where I slept."
          ],
          [
            "Would you want his kind of power?",
            "I would dislike needing guards against the people I claimed to serve."
          ]
        ]
      },
      {
        "title": "The root and the road",
        "opening": "What would you like to ask a human traveller?",
        "first": "Whether you feel smaller when you leave home, or larger. I've heard convincing accounts of both.",
        "replies": [
          [
            "Smaller, usually.",
            "Then perhaps you are paying attention."
          ],
          [
            "Larger. There's more I could become.",
            "And more people who won't already know who you are. That must be frighteningly pleasant."
          ],
          [
            "Both, on the same day.",
            "That sounds less tidy. I suspect it's the truest answer."
          ]
        ]
      }
    ],
    "greetings": [
      "A human visitor. Come where we can speak without shouting over our differences in height.",
      "I'm Corin. Gladly. My neck was beginning to object.",
      "Ah, the hollow has not quite exhausted your curiosity.",
      "Not even close.",
      "A dragon beneath our trees. The old stories have become inconveniently large.",
      "I'm Corin. He tries to be careful."
    ]
  },
  "Cap": {
    "name": "Cap",
    "home": "Sporehollow",
    "role": "Grower and storekeeper",
    "source": "02-shrooms-roads.txt:27",
    "topics": [
      {
        "title": "The invisible inventory",
        "opening": "How do you keep track of everything without writing?",
        "first": "Ilsa asks where something is. I say confidently. Then I remember while she's looking at me.",
        "replies": [
          [
            "That sounds risky.",
            "Marriage improves the speed of thought."
          ],
          [
            "What if you don't remember?",
            "I stop being confident. She's grateful for the variety."
          ],
          [
            "Couldn't you make marks?",
            "I tried. Forgot what the marks meant. Very well-organised confusion."
          ]
        ]
      },
      {
        "title": "Cap's grand entrance",
        "opening": "Why did Ilsa laugh when you mentioned dancing?",
        "first": "I attempted a leap at a gathering. Landed beautifully. The ground continued downward.",
        "replies": [
          [
            "You fell in a hollow?",
            "A shallow one. Deep enough to finish the performance."
          ],
          [
            "Were you hurt?",
            "Only when people asked for it again."
          ],
          [
            "Would you dance now?",
            "At ground level. I've matured artistically."
          ]
        ]
      },
      {
        "title": "The troublesome guest",
        "opening": "What makes a difficult guest?",
        "first": "Someone who says they don't want anything while looking sadly at everything.",
        "replies": [
          [
            "Perhaps they're being polite.",
            "Then I wish they'd be impolite enough to have supper."
          ],
          [
            "Do you tell them that?",
            "Ilsa tells them more gently. We divide the work."
          ],
          [
            "What should I say?",
            "What you mean. It's restful."
          ]
        ]
      }
    ],
    "greetings": [
      "A visitor! Tell Ilsa I was being useful if she asks.",
      "I'm Corin. How much of a lie would that be?",
      "Back for conversation? Good. Conversation doesn't need carrying.",
      "You make it sound suspiciously attractive.",
      "Does the dragon understand 'not for eating'? We begin every friendship there.",
      "I'm Corin. He understands. Agreement takes longer."
    ]
  },
  "Ilsa": {
    "name": "Ilsa",
    "home": "Sporehollow",
    "role": "Grower and teacher",
    "source": "02-shrooms-roads.txt:32",
    "topics": [
      {
        "title": "The borrowed human word",
        "opening": "Is there a human word you particularly like?",
        "first": "Perhaps. Such a useful word. It lets a thought sit down before you make it leave.",
        "replies": [
          [
            "Cap must use it often.",
            "Cap uses 'certainly', then spends an hour finding out whether he meant it."
          ],
          [
            "Is there a word you dislike?",
            "Weeds. Humans sound so sure the plant is the one in the wrong."
          ],
          [
            "Perhaps is my answer to chores.",
            "Then Hettie has probably developed an opinion about it."
          ]
        ]
      },
      {
        "title": "The youngest teacher",
        "opening": "Has a young one ever taught you something?",
        "first": "One asked why I answered questions nobody had asked. I spent a very uncomfortable afternoon noticing how often I did it.",
        "replies": [
          [
            "What did you change?",
            "I let silences last longer. Surprisingly, the world continued."
          ],
          [
            "Was it difficult?",
            "Dreadfully. I'm resisting the urge to explain three things to you now."
          ],
          [
            "What were they?",
            "No. You nearly got me."
          ]
        ]
      },
      {
        "title": "A quarrel worth having",
        "opening": "Do you and Cap ever really argue?",
        "first": "We argued over taking in a visitor. I wanted to help. He was worried we'd have too little for ourselves.",
        "replies": [
          [
            "Who was right?",
            "Both of us about different things. Most annoying."
          ],
          [
            "What did you decide?",
            "We shared what we could and said plainly when we couldn't give more."
          ],
          [
            "Was Cap angry afterward?",
            "Until supper. His convictions are vulnerable to supper."
          ]
        ]
      }
    ],
    "greetings": [
      "Come along. Cap's probably told you his version already.",
      "I'm Corin. Which version should I worry about?",
      "It's pleasant to see someone without a problem for me to solve.",
      "I'll try to stay pleasant.",
      "Goodness. I hope that dragon has better manners than Cap at supper.",
      "I'm Corin. That's a surprisingly low bar to set."
    ]
  },
  "Mosslet": {
    "name": "Mosslet",
    "home": "Sporehollow",
    "role": "Lookout",
    "source": "02-shrooms-roads.txt:37",
    "topics": [
      {
        "title": "The false alarm",
        "opening": "Have you ever raised an alarm by mistake?",
        "first": "I mistook my own shadow for something following me. Turning around did not improve the situation.",
        "replies": [
          [
            "How did you realise?",
            "The sun went behind a cloud. My pursuer showed excellent timing."
          ],
          [
            "Did everyone laugh?",
            "Once I did. They were very considerate for nearly a minute."
          ],
          [
            "Are you embarrassed still?",
            "Less than I'd be if a real danger arrived and I said nothing."
          ]
        ]
      },
      {
        "title": "Things from above",
        "opening": "What would you most like to see from the treetops?",
        "first": "Whether the paths look as tangled from above as they feel down here.",
        "replies": [
          [
            "Perhaps they're worse.",
            "Then I'd feel much better about getting lost."
          ],
          [
            "Would you be frightened?",
            "Of falling, yes. Of seeing, no."
          ],
          [
            "I'd want to see home.",
            "Oh. Yes. I hadn't thought of how small it would look."
          ]
        ]
      },
      {
        "title": "Mosslet's visitor list",
        "opening": "Do you remember everyone who passes here?",
        "first": "Most. There was a man who said goodbye to every tree. Took him most of the afternoon to leave.",
        "replies": [
          [
            "Why was he doing that?",
            "He'd promised his child to be polite in the forest."
          ],
          [
            "Did it bother you?",
            "Not at all. It gave me a chance to finish my lunch."
          ],
          [
            "Did the trees answer?",
            "If they did, he was the only one patient enough to hear it."
          ]
        ]
      }
    ],
    "greetings": [
      "Stop a moment. Friend, stranger, or someone who hasn't decided?",
      "I'm Corin. Stranger hoping for friend.",
      "I heard you coming. You have a rather recognisable step.",
      "Should I apologise to the ground?",
      "Wings. Actual wings. I need a more ambitious lookout spot.",
      "I'm Corin. Please don't climb anything on our account."
    ]
  },
  "Weft": {
    "name": "Weft",
    "home": "Thornwell's southern road",
    "role": "Camp farmer",
    "source": "02-shrooms-roads.txt:42",
    "topics": [
      {
        "title": "A traveller's disguise",
        "opening": "Have you ever pretended to be someone else?",
        "first": "Told a bore I was deaf. Then somebody offered me cake and I answered immediately.",
        "replies": [
          [
            "Did the bore notice?",
            "He said it was a miracle and resumed talking."
          ],
          [
            "Why not just leave?",
            "I was young and thought politeness required suffering."
          ],
          [
            "Would you do it now?",
            "I'd offer the bore a job. Conversations shorten remarkably near a shovel."
          ]
        ]
      },
      {
        "title": "The weather wager",
        "opening": "Why don't you wager on the weather anymore?",
        "first": "Lost a dinner to a woman who predicted rain by looking behind me.",
        "replies": [
          [
            "Was there a cloud?",
            "A wall of it. I was too busy explaining the sky."
          ],
          [
            "Did you pay up?",
            "Yes. She ate beautifully and offered no further education."
          ],
          [
            "What had you predicted?",
            "A clear evening. I remain grateful nobody wrote it down."
          ]
        ]
      },
      {
        "title": "Weft's good china",
        "opening": "What's something you save for special occasions?",
        "first": "Used to save my good cup. Then I thought, if Tuesday isn't worth a good cup, we're in trouble.",
        "replies": [
          [
            "Do you use it every day?",
            "When I'm home. Makes washing it slightly less dreary."
          ],
          [
            "What if it breaks?",
            "I'll be upset. At least it won't have spent its life waiting."
          ],
          [
            "Is Tuesday your favourite day?",
            "Now it has a cup, yes."
          ]
        ]
      }
    ],
    "greetings": [
      "You can relax your shoulders here. The road doesn't pay you for looking stern.",
      "I'm Corin. I'd hoped it might.",
      "Back this way? Good. I was getting bored with my own news.",
      "Mine may be worse.",
      "Keep his wings off the crops and we shall get along splendidly.",
      "I'm Corin. That's fair. I'll stand where you point."
    ]
  },
  "Cartwright Oswin": {
    "name": "Cartwright Oswin",
    "home": "Western road",
    "role": "Cartwright",
    "source": "02-shrooms-roads.txt:47",
    "topics": [
      {
        "title": "The racing snail",
        "opening": "Did you really lose a race to a snail?",
        "first": "I said my repaired cart could beat anything. My niece chose a snail, then insisted I start with the cart dismantled.",
        "replies": [
          [
            "You agreed?",
            "I hadn't heard all the terms. A family failing."
          ],
          [
            "Who won?",
            "The snail. She'd given it a generous head start."
          ],
          [
            "Did you pay the wager?",
            "A bun. Cheapest lesson I've ever bought."
          ]
        ]
      },
      {
        "title": "An unwanted retirement",
        "opening": "Will you ever give up cartwrighting?",
        "first": "People keep suggesting it as if sitting down were a magnificent discovery. I know about chairs.",
        "replies": [
          [
            "You could do something else.",
            "I might. I'd rather choose before everyone chooses for me."
          ],
          [
            "What would you miss?",
            "Someone arriving unhappy and leaving with a problem gone."
          ],
          [
            "What would you keep doing?",
            "Mending things badly for free, according to my daughter."
          ]
        ]
      },
      {
        "title": "The royal carriage",
        "opening": "Would you build a carriage for Halvard?",
        "first": "Only if someone else measured it. I don't fancy being blamed for a king who doesn't fit.",
        "replies": [
          [
            "Would he pay you?",
            "That's the question I'd ask last, if I intended to survive the first meeting."
          ],
          [
            "What would you build instead?",
            "A good ordinary cart. Nobody has to kneel when it arrives."
          ],
          [
            "Could you refuse?",
            "A man can refuse in conversation more easily than at his door."
          ]
        ]
      }
    ],
    "greetings": [
      "Stand clear of anything that might roll. That includes my temper.",
      "I'm Corin. I'll give both some room.",
      "You again. Good. A face with no broken axle attached.",
      "Not that I've noticed.",
      "A dragon. Well, I can't put wheels on that.",
      "I'm Corin. He'd be disappointed if you tried."
    ]
  },
  "Miner Marn": {
    "name": "Miner Marn",
    "home": "Forgewick's eastern road",
    "role": "Road crew leader",
    "source": "02-shrooms-roads.txt:52",
    "topics": [
      {
        "title": "The crew's lucky pebble",
        "opening": "Why does your crew carry a lucky pebble?",
        "first": "Because Nerik said it was lucky. Now nobody wants to be the fellow who loses it before a bad day.",
        "replies": [
          [
            "Do you believe it works?",
            "I believe Nerik checks his pockets. That's useful in itself."
          ],
          [
            "What's special about it?",
            "Absolutely nothing. Don't say that where it can hear."
          ],
          [
            "Who carries it now?",
            "We take turns. Superstition has acquired a rota."
          ]
        ]
      },
      {
        "title": "The boss at home",
        "opening": "Are you in charge at home too?",
        "first": "My youngest once sent me out of a room for interrupting a puppet show. I went.",
        "replies": [
          [
            "Did you object?",
            "She'd explained the rules clearly. Difficult to argue with decent management."
          ],
          [
            "Was it a good show?",
            "Excellent. The villain sounded suspiciously like me."
          ],
          [
            "Do you have hobbies?",
            "I'm apparently a supporting actor."
          ]
        ]
      },
      {
        "title": "The unsent complaint",
        "opening": "What would you tell the crown if they'd listen?",
        "first": "That a road crew needs stone, food, and time. Threatening us supplies none of them.",
        "replies": [
          [
            "Have you tried saying it?",
            "In writing. The answer thanked me for my loyalty."
          ],
          [
            "Were you being loyal?",
            "I was being practical. It's often mistaken for something grander."
          ],
          [
            "Would you say it in person?",
            "If they'd really listen. That's the expensive part of your question."
          ]
        ]
      }
    ],
    "greetings": [
      "If you've come to tell me stone is heavy, you're too late.",
      "I'm Corin. I'll cross that off my list.",
      "Back again? I might put you in the headcount.",
      "Would I get paid?",
      "Keep the dragon outside the crew's working room. Nobody needs a surprise wing.",
      "I'm Corin. We'll give you space."
    ]
  },
  "Miner Nerik": {
    "name": "Miner Nerik",
    "home": "Forgewick's eastern road",
    "role": "Young road worker",
    "source": "02-shrooms-roads.txt:57",
    "topics": [
      {
        "title": "A name worth shouting",
        "opening": "Why did you want to join a road crew?",
        "first": "I wanted someone to shout my name because they needed me. At home it usually meant I'd broken something.",
        "replies": [
          [
            "Has that happened?",
            "Both versions. I'm improving the balance."
          ],
          [
            "Was your family pleased?",
            "Mum packed enough food for three workers. Subtle vote of confidence."
          ],
          [
            "What do you want next?",
            "To know my job well enough to help the next frightened newcomer."
          ]
        ]
      },
      {
        "title": "The invented sweetheart",
        "opening": "Why did you tell the crew you had a sweetheart?",
        "first": "They kept asking. I panicked. Now they ask how she is, which is worse.",
        "replies": [
          [
            "What do you tell them?",
            "That she's busy. She's the busiest woman who never lived."
          ],
          [
            "You could tell the truth.",
            "Marn already knows. He asked whether her imaginary father liked me."
          ],
          [
            "Why did you feel you needed one?",
            "Everyone seemed to have a life already. I thought mine sounded unfinished."
          ]
        ]
      },
      {
        "title": "A pocket book",
        "opening": "What do you write when the shift's over?",
        "first": "Little descriptions. Someone's voice, a funny remark. I'm afraid I'll forget the parts that make the day mine.",
        "replies": [
          [
            "Poems?",
            "Not if anyone from work asks."
          ],
          [
            "Would you read one aloud?",
            "Perhaps when I've stopped hearing all its faults."
          ],
          [
            "Do you write about Marn?",
            "Under a false name. I'm young, not reckless."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello! Sorry, I thought you were Marn for a moment. You both arrived unexpectedly.",
      "I'm Corin. I hope that's the only resemblance.",
      "It's you. Good. I can ask a question without looking new at my job.",
      "Ask away.",
      "Oh, that's brilliant. Sorry. Am I allowed to say that about a dragon?",
      "I'm Corin. He seems pleased."
    ]
  },
  "Snowbuilder Nessa": {
    "name": "Snowbuilder Nessa",
    "home": "Hollybeck's southern road",
    "role": "Snow sculptor",
    "source": "02-shrooms-roads.txt:62",
    "topics": [
      {
        "title": "A face everyone knew",
        "opening": "Have you ever sculpted someone without telling them?",
        "first": "Made a snowman that looked like a neighbour. Everyone recognised him except the neighbour. He complained about its expression.",
        "replies": [
          [
            "What expression?",
            "His complaining one."
          ],
          [
            "Did you confess?",
            "He guessed when I couldn't stop laughing."
          ],
          [
            "Was he angry?",
            "For a day. Then he brought his sister to see it."
          ]
        ]
      },
      {
        "title": "Summer employment",
        "opening": "What do you do when there isn't any snow?",
        "first": "I draw. Badly at first. Summer gives me months to learn a face winter will let me build.",
        "replies": [
          [
            "Do you miss the snow?",
            "Only until I can feel my toes again."
          ],
          [
            "Why not work in stone?",
            "Stone expects a permanent decision. I'm not always ready for one."
          ],
          [
            "Do you ever change your mind?",
            "Constantly. A thaw is an excellent accomplice."
          ]
        ]
      },
      {
        "title": "A visitor's portrait",
        "opening": "What would you notice if you made a sculpture of me?",
        "first": "You look as though you're about to ask a question even while somebody's answering.",
        "replies": [
          [
            "Is that bad?",
            "No. Difficult to carve, though. I'd need the eyebrows just right."
          ],
          [
            "What else?",
            "You hold yourself differently when you think nobody's worried about you."
          ],
          [
            "Do I look frightened?",
            "Sometimes. So does everyone worth drawing."
          ]
        ]
      }
    ],
    "greetings": [
      "You've arrived before my fingers have completely surrendered. Lucky timing.",
      "I'm Corin. Should we keep this brief?",
      "Ah, an audience with a pulse. My usual sort melts.",
      "I'll try to be more durable.",
      "Please ask your dragon to admire winter from a sensible distance.",
      "I'm Corin. I'll mention the melting problem."
    ]
  },
  "Linna": {
    "name": "Linna",
    "home": "Thornwell",
    "role": "Mill bookkeeper",
    "source": "03-thornwell.txt:1",
    "topics": [
      {
        "title": "The disputed inheritance",
        "opening": "What's the strangest thing you've had to put a value on?",
        "first": "A woman's collection of spoons. Her sons were quarrelling over it. Neither had visited her for years.",
        "replies": [
          [
            "How did you value it?",
            "I asked which spoon she'd used. Neither knew."
          ],
          [
            "What happened to them?",
            "Sold, eventually. I bought the plainest one."
          ],
          [
            "Why buy it?",
            "Because I did know. She used to bring me soup."
          ]
        ]
      },
      {
        "title": "Linna's expensive habit",
        "opening": "Do you spend money on anything foolish?",
        "first": "Beautiful blank paper. Then I won't write on it because my thoughts seem unworthy of the expense.",
        "replies": [
          [
            "What would you write?",
            "Something with no figures in it. I haven't narrowed it further."
          ],
          [
            "You could spoil the first page.",
            "That is a disturbingly practical suggestion."
          ],
          [
            "Could you draw instead?",
            "You haven't seen my drawings. Even the paper would object."
          ]
        ]
      },
      {
        "title": "A troublesome signature",
        "opening": "Why do you sign your full name every time?",
        "first": "When I began, people assumed the accounts belonged to the man standing nearest me. I became difficult to overlook.",
        "replies": [
          [
            "Did it work?",
            "Eventually. Repetition can be a form of stubbornness."
          ],
          [
            "Was anyone helpful?",
            "A woman who insisted I explain my own figures. She wouldn't let my employer answer."
          ],
          [
            "Does it still happen?",
            "Less. I still enjoy correcting it more than I ought."
          ]
        ]
      }
    ],
    "greetings": [
      "Are you looking for someone, or just looking? Both are popular occupations here.",
      "Just looking for now. I'm Corin.",
      "Ah, Corin. You've caught me between numbers.",
      "Is there much room there?",
      "A dragon? I'd like to establish whether I ought to be running.",
      "No. I'm Corin. He's travelling with me."
    ]
  },
  "Garrow": {
    "name": "Garrow",
    "home": "Thornwell",
    "role": "Woodcutter",
    "source": "03-thornwell.txt:6",
    "topics": [
      {
        "title": "The untouched forest",
        "opening": "Is there a part of the woods you won't enter?",
        "first": "There's a hollow where the birds always seem to stop singing. Probably a perfectly good explanation. I'm content without it.",
        "replies": [
          [
            "You think it's haunted?",
            "I think I'm paid to cut wood, not settle questions about ghosts."
          ],
          [
            "Have you seen anything?",
            "No. That's the pleasing part of staying out."
          ],
          [
            "Would you tell people to avoid it?",
            "I'd tell them what I heard. The rest would be theirs."
          ]
        ]
      },
      {
        "title": "The winter beard",
        "opening": "Why do you grow your beard longer in winter?",
        "first": "Warmth. Also my sister says I look respectable clean-shaven. I try not to raise false expectations.",
        "replies": [
          [
            "Does she visit often?",
            "Often enough to complain about it."
          ],
          [
            "What do you complain about?",
            "Her habit of being right before I've finished my explanation."
          ],
          [
            "Would you shave for her?",
            "For her wedding, I did. She cried. Claimed it was the ceremony."
          ]
        ]
      },
      {
        "title": "A surprisingly gentle pastime",
        "opening": "What do you do when you're not cutting wood?",
        "first": "Press flowers between old pages. Go on, get the surprised face over with.",
        "replies": [
          [
            "I wasn't going to laugh.",
            "Good. Some of them took considerable finding."
          ],
          [
            "Why flowers?",
            "My daughter used to bring them home. I started keeping the ones she forgot."
          ],
          [
            "Does she know?",
            "She found them once. Went very quiet, then brought me another."
          ]
        ]
      }
    ],
    "greetings": [
      "You look lost. If you aren't, don't let me discourage you.",
      "I'm Corin. Still deciding where to go.",
      "Back, eh? That's almost a conversation habit.",
      "I've had worse habits.",
      "I've seen some large lizards, but none that made me reconsider my axe.",
      "I'm Corin. Please leave the axe out of our introduction."
    ]
  },
  "Wren": {
    "name": "Wren",
    "home": "Thornwell",
    "role": "Herbalist and merchant",
    "source": "03-thornwell.txt:11",
    "topics": [
      {
        "title": "The name you chose",
        "opening": "Was Wren always your name?",
        "first": "It's the one I chose. The old one belonged to somebody everybody had already decided about.",
        "replies": [
          [
            "Was leaving it difficult?",
            "Explaining was. Using it felt easy."
          ],
          [
            "Do people accept it?",
            "Most do. The others hear it again until they tire of the argument."
          ],
          [
            "Why Wren?",
            "Small bird, extraordinary noise. It seemed a useful ambition."
          ]
        ]
      },
      {
        "title": "A customer after sunset",
        "opening": "Has a customer ever come only for company?",
        "first": "An older man used to invent complaints so I'd visit. Eventually I asked whether we could have tea without discussing his elbow.",
        "replies": [
          [
            "Was he offended?",
            "Relieved. Inventing ailments was becoming hard work."
          ],
          [
            "Did you keep visiting?",
            "When I could. He made terrible tea and listened beautifully."
          ],
          [
            "How did you know?",
            "His elbow changed sides halfway through the week."
          ]
        ]
      },
      {
        "title": "A kindness you resent",
        "opening": "Can someone be too helpful?",
        "first": "My aunt keeps sending me advice. Wrapped around things I actually need. Very difficult to refuse gracefully.",
        "replies": [
          [
            "Have you told her?",
            "Yes. Now she says the advice is for someone else who might happen to be nearby."
          ],
          [
            "Does any of it help?",
            "Some. That's the most irritating part."
          ],
          [
            "What would you like her to send?",
            "A letter asking how I am, with room for the answer."
          ]
        ]
      }
    ],
    "greetings": [
      "You don't look like my usual customer. What brings you through Thornwell?",
      "I'm Corin, from Millwood. A little curiosity, mostly.",
      "Corin. A social visit, I hope?",
      "Unless curiosity's an illness.",
      "Oh. Is your companion likely to put his nose into things?",
      "I'm Corin, and I'm afraid curiosity runs through the party."
    ]
  },
  "Calder": {
    "name": "Calder",
    "home": "Road to Thornwell",
    "role": "Fisher and camp keeper",
    "source": "03-thornwell.txt:16",
    "topics": [
      {
        "title": "The night of the snoring",
        "opening": "What's the worst night you've had at camp?",
        "first": "Three strangers snoring in different rhythms. Whenever I adjusted to one, another began. Like musicians who hated each other.",
        "replies": [
          [
            "Did you wake them?",
            "They all denied it. One blamed the trees."
          ],
          [
            "How did you sleep?",
            "Badly, once they'd left."
          ],
          [
            "Would you turn them away next time?",
            "No. I'd sleep first and let them watch the road."
          ]
        ]
      },
      {
        "title": "A map of stars",
        "opening": "Do you know the names of the stars?",
        "first": "Odo taught me a few. Then admitted he'd invented some because I wouldn't stop asking.",
        "replies": [
          [
            "Which ones were invented?",
            "Probably the Crooked Teapot. Though I remain fond of it."
          ],
          [
            "Were you angry?",
            "For an afternoon. Then I invented a worse one and told him he was wrong."
          ],
          [
            "Do you still use his names?",
            "Yes. The sky would feel less like home without them."
          ]
        ]
      },
      {
        "title": "The life you didn't choose",
        "opening": "Did you always want to keep a camp?",
        "first": "Wanted to go everywhere at first. Discovered I liked the part where everyone stopped moving and started talking.",
        "replies": [
          [
            "Do you still want to travel?",
            "Sometimes. Staying by choice doesn't cure curiosity."
          ],
          [
            "Who tells the best stories?",
            "People who don't begin by announcing they're good at stories."
          ],
          [
            "What do you tell them?",
            "Small things. They can find their own monsters on the road."
          ]
        ]
      }
    ],
    "greetings": [
      "Come off the road a moment. No need to arrive anywhere breathless.",
      "Thanks. I'm Corin, from Millwood.",
      "Corin! How much road have you collected since last time?",
      "Enough to appreciate stopping.",
      "Well, that's one way to discourage uninvited camp visitors.",
      "I'm Corin. He's with me, if that's all right."
    ]
  },
  "Orin": {
    "name": "Orin",
    "home": "Thornwell",
    "role": "Gardener",
    "source": "03-thornwell.txt:21",
    "topics": [
      {
        "title": "The harvest moon party",
        "opening": "Why do you dislike the harvest moon celebration?",
        "first": "I don't dislike it. I dislike being appointed to arrange it because I once made the mistake of doing it well.",
        "replies": [
          [
            "Can't someone else arrange it?",
            "Everyone says they'd hate to disappoint me. Very flattering imprisonment."
          ],
          [
            "What would you change?",
            "I'd arrive late, eat too much, and complain about the arrangements."
          ],
          [
            "You could say no.",
            "I've rehearsed. It sounded magnificent to the cabbages."
          ]
        ]
      },
      {
        "title": "Orin's rival",
        "opening": "Who's your fiercest gardening rival?",
        "first": "A woman who claims she doesn't garden at all. Throws seeds down, forgets them, grows glorious things.",
        "replies": [
          [
            "Does that annoy you?",
            "Beyond all reason. I'm delighted for her in a very strained voice."
          ],
          [
            "Have you asked her secret?",
            "She says she hasn't one. Cruel woman."
          ],
          [
            "Perhaps you're trying too hard.",
            "Yes, that's precisely the sort of thing I'd prefer not to hear."
          ]
        ]
      },
      {
        "title": "The tree for a wedding",
        "opening": "Why plant a tree when someone marries?",
        "first": "So in twenty years there's somewhere to sit when they're tired of explaining how they met.",
        "replies": [
          [
            "Have you planted one?",
            "For my parents. Father complained about its position for years. Now it's his favourite shade."
          ],
          [
            "What kind was it?",
            "One that would grow well there. Romance shouldn't kill the tree."
          ],
          [
            "Would you plant one for yourself?",
            "I'd need someone prepared to disagree about the position with me."
          ]
        ]
      }
    ],
    "greetings": [
      "Careful. I'm deciding something and looking much wiser than I feel.",
      "I'm Corin. Should I come back?",
      "Ah, Corin. I decided. Changed my mind afterward, naturally.",
      "That's progress of a kind.",
      "Please tell me the dragon dislikes vegetables.",
      "I'm Corin. I haven't asked him about every vegetable yet."
    ]
  },
  "Isolde": {
    "name": "Isolde",
    "home": "Thornwell",
    "role": "Town resident",
    "source": "03-thornwell.txt:26",
    "topics": [
      {
        "title": "The neighbour's secret",
        "opening": "Have you ever learned a secret you wished you hadn't?",
        "first": "A neighbour confessed she'd never liked my singing. We'd been friends for twelve years. That's an impressive endurance.",
        "replies": [
          [
            "Did it hurt?",
            "Yes. Then she said she'd still like me to come round."
          ],
          [
            "Do you still sing for her?",
            "Less loudly. Friendship involves negotiations."
          ],
          [
            "What made her confess?",
            "I offered lessons. There's only so far loyalty can stretch."
          ]
        ]
      },
      {
        "title": "A room of your own",
        "opening": "What would you do with a room nobody else used?",
        "first": "Paint it yellow. Read untidy books. Leave a cup exactly where I put it.",
        "replies": [
          [
            "Untidy books?",
            "Books I can disagree with in the margins."
          ],
          [
            "Why yellow?",
            "My mother hated it. I loved her, but I also love yellow."
          ],
          [
            "Do you need a whole room?",
            "Probably not. But it's a pleasant size for a wish."
          ]
        ]
      },
      {
        "title": "A stranger at the table",
        "opening": "Would you invite a stranger to dinner?",
        "first": "Depends whether they listen. A charming talker can be a very long supper.",
        "replies": [
          [
            "What would you ask them?",
            "What surprised them that day. It usually produces something better than their title."
          ],
          [
            "What surprised you today?",
            "You asking me back. People often forget that part."
          ],
          [
            "Would I qualify?",
            "So far. Don't grow overconfident before pudding."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. You have the look of someone with a question.",
      "I'm Corin. I've usually got several.",
      "Corin, you've arrived before I finished wondering where you went.",
      "Shall I spoil the mystery?",
      "My word. I was expecting ordinary company today.",
      "I'm Corin. So was I, until recently."
    ]
  },
  "Ada": {
    "name": "Ada",
    "home": "Thornwell",
    "role": "Rowan's wife",
    "source": "03-thornwell.txt:31",
    "topics": [
      {
        "title": "The argument Rowan lost",
        "opening": "What's the longest argument you've had with Rowan?",
        "first": "Whether 'nearly home' includes an hour's walk. He thinks distance changes if you're cheerful about it.",
        "replies": [
          [
            "Who won?",
            "I stopped asking where he was and started asking what he could see."
          ],
          [
            "Does that work?",
            "Better. A hill is harder to exaggerate than a feeling."
          ],
          [
            "Do you mind him being late?",
            "I mind not knowing whether to worry or keep supper warm."
          ]
        ]
      },
      {
        "title": "Ada's own adventure",
        "opening": "What have you done that Rowan hasn't?",
        "first": "Travelled without needing to explain every footprint. He finds this deeply suspicious.",
        "replies": [
          [
            "Where did you go?",
            "Visiting family. I remember the conversation. He asks about the terrain."
          ],
          [
            "Does that bother you?",
            "Sometimes. I want him interested in what mattered to me."
          ],
          [
            "Have you told him?",
            "Yes. He tries. So do I when the conversation involves droppings."
          ]
        ]
      },
      {
        "title": "An old love letter",
        "opening": "Did Rowan write you love letters?",
        "first": "One. It began with the weather and took two pages to reach the point.",
        "replies": [
          [
            "What was the point?",
            "That he missed me. He'd disguised it brilliantly beneath rainfall."
          ],
          [
            "Did you keep it?",
            "Of course. I'm fond of the rainfall now."
          ],
          [
            "What did you write back?",
            "That I missed him too. One line. He said it was too short."
          ]
        ]
      }
    ],
    "greetings": [
      "Are you after Rowan, or have I finally got a visitor of my own?",
      "I'm Corin. I'd be glad to speak to you.",
      "Corin! Good. Come and tell me something that isn't about muddy boots.",
      "I'll choose carefully.",
      "Oh. Rowan comes home with a dog; you've made rather different arrangements.",
      "I'm Corin. I didn't plan the dragon part."
    ]
  },
  "Bren": {
    "name": "Bren",
    "home": "Thornwell",
    "role": "Amateur historian",
    "source": "03-thornwell.txt:36",
    "topics": [
      {
        "title": "History's missing meals",
        "opening": "What would you ask someone from a hundred years ago?",
        "first": "What they ate when nobody important was visiting. The records give everyone magnificent banquets and no breakfast.",
        "replies": [
          [
            "Why breakfast?",
            "Because it happened every day. History neglects the things people actually did most."
          ],
          [
            "Would that change anything?",
            "It would change how I pictured them. That's enough for a start."
          ],
          [
            "I'd ask whether they were happy.",
            "A harder question. I'd let them finish breakfast first."
          ]
        ]
      },
      {
        "title": "The portrait nobody liked",
        "opening": "Have you ever found an unflattering royal portrait?",
        "first": "A written description of one. The painter apparently made the ruler look exactly like himself. Serious diplomatic error.",
        "replies": [
          [
            "What happened to the painting?",
            "Painted over. You can learn a great deal from a missing picture."
          ],
          [
            "What happened to the painter?",
            "The account doesn't say. I dislike that silence."
          ],
          [
            "Could it be a joke?",
            "Certainly. I wish the writer had been clearer about who was laughing."
          ]
        ]
      },
      {
        "title": "A future historian",
        "opening": "What would you want someone to write about you?",
        "first": "That I was pleasant to disagree with. I'm still gathering evidence in support of it.",
        "replies": [
          [
            "You like arguments?",
            "I like finding something out. I sometimes confuse the two."
          ],
          [
            "What would they get wrong?",
            "They'd imagine I knew where every book was."
          ],
          [
            "Do you?",
            "Not remotely. Please don't spread that about."
          ]
        ]
      }
    ],
    "greetings": [
      "A new face. I promise not to ask your ancestry before your name.",
      "Corin. That seems a fair exchange.",
      "Corin! I've found something wonderfully inconclusive.",
      "You sound pleased about that.",
      "A dragon. This will make several confident books extremely embarrassing.",
      "I'm Corin. He's already embarrassed a few confident people."
    ]
  },
  "Berta": {
    "name": "Berta",
    "home": "Thornwell",
    "role": "Retired herbalist",
    "source": "03-thornwell.txt:41",
    "topics": [
      {
        "title": "An opinion nobody wanted",
        "opening": "What do you enjoy most about retirement?",
        "first": "Giving an opinion and leaving before anyone asks me to do the work.",
        "replies": [
          [
            "Doesn't that feel unfair?",
            "Enormously. I'm catching up on decades of fairness."
          ],
          [
            "Do people still ask your advice?",
            "Constantly. I make them bring their own chairs."
          ],
          [
            "What do you miss?",
            "Being expected somewhere. Don't tell anyone; they'll find me a committee."
          ]
        ]
      },
      {
        "title": "The patient who lied",
        "opening": "Could you tell when people weren't being honest?",
        "first": "A man once swore he'd rested his ankle. His boot had fresh roof tar on it.",
        "replies": [
          [
            "Had he been on his roof?",
            "His wife's roof, he said, as if that altered the ankle."
          ],
          [
            "Were you furious?",
            "Mostly frightened. People underestimate how frightening it is to care for them."
          ],
          [
            "What did you say?",
            "That the roof could wait longer than his bones could."
          ]
        ]
      },
      {
        "title": "Berta's unfinished business",
        "opening": "Is there something you still want to learn?",
        "first": "To swim. Everyone reacts as though I'd announced an intention to sprout wings.",
        "replies": [
          [
            "Why now?",
            "Because 'someday' has begun to sound rather insulting."
          ],
          [
            "Are you nervous?",
            "Very. I intend to be nervous in shallow water with help."
          ],
          [
            "Would you tell people afterward?",
            "I may become unbearable about it. A risk worth taking."
          ]
        ]
      }
    ],
    "greetings": [
      "Speak up, dear. My ears are selective and haven't selected you yet.",
      "I'm Corin. Can you hear me now?",
      "Corin, yes. I remember the questions.",
      "I've brought replacements.",
      "Well, that's a creature I never had to fit through a consulting-room door.",
      "I'm Corin. Fortunately he's feeling well."
    ]
  },
  "Della": {
    "name": "Della",
    "home": "Thornwell",
    "role": "Gardener",
    "source": "03-thornwell.txt:46",
    "topics": [
      {
        "title": "The secret competition",
        "opening": "Why do you get cross about the town flower display?",
        "first": "Because I say I don't care who wins, then spend a week caring with tremendous energy.",
        "replies": [
          [
            "Why pretend?",
            "Because losing gracefully seems easier if you never admitted entering properly."
          ],
          [
            "Have you won?",
            "Once. Became appallingly gracious overnight."
          ],
          [
            "Who knows you care?",
            "Everybody. I'm the last to receive this information."
          ]
        ]
      },
      {
        "title": "A garden for nobody",
        "opening": "Would you keep a garden if nobody saw it?",
        "first": "Yes. But I'd probably tell passersby how little I cared whether they looked.",
        "replies": [
          [
            "You like an audience.",
            "I like sharing pleasure. Also compliments. Both can be true."
          ],
          [
            "What do you enjoy alone?",
            "The first smell after rain. Nobody has improved it by talking."
          ],
          [
            "Should I leave you to it?",
            "Not now. It's quite pleasant talking to you."
          ]
        ]
      },
      {
        "title": "The borrowed dress",
        "opening": "Have you ever ruined something you borrowed?",
        "first": "A dress, at a wedding. Sat on berry juice. Spent the evening backing away from people.",
        "replies": [
          [
            "Did the owner notice?",
            "Immediately. She'd done the same thing the previous year."
          ],
          [
            "Was she angry?",
            "She said I should have asked where to sit."
          ],
          [
            "Did it wash out?",
            "Most of it. We called the remainder family history."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello! Please don't ask whether rain would be good for the garden. Everyone has.",
      "I'm Corin. I can find a different question.",
      "Corin, how nice. Have you brought news or an appetite?",
      "Is there a wrong answer?",
      "Oh, goodness. I'd better stop calling snails my largest problem.",
      "I'm Corin. He's quite gentle when nobody startles him."
    ]
  },
  "Ewan": {
    "name": "Ewan",
    "home": "Thornwell",
    "role": "Student of history",
    "source": "03-thornwell.txt:51",
    "topics": [
      {
        "title": "A hero's laundry",
        "opening": "Why are you interested in famous people's ordinary days?",
        "first": "Someone had to wash a hero's socks. I'd like to know whether they thought he was terribly impressive.",
        "replies": [
          [
            "Would that spoil the story?",
            "Only if the story needed him never to smell."
          ],
          [
            "What would you ask them?",
            "Whether he was kind when nobody needed him to be brave."
          ],
          [
            "Would you ask the hero?",
            "I'd rather ask the person doing the washing."
          ]
        ]
      },
      {
        "title": "The examination dream",
        "opening": "Do you worry about your studies?",
        "first": "I dream I'm asked a question and can only remember the page number. A very precise form of uselessness.",
        "replies": [
          [
            "Has that really happened?",
            "Once. The teacher was delighted by the page number. Less delighted by the silence."
          ],
          [
            "What scares you most?",
            "Discovering I only know how to remember, not how to think."
          ],
          [
            "You're thinking about it now.",
            "Yes. Inconveniently, there's no mark for that."
          ]
        ]
      },
      {
        "title": "The forbidden question",
        "opening": "Is there a question you're embarrassed to ask?",
        "first": "Whether I'm allowed to stop reading a book I hate. People speak as if abandoning it were a moral collapse.",
        "replies": [
          [
            "Of course you can stop.",
            "That's reassuringly brisk."
          ],
          [
            "What book?",
            "One whose author takes six pages to enter a room."
          ],
          [
            "Perhaps he gets lost.",
            "If so, I wish he'd take the reader's advice."
          ]
        ]
      }
    ],
    "greetings": [
      "Are you visiting? I've been trying to guess, which is a poor substitute for asking.",
      "Yes. I'm Corin, from Millwood.",
      "Corin! I have a question I haven't managed to make smaller.",
      "I'll brace myself.",
      "A living dragon. I suddenly have far too many questions.",
      "I'm Corin. Let's begin with names and work upward."
    ]
  },
  "Elric": {
    "name": "Elric",
    "home": "Thornwell",
    "role": "Letter writer",
    "source": "03-thornwell.txt:56",
    "topics": [
      {
        "title": "The letter to nobody",
        "opening": "Has anyone asked you to write to someone who couldn't answer?",
        "first": "A woman wrote to her dead husband. She knew he'd never receive it. She wanted the words somewhere outside herself.",
        "replies": [
          [
            "Did it help?",
            "She stopped holding her breath while she dictated. I took that as something."
          ],
          [
            "What did she say?",
            "That belongs to her."
          ],
          [
            "Did you charge her?",
            "For the paper. She insisted on paying for the work too."
          ]
        ]
      },
      {
        "title": "A beautiful lie",
        "opening": "Would you write something you knew was false?",
        "first": "I've written 'I am quite well' for people who were plainly struggling. I ask whether they're sure.",
        "replies": [
          [
            "Do you refuse?",
            "Not that lie. Sometimes it's all the dignity they can afford that morning."
          ],
          [
            "Would you lie for money?",
            "Depends on the lie. I won't help someone steal a life with a neat signature."
          ],
          [
            "What would you write for yourself?",
            "Something less cautious than I usually say aloud."
          ]
        ]
      },
      {
        "title": "The sound of ink",
        "opening": "Do you hear a person's voice when you read their letter?",
        "first": "If I know them. My brother's letters sound impatient even when he only lists vegetables.",
        "replies": [
          [
            "What do yours sound like?",
            "My sister says I sound dressed for a wedding."
          ],
          [
            "Are you that formal?",
            "On paper. It's armour nobody can see."
          ],
          [
            "Would you like to change it?",
            "Yes. I'm practising signing without apologising for taking up space."
          ]
        ]
      }
    ],
    "greetings": [
      "Need words written, or have you brought your own?",
      "My own. I'm Corin.",
      "Corin. A familiar voice makes a pleasant break from unfamiliar handwriting.",
      "I'll try to speak legibly.",
      "I shall struggle to describe this in a letter without sounding drunk.",
      "I'm Corin. You can blame me for the dragon if necessary."
    ]
  },
  "Mara": {
    "name": "Mara",
    "home": "Thornwell",
    "role": "Baker",
    "source": "03-thornwell.txt:61",
    "topics": [
      {
        "title": "The baker's rival",
        "opening": "Who makes the best food in Thornwell?",
        "first": "For bread, me. For anything I can eat sitting down while somebody else cooks, almost anyone.",
        "replies": [
          [
            "Would you say that publicly?",
            "The bread part, certainly."
          ],
          [
            "Do you ever get cooked for?",
            "My sister tries. She asks for instructions every few minutes, which somewhat defeats the pleasure."
          ],
          [
            "What would you ask for?",
            "Something I don't know how to make. Then I'd have to keep quiet."
          ]
        ]
      },
      {
        "title": "The rumour of wealth",
        "opening": "Why do people think bakers are rich?",
        "first": "They count the coins and forget the flour, the fuel, the rent. A tray full of food looks like money until you sell it.",
        "replies": [
          [
            "Does that make you bitter?",
            "On rent day. I recover by breakfast."
          ],
          [
            "What do you enjoy about it?",
            "Feeding someone who wasn't sure they could afford to eat."
          ],
          [
            "Do people repay you?",
            "Sometimes in coin. Sometimes by coming back when they're doing better."
          ]
        ]
      },
      {
        "title": "Mara's birthday rule",
        "opening": "Why won't you bake your own birthday cake?",
        "first": "Because I want someone to make it without me correcting them. My birthday present is resisting the urge.",
        "replies": [
          [
            "What if it's awful?",
            "Then I eat an awful cake made for me. I've had worse birthdays."
          ],
          [
            "Does anyone dare bake it?",
            "My niece. She fears nothing, including quantities."
          ],
          [
            "What does she put in it?",
            "Everything she considers festive. Last year was unusually crunchy."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello, stranger. You've arrived with excellent timing or terrible hunger.",
      "I'm Corin. Possibly both.",
      "Corin! I remembered the name before you said it.",
      "That's more than I manage sometimes.",
      "Please tell me a dragon doesn't count as one hungry customer.",
      "I'm Corin. I wouldn't trust that arithmetic either."
    ]
  },
  "Kit": {
    "name": "Kit",
    "home": "Thornwell",
    "role": "Messenger",
    "source": "03-thornwell.txt:66",
    "topics": [
      {
        "title": "The fastest route",
        "opening": "Why do you know so many shortcuts?",
        "first": "Because adults keep saying 'just a quick errand'. I decided to make the lie true.",
        "replies": [
          [
            "What's your favourite shortcut?",
            "The one where nobody calls my name halfway through."
          ],
          [
            "Do you ever get lost?",
            "Briefly. I call it investigating."
          ],
          [
            "What if someone asks you to hurry?",
            "I ask whether they want speed or their parcel intact."
          ]
        ]
      },
      {
        "title": "A message for yourself",
        "opening": "What message would you like someone to bring you?",
        "first": "That a whole day belongs to me. No errands hidden inside favours.",
        "replies": [
          [
            "What would you do?",
            "Follow a road without carrying anything for anyone."
          ],
          [
            "Would you come back?",
            "Of course. I'd want to tell somebody where I'd been."
          ],
          [
            "Could you take a day off?",
            "I'm learning to say no without adding a long explanation."
          ]
        ]
      },
      {
        "title": "Kit's great invention",
        "opening": "What would make your work easier?",
        "first": "A town where everyone stayed at the address written on their letters. Wild ambition, I know.",
        "replies": [
          [
            "You'd be out of work.",
            "I'd deliver congratulations to everybody for being findable."
          ],
          [
            "What about a flying messenger?",
            "I suppose I'd have to learn to wave professionally."
          ],
          [
            "Do you like the work at all?",
            "Most days. Complaining is the part they let me do sitting down."
          ]
        ]
      }
    ],
    "greetings": [
      "If you're asking for directions, I charge one interesting fact.",
      "I'm Corin. Does being from Millwood count?",
      "Corin! Still moving, then?",
      "Whenever nobody stops me with an interesting question.",
      "Can the dragon deliver messages? Asking for professional reasons.",
      "I'm Corin. Let's introduce ourselves before recruiting him."
    ]
  },
  "Mabel": {
    "name": "Mabel",
    "home": "Thornwell",
    "role": "Weaver",
    "source": "03-thornwell.txt:71",
    "topics": [
      {
        "title": "The family portrait",
        "opening": "Why did you leave yourself out of a family hanging?",
        "first": "I was the one making it. Somehow I remembered everybody except myself.",
        "replies": [
          [
            "Did someone notice?",
            "My youngest asked where I'd gone. I had no good answer."
          ],
          [
            "Did you add yourself?",
            "Yes. Larger than strictly necessary."
          ],
          [
            "What did your family say?",
            "That it looked more like us. I hadn't realised how much I wanted to hear that."
          ]
        ]
      },
      {
        "title": "A colour you hate",
        "opening": "Is there a colour you can't stand?",
        "first": "A particular dull brown. I wore it for years because it was practical. I came to resent its good sense.",
        "replies": [
          [
            "What do you wear now?",
            "Whatever pleases me. Practicality hasn't stopped the sun rising."
          ],
          [
            "Did anyone object?",
            "Several people. None offered to live my life for me, so I ignored them."
          ],
          [
            "Does colour matter that much?",
            "On a hard morning, a little. Little things get more opportunities than grand ones."
          ]
        ]
      },
      {
        "title": "The traveller's cloth",
        "opening": "Can you tell where someone comes from by their clothes?",
        "first": "Sometimes. More often I can tell who repaired them with care.",
        "replies": [
          [
            "How?",
            "The hidden stitches. The ones nobody expects to be admired."
          ],
          [
            "Would you recognise Nan's work?",
            "Not yet. But I expect you would."
          ],
          [
            "What would mine tell you?",
            "That you've had a life before this conversation. People forget that about strangers."
          ]
        ]
      }
    ],
    "greetings": [
      "A visitor. How nice to meet someone who hasn't already heard my opinion.",
      "I'm Corin. I'll hear it fresh.",
      "Corin, you've come back. I didn't frighten you off, then.",
      "Should you have?",
      "Well, I've woven stranger creatures. None of them breathed at me.",
      "I'm Corin. This one's rather more alive."
    ]
  },
  "Maren": {
    "name": "Maren",
    "home": "Thornwell",
    "role": "Innkeeper",
    "source": "03-thornwell.txt:76",
    "topics": [
      {
        "title": "The guest book",
        "opening": "Why keep names after people leave?",
        "first": "A woman once returned and asked whether her husband had stayed with us years before. I could tell her he had.",
        "replies": [
          [
            "Was she looking for him?",
            "No. He'd died. She was visiting places he'd told her about."
          ],
          [
            "What else could you tell her?",
            "That he'd asked for a second blanket and praised breakfast. Small things. They mattered."
          ],
          [
            "Do you remember everybody?",
            "No. That's why I write things down."
          ]
        ]
      },
      {
        "title": "The room nobody wanted",
        "opening": "Have you ever had a room people thought was haunted?",
        "first": "A shutter knocked at night. The first guest called it a ghost. After that every draught had a personality.",
        "replies": [
          [
            "Did you fix the shutter?",
            "Yes. Lost my most interesting advertisement."
          ],
          [
            "Did anyone want the ghost room?",
            "More people than wanted the ordinary ones."
          ],
          [
            "Were you tempted to leave it?",
            "Briefly. Then I imagined being the tired guest trying to sleep."
          ]
        ]
      },
      {
        "title": "A holiday in your own town",
        "opening": "Where would you go on holiday?",
        "first": "Somewhere I'd never have to ask whether anyone needed another towel.",
        "replies": [
          [
            "Would you stay at an inn?",
            "Yes. I'd be a dreadful guest. I'd notice everything."
          ],
          [
            "What would make you happy?",
            "Someone telling me when dinner was ready."
          ],
          [
            "Could someone mind this place?",
            "They could. I have to stop treating that possibility as an insult."
          ]
        ]
      }
    ],
    "greetings": [
      "Welcome. Before you ask, people who say they don't snore usually do.",
      "I'm Corin. I'll make no promises.",
      "Corin, back through Thornwell? It's good to have a name for a returning face.",
      "It's good to be remembered.",
      "Oh, dear. My room sizes have become a sensitive subject.",
      "I'm Corin. We'll keep the dragon outside."
    ]
  },
  "Asta": {
    "name": "Asta",
    "home": "Thornwell",
    "role": "Student of nature",
    "source": "04-thornwell-neighbours.txt:1",
    "topics": [
      {
        "title": "The moth at the window",
        "opening": "Why do moths interest you?",
        "first": "One kept visiting my window. I gave it a name before discovering there were at least seven of them.",
        "replies": [
          [
            "Did they all keep the name?",
            "Yes. They seemed unlikely to complain."
          ],
          [
            "Could you tell them apart?",
            "Eventually. I was embarrassed by how little I'd looked before naming them."
          ],
          [
            "What was the name?",
            "Professor. They looked exceedingly busy without explaining themselves."
          ]
        ]
      },
      {
        "title": "Asta's frightening discovery",
        "opening": "Have you ever found something you were afraid to touch?",
        "first": "A shed snake skin. I knew what it was. My hands took longer to be convinced.",
        "replies": [
          [
            "Did you pick it up?",
            "With a stick first. Bravery arrived in stages."
          ],
          [
            "What did you do with it?",
            "Drew it, then left it. It didn't need to become my possession."
          ],
          [
            "Would you touch a live snake?",
            "Not without knowing what I was doing. Curiosity isn't a qualification."
          ]
        ]
      },
      {
        "title": "The wrong sort of book",
        "opening": "Why don't you read stories very often?",
        "first": "I get distracted wondering whether the animals are behaving plausibly. Ruins the suspense.",
        "replies": [
          [
            "Even talking animals?",
            "Especially those. They all sound like disappointed schoolteachers."
          ],
          [
            "What would your talking animals say?",
            "Probably ask us to leave."
          ],
          [
            "Would you write that book?",
            "It would be very short and refreshingly rude."
          ]
        ]
      }
    ],
    "greetings": [
      "Sorry, I was watching something very small. Hello.",
      "I'm Corin. I can wait for the small thing.",
      "Corin! You haven't stepped on anything interesting, have you?",
      "Not knowingly.",
      "Oh. My notes are about to become entirely inadequate.",
      "I'm Corin. This is a larger interruption than usual."
    ]
  },
  "Colm": {
    "name": "Colm",
    "home": "Thornwell",
    "role": "Enthusiastic cook",
    "source": "04-thornwell-neighbours.txt:6",
    "topics": [
      {
        "title": "A meal in the dark",
        "opening": "Have you ever eaten without knowing what it was?",
        "first": "During a powerfully smoky supper. I praised the onions. They were apples. Nobody corrected me until I'd explained my expertise.",
        "replies": [
          [
            "Was it good?",
            "Excellent. I was the only bad ingredient."
          ],
          [
            "Did you ask for the recipe?",
            "Eventually. Pride delayed the paperwork."
          ],
          [
            "Would you eat it again?",
            "In daylight, ideally."
          ]
        ]
      },
      {
        "title": "The invitation you feared",
        "opening": "Have you ever dreaded a dinner invitation?",
        "first": "Yes. A man invited six people to admire his new chairs. The food was merely a reason to sit in them.",
        "replies": [
          [
            "Were the chairs comfortable?",
            "No. We were apparently supposed to admire them standing up."
          ],
          [
            "Did you say anything?",
            "I praised his courage in choosing them."
          ],
          [
            "Was that kind?",
            "It was the kindest available sentence."
          ]
        ]
      },
      {
        "title": "A taste of childhood",
        "opening": "What food do you miss most?",
        "first": "Burnt porridge. My father was a terrible cook. After he died I discovered nobody burned it quite the same way.",
        "replies": [
          [
            "Have you tried making it?",
            "Yes. I keep making it better by accident."
          ],
          [
            "Did you like it then?",
            "No. I liked him sitting beside me while I complained."
          ],
          [
            "Would you serve it to someone?",
            "Only someone willing to hear why."
          ]
        ]
      }
    ],
    "greetings": [
      "You look like someone with an opinion about supper.",
      "I'm Corin. Usually a favourable one.",
      "Corin, I've had an idea. Nobody's suffered from it yet.",
      "That sounds cautiously promising.",
      "I was going to ask how many you're feeding. The answer has become complicated.",
      "I'm Corin. His appetite needs its own conversation."
    ]
  },
  "Tessa": {
    "name": "Tessa",
    "home": "Thornwell and Forgewick",
    "role": "Travelling musician",
    "source": "04-thornwell-neighbours.txt:11",
    "topics": [
      {
        "title": "The tune without a name",
        "opening": "Have you ever forgotten where a tune came from?",
        "first": "One follows me everywhere. My mother hummed it, but she couldn't remember who taught her.",
        "replies": [
          [
            "Does that bother you?",
            "Sometimes. I feel as though I'm carrying somebody's letter without the address."
          ],
          [
            "Could it be hers?",
            "Perhaps. She never believed anything she made deserved keeping."
          ],
          [
            "Will you keep playing it?",
            "Yes. Even without a name, it knows where to go."
          ]
        ]
      },
      {
        "title": "An audience of one",
        "opening": "Who's the best audience you've ever had?",
        "first": "A tired woman who closed her eyes halfway through. I thought she'd fallen asleep. She asked me not to stop.",
        "replies": [
          [
            "What did you play?",
            "Something quiet. It hardly mattered which tune."
          ],
          [
            "Did she explain afterward?",
            "No. I didn't ask her to pay for the song with a story."
          ],
          [
            "Was she grateful?",
            "She looked rested. I liked that better than applause."
          ]
        ]
      },
      {
        "title": "A travelling argument",
        "opening": "What's hardest about travelling with other musicians?",
        "first": "Agreeing whether a silence is peaceful or a chance to practise.",
        "replies": [
          [
            "Which side are you on?",
            "Depends who is practising."
          ],
          [
            "Do you quarrel often?",
            "About small things until someone admits they're homesick."
          ],
          [
            "What helps?",
            "Eating. It's remarkable how many artistic disputes require a meal."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. If you're about to request a song, tell me your name first.",
      "Corin. No request yet.",
      "Corin! A listener I recognise.",
      "And a musician I can find by ear.",
      "A dragon. I wonder what sort of music he hears in his head.",
      "I'm Corin. I could ask him, though he may be biased."
    ]
  },
  "Rowan the Hunter": {
    "name": "Rowan the Hunter",
    "home": "Thornwell",
    "role": "Hunter and Bramble's owner",
    "source": "04-thornwell-neighbours.txt:16",
    "topics": [
      {
        "title": "A dog's judgement",
        "opening": "Has Bramble ever disliked someone you liked?",
        "first": "A charming fellow offered to buy him. Bramble sat behind Ada and refused to come out.",
        "replies": [
          [
            "Would you have sold him?",
            "Never. I was annoyed with myself for laughing at the offer."
          ],
          [
            "Could he understand?",
            "He understood the reaching hand. That was enough."
          ],
          [
            "Did Ada like the man?",
            "Not after that. Our household reached a swift agreement."
          ]
        ]
      },
      {
        "title": "The first lie to Ada",
        "opening": "Have you ever lied to Ada about a bad day?",
        "first": "Said I'd had an easy walk. Then fell asleep holding a spoon. Not my most convincing performance.",
        "replies": [
          [
            "Why lie?",
            "Didn't want her worrying. She disliked being excluded more."
          ],
          [
            "What did she say?",
            "That she could bear hearing I'd struggled. She couldn't bear having to guess."
          ],
          [
            "Do you tell her now?",
            "More. Old habits don't retire just because you've embarrassed them."
          ]
        ]
      },
      {
        "title": "The hunter's mercy",
        "opening": "Have you ever let an animal go when you needed the food?",
        "first": "Yes. Once I'd made a poor shot possible, not a clean one. Hunger didn't make my hands steadier.",
        "replies": [
          [
            "Was turning back hard?",
            "Very. Being hungry with a reason is still being hungry."
          ],
          [
            "Did anyone blame you?",
            "I blamed myself enough without recruiting help."
          ],
          [
            "Would you do the same again?",
            "Yes. I need to be able to live with what I do out there."
          ]
        ]
      }
    ],
    "greetings": [
      "Rowan. Are you looking for someone, lad?",
      "Corin. Perhaps you can help.",
      "Corin! Good to see you walking into town of your own accord.",
      "Better than being dragged by a dog.",
      "I've hunted all my life and never expected a dragon to come looking for conversation.",
      "I'm Corin. We're hoping for a friendly welcome."
    ]
  },
  "Osric": {
    "name": "Osric",
    "home": "Thornwell",
    "role": "Weaver and reader",
    "source": "04-thornwell-neighbours.txt:21",
    "topics": [
      {
        "title": "The margin argument",
        "opening": "Why do you write objections in your books?",
        "first": "Because an author shouldn't get the last word just by being absent.",
        "replies": [
          [
            "Do you ever change your mind?",
            "Then I argue with my earlier handwriting."
          ],
          [
            "Doesn't it ruin the book?",
            "It makes the book mine. I leave borrowed ones in peace."
          ],
          [
            "What do you argue about?",
            "Usually someone declaring that people are simple. People who say that make me suspicious."
          ]
        ]
      },
      {
        "title": "The reader at dinner",
        "opening": "Have you ever read at the table?",
        "first": "Once I was asked to pass the salt and handed over my book. It was a much more interesting contribution.",
        "replies": [
          [
            "Did anyone appreciate it?",
            "My sister put salt on the page. Fair criticism."
          ],
          [
            "Have you stopped?",
            "At family meals. Supper alone remains negotiable."
          ],
          [
            "What was so interesting?",
            "I've forgotten. I remember the salt vividly."
          ]
        ]
      },
      {
        "title": "An unwritten ending",
        "opening": "Would you ever write a story yourself?",
        "first": "I have an ending. Unfortunately, nobody in it has done anything to deserve it yet.",
        "replies": [
          [
            "What happens at the end?",
            "Someone comes home. That's all I'm sure of."
          ],
          [
            "Sounds like a beginning too.",
            "Yes. That's precisely the trouble."
          ],
          [
            "Why that ending?",
            "I like knowing there's somewhere a person is expected."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. If I've been staring, forgive me. I was thinking past you.",
      "I'm Corin. I'll try not to obstruct the thought.",
      "Corin, you've arrived at a good stopping place.",
      "In the book or the thinking?",
      "A dragon! I can no longer complain that the interesting things only happen in books.",
      "I'm Corin. I used to think that too."
    ]
  },
  "Alder": {
    "name": "Alder",
    "home": "Thornwell",
    "role": "Beekeeper",
    "source": "04-thornwell-neighbours.txt:26",
    "topics": [
      {
        "title": "The honey thief",
        "opening": "Who steals the most honey from you?",
        "first": "Me. I taste a batch for quality and lose all respect for measurement.",
        "replies": [
          [
            "Does Gwyneth know?",
            "She says my professional standards are making me sticky."
          ],
          [
            "Have you ever been caught?",
            "Holding the spoon. Difficult to call that circumstantial."
          ],
          [
            "Is every batch different?",
            "Enough to justify another taste. You see my difficulty."
          ]
        ]
      },
      {
        "title": "A bee's reputation",
        "opening": "Does it annoy you when people call bees vicious?",
        "first": "Yes. Imagine someone lifting your roof and complaining when you objected.",
        "replies": [
          [
            "You've been stung, though.",
            "Often. Knowing the reason doesn't make it pleasant."
          ],
          [
            "Are you ever afraid?",
            "When something changes and I don't understand it. That's a useful time to slow down."
          ],
          [
            "Would you rather keep gentler creatures?",
            "I've met people. I'm not sure where I'd find them."
          ]
        ]
      },
      {
        "title": "A letter from a child",
        "opening": "What's the nicest thing anyone's said about your work?",
        "first": "A child asked whether I knew every bee's name. I'd never felt so magnificently overqualified.",
        "replies": [
          [
            "What did you tell them?",
            "That they changed shifts too quickly."
          ],
          [
            "Did they believe you?",
            "They offered to help with introductions."
          ],
          [
            "Did you accept?",
            "We named three. Probably the same bee twice."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello there. If you're afraid of bees, say so. No shame in honest distance.",
      "I'm Corin. Respectfully cautious.",
      "Corin! Still curious about everything?",
      "I haven't found a cure.",
      "A dragon. I must tell Gwyneth before somebody improves the story.",
      "I'm Corin. Please keep the size accurate."
    ]
  },
  "Gwyneth": {
    "name": "Gwyneth",
    "home": "Thornwell",
    "role": "Neighbour and host",
    "source": "04-thornwell-neighbours.txt:31",
    "topics": [
      {
        "title": "The guest who rearranged everything",
        "opening": "What's the rudest thing a guest has done?",
        "first": "Moved all my furniture to improve the conversation. Then sat where nobody could see him.",
        "replies": [
          [
            "Did you move it back?",
            "After he left. I discovered I liked one change, which made me cross."
          ],
          [
            "Why didn't you stop him?",
            "I was waiting for the astonishment to become words."
          ],
          [
            "Would you invite him again?",
            "For a walk. No furniture available."
          ]
        ]
      },
      {
        "title": "Gwyneth's small rebellion",
        "opening": "What's something you do purely to please yourself?",
        "first": "Buy flowers with no practical use. Alder keeps suggesting varieties useful to bees.",
        "replies": [
          [
            "Do you listen?",
            "Occasionally. Then I buy something gloriously unhelpful."
          ],
          [
            "Does he mind?",
            "No. He just has difficulty seeing an unoccupied opportunity for honey."
          ],
          [
            "What do you like about flowers?",
            "That liking them is enough."
          ]
        ]
      },
      {
        "title": "The empty invitation",
        "opening": "Have you ever invited someone out of politeness and regretted it?",
        "first": "Yes. They came, and I discovered I liked them. It was my original politeness I regretted.",
        "replies": [
          [
            "Why?",
            "I'd decided they were tiresome without really listening."
          ],
          [
            "What changed your mind?",
            "They asked a question nobody else had thought to ask."
          ],
          [
            "What question?",
            "Whether I was tired. Such a small thing to notice."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. Come and say something I haven't already heard from Alder.",
      "I'm Corin. I'll avoid bees initially.",
      "Corin, how lovely. I remember you left me with a question.",
      "Was it a good one?",
      "Oh, my. Alder will talk about this for a month.",
      "I'm Corin. I apologise in advance for the repetition."
    ]
  },
  "Eira": {
    "name": "Eira",
    "home": "Thornwell",
    "role": "Cider maker",
    "source": "04-thornwell-neighbours.txt:36",
    "topics": [
      {
        "title": "The ceremonial barrel",
        "opening": "Why did you refuse to name a barrel after the king?",
        "first": "Because a barrel is useful. I didn't say that part aloud.",
        "replies": [
          [
            "What did you say?",
            "That the name wouldn't fit."
          ],
          [
            "Did anyone believe you?",
            "They appreciated my concern for lettering."
          ],
          [
            "Were you frightened?",
            "Afterward. During it I was mostly irritated."
          ]
        ]
      },
      {
        "title": "A talent for silence",
        "opening": "Are you quiet at home too?",
        "first": "No. At home I sing at a volume my neighbours consider ambitious.",
        "replies": [
          [
            "Are you any good?",
            "No. Home is where I don't have to be."
          ],
          [
            "Do you take requests?",
            "Mostly requests to stop."
          ],
          [
            "Does that bother you?",
            "Only if they're shouted before the chorus."
          ]
        ]
      },
      {
        "title": "The bottle saved too long",
        "opening": "Have you ever saved something for so long you wasted it?",
        "first": "A bottle for an occasion important enough. When I opened it, it had gone sour.",
        "replies": [
          [
            "What occasion did you choose?",
            "An ordinary supper. I'd finally come to my senses too late."
          ],
          [
            "Did you throw it away?",
            "Yes. Kept the bottle as an irritating reminder."
          ],
          [
            "What do you celebrate now?",
            "People turning up. It happens less often than we assume."
          ]
        ]
      }
    ],
    "greetings": [
      "New face. I'm Eira. Don't believe everything people say about my cider.",
      "Corin. I'll reserve judgement.",
      "Corin! Still here to tell the tale?",
      "Which tale have you heard?",
      "Does dragon fire count as assistance or a catastrophe in cider making?",
      "I'm Corin. I'd assume catastrophe until proven otherwise."
    ]
  },
  "Fenton": {
    "name": "Fenton",
    "home": "Thornwell",
    "role": "Traveller and storyteller",
    "source": "04-thornwell-neighbours.txt:41",
    "topics": [
      {
        "title": "The story you stole",
        "opening": "Have you ever told someone else's story as your own?",
        "first": "Once. The person whose story it was walked into the room halfway through.",
        "replies": [
          [
            "What did you do?",
            "Introduced him as a reliable witness. He introduced me as an unreliable narrator."
          ],
          [
            "Were you ashamed?",
            "Dreadfully. Everyone laughed, but he didn't owe me that kindness."
          ],
          [
            "Did you stop doing it?",
            "Yes. My own mistakes supply plenty of material."
          ]
        ]
      },
      {
        "title": "A town you disliked",
        "opening": "Have you ever left somewhere and missed it unexpectedly?",
        "first": "A noisy town where I slept badly. Missed the woman who sold breakfast. Never even learned her name.",
        "replies": [
          [
            "Would you go back?",
            "I'd like to. I'm afraid I'd make too much of an ordinary kindness."
          ],
          [
            "What did she do?",
            "Remembered I disliked onions. After weeks of being a stranger, that felt enormous."
          ],
          [
            "You could just thank her.",
            "Yes. I complicate things for a living."
          ]
        ]
      },
      {
        "title": "Fenton's honest ending",
        "opening": "Why do you always finish stories neatly?",
        "first": "Because life generally refuses to. I like giving people somewhere to put the feeling down.",
        "replies": [
          [
            "Doesn't that make them untrue?",
            "Sometimes. I'm learning to say when I've improved something."
          ],
          [
            "What's your least tidy story?",
            "Someone I loved left. I still don't know whether I should have followed."
          ],
          [
            "How do you tell that one?",
            "Rarely. And without jokes."
          ]
        ]
      }
    ],
    "greetings": [
      "A fellow traveller? Tell me your name before I invent one.",
      "Corin. Please use that version.",
      "Corin! I was hoping the road would bring you back.",
      "It's been reasonably cooperative.",
      "Now that's an entrance. Mine suddenly seems under-rehearsed.",
      "I'm Corin. The dragon wasn't hired for effect."
    ]
  },
  "Celia": {
    "name": "Celia",
    "home": "Thornwell",
    "role": "History enthusiast",
    "source": "04-thornwell-neighbours.txt:46",
    "topics": [
      {
        "title": "The woman in the footnote",
        "opening": "Who do you wish people remembered better?",
        "first": "A woman who kept a town fed during a siege. The account gives three pages to a captain's horse and half a line to her.",
        "replies": [
          [
            "Do you know her name?",
            "Only part of it. I keep hoping another account will finish the sentence."
          ],
          [
            "Why the horse?",
            "The captain commissioned the book."
          ],
          [
            "Would you write a different one?",
            "I'd start by asking who did the work."
          ]
        ]
      },
      {
        "title": "A familiar superstition",
        "opening": "Is there a superstition you follow even though you don't believe it?",
        "first": "I greet the first bird I see in the morning. My grandmother insisted. It's less belief than affection now.",
        "replies": [
          [
            "What if someone hears?",
            "I introduce them to the bird."
          ],
          [
            "Does it bring good luck?",
            "The bird has never filed a report."
          ],
          [
            "What if you forget?",
            "Then I feel I've been rude to my grandmother, which is much worse than bad luck."
          ]
        ]
      },
      {
        "title": "Tomorrow's history",
        "opening": "What will people get wrong about us someday?",
        "first": "They'll think we knew how things would turn out. Every account makes uncertainty look like a straight road.",
        "replies": [
          [
            "What would you write instead?",
            "That we guessed. That we changed our minds. That some days we just got through."
          ],
          [
            "Would anyone read that?",
            "I would. It sounds considerably more like company."
          ],
          [
            "Should I remember my doubts?",
            "Yes. They belong to the story too."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. I'm Celia. You look as though you've actually been somewhere.",
      "Corin. Mostly Millwood, until recently.",
      "Corin! Tell me you noticed something odd on the road.",
      "I'll have to narrow it down.",
      "A dragon. Well, I asked for interesting news and have been thoroughly answered.",
      "I'm Corin. I promise he's real."
    ]
  },
  "Archivist Elowen": {
    "name": "Archivist Elowen",
    "home": "Thornwell school",
    "role": "Archivist",
    "source": "05-school.txt:1",
    "topics": [
      {
        "title": "The book returned late",
        "opening": "What's the latest anyone's returned a book?",
        "first": "Twenty-three years. The borrower apologised as though she'd only missed breakfast.",
        "replies": [
          [
            "Did you charge a fine?",
            "She offered. I asked her to tell me where the book had been instead."
          ],
          [
            "Where had it been?",
            "Three homes, a marriage, a flood. It had lived more than some of its readers."
          ],
          [
            "Was it damaged?",
            "Yes. And full of notes I was glad to have."
          ]
        ]
      },
      {
        "title": "The page you kept",
        "opening": "Have you ever wanted to keep something you should have shared?",
        "first": "A letter in an old collection. It felt so private I couldn't bear cataloguing it.",
        "replies": [
          [
            "What did you do?",
            "Recorded that it existed without making a spectacle of its pain."
          ],
          [
            "Who decides what's private?",
            "That's the question that kept me awake."
          ],
          [
            "Would you make the same choice now?",
            "Yes. Curiosity doesn't make every door ours to open."
          ]
        ]
      },
      {
        "title": "Elowen's forgotten word",
        "opening": "Do you ever forget an ordinary word?",
        "first": "Yesterday I called a spoon a small soup shovel. My mind had supplied the function and abandoned the dignity.",
        "replies": [
          [
            "Did anyone laugh?",
            "Iven wrote it down. Friendship has its limits."
          ],
          [
            "Were you embarrassed?",
            "Until somebody asked me to pass the large soup shovel."
          ],
          [
            "Does it happen often?",
            "Only when I'm trying to sound particularly authoritative."
          ]
        ]
      }
    ],
    "greetings": [
      "Welcome. A question is a perfectly good reason to be here.",
      "I'm Corin. I brought several.",
      "Corin. Have your questions multiplied since last time?",
      "They've been very industrious.",
      "A dragon. I shall need a new definition of a quiet visitor.",
      "I'm Corin. We'll try to respect the books."
    ]
  },
  "Mira": {
    "name": "Mira",
    "home": "Thornwell school",
    "role": "Student of the mines",
    "source": "05-school.txt:6",
    "topics": [
      {
        "title": "The first descent",
        "opening": "What frightens you about going underground?",
        "first": "Not the dark exactly. The moment the daylight becomes a small shape behind you.",
        "replies": [
          [
            "Have you felt that?",
            "Yes. I kept turning to make sure it was still there."
          ],
          [
            "Why study it then?",
            "Because fear hasn't made me less curious."
          ],
          [
            "What helps?",
            "Knowing who's beside me. And being able to say I want to go back."
          ]
        ]
      },
      {
        "title": "A stone from home",
        "opening": "Do you keep a stone in your pocket?",
        "first": "From outside the house where I grew up. Completely ordinary. I was disappointed when someone identified it so quickly.",
        "replies": [
          [
            "What had you hoped it was?",
            "Something rare enough to explain why I couldn't throw it away."
          ],
          [
            "You don't need a rare stone.",
            "I know that now. Then, I wanted a scholarly excuse."
          ],
          [
            "Does carrying it help?",
            "On strange mornings. My hand knows it before my head catches up."
          ]
        ]
      },
      {
        "title": "The scholar's boots",
        "opening": "Why do you dislike being called clever?",
        "first": "I don't. I dislike when people use it to mean I couldn't possibly carry my own bag.",
        "replies": [
          [
            "Do they say that?",
            "They say it kindly, which makes arguing harder."
          ],
          [
            "What do you want them to notice?",
            "That I've practised. Not everything I can do arrived as a gift."
          ],
          [
            "I'd rather be useful than clever.",
            "I'd like to be allowed both, depending on the day."
          ]
        ]
      }
    ],
    "greetings": [
      "Oh, hello. Are you interested in what lies under our feet?",
      "I'm Corin. Usually I hope it's solid.",
      "Corin! I've been thinking about something you might understand.",
      "That's a generous assumption.",
      "A dragon! Does he mind questions about places he can fit?",
      "I'm Corin. He may prefer questions about open sky."
    ]
  },
  "Oren": {
    "name": "Oren",
    "home": "Thornwell school",
    "role": "Student of spirits",
    "source": "05-school.txt:11",
    "topics": [
      {
        "title": "The polite ghost",
        "opening": "Do ghost stories ever make you laugh?",
        "first": "One describes a spirit who kept apologising for frightening people. Eventually the household apologised for being frightened.",
        "replies": [
          [
            "Do you believe it?",
            "I believe the person telling it liked people."
          ],
          [
            "Would you want to meet that ghost?",
            "At a reasonable hour, with advance notice."
          ],
          [
            "How does the story end?",
            "They grew accustomed to one another. A disappointingly sensible haunting."
          ]
        ]
      },
      {
        "title": "Oren's fear",
        "opening": "What are you actually afraid of?",
        "first": "Forgetting someone's voice. You can keep their words and still lose the sound.",
        "replies": [
          [
            "Whose voice?",
            "My grandfather's. I can remember his laugh better than his speaking."
          ],
          [
            "Do you imitate it?",
            "Badly, in private. I'm not ready to let anybody correct me."
          ],
          [
            "Could you write it down?",
            "I've tried. Words describe a sound without bringing it back."
          ]
        ]
      },
      {
        "title": "The funeral argument",
        "opening": "Why do people argue so much about funerals?",
        "first": "Because they're trying to make one decision that will prove they loved someone enough.",
        "replies": [
          [
            "Can it?",
            "No. But I understand wanting it to."
          ],
          [
            "Have you argued at one?",
            "Yes. About flowers. I was really angry that there was a funeral at all."
          ],
          [
            "What would you do differently?",
            "Ask who needed company before asking which flowers were proper."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. Before you ask, studying spirits doesn't mean I can summon your relatives.",
      "I'm Corin. That wasn't going to be my first question.",
      "Corin. Still among the living, I see.",
      "I try to remain consistent.",
      "A dragon. Excellent. Something extraordinary that is unmistakably alive.",
      "I'm Corin. We both prefer it that way."
    ]
  },
  "Tamsin": {
    "name": "Tamsin",
    "home": "Thornwell school",
    "role": "Reader and aspiring writer",
    "source": "05-school.txt:16",
    "topics": [
      {
        "title": "The character who escaped",
        "opening": "Have you ever written someone you couldn't control?",
        "first": "A minor character refused to remain minor. Every time I tried to end her scene, she had something better to say.",
        "replies": [
          [
            "Did you let her stay?",
            "Yes. She has nearly taken over."
          ],
          [
            "Who was she supposed to be?",
            "Someone carrying a basket through a doorway."
          ],
          [
            "What's in the basket?",
            "I still don't know. She's been very evasive."
          ]
        ]
      },
      {
        "title": "The reader you fear",
        "opening": "Who would you be most afraid to show your writing?",
        "first": "Someone who knows me well enough to recognise the parts I pretend I invented.",
        "replies": [
          [
            "Your family?",
            "Some of them. Strangers can dislike a story without asking whether I'm all right."
          ],
          [
            "Would you hide it forever?",
            "No. I don't want to write only for a drawer."
          ],
          [
            "What would you want them to say?",
            "That they wanted to keep reading. I'd survive almost anything after that."
          ]
        ]
      },
      {
        "title": "A story with no battle",
        "opening": "Can a story be exciting without anyone fighting?",
        "first": "Absolutely. Two people who ought to say something and won't can keep me awake for hours.",
        "replies": [
          [
            "That sounds frustrating.",
            "So does a locked door. People still want to know what's behind it."
          ],
          [
            "Would you write one?",
            "I'm trying. Unfortunately, everyone keeps being sensible too early."
          ],
          [
            "Why not let them?",
            "Because I know how much courage sensible can take. I haven't written that part properly yet."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. If I look guilty, I've been reading when I ought to be writing.",
      "I'm Corin. I won't report you.",
      "Corin! I've removed three pages. It feels like progress and vandalism.",
      "Perhaps both can be useful.",
      "A dragon! I'd have been told this was an implausible opening.",
      "I'm Corin. Life didn't consult an editor."
    ]
  },
  "Master Iven": {
    "name": "Master Iven",
    "home": "Thornwell school",
    "role": "Teacher",
    "source": "05-school.txt:21",
    "topics": [
      {
        "title": "The question you couldn't answer",
        "opening": "What do you do when a pupil asks something you don't know?",
        "first": "I used to talk longer. Now I say I don't know before I damage anybody's education.",
        "replies": [
          [
            "Do they lose respect for you?",
            "They stop pretending quite so much. I consider it a good exchange."
          ],
          [
            "What was the hardest question?",
            "Why adults insist things are fair when they plainly aren't."
          ],
          [
            "What did you answer?",
            "That adults sometimes want obedience more than an honest conversation."
          ]
        ]
      },
      {
        "title": "The empty desk",
        "opening": "Do you remember pupils who leave early?",
        "first": "Very clearly. You hope they know leaving a room isn't the same as becoming less capable.",
        "replies": [
          [
            "Do they come back?",
            "Some visit. I try not to turn the visit into an examination."
          ],
          [
            "What do you ask them?",
            "What they've learned that I couldn't have taught them."
          ],
          [
            "Would you ask me that?",
            "Yes. And I'd listen to the answer."
          ]
        ]
      },
      {
        "title": "Iven's bad subject",
        "opening": "Was there a subject you were terrible at?",
        "first": "Music. I approached every note with conviction and frequently arrived somewhere else.",
        "replies": [
          [
            "Did your teacher despair?",
            "She found other things for me to do during performances."
          ],
          [
            "Were you upset?",
            "At first. Then I discovered I enjoyed arranging the chairs."
          ],
          [
            "That's a rather different skill.",
            "And one without which the audience falls over."
          ]
        ]
      }
    ],
    "greetings": [
      "Come in. You needn't be enrolled to ask a question.",
      "I'm Corin. I wasn't sure.",
      "Corin! What has the world been teaching you?",
      "Its lessons are rather poorly scheduled.",
      "Well. The children will never believe my description is restrained.",
      "I'm Corin. The dragon does make restraint difficult."
    ]
  },
  "Brin": {
    "name": "Brin",
    "home": "Thornwell school",
    "role": "Student of rider temples",
    "source": "05-school.txt:26",
    "topics": [
      {
        "title": "A sanctuary's smell",
        "opening": "What do you imagine an old sanctuary smelled like?",
        "first": "Rain drying on stone. Leather. People coming in hungry. I dislike imagining ruins as though they were born empty.",
        "replies": [
          [
            "Why think about smells?",
            "They make a place occupied in my head."
          ],
          [
            "Could you be wrong?",
            "Entirely. I'd like someone who knew to correct me."
          ],
          [
            "I'd think of dragon smoke.",
            "Yes. Ordinary to them, extraordinary to us."
          ]
        ]
      },
      {
        "title": "The thing you'd save",
        "opening": "If a ruin were collapsing, what would you save?",
        "first": "People first. After that, something made by an ordinary hand. A note, perhaps.",
        "replies": [
          [
            "Not a treasure?",
            "Someone will already be arguing over the treasure."
          ],
          [
            "Why a note?",
            "Because it might say something nobody intended a monument to say."
          ],
          [
            "What would you hope it said?",
            "Something funny. I want to know they laughed there."
          ]
        ]
      },
      {
        "title": "A difficult admission",
        "opening": "Would you be brave enough to enter every place you study?",
        "first": "No. I'm trying to stop treating that answer as a disgrace.",
        "replies": [
          [
            "Wouldn't you regret staying outside?",
            "Perhaps. I'd also regret rushing in to prove something irrelevant."
          ],
          [
            "What would make you ready?",
            "Training, company, and a proper reason."
          ],
          [
            "You can still study it.",
            "Yes. I needed to hear that from someone without my voice."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. I'm Brin. If you're asking about temples, you've found the right obsession.",
      "Corin. I can see the attraction.",
      "Corin! More questions, or have you brought answers?",
      "I'm usually better supplied with questions.",
      "A dragon. Please give me a moment to become articulate again.",
      "I'm Corin. Take two if you need them."
    ]
  },
  "Nell": {
    "name": "Nell",
    "home": "Thornwell school",
    "role": "History student",
    "source": "05-school.txt:31",
    "topics": [
      {
        "title": "The royal birthday",
        "opening": "Why do histories record every ruler's birthday?",
        "first": "Because somebody paid to have the ruler remembered. I want to know whose birthdays nobody wrote down.",
        "replies": [
          [
            "Ordinary people's?",
            "Especially the ones who couldn't afford a cake."
          ],
          [
            "Would you record them all?",
            "I couldn't. I could at least stop pretending the list was complete."
          ],
          [
            "Why does that matter?",
            "Because absence on a page can start looking like absence from the world."
          ]
        ]
      },
      {
        "title": "Nell's stubbornness",
        "opening": "Have you ever kept arguing after you knew you were wrong?",
        "first": "Yes. A dreadful few minutes in which I defended a position I'd already abandoned privately.",
        "replies": [
          [
            "Why keep going?",
            "Pride. It wears surprisingly scholarly clothes."
          ],
          [
            "Did you admit it afterward?",
            "The next morning. I should have done it before supper."
          ],
          [
            "Did the other person forgive you?",
            "Immediately. I found that almost more embarrassing."
          ]
        ]
      },
      {
        "title": "A history of laughter",
        "opening": "Can you learn anything from an old joke?",
        "first": "Who was allowed to laugh at whom. And who had to pretend it was funny.",
        "replies": [
          [
            "Do jokes last?",
            "Some. Others need so much explanation they become punishments."
          ],
          [
            "What's your favourite kind?",
            "The kind where the powerful person hasn't noticed they're ridiculous."
          ],
          [
            "Would you tell one near the king?",
            "I'd prefer to remain available for future research."
          ]
        ]
      }
    ],
    "greetings": [
      "You're new here, aren't you? I'm Nell.",
      "Corin. Is it that obvious?",
      "Corin! I have a theory. It may survive ten minutes.",
      "Shall we see?",
      "A dragon. That's going to ruin somebody's very confident essay.",
      "I'm Corin. I hope it wasn't yours."
    ]
  },
  "Sable": {
    "name": "Sable",
    "home": "Thornwell school",
    "role": "Researcher",
    "source": "05-school.txt:36",
    "topics": [
      {
        "title": "The forged diary",
        "opening": "How would you spot a false old diary?",
        "first": "I once found one whose author described a building erected after he supposedly died. Very observant ghost.",
        "replies": [
          [
            "Was somebody trying to cheat?",
            "Yes. They'd put more effort into staining the paper than checking dates."
          ],
          [
            "Did you confront them?",
            "With a question. They became offended remarkably quickly."
          ],
          [
            "Could it have fooled you?",
            "Of course. Remembering that makes me check twice."
          ]
        ]
      },
      {
        "title": "A private superstition",
        "opening": "Do you have any rituals before working?",
        "first": "I sharpen a pencil I may not use. It tells my wandering mind we've begun.",
        "replies": [
          [
            "Does it work?",
            "Sometimes. Other days I have an excellent pencil and no work."
          ],
          [
            "Why not just start?",
            "If I knew, I'd have a great deal more time."
          ],
          [
            "Could someone interrupt the ritual?",
            "You just did. I appear to have survived."
          ]
        ]
      },
      {
        "title": "The unanswered letter",
        "opening": "What research question matters to you personally?",
        "first": "Why my great-aunt left home. Family stories make her either wicked or brave. None let her be uncertain.",
        "replies": [
          [
            "Have you found an answer?",
            "Pieces. She wrote that she couldn't bear another winter there."
          ],
          [
            "Does that change your view?",
            "It makes her sound like a person instead of a verdict."
          ],
          [
            "Would you have gone?",
            "I don't know. That's why I dislike everyone else's certainty."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. I'm Sable. Please interrupt; I've been circling the same thought for an hour.",
      "Corin. Happy to provide a different circle.",
      "Corin! You may be just the distraction I need.",
      "I'll try to be a useful one.",
      "A dragon. My concentration has surrendered completely.",
      "I'm Corin. He has that effect."
    ]
  },
  "Pella": {
    "name": "Pella",
    "home": "Thornwell school",
    "role": "Geography student",
    "source": "05-school.txt:41",
    "topics": [
      {
        "title": "The centre of the world",
        "opening": "Where would you put the centre of a map?",
        "first": "I used to put home. Now I wonder how that makes everybody else feel like the edge.",
        "replies": [
          [
            "Does a map need a centre?",
            "The paper does. The world doesn't seem particularly concerned."
          ],
          [
            "Where would you put it now?",
            "Where the journey begins. I'd write whose journey it was."
          ],
          [
            "I'd still choose home.",
            "So would I sometimes. I just want to know I'm choosing."
          ]
        ]
      },
      {
        "title": "A border in the rain",
        "opening": "Have you ever seen a border you couldn't recognise?",
        "first": "Yes. The map had a thick line. The ground had wet grass and a goat.",
        "replies": [
          [
            "Did that disappoint you?",
            "It made me laugh. We'd argued about that line for an entire lesson."
          ],
          [
            "What did the goat do?",
            "Crossed without consulting anyone."
          ],
          [
            "Do borders matter?",
            "To the people enforcing them. The goat offered a useful second opinion."
          ]
        ]
      },
      {
        "title": "Pella's folded future",
        "opening": "Where would you go if you had no obligations?",
        "first": "I'd walk until nobody knew which direction my home was in.",
        "replies": [
          [
            "Wouldn't that be lonely?",
            "Yes. I'd like to know whether I could bear it for a little while."
          ],
          [
            "Why that far?",
            "Because every choice I make here comes with advice."
          ],
          [
            "Would you come home?",
            "I think so. I'd like returning to be a choice too."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello! Tell me somewhere you've been. I promise not to test you on it.",
      "Corin, from Millwood. That's a comfortable starting point.",
      "Corin! Has the road contradicted any maps lately?",
      "I suspect it enjoys doing that.",
      "A dragon. You could see all the awkward bits from above.",
      "I'm Corin. We still have to find our way back down."
    ]
  },
  "Scholar Ilyan": {
    "name": "Scholar Ilyan",
    "home": "Thornwell school and Sandspire",
    "role": "Scholar of the desert",
    "source": "05-school.txt:46",
    "topics": [
      {
        "title": "The scholar's souvenir",
        "opening": "What's the strangest souvenir you've kept?",
        "first": "Sand. Accidentally, in every book I took home. Years later the desert is still interrupting my reading.",
        "replies": [
          [
            "Why not shake it out?",
            "I do. There appears to be a second desert hidden in the bindings."
          ],
          [
            "Does it remind you of anything?",
            "Heat before sunrise, oddly. The anticipation of it."
          ],
          [
            "Would you go back?",
            "Yes. With fewer books and the same likely mistakes."
          ]
        ]
      },
      {
        "title": "An expedition argument",
        "opening": "What do travellers argue about most?",
        "first": "Pace. The eager call everybody slow; the exhausted call everybody thoughtless. Both forget to ask about blisters.",
        "replies": [
          [
            "Have you been both?",
            "In the same afternoon."
          ],
          [
            "How do you settle it?",
            "Stop long enough for people to say what's actually wrong."
          ],
          [
            "Does stopping waste time?",
            "Less than carrying someone who was afraid to admit they needed it."
          ]
        ]
      },
      {
        "title": "A discovery you regret",
        "opening": "Have you ever wished you hadn't learned something?",
        "first": "I found that a passage I'd admired was stolen from a less celebrated scholar. Admiration is awkward to take back.",
        "replies": [
          [
            "Did you stop reading it?",
            "No. I started saying the other scholar's name."
          ],
          [
            "Did people mind?",
            "People who liked the tidy version did."
          ],
          [
            "Would you rather not have known?",
            "For a day. Then it became something I was glad not to repeat."
          ]
        ]
      }
    ],
    "greetings": [
      "Ilyan. Scholar, occasional traveller, frequent misjudger of luggage.",
      "Corin. That last one sounds useful to know about.",
      "Corin! I hope you're here with questions rather than an account of my mistakes.",
      "Could be both.",
      "A dragon. At last, a reason for my astonishment that nobody can call excessive.",
      "I'm Corin. He may enjoy that description."
    ]
  },
  "Bess": {
    "name": "Bess",
    "home": "Thornwell's Copper Cup",
    "role": "Tavern keeper",
    "source": "06-copper-cup.txt:1",
    "topics": [
      {
        "title": "The cup on the sign",
        "opening": "Why is it called the Copper Cup?",
        "first": "Because the Silver Goblet sounded expensive and the Wooden Bowl sounded desperate. My mother understood first impressions.",
        "replies": [
          [
            "Was it always your family's?",
            "Long enough that people mistake knowing my mother for knowing my business."
          ],
          [
            "Would you change the name?",
            "No. I've shouted it too often to learn another."
          ],
          [
            "Does a name really matter?",
            "It gets people through the door. Supper has to do the rest."
          ]
        ]
      },
      {
        "title": "Bess's forbidden subject",
        "opening": "What conversation do you hate hearing here?",
        "first": "Someone explaining how easy running a tavern must be while I carry their fourth drink.",
        "replies": [
          [
            "What do you say?",
            "I offer them the tray. Enlightenment usually follows."
          ],
          [
            "Do you enjoy the work?",
            "Most of it. I can enjoy a thing without declaring it effortless."
          ],
          [
            "What's the worst part?",
            "Knowing everybody's hungry before I've had time to be hungry myself."
          ]
        ]
      },
      {
        "title": "The price of a bow",
        "opening": "Why do royal visits leave everyone so quiet?",
        "first": "Because every request sounds polite until you imagine refusing it. Then you hear the order underneath.",
        "replies": [
          [
            "They should pay like anyone else.",
            "They should. I keep the figures, even when nobody wants the bill."
          ],
          [
            "Could the town refuse together?",
            "Perhaps. I'd want to know who was standing beside us when the answer arrived."
          ],
          [
            "Does Halvard notice the silence?",
            "He may mistake it for respect. People with guards can afford that mistake."
          ]
        ]
      }
    ],
    "greetings": [
      "Welcome to the Copper Cup. If you're trouble, be the sort that pays.",
      "I'm Corin. I'll aim for no trouble at all.",
      "Corin! Still in one piece. We like repeat customers that way.",
      "I'll try to keep the arrangement.",
      "A dragon. I need to reconsider what I meant by no animals on the furniture.",
      "I'm Corin. We won't test the furniture."
    ]
  },
  "Ronan": {
    "name": "Ronan",
    "home": "Copper Cup",
    "role": "Cider maker",
    "source": "06-copper-cup.txt:6",
    "topics": [
      {
        "title": "The tasting face",
        "opening": "Why do people pull such solemn faces tasting cider?",
        "first": "They're afraid enjoying it too quickly will make them look unsophisticated.",
        "replies": [
          [
            "Do you do that?",
            "Professionally. In private I manage a smile."
          ],
          [
            "Can you tell if they like it?",
            "Watch whether they take another drink while talking."
          ],
          [
            "What face should I make?",
            "Your own. It costs less effort."
          ]
        ]
      },
      {
        "title": "A family feud in barrels",
        "opening": "Does your family argue about your trade?",
        "first": "My brother thinks I should make something more respectable. He sells buttons and regards himself as essential to civilisation.",
        "replies": [
          [
            "He has a point.",
            "Yes, but he makes it while drinking my cider."
          ],
          [
            "Do you get along?",
            "Very well once we stop discussing our achievements."
          ],
          [
            "Would you swap jobs?",
            "No. I couldn't bear looking for a missing button all day."
          ]
        ]
      },
      {
        "title": "Ronan's best compliment",
        "opening": "What's the best compliment your cider ever got?",
        "first": "Two people stopped quarrelling long enough to agree it was good. Then resumed at lower volume.",
        "replies": [
          [
            "Did you know them?",
            "Married forty years. They had a tremendous amount of argument prepared."
          ],
          [
            "Was it your best batch?",
            "No. That's what made it pleasing."
          ],
          [
            "Did you tell anyone?",
            "Only everyone who asked a remotely related question."
          ]
        ]
      }
    ],
    "greetings": [
      "Ronan. If you're new to Thornwell, I can offer an opinion on almost anything.",
      "Corin. I'll start with the harmless subjects.",
      "Corin! Good. Somebody who hasn't heard this twice.",
      "Yet.",
      "A dragon? I've not had nearly enough cider to explain that.",
      "I'm Corin. It's not the cider."
    ]
  },
  "Venn": {
    "name": "Venn",
    "home": "Copper Cup",
    "role": "Letter carrier",
    "source": "06-copper-cup.txt:11",
    "topics": [
      {
        "title": "The scent on the envelope",
        "opening": "Can a letter tell you something before it's opened?",
        "first": "Someone once scented an envelope so heavily I knew which lane I'd delivered it to an hour later.",
        "replies": [
          [
            "A love letter?",
            "I don't read them. I sincerely hoped it was loved."
          ],
          [
            "Did the recipient seem pleased?",
            "They opened the window. An ambiguous response."
          ],
          [
            "Would you send one like that?",
            "No. I prefer my affection to remain local."
          ]
        ]
      },
      {
        "title": "A farewell at the gate",
        "opening": "What's the hardest letter to carry?",
        "first": "The one someone keeps taking back before finally letting go.",
        "replies": [
          [
            "Do you wait?",
            "Yes. Whatever's in it has already taken them longer than my round."
          ],
          [
            "Have they ever changed their mind?",
            "Often. I return the stamp if I can."
          ],
          [
            "Do you wonder what it says?",
            "Of course. Wondering is permitted. Opening isn't."
          ]
        ]
      },
      {
        "title": "Venn's own address",
        "opening": "Do you like getting letters?",
        "first": "Terribly. I pretend I don't so people won't feel obliged.",
        "replies": [
          [
            "Why pretend?",
            "Receiving a letter feels better when it wasn't an assignment."
          ],
          [
            "Who writes to you?",
            "My sister. She includes ordinary details I didn't know I missed."
          ],
          [
            "Do you answer quickly?",
            "Shamefully slowly for someone with my occupation."
          ]
        ]
      }
    ],
    "greetings": [
      "New face. Venn, letter carrier. No, I won't guess where you live.",
      "Corin. Millwood saves you the effort.",
      "Corin! You look easier to find than most of my deliveries.",
      "Give me time.",
      "A dragon would make finding an address rather simpler.",
      "I'm Corin. Keeping the letters dry might be harder."
    ]
  },
  "Hobb": {
    "name": "Hobb",
    "home": "Copper Cup",
    "role": "Carpenter",
    "source": "06-copper-cup.txt:16",
    "topics": [
      {
        "title": "The house in a dream",
        "opening": "Do you ever dream about buildings?",
        "first": "The same impossible house. Every time I finish a staircase it leads to another staircase.",
        "replies": [
          [
            "What's at the top?",
            "More employment, apparently."
          ],
          [
            "Would you build it awake?",
            "Not for a fixed price."
          ],
          [
            "Does it frighten you?",
            "Only when I wake and remember I haven't charged anyone."
          ]
        ]
      },
      {
        "title": "Hobb's wedding gift",
        "opening": "What do you give people when they marry?",
        "first": "Something plain they can use after they've stopped trying to impress visitors.",
        "replies": [
          [
            "Such as?",
            "A sturdy box. Every household eventually needs somewhere for things nobody admits owning."
          ],
          [
            "Is that romantic?",
            "My wife used ours for letters. Made it romantic herself."
          ],
          [
            "What do you put in yours?",
            "Things I haven't found the courage to throw away."
          ]
        ]
      },
      {
        "title": "A job too personal",
        "opening": "Is it difficult working for friends?",
        "first": "Very. They say 'whenever you have time', then ask how it's going every day.",
        "replies": [
          [
            "Do you charge them?",
            "Yes. Less awkward than discovering we disagree about the size of a favour."
          ],
          [
            "Have you lost a friend over work?",
            "Nearly. We learned to write things down before affection did the measuring."
          ],
          [
            "Would you refuse a job?",
            "I have. Some friendships need fewer shelves in them."
          ]
        ]
      }
    ],
    "greetings": [
      "Hobb. Carpenter. Currently engaged in the difficult work of not working.",
      "Corin. I won't interfere.",
      "Corin, you've found me resting again. Please don't draw conclusions.",
      "I'll wait for more evidence.",
      "A dragon. That's a considerable weight to introduce without warning.",
      "I'm Corin. We'll mind where he puts it."
    ]
  },
  "Edric": {
    "name": "Edric",
    "home": "Copper Cup",
    "role": "Traveller",
    "source": "06-copper-cup.txt:21",
    "topics": [
      {
        "title": "A borrowed accent",
        "opening": "Have you ever come home sounding different?",
        "first": "After a month away, my sister asked why I'd begun talking through my nose. I'd thought I sounded distinguished.",
        "replies": [
          [
            "Were you copying someone?",
            "An innkeeper I admired. Unconsciously, which made it worse."
          ],
          [
            "Did you stop?",
            "After she imitated me through supper."
          ],
          [
            "Do you change elsewhere?",
            "A little. Sometimes travel shows you which parts of yourself were borrowed already."
          ]
        ]
      },
      {
        "title": "The meal you couldn't name",
        "opening": "What's the best thing you've eaten on a journey?",
        "first": "A stew I couldn't ask the name of. We didn't share a language. I held out my bowl and smiled rather desperately.",
        "replies": [
          [
            "Did they understand?",
            "Perfectly. Hunger travels well."
          ],
          [
            "Could you make it yourself?",
            "I've tried. Mine tastes like remembering, which isn't the same ingredient."
          ],
          [
            "Would you go back for it?",
            "For the company, yes. The stew might disappoint a memory that large."
          ]
        ]
      },
      {
        "title": "The traveller who stayed",
        "opening": "Have you ever nearly settled somewhere else?",
        "first": "Once. There was someone there. We spent weeks discussing the weather instead of what would happen when I left.",
        "replies": [
          [
            "Did you leave?",
            "Yes. I wish we'd had the difficult conversation first."
          ],
          [
            "Would it have changed things?",
            "I don't know. That's the part I brought home."
          ],
          [
            "Have you written since?",
            "Once. Some answers take longer than letters."
          ]
        ]
      }
    ],
    "greetings": [
      "Room for one more conversation. I'm Edric.",
      "Corin. I won't bring a speech.",
      "Corin! Has anything surprised you since last time?",
      "Quite a few things, unfortunately.",
      "I've travelled for years to see something nobody would believe. You've brought it to the tavern.",
      "I'm Corin. Please believe this part accurately."
    ]
  },
  "Dorr": {
    "name": "Dorr",
    "home": "Copper Cup",
    "role": "Night worker",
    "source": "06-copper-cup.txt:26",
    "topics": [
      {
        "title": "The town asleep",
        "opening": "What's Thornwell like while everyone's asleep?",
        "first": "Kinder-looking. No queues, no arguments. Then a cat knocks something over and restores proportion.",
        "replies": [
          [
            "Do you like it?",
            "Yes. I like being awake in a town that's resting."
          ],
          [
            "Does it feel lonely?",
            "Sometimes. Then I see another lit window and imagine someone keeping me company."
          ],
          [
            "What do you hear?",
            "Small noises daytime tramples over."
          ]
        ]
      },
      {
        "title": "A misplaced breakfast",
        "opening": "Do you eat breakfast when everyone else eats supper?",
        "first": "Sometimes. People object as if eggs have signed an agreement with morning.",
        "replies": [
          [
            "Does it confuse you?",
            "It confuses visitors. I offer toast and watch them reconsider the hour."
          ],
          [
            "What do you miss?",
            "Meals where nobody's either arriving or falling asleep."
          ],
          [
            "Could you change your hours?",
            "Perhaps eventually. For now, the work is steady."
          ]
        ]
      },
      {
        "title": "Dorr's strange talent",
        "opening": "What's something you're unexpectedly good at?",
        "first": "Remembering footsteps. I know several neighbours without ever seeing their faces at work.",
        "replies": [
          [
            "Could you recognise mine?",
            "Not yet. You'd have to become a regular inconvenience."
          ],
          [
            "Is it useful?",
            "When a familiar step hesitates, I know to check."
          ],
          [
            "What would your steps sound like?",
            "Tired, I expect. I'd like to hear them from someone else's side of the door."
          ]
        ]
      }
    ],
    "greetings": [
      "If I yawn, it's my hours, not your face. Dorr.",
      "Corin. That's a relief.",
      "Corin. You're getting easier to recognise through a yawn.",
      "I'll count that as progress.",
      "A dragon. That woke me up more effectively than expected.",
      "I'm Corin. He's useful for unexpected wakefulness."
    ]
  },
  "Ser Anwen": {
    "name": "Ser Anwen",
    "home": "Copper Cup",
    "role": "Knight",
    "source": "06-copper-cup.txt:31",
    "topics": [
      {
        "title": "The armour beneath the title",
        "opening": "Do people speak differently when they learn you're a knight?",
        "first": "They either become painfully polite or begin a quarrel they've been saving for any uniform.",
        "replies": [
          [
            "Which is worse?",
            "Politeness can hide fear. At least a quarrel tells me something."
          ],
          [
            "Do you remove the title at home?",
            "My sister removes it for me. With enthusiasm."
          ],
          [
            "Does that bother you?",
            "No. It's restful to be someone who once fell out of an apple tree."
          ]
        ]
      },
      {
        "title": "A command you remember",
        "opening": "What order has stayed with you longest?",
        "first": "A captain told me to sit beside a wounded man. I kept asking what useful thing I should do. He said I'd been told.",
        "replies": [
          [
            "Did sitting help?",
            "The man stopped asking whether everyone had gone."
          ],
          [
            "Did he survive?",
            "Yes. I remember the sitting better than the fighting."
          ],
          [
            "Were you frightened?",
            "Too frightened to feel useful. That didn't mean I wasn't."
          ]
        ]
      },
      {
        "title": "Anwen's civilian wish",
        "opening": "What would you do if you laid down your sword?",
        "first": "Learn to make something people used without being afraid.",
        "replies": [
          [
            "What would you make?",
            "Perhaps doors. There's something pleasing about helping people come home."
          ],
          [
            "Why haven't you begun?",
            "I've been waiting for life to become uncomplicated. A foolish condition."
          ],
          [
            "Would you miss being a knight?",
            "Parts of it. You can leave something without despising it."
          ]
        ]
      }
    ],
    "greetings": [
      "Anwen. You may speak normally; I'm not conducting an inspection.",
      "Corin. Good to know.",
      "Corin. You seem less wary of me.",
      "You keep giving me reasons to be.",
      "A dragon. I should choose my next words carefully.",
      "I'm Corin. We'd appreciate that."
    ]
  },
  "Grusk": {
    "name": "Grusk",
    "home": "Copper Cup",
    "role": "Retired haulier",
    "source": "06-copper-cup.txt:36",
    "topics": [
      {
        "title": "The load you remember",
        "opening": "What's the strangest thing you ever transported?",
        "first": "An enormous portrait of a man who accompanied it. Both objects required flattering treatment.",
        "replies": [
          [
            "Which was heavier?",
            "The portrait. The man's opinion of himself was harder to carry."
          ],
          [
            "Did it arrive safely?",
            "Yes. I wanted neither replacing."
          ],
          [
            "Was he grateful?",
            "He admired the portrait. I assume some gratitude was implied."
          ]
        ]
      },
      {
        "title": "Grusk's reading glasses",
        "opening": "Why do you keep mislaying your glasses?",
        "first": "Because I take them off to look for something close. Then I need them to find what I've taken off.",
        "replies": [
          [
            "Have you tried a cord?",
            "Yes. Lost the cord."
          ],
          [
            "Do you mind being teased?",
            "Only by people who never admit their own foolishness."
          ],
          [
            "What do you read?",
            "Love stories. You may adjust your expression at your leisure."
          ]
        ]
      },
      {
        "title": "A man without a load",
        "opening": "Was it hard to stop hauling?",
        "first": "For a while I measured every day by how tired I was. A pleasant day felt suspicious.",
        "replies": [
          [
            "What changed?",
            "I spent an afternoon with my nephew and came home happy instead."
          ],
          [
            "Do you miss the strength?",
            "Yes. I miss trusting my back before I ask it."
          ],
          [
            "What do you do now?",
            "More things badly. It's surprisingly enjoyable being a beginner nobody depends on."
          ]
        ]
      }
    ],
    "greetings": [
      "Grusk. You'll have to tell me your name; I've retired from guessing.",
      "Corin. Happy to save you the effort.",
      "Corin, good. A conversation I needn't begin from nothing.",
      "Where did we leave it?",
      "A dragon. I used to complain about moving wardrobes.",
      "I'm Corin. Fortunately he moves himself."
    ]
  },
  "Fen": {
    "name": "Fen",
    "home": "Copper Cup",
    "role": "Dancer",
    "source": "06-copper-cup.txt:41",
    "topics": [
      {
        "title": "The serious face",
        "opening": "Why do people look so stern when they're learning to dance?",
        "first": "They're trying to remember their feet. Their faces get left in charge of worrying.",
        "replies": [
          [
            "Were you like that?",
            "Worse. I counted with my eyebrows."
          ],
          [
            "What helps?",
            "Someone willing to laugh with you instead of watching for mistakes."
          ],
          [
            "Would I look foolish?",
            "Briefly. Then you'd be busy doing something else."
          ]
        ]
      },
      {
        "title": "A dance for grief",
        "opening": "Have you ever danced when you were unhappy?",
        "first": "Yes. Not to cure it. I needed my body to remember it could do something besides sit with the feeling.",
        "replies": [
          [
            "Did it help?",
            "For that evening. I don't ask every good thing to last forever."
          ],
          [
            "Were other people there?",
            "A few. They didn't demand I become cheerful."
          ],
          [
            "What did you dance to?",
            "A tune I knew well enough not to think about."
          ]
        ]
      },
      {
        "title": "Fen's least graceful moment",
        "opening": "What's your least graceful moment?",
        "first": "Bowing after a performance and knocking heads with the person beside me. We received our loudest applause.",
        "replies": [
          [
            "Did it hurt?",
            "Only until we started laughing. Then it hurt to laugh."
          ],
          [
            "Did the audience think it was planned?",
            "Some did. We declined requests to repeat it."
          ],
          [
            "Could you make it part of the act?",
            "I prefer my art with fewer bruises."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello! Fen. You needn't dance to be good company.",
      "Corin. That's reassuring.",
      "Corin, you've returned. I shall assume the company was acceptable.",
      "Better than acceptable.",
      "If that dragon swishes his tail in time, I'm professionally threatened.",
      "I'm Corin. I can't promise his sense of rhythm."
    ]
  },
  "Senn": {
    "name": "Senn",
    "home": "Copper Cup",
    "role": "Game enthusiast",
    "source": "06-copper-cup.txt:46",
    "topics": [
      {
        "title": "A rule nobody remembers",
        "opening": "Why do old games have such strange rules?",
        "first": "Because somebody once lost in an interesting way and made sure it couldn't happen again.",
        "replies": [
          [
            "Have you done that?",
            "I once proposed a rule halfway through losing. It was poorly received."
          ],
          [
            "How do you learn the proper rules?",
            "Ask three people, then agree which disagreement you'll use."
          ],
          [
            "Doesn't that spoil the game?",
            "Only if winning matters more than the evening."
          ]
        ]
      },
      {
        "title": "The perfect opponent",
        "opening": "Who do you most enjoy playing against?",
        "first": "Someone who takes the game seriously and themselves lightly. Rarer than you'd think.",
        "replies": [
          [
            "What about beginners?",
            "I like teaching. I dislike people who pretend teaching means crushing someone slowly."
          ],
          [
            "Are you a good loser?",
            "I am a recovering bad one."
          ],
          [
            "How can I tell?",
            "If I explain why I lost before saying well played, remind me."
          ]
        ]
      },
      {
        "title": "The game in your head",
        "opening": "Do you ever replay a game afterward?",
        "first": "Constantly. In my head I'm brilliant about an hour too late.",
        "replies": [
          [
            "Does that improve your next game?",
            "Sometimes. Mostly it improves my walk home."
          ],
          [
            "Do you ever stop thinking about it?",
            "When someone asks a better question."
          ],
          [
            "Was that a better question?",
            "Nearly. Give me a moment to resign mentally."
          ]
        ]
      }
    ],
    "greetings": [
      "Senn. Before you ask, the expression is concentration, not indigestion.",
      "Corin. I was going to ask neither.",
      "Corin! I've lost an argument with the rules.",
      "Are you admitting defeat?",
      "A dragon could settle a game dispute rather unfairly.",
      "I'm Corin. We won't use him as an umpire."
    ]
  },
  "Dain": {
    "name": "Dain",
    "home": "Copper Cup",
    "role": "Card player",
    "source": "06-copper-cup.txt:51",
    "topics": [
      {
        "title": "The face you can't read",
        "opening": "Who's impossible to read across a table?",
        "first": "My aunt. She looks disappointed whatever she's holding. I spent childhood training and learned nothing.",
        "replies": [
          [
            "Is she good?",
            "Appallingly. Pretends she barely knows the game."
          ],
          [
            "Do you call her out?",
            "And risk her remembering something I did at twelve? No."
          ],
          [
            "Have you ever beaten her?",
            "Once. She congratulated me so sweetly I suspected a gift."
          ]
        ]
      },
      {
        "title": "A debt forgiven",
        "opening": "Have you ever forgiven a debt?",
        "first": "A friend owed me enough that he stopped visiting. I realised I was missing him more than the money.",
        "replies": [
          [
            "Did you tell him?",
            "Yes. He came round looking prepared for a punishment."
          ],
          [
            "Did he repay you eventually?",
            "Partly. We stopped measuring every visit against it."
          ],
          [
            "Would you lend again?",
            "Not more than I could afford to lose without losing the person."
          ]
        ]
      },
      {
        "title": "Dain's lucky coat",
        "opening": "Do you believe in lucky clothes?",
        "first": "I won three games in a coat, then lost five refusing to take it off in a hot room.",
        "replies": [
          [
            "Did you blame the coat?",
            "For the heat, certainly."
          ],
          [
            "Why keep wearing it?",
            "Because taking it off would admit the first three wins weren't magic."
          ],
          [
            "What do you believe now?",
            "That fresh air improves judgement more reliably than tailoring."
          ]
        ]
      }
    ],
    "greetings": [
      "Dain. If you want a seat, ask. If you want my secrets, buy your own.",
      "Corin. I'll begin with conversation.",
      "Corin! Looking for company or a theory about luck?",
      "Company sounds cheaper.",
      "A dragon at your shoulder would make bluffing difficult for everyone else.",
      "I'm Corin. We'll keep him out of the game."
    ]
  },
  "Rusk": {
    "name": "Rusk",
    "home": "Copper Cup",
    "role": "Experienced traveller",
    "source": "06-copper-cup.txt:56",
    "topics": [
      {
        "title": "The companion you disliked",
        "opening": "Have you travelled with someone you couldn't stand?",
        "first": "A man who sang constantly. Hated him for three days. On the fourth I was ill and he stayed without a word.",
        "replies": [
          [
            "Did that change things?",
            "I still hated the singing. I stopped mistaking it for the whole man."
          ],
          [
            "Did you travel together again?",
            "Yes. I requested quieter songs."
          ],
          [
            "What did he dislike about you?",
            "My conviction that silence was everyone's favourite sound."
          ]
        ]
      },
      {
        "title": "A door left open",
        "opening": "What's the kindest welcome you've had?",
        "first": "Someone opened a door before I could finish deciding whether I dared knock.",
        "replies": [
          [
            "Why were you hesitant?",
            "I looked a state and had very little money."
          ],
          [
            "Did they ask questions?",
            "After I was warm. That's the part I remember."
          ],
          [
            "Did you go back?",
            "Years later. They remembered less about it than I did."
          ]
        ]
      },
      {
        "title": "The journey you haven't described",
        "opening": "Is there a journey you never talk about?",
        "first": "One where I came home alone. People keep asking for the exciting parts. There weren't any I'd care to offer.",
        "replies": [
          [
            "I'm sorry.",
            "Thank you. You needn't turn it into a question."
          ],
          [
            "Did talking ever help?",
            "With someone who wasn't waiting for a story, yes."
          ],
          [
            "We can speak about something else.",
            "I'd like that. Thank you for hearing the difference."
          ]
        ]
      }
    ],
    "greetings": [
      "Rusk. If you've come far, sit before explaining how far.",
      "Corin. I'd appreciate that order of events.",
      "Corin. Still curious? Good.",
      "Usually at inconvenient times.",
      "I've shared roads with stranger things, but rarely shared a conversation near one.",
      "I'm Corin. We'd like this to be a friendly oddity."
    ]
  },
  "Linnet": {
    "name": "Linnet",
    "home": "Copper Cup",
    "role": "Musician",
    "source": "06-copper-cup.txt:61",
    "topics": [
      {
        "title": "The song that changed",
        "opening": "Have you ever heard someone change one of your songs?",
        "first": "A child made up a verse about his brother's ears. The original had been a mournful love song.",
        "replies": [
          [
            "Were you offended?",
            "It was an excellent verse. I resented that briefly."
          ],
          [
            "Did you keep it?",
            "In my memory. His brother asked me not to perform it."
          ],
          [
            "Who owns a song then?",
            "Once people sing it, ownership becomes a rather crowded room."
          ]
        ]
      },
      {
        "title": "A musician's silence",
        "opening": "Do you ever get tired of music?",
        "first": "Yes. I like walking home with only my footsteps for company.",
        "replies": [
          [
            "Does that worry you?",
            "It used to. Now I know enjoyment can need a rest."
          ],
          [
            "What do you hear afterward?",
            "The tune more clearly, usually."
          ],
          [
            "Would you stop performing?",
            "Perhaps someday. I'd keep the part nobody has to applaud."
          ]
        ]
      },
      {
        "title": "A forgotten listener",
        "opening": "Do you remember faces in an audience?",
        "first": "One woman always looked bored. I thought she hated my playing. Then she brought her children to hear me.",
        "replies": [
          [
            "Did you ask why she looked bored?",
            "Fortunately, I didn't. That might have shortened the friendship."
          ],
          [
            "What did you learn?",
            "That a face isn't a review."
          ],
          [
            "Do you still look for reactions?",
            "Yes. I'm a musician, not a saint."
          ]
        ]
      }
    ],
    "greetings": [
      "Hello. Linnet. Are you listening, or trying to get past?",
      "Corin. Listening for now.",
      "Corin! Good to have a familiar ear.",
      "I've brought both.",
      "A dragon might make the lower notes rather more interesting.",
      "I'm Corin. Please don't encourage a duet yet."
    ]
  },
  "Puck": {
    "name": "Puck",
    "home": "Copper Cup",
    "role": "Music lover",
    "source": "06-copper-cup.txt:66",
    "topics": [
      {
        "title": "The song in your sleep",
        "opening": "Have you ever woken with a song stuck in your head?",
        "first": "One I couldn't identify. Spent a day humming it at people. It was a vendor's cry about onions.",
        "replies": [
          [
            "Did anyone recognise it?",
            "Bess. Told me the price had gone up."
          ],
          [
            "Were you disappointed?",
            "A little. I'd hoped for a forgotten masterpiece."
          ],
          [
            "Do you still hum it?",
            "Yes. The onions had excellent phrasing."
          ]
        ]
      },
      {
        "title": "The enthusiasm problem",
        "opening": "Can you clap too much?",
        "first": "Apparently. I once applauded halfway through a dramatic pause. Started an entire room.",
        "replies": [
          [
            "Was the performer angry?",
            "He thanked us through his teeth and began the silence again."
          ],
          [
            "Did you apologise?",
            "Afterward. He said at least I'd been awake."
          ],
          [
            "Would you do it again?",
            "My hands occasionally act before consultation."
          ]
        ]
      },
      {
        "title": "Puck's quiet friend",
        "opening": "Does everyone need to enjoy the same music to be friends?",
        "first": "My best friend likes silence. We've built a surprisingly sturdy friendship around taking turns.",
        "replies": [
          [
            "Do you argue?",
            "Only when I call silence a very slow tune."
          ],
          [
            "How did you meet?",
            "I sat beside him because he wasn't trying to talk over the song."
          ],
          [
            "What does he like about you?",
            "He says I'm pleased about things. I hadn't realised that could be useful."
          ]
        ]
      }
    ],
    "greetings": [
      "Puck. I listen better than I sing, which isn't difficult.",
      "Corin. I'll trust your judgement.",
      "Corin! You've missed a lively argument about a tune.",
      "Was anyone actually singing it?",
      "Oh, magnificent. A dragon. This evening's stories will require restraint.",
      "I'm Corin. Please practise that restraint early."
    ]
  },
  "Vale": {
    "name": "Vale",
    "home": "Copper Cup",
    "role": "Reader and traveller",
    "source": "06-copper-cup.txt:71",
    "topics": [
      {
        "title": "A book you outgrew",
        "opening": "Have you ever stopped loving a favourite book?",
        "first": "Yes. Read it again and found it cruel in places I'd once called clever.",
        "replies": [
          [
            "Did you throw it away?",
            "No. I wanted to remember why I'd admired it, and why I no longer did."
          ],
          [
            "Was that sad?",
            "A little. It's strange to outgrow someone who hasn't changed."
          ],
          [
            "Could you love parts of it?",
            "I do. Affection needn't be a promise to agree forever."
          ]
        ]
      },
      {
        "title": "The stranger who knew you",
        "opening": "Has someone ever mistaken you for someone else?",
        "first": "A woman embraced me at an inn. When she realised, she began to cry. Her son hadn't come home.",
        "replies": [
          [
            "What did you do?",
            "Stayed while she gathered herself. I didn't know what else to offer."
          ],
          [
            "Did you learn what happened?",
            "No. I still think about her when I enter a crowded room."
          ],
          [
            "That's a hard thing to carry.",
            "Yes. Not every journey leaves you a useful lesson."
          ]
        ]
      },
      {
        "title": "The last unread page",
        "opening": "Would you want to know how your own story ends?",
        "first": "No. I'd begin arranging everything to explain it. I'd rather notice the middle.",
        "replies": [
          [
            "Even if the ending were good?",
            "Especially then. I might grow careless with the people in it."
          ],
          [
            "What if it were bad?",
            "I'd spend good days waiting for it."
          ],
          [
            "I'd be tempted to look.",
            "So would I. Refusing an imaginary book is easy."
          ]
        ]
      }
    ],
    "greetings": [
      "Vale. You're welcome to interrupt my book; it's becoming pompous.",
      "Corin. I'll try to improve the company.",
      "Corin! The book has improved or I've become more forgiving.",
      "Which seems likelier?",
      "A dragon. At last, a travel account I can verify by looking up.",
      "I'm Corin. He'd prefer not to be reduced to an account."
    ]
  },
  "Cerys": {
    "name": "Cerys",
    "home": "Copper Cup",
    "role": "Curious observer",
    "source": "06-copper-cup.txt:76",
    "topics": [
      {
        "title": "A face in a crowd",
        "opening": "Why do you like watching strangers?",
        "first": "Everybody arrives in the middle of a life. You get a glimpse and never learn most of it.",
        "replies": [
          [
            "Do you invent the rest?",
            "Constantly. I try not to mistake my invention for knowing them."
          ],
          [
            "What did you guess about me?",
            "That you were looking for someone. It's a popular answer and often true."
          ],
          [
            "Would you rather ask?",
            "I'm trying that now."
          ]
        ]
      },
      {
        "title": "The courage to interrupt",
        "opening": "Do you find it easy to approach people?",
        "first": "Only after I've rehearsed something natural so many times it no longer sounds natural.",
        "replies": [
          [
            "Like this conversation?",
            "I abandoned the rehearsal. You arrived too soon."
          ],
          [
            "What were you going to say?",
            "Something unbearable about the weather."
          ],
          [
            "You could just say hello.",
            "Yes. Deceptively sophisticated word, hello."
          ]
        ]
      },
      {
        "title": "A question you regret",
        "opening": "Have you asked something you wished you hadn't?",
        "first": "Asked a man why he always ate alone. As though solitude required a defence.",
        "replies": [
          [
            "How did he answer?",
            "Said he enjoyed his own company. I apologised for sounding surprised."
          ],
          [
            "Did he mind?",
            "Less than I did afterward."
          ],
          [
            "Would you ask now?",
            "I'd ask whether he wanted company. Much less work for him."
          ]
        ]
      }
    ],
    "greetings": [
      "Cerys. I was trying to guess your business and doing it badly.",
      "Corin. We can save you the trouble.",
      "Corin! You've become an actual person instead of one of my guesses.",
      "A promotion, I hope.",
      "A dragon. I withdraw every guess I was making.",
      "I'm Corin. You weren't going to guess that one."
    ]
  },
  "Nyra": {
    "name": "Nyra",
    "home": "Copper Cup",
    "role": "Performer and card player",
    "source": "06-copper-cup.txt:81",
    "topics": [
      {
        "title": "The trick you won't perform",
        "opening": "Is there a trick you refuse to do?",
        "first": "One that depends on humiliating the volunteer. Cheap laughter. Expensive for the person standing there.",
        "replies": [
          [
            "Did you learn that badly?",
            "Yes. I laughed along when I should have stopped."
          ],
          [
            "Can you surprise people kindly?",
            "Of course. Astonishment doesn't need a victim."
          ],
          [
            "What makes a good volunteer?",
            "Someone who wants to be there. That's the whole secret of that part."
          ]
        ]
      },
      {
        "title": "Nyra without an audience",
        "opening": "Are you funny when you're alone?",
        "first": "Mostly I'm quiet. People seem disappointed to discover I don't perform for the kettle.",
        "replies": [
          [
            "Do you like being quiet?",
            "Very much. It gives the next joke somewhere to come from."
          ],
          [
            "Does performing tire you?",
            "Pleasantly, until somebody follows me home expecting more."
          ],
          [
            "How do you tell them to stop?",
            "Plainly. I have no clever version that works better."
          ]
        ]
      },
      {
        "title": "A vanished coin",
        "opening": "Have you ever actually lost a coin during a trick?",
        "first": "Yes. Disappeared perfectly. Reappeared three days later in my laundry, to a much smaller audience.",
        "replies": [
          [
            "What did you tell the first audience?",
            "That its return would be unusually mysterious."
          ],
          [
            "Did they believe you?",
            "One person applauded the confidence."
          ],
          [
            "Would you admit it now?",
            "I just have. Consider yourself specially trusted."
          ]
        ]
      }
    ],
    "greetings": [
      "Nyra. If I offer to guess your card, watch my other hand.",
      "Corin. That's unusually honest advertising.",
      "Corin! Still trusting me enough to say hello?",
      "Only hello, so far.",
      "A dragon. Hard act to follow. I'd need a much larger hat.",
      "I'm Corin. Please don't try putting him in one."
    ]
  },
  "Prue": {
    "name": "Prue",
    "home": "Forgewick",
    "role": "Stonemason",
    "source": "07-forgewick.txt:1",
    "topics": [
      {
        "title": "The mason's handwriting",
        "opening": "Why is your handwriting so tiny?",
        "first": "Spend all day making permanent marks and you become shy about the casual ones.",
        "replies": [
          [
            "Can anyone read it?",
            "I can. Usually on the day I wrote it."
          ],
          [
            "What do you write?",
            "Letters to my sister. She sends a separate page of questions about my letters."
          ],
          [
            "Would larger writing help?",
            "Obviously. I'm resisting an easy solution on principle."
          ]
        ]
      },
      {
        "title": "A wall with a secret",
        "opening": "Have you ever hidden something in a building?",
        "first": "A scrap with our names inside a wall we repaired. Nothing grand. Just who had been there.",
        "replies": [
          [
            "Why hide it?",
            "It was for whoever came after us, not whoever paid us."
          ],
          [
            "What if nobody finds it?",
            "Then it can stay ours."
          ],
          [
            "What would you want to find?",
            "A name. Something to say aloud while I worked."
          ]
        ]
      },
      {
        "title": "Prue's temper",
        "opening": "What makes you lose your temper fastest?",
        "first": "Someone lifting my tools without asking. People become remarkably familiar when they think they're helping.",
        "replies": [
          [
            "Do you tell them?",
            "Before I start shouting, if I'm quick enough."
          ],
          [
            "Has anyone surprised you pleasantly?",
            "An apprentice who asked where everything went and remembered."
          ],
          [
            "That doesn't sound difficult.",
            "No. That's partly why the other thing irritates me."
          ]
        ]
      }
    ],
    "greetings": [
      "Prue. If you've come to tell me that's heavy, I know.",
      "Corin. I'll find something more useful to say.",
      "Corin. Good. Someone who asks before advising.",
      "I do try.",
      "A dragon. Please keep him clear of anything I've only just finished.",
      "I'm Corin. We'll watch where he steps."
    ]
  },
  "Toft": {
    "name": "Toft",
    "home": "Forgewick",
    "role": "Former miner and provisions merchant",
    "source": "07-forgewick.txt:6",
    "topics": [
      {
        "title": "The price of warmth",
        "opening": "What sells when the weather turns miserable?",
        "first": "Things people thought they could manage without. Dry socks acquire an astonishing dignity.",
        "replies": [
          [
            "Did you learn that underground?",
            "I learned several unpleasant ways to regret wet feet."
          ],
          [
            "Do you charge more then?",
            "No. People remember being cornered."
          ],
          [
            "Even if others do?",
            "Especially then. I'd like customers who return willingly."
          ]
        ]
      },
      {
        "title": "Toft's old nickname",
        "opening": "Did the miners have a name for you?",
        "first": "Songbird. I can't sing a note. Miners enjoy accuracy chiefly when it's inconvenient.",
        "replies": [
          [
            "Did you mind?",
            "At first. Then I noticed they used it kindly."
          ],
          [
            "Who started it?",
            "A man who snored in tune. Unfairly gifted."
          ],
          [
            "Do people still call you that?",
            "Old friends. It's how I know who's come through the door."
          ]
        ]
      },
      {
        "title": "An unopened parcel",
        "opening": "Have you ever kept something wrapped for years?",
        "first": "A gift from my mother. Opened it after she died and hated myself for waiting.",
        "replies": [
          [
            "What was it?",
            "A scarf she'd made too long. She'd included an apology for the length."
          ],
          [
            "Do you use it?",
            "Every winter. Plenty of room for the apology."
          ],
          [
            "Why hadn't you opened it?",
            "Thought there'd be time to thank her properly. I was very busy being foolish."
          ]
        ]
      }
    ],
    "greetings": [
      "Toft. Take a look around before deciding you can't afford anything.",
      "Corin. Thank you.",
      "Corin! Back with stories or an empty bag?",
      "A little of both, probably.",
      "I'd better learn what dragons eat before I attempt a sales pitch.",
      "I'm Corin. That's a sensible order."
    ]
  },
  "Ovid": {
    "name": "Ovid",
    "home": "Forgewick",
    "role": "Market organiser",
    "source": "07-forgewick.txt:11",
    "topics": [
      {
        "title": "The market bell",
        "opening": "Why don't you use a bell to settle arguments?",
        "first": "Because the first thing people would argue about is who gets to ring it.",
        "replies": [
          [
            "You sound certain.",
            "We tried a whistle."
          ],
          [
            "What happened?",
            "Three people brought whistles of their own."
          ],
          [
            "How do you settle things now?",
            "I make everyone explain what they actually want. Most quarrels shrink after that."
          ]
        ]
      },
      {
        "title": "A day without decisions",
        "opening": "What would a perfect day off look like?",
        "first": "Somebody else choosing lunch. I don't care what it is. I want no jurisdiction over it.",
        "replies": [
          [
            "Even something you dislike?",
            "I'd dislike it peacefully."
          ],
          [
            "Do people ask you things at home?",
            "Only everything."
          ],
          [
            "Have you told them you're tired?",
            "Yes. They asked what they should do about it. We nearly had a breakthrough."
          ]
        ]
      },
      {
        "title": "Ovid's secret favourite",
        "opening": "Do you have a favourite market stall?",
        "first": "Whichever one lets a nervous beginner take their time. You can hear impatience from across a square.",
        "replies": [
          [
            "Were you a nervous beginner?",
            "Painfully. I apologised before naming prices."
          ],
          [
            "Who helped?",
            "A woman who bought something and treated me like I belonged there."
          ],
          [
            "Is that why you organise things?",
            "Partly. I want people to have room before they know how to ask for it."
          ]
        ]
      }
    ],
    "greetings": [
      "Ovid. If you're looking for the person responsible, I'd like to hear the complaint first.",
      "Corin. No complaint yet.",
      "Corin! Excellent. A conversation without a queue forming.",
      "We'd better enjoy it quickly.",
      "A dragon. This will require a wider definition of clear passage.",
      "I'm Corin. We'll avoid blocking anyone."
    ]
  },
  "Garran": {
    "name": "Garran",
    "home": "Forgewick",
    "role": "Metalworker",
    "source": "07-forgewick.txt:16",
    "topics": [
      {
        "title": "A ring you never sold",
        "opening": "Have you ever made jewellery?",
        "first": "A ring for someone I meant to ask a question. Took so long making it that she asked me first.",
        "replies": [
          [
            "Did you say yes?",
            "Before she finished. Ruined her preparation."
          ],
          [
            "Did the ring fit?",
            "After adjustment. Romance isn't always accurate on the first attempt."
          ],
          [
            "Do you still have it?",
            "She does. Says she earned it by doing the difficult part."
          ]
        ]
      },
      {
        "title": "The apprentice's prank",
        "opening": "What's the best prank anyone played on you?",
        "first": "Moved my lunch a little farther away every day. Took me a week to notice I was taking a longer break.",
        "replies": [
          [
            "Who did it?",
            "An apprentice with excellent judgement about how much mischief I'd bear."
          ],
          [
            "Were you angry?",
            "I promoted the lunch to a cupboard."
          ],
          [
            "Did you get revenge?",
            "I paid him in small coins. He appreciated the craftsmanship."
          ]
        ]
      },
      {
        "title": "A useful scar",
        "opening": "Do you remember every scar?",
        "first": "Not all. The one I show people least came from opening a cupboard.",
        "replies": [
          [
            "You tell them that?",
            "Only if they've made the mistake of looking impressed."
          ],
          [
            "Do you mind the others?",
            "Some. I'm tired of people treating carelessness as proof I work hard."
          ],
          [
            "What proves it then?",
            "The finished piece. Look at that."
          ]
        ]
      }
    ],
    "greetings": [
      "Garran. Speak from this side; the other ear's had a longer career.",
      "Corin. Here all right?",
      "Corin! I heard you that time.",
      "I was hoping you would.",
      "A dragon. If he understands shouting, he'll enjoy Forgewick.",
      "I'm Corin. He hears more than you'd think."
    ]
  },
  "Nessa": {
    "name": "Nessa",
    "home": "Forgewick",
    "role": "Glass decorator",
    "source": "07-forgewick.txt:21",
    "topics": [
      {
        "title": "The colour nobody ordered",
        "opening": "What's a colour you'd like to use more?",
        "first": "A bruised violet people call gloomy. I think it's beautiful. Not every beautiful thing needs to cheer you up.",
        "replies": [
          [
            "What would you make?",
            "Something small enough to keep close, not announce across a room."
          ],
          [
            "Would it sell?",
            "Perhaps not. That's a separate question."
          ],
          [
            "Why does everyone want cheerful?",
            "They may have enough sadness already. I try to remember that."
          ]
        ]
      },
      {
        "title": "Nessa's childhood window",
        "opening": "What first made you notice glass?",
        "first": "A coloured bottle on a windowsill. The light put a patch on my hand. I kept moving to catch it.",
        "replies": [
          [
            "Did someone teach you afterward?",
            "Eventually. Curiosity got there years before training."
          ],
          [
            "Do you still enjoy that?",
            "Yes. Work hasn't quite managed to spoil it."
          ],
          [
            "Would you show a child now?",
            "Gladly. I'd let them discover the moving part themselves."
          ]
        ]
      },
      {
        "title": "An insult you kept",
        "opening": "Has a criticism ever helped you?",
        "first": "Someone said my work was too careful to look alive. I disliked him for a month and experimented for a year.",
        "replies": [
          [
            "Was he right?",
            "Partly. He was unnecessarily pleased about it."
          ],
          [
            "Did you thank him?",
            "Eventually. I waited until I could do it without gritting my teeth."
          ],
          [
            "What changed?",
            "I stopped correcting every irregularity merely because I could."
          ]
        ]
      }
    ],
    "greetings": [
      "Nessa. If you're admiring something, tell me which bit. I like particulars.",
      "Corin. I'll try to be specific.",
      "Corin! Still looking closely at things?",
      "When they let me stop.",
      "A dragon. Those colours would be infuriating to reproduce.",
      "I'm Corin. He'd probably move halfway through."
    ]
  },
  "Kerr": {
    "name": "Kerr",
    "home": "Forgewick",
    "role": "Coal carrier",
    "source": "07-forgewick.txt:26",
    "topics": [
      {
        "title": "The bath argument",
        "opening": "What's the first thing you want after work?",
        "first": "A bath nobody interrupts to ask when I'll be finished.",
        "replies": [
          [
            "Does that happen often?",
            "My family treats a closed door as a promising place for conversation."
          ],
          [
            "What do they ask?",
            "Things they ignored me all morning to avoid discussing."
          ],
          [
            "Do you answer?",
            "Eventually. I like them more once I'm clean."
          ]
        ]
      },
      {
        "title": "A tune for walking",
        "opening": "Do you count steps while carrying loads?",
        "first": "No. I keep a tune in my head. Counting makes the remaining steps too interested in me.",
        "replies": [
          [
            "Which tune?",
            "One my brother sang. He got half the words wrong."
          ],
          [
            "Could you learn the proper ones?",
            "Probably. I prefer his version."
          ],
          [
            "Does it make the load lighter?",
            "No. It makes the journey less empty."
          ]
        ]
      },
      {
        "title": "Kerr's ambition",
        "opening": "What would you do with a little extra money?",
        "first": "Pay someone to paint my mother's likeness. She thinks she's too ordinary for a portrait.",
        "replies": [
          [
            "What would you tell her?",
            "That ordinary is exactly the face I want."
          ],
          [
            "Would she agree?",
            "She'd complain for an hour and choose her best clothes."
          ],
          [
            "Why a portrait?",
            "I want something that remembers her when I'm not doing it properly."
          ]
        ]
      }
    ],
    "greetings": [
      "Kerr. Give me a moment to catch my breath before we exchange opinions.",
      "Corin. No hurry.",
      "Corin. Good timing. I've reached the part of the day with fewer loads in it.",
      "My favourite part too.",
      "A dragon could carry quite a lot. I imagine he'd dislike the suggestion.",
      "I'm Corin. I'd ask before drawing up a rota."
    ]
  },
  "Brigid": {
    "name": "Brigid",
    "home": "Forgewick",
    "role": "Builder",
    "source": "07-forgewick.txt:31",
    "topics": [
      {
        "title": "The house you wanted",
        "opening": "Did you ever draw your ideal home?",
        "first": "As a child. Every room had a fireplace. Nobody had explained chimneys or fuel bills.",
        "replies": [
          [
            "What else was in it?",
            "A room only for maps. I still rather want that one."
          ],
          [
            "Would you build it now?",
            "A smaller version. With fewer opportunities to burn down."
          ],
          [
            "Why maps?",
            "I liked thinking I could stay somewhere and still have the world nearby."
          ]
        ]
      },
      {
        "title": "A client's certainty",
        "opening": "What's your least favourite thing a client says?",
        "first": "That something should be simple. Usually just before describing a room larger inside than out.",
        "replies": [
          [
            "Do you explain?",
            "With measurements. They find that terribly personal."
          ],
          [
            "Have you ever agreed too soon?",
            "Yes. Paid for my confidence in long evenings."
          ],
          [
            "What do you say now?",
            "Let me look first. Four extremely profitable words."
          ]
        ]
      },
      {
        "title": "Building after loss",
        "opening": "Is it strange replacing a home someone loved?",
        "first": "Very. They compare every new corner with a memory. You're building beside something you can't see.",
        "replies": [
          [
            "Can you make it right?",
            "Not all of it. I ask which details they need kept."
          ],
          [
            "What details matter?",
            "A height mark. A particular view. Small things they can point to."
          ],
          [
            "Do you get attached?",
            "Sometimes. It's hard not to, once you've heard why a doorway matters."
          ]
        ]
      }
    ],
    "greetings": [
      "Brigid. If you're bringing advice, I hope it comes with a spare pair of hands.",
      "Corin. Just questions today.",
      "Corin! No, you haven't interrupted anything I can't blame on you later.",
      "That's reassuringly honest.",
      "A dragon. I'll be reconsidering several doorway widths in my dreams.",
      "I'm Corin. He generally waits outside."
    ]
  },
  "Fara": {
    "name": "Fara",
    "home": "Forgewick",
    "role": "Mender",
    "source": "07-forgewick.txt:36",
    "topics": [
      {
        "title": "The costume nobody wore",
        "opening": "Have you made something for a celebration that never happened?",
        "first": "A costume for a play. The organiser ran away with the takings. We had splendid sleeves and no performance.",
        "replies": [
          [
            "What did you do?",
            "Held our own evening. Made the organiser the villain."
          ],
          [
            "Did people come?",
            "Everyone he'd annoyed. We needed more chairs."
          ],
          [
            "Did you get paid?",
            "Enough. Revenge has surprisingly good attendance."
          ]
        ]
      },
      {
        "title": "The mender's secret",
        "opening": "Do you mend your own things promptly?",
        "first": "Absolutely not. My good coat has been waiting behind everyone else's emergencies.",
        "replies": [
          [
            "Why call it your good coat?",
            "Because I'm sentimental and optimistic."
          ],
          [
            "Would you let someone else mend it?",
            "If I could stop supervising. So, possibly not."
          ],
          [
            "What would make you do it?",
            "An invitation I actually wanted to accept."
          ]
        ]
      },
      {
        "title": "A name sewn inside",
        "opening": "Why do people ask for names stitched inside clothes?",
        "first": "Children lose things. Adults sometimes want proof something belongs to them.",
        "replies": [
          [
            "Have you wanted that?",
            "When I first earned enough for a coat of my own. I touched the name every time I put it on."
          ],
          [
            "Did anyone see?",
            "It wasn't for them."
          ],
          [
            "Do you still have it?",
            "No. I remember the feeling more clearly than the coat."
          ]
        ]
      }
    ],
    "greetings": [
      "Fara. If you're apologising for a tear, save it. Cloth tears.",
      "Corin. I'll remember that.",
      "Corin! Still keeping yourself reasonably stitched together?",
      "Mostly.",
      "A dragon. I hope his claws aren't involved in fitting clothes.",
      "I'm Corin. We keep him away from delicate work."
    ]
  },
  "Garrick": {
    "name": "Garrick",
    "home": "Forgewick",
    "role": "Retired courier",
    "source": "07-forgewick.txt:41",
    "topics": [
      {
        "title": "The parcel marked fragile",
        "opening": "What's the oddest parcel you carried?",
        "first": "One marked fragile that rattled like stones. The owner insisted it was supposed to sound broken.",
        "replies": [
          [
            "What was inside?",
            "Pieces for a mosaic. I spent two days panicking over a finished result."
          ],
          [
            "Did you ask before leaving?",
            "No. I was young and thought questions looked unprofessional."
          ],
          [
            "What would you do now?",
            "Open my mouth before setting out."
          ]
        ]
      },
      {
        "title": "Garrick's slow walk",
        "opening": "Why do you walk so slowly these days?",
        "first": "Because nobody's paying me to hurry, and I've discovered the world continues without my assistance.",
        "replies": [
          [
            "Does it frustrate people?",
            "Occasionally. I step aside and wish them joy of arriving sooner."
          ],
          [
            "Do you notice more?",
            "Windows mostly. I'd passed some for years without looking up."
          ],
          [
            "Do you miss being needed?",
            "Yes. Slowly is a pleasure; unnecessary takes practice."
          ]
        ]
      },
      {
        "title": "A message remembered",
        "opening": "Is there a message you still remember exactly?",
        "first": "A woman sent three words to her sister: Come if possible. I learned how much fear can fit in a small space.",
        "replies": [
          [
            "Did the sister come?",
            "Yes. I saw her on the road the next morning."
          ],
          [
            "Was everything all right?",
            "I never learned. Delivering didn't give me a right to the ending."
          ],
          [
            "Does that bother you?",
            "Sometimes. I prefer it to being owed everybody's private life."
          ]
        ]
      }
    ],
    "greetings": [
      "Garrick. I used to know every route. Now I enjoy admitting I've forgotten some.",
      "Corin. I'll ask for company instead.",
      "Corin! A familiar face without a delivery deadline.",
      "A pleasant change?",
      "A dragon. My old knees are suddenly jealous of wings.",
      "I'm Corin. They have their own complications."
    ]
  },
  "Junia": {
    "name": "Junia",
    "home": "Forgewick",
    "role": "Story writer",
    "source": "07-forgewick.txt:46",
    "topics": [
      {
        "title": "The name that wouldn't fit",
        "opening": "Have you ever changed a character's name halfway through?",
        "first": "Yes. He immediately became less irritating. Apparently I'd been blaming his personality for a name I hated.",
        "replies": [
          [
            "How did you choose another?",
            "Said them aloud until the neighbours became concerned."
          ],
          [
            "Could you use a real person's name?",
            "Only after making sure I wasn't also borrowing their nose."
          ],
          [
            "Does the character know?",
            "He seems relieved."
          ]
        ]
      },
      {
        "title": "A story your mother read",
        "opening": "What did your mother think of your first story?",
        "first": "Asked why the mother in it was so unreasonable. She wasn't meant to be in it, which didn't help my defence.",
        "replies": [
          [
            "Was she in it?",
            "A little. More than I'd admitted to myself."
          ],
          [
            "Did you change it?",
            "I gave the mother a reason. It improved the story."
          ],
          [
            "Did your mother like that?",
            "She said it was a start. Excellent critic, impossible audience."
          ]
        ]
      },
      {
        "title": "The sentence you deleted",
        "opening": "What's hardest to cut from a story?",
        "first": "A sentence I love that does nothing except announce how pleased I am with it.",
        "replies": [
          [
            "How do you recognise it?",
            "I keep showing it to people without explaining the scene."
          ],
          [
            "Do you save it elsewhere?",
            "Yes. I have a small graveyard of very elegant sentences."
          ],
          [
            "Will you use them later?",
            "They all believe so."
          ]
        ]
      }
    ],
    "greetings": [
      "Junia. If I stare into space, I'm either working or avoiding it. Hard to tell.",
      "Corin. I won't demand proof.",
      "Corin! I've finally given somebody a convincing motive.",
      "Someone in a story, I hope.",
      "A dragon. Everyone will think I've invented you badly.",
      "I'm Corin. You may have to make the truth less exciting."
    ]
  },
  "Kellan": {
    "name": "Kellan",
    "home": "Forgewick",
    "role": "Apprentice toolmaker",
    "source": "07-forgewick.txt:51",
    "topics": [
      {
        "title": "The master's handwriting",
        "opening": "Can you read your master's notes?",
        "first": "More by memory than reading. There's one mark that means either polish or completely remake. Context matters.",
        "replies": [
          [
            "Have you mistaken them?",
            "Once. I polished a mistake beautifully."
          ],
          [
            "Was the master angry?",
            "Mostly with the handwriting. A rare and treasured victory."
          ],
          [
            "Why not ask?",
            "I do now. Confidence was taking too long to repair."
          ]
        ]
      },
      {
        "title": "Kellan's first customer",
        "opening": "What was it like selling something you'd made?",
        "first": "Terrifying. I wanted to follow the customer home and check whether it worked.",
        "replies": [
          [
            "Did you?",
            "No. I rehearsed a casual meeting for several days instead."
          ],
          [
            "Did they come back?",
            "For another. I pretended this was an ordinary event."
          ],
          [
            "Were you proud?",
            "I kept the first coin. Spent the others very sensibly on supper."
          ]
        ]
      },
      {
        "title": "A skill you envy",
        "opening": "What can someone else do that you wish you could?",
        "first": "Draw what they mean. My sketches require an accompanying apology.",
        "replies": [
          [
            "Could you learn?",
            "Ivo says so. He also says I must stop hiding the paper."
          ],
          [
            "Why hide it?",
            "Because people can see the mistake before I explain it."
          ],
          [
            "That's how learning looks.",
            "Yes. I keep hoping to skip the visible part."
          ]
        ]
      }
    ],
    "greetings": [
      "Kellan. Apprentice, though I'm hoping the word wears off eventually.",
      "Corin. Everyone starts somewhere.",
      "Corin! I've managed something since last time.",
      "Tell me before you decide it's too small.",
      "A dragon. I'm trying to look calm and failing brilliantly.",
      "I'm Corin. He doesn't mind enthusiasm."
    ]
  },
  "Lysa": {
    "name": "Lysa",
    "home": "Forgewick",
    "role": "Weaver",
    "source": "07-forgewick.txt:56",
    "topics": [
      {
        "title": "The pattern nobody saw",
        "opening": "Have you woven a secret into something?",
        "first": "A tiny bird in a cloth for my sister. She found it years later and wrote as though I'd just sent it.",
        "replies": [
          [
            "Why hide it?",
            "She likes noticing things. I wanted the gift to last beyond unwrapping."
          ],
          [
            "Did she like it?",
            "She sent me a drawing of where she'd found it."
          ],
          [
            "Would you do that for everyone?",
            "No. Some people want their presents to behave plainly."
          ]
        ]
      },
      {
        "title": "A weaver's hands at rest",
        "opening": "What do your hands do when you're nervous?",
        "first": "Fold whatever I'm holding. Receipts, sleeves, other people's perfectly innocent napkins.",
        "replies": [
          [
            "Does it help?",
            "A little. It gives the nervousness a small job."
          ],
          [
            "Have you ruined anything?",
            "A letter I was trying not to open."
          ],
          [
            "Did you open it eventually?",
            "Yes. It wasn't half as frightening as waiting had made it."
          ]
        ]
      },
      {
        "title": "A compliment refused",
        "opening": "Why do you argue when people praise your work?",
        "first": "Because I can still see the part I nearly got wrong.",
        "replies": [
          [
            "But they can't.",
            "I'm beginning to understand that this is allowed."
          ],
          [
            "What would you like them to notice?",
            "The colour. That's the part I choose with the least fear."
          ],
          [
            "Then take the compliment.",
            "All right. That felt oddly strenuous."
          ]
        ]
      }
    ],
    "greetings": [
      "Lysa. Don't mind the silence; I was counting and haven't quite stopped.",
      "Corin. I'll wait outside the numbers.",
      "Corin! You've arrived at a friendlier moment.",
      "I'll take advantage of it.",
      "A dragon. That would make a splendid pattern and a terrible measuring appointment.",
      "I'm Corin. He agrees about the appointment."
    ]
  },
  "Cinder": {
    "name": "Cinder",
    "home": "Forgewick",
    "role": "Former forge tender",
    "source": "07-forgewick.txt:61",
    "topics": [
      {
        "title": "The name you kept",
        "opening": "Did people tease you about your name at the forge?",
        "first": "Endlessly. They all thought they'd invented the joke. I began rating their delivery.",
        "replies": [
          [
            "What got the highest mark?",
            "Someone who asked my name and said nothing else."
          ],
          [
            "Did you ever wish for another?",
            "As a boy. Now it sounds like me."
          ],
          [
            "Would you name a child after your trade?",
            "Only if I became a poet first. Better choices."
          ]
        ]
      },
      {
        "title": "A night without heat",
        "opening": "Do you miss the forge's warmth?",
        "first": "Sometimes I wake expecting it. The room feels wrong until I remember I'm home.",
        "replies": [
          [
            "Is that unpleasant?",
            "Not always. Familiarity takes longer to cool than iron."
          ],
          [
            "What do you like now?",
            "Being warm because somebody lit a fire for supper, not because a shift began."
          ],
          [
            "Do you go back to visit?",
            "Occasionally. I leave before my hands volunteer."
          ]
        ]
      },
      {
        "title": "Cinder's unexpected collection",
        "opening": "Do you collect anything?",
        "first": "Small smooth stones. Nothing valuable. I like something that doesn't need improving.",
        "replies": [
          [
            "Where do you keep them?",
            "At home, where visitors occasionally mistake them for a chore."
          ],
          [
            "Do they all mean something?",
            "Some do. Some simply feel right in the hand."
          ],
          [
            "Would you part with them?",
            "A few. The one from my brother's garden stays."
          ]
        ]
      }
    ],
    "greetings": [
      "Cinder. Before you ask, yes, the name predates the work.",
      "Corin. You anticipated me.",
      "Corin. Good. I was ready for a quiet conversation.",
      "We can manage quiet.",
      "A dragon. I know fire, but fire with opinions is new.",
      "I'm Corin. He has plenty of those."
    ]
  },
  "Warden": {
    "name": "Warden",
    "home": "Forgewick",
    "role": "Neighbourhood organiser",
    "source": "08-forgewick-homes.txt:1",
    "topics": [
      {
        "title": "The meeting nobody needed",
        "opening": "What's the worst meeting you've attended?",
        "first": "One about whether we needed more meetings. It overran.",
        "replies": [
          [
            "What did you decide?",
            "To discuss it again. I briefly considered leaving town."
          ],
          [
            "Why did you stay?",
            "Somebody still had to arrange the actual work."
          ],
          [
            "Could you cancel the next one?",
            "I did. It was my most popular contribution."
          ]
        ]
      },
      {
        "title": "Warden's hidden hobby",
        "opening": "What would your neighbours never guess about you?",
        "first": "I write very bad romantic poems. My husband thinks they're wonderful, which casts doubt on his judgement.",
        "replies": [
          [
            "Do you read them aloud?",
            "Only to him. He's already committed."
          ],
          [
            "What are they about?",
            "Him, mostly. That may explain the favourable reviews."
          ],
          [
            "Would you publish them?",
            "I'd rather organise three more meetings."
          ]
        ]
      },
      {
        "title": "The favour you remember",
        "opening": "Who helped you when you first needed it?",
        "first": "A neighbour who didn't wait for me to sound grateful. I was exhausted and rather rude.",
        "replies": [
          [
            "Did you apologise?",
            "Later. She said she'd heard worse from happier people."
          ],
          [
            "Do you do the same now?",
            "I try. It's harder when you're the one being snapped at."
          ],
          [
            "Why remember that part?",
            "So I don't require people to be charming before helping them."
          ]
        ]
      }
    ],
    "greetings": [
      "Warden. That's my name, before you start wondering what you've done wrong.",
      "Corin. I was only slightly worried.",
      "Corin! No, I haven't found a job for you. Yet.",
      "I'll enjoy this brief freedom.",
      "A dragon. I'll need to warn people before the rumours acquire extra heads.",
      "I'm Corin. One head is quite enough."
    ]
  },
  "Ember": {
    "name": "Ember",
    "home": "Forgewick",
    "role": "Home baker",
    "source": "08-forgewick-homes.txt:6",
    "topics": [
      {
        "title": "A cake for an enemy",
        "opening": "Would you bake for someone you disliked?",
        "first": "I have. Made it beautifully. Refused to give them the satisfaction of an inferior cake.",
        "replies": [
          [
            "Did they thank you?",
            "With their mouth full. I accepted the evidence."
          ],
          [
            "Did you like them afterward?",
            "No. Cake isn't absolution."
          ],
          [
            "Would you do it again?",
            "If they paid. My principles require ingredients."
          ]
        ]
      },
      {
        "title": "The recipe in the wrong pocket",
        "opening": "Have you ever lost a favourite recipe?",
        "first": "Dagna washed it. We spent an evening trying to distinguish raisins from instructions.",
        "replies": [
          [
            "Did you recover it?",
            "Enough to make something edible. Not enough to repeat it reliably."
          ],
          [
            "Were you angry?",
            "For ten minutes. Then we began laughing at the ink."
          ],
          [
            "Have you written it down since?",
            "Three copies. Love doesn't prevent laundry."
          ]
        ]
      },
      {
        "title": "The home you chose",
        "opening": "What made Forgewick feel like home?",
        "first": "The first time someone complained I'd been away too long. I hadn't realised anybody was counting.",
        "replies": [
          [
            "Who said it?",
            "Dagna. She disguised it as a complaint about supper."
          ],
          [
            "Did you tell her you were pleased?",
            "Not well. I made something enormous instead."
          ],
          [
            "Does she understand that?",
            "Usually. She'd still prefer words before the second helping."
          ]
        ]
      }
    ],
    "greetings": [
      "Ember. No connection to every fire-related joke you may have prepared.",
      "Corin. I'll retire them quietly.",
      "Corin! Dagna said I'd talked your ears off.",
      "They're still attached.",
      "A dragon! Finally, someone who might appreciate an oven joke.",
      "I'm Corin. I wouldn't guarantee his taste in jokes."
    ]
  },
  "Dagna": {
    "name": "Dagna",
    "home": "Forgewick",
    "role": "Launderer",
    "source": "08-forgewick-homes.txt:11",
    "topics": [
      {
        "title": "The shirt with two owners",
        "opening": "What's the strangest quarrel your work has caused?",
        "first": "Two brothers claimed the same shirt. Neither wanted it until he thought the other would get it.",
        "replies": [
          [
            "How did you decide?",
            "Asked who wanted to pay for cleaning it. Ownership became less urgent."
          ],
          [
            "Who took it?",
            "Their mother. She'd bought it."
          ],
          [
            "Did they apologise?",
            "They carried the laundry. Better than a speech."
          ]
        ]
      },
      {
        "title": "Dagna's holiday weather",
        "opening": "What weather would you choose for a day off?",
        "first": "Rain. Nobody can tell me I ought to be making use of a beautiful drying day.",
        "replies": [
          [
            "Wouldn't you rather go out?",
            "I could. That's the splendid thing about waterproof clothes."
          ],
          [
            "What would you do indoors?",
            "Read without listening for a change in the wind."
          ],
          [
            "Does Ember understand?",
            "Ember brings food. A very persuasive form of understanding."
          ]
        ]
      },
      {
        "title": "A difficult compliment",
        "opening": "What compliment makes you uncomfortable?",
        "first": "That I never complain. I do complain. People just call it joking when they'd rather not listen.",
        "replies": [
          [
            "Have you told them?",
            "More plainly lately."
          ],
          [
            "Does that work?",
            "With the people worth telling twice."
          ],
          [
            "What would you prefer to hear?",
            "That somebody noticed I needed a hand."
          ]
        ]
      }
    ],
    "greetings": [
      "Dagna. If you're worried about soot, you've chosen an unfortunate town.",
      "Corin. I'll try to make peace with it.",
      "Corin! You look less bewildered by the place.",
      "I'm learning which noises to ignore.",
      "A dragon. I wonder whether smoke comes out of everything he touches.",
      "I'm Corin. We'll try not to find out on your washing."
    ]
  },
  "Lode": {
    "name": "Lode",
    "home": "Forgewick",
    "role": "Retired miner",
    "source": "08-forgewick-homes.txt:16",
    "topics": [
      {
        "title": "The sound of your own name",
        "opening": "Did you like hearing your name underground?",
        "first": "Very much. In the dark, a familiar voice can make a whole room where there wasn't one.",
        "replies": [
          [
            "Who called you most?",
            "My oldest friend. He always sounded annoyed, even when he was glad."
          ],
          [
            "Do you still see him?",
            "When his knees permit the journey. Mine complain at the other end."
          ],
          [
            "Do you miss the mine?",
            "I miss who we were together there."
          ]
        ]
      },
      {
        "title": "Lode's clean hands",
        "opening": "Was it strange having clean hands after retiring?",
        "first": "I kept looking at them as though they'd failed to report for work.",
        "replies": [
          [
            "What did you do with them?",
            "Started cooking. Rediscovered dirt in a much more edible form."
          ],
          [
            "Were you good?",
            "No. My family became unusually willing to help."
          ],
          [
            "Are you better now?",
            "Enough that they let me finish before offering advice."
          ]
        ]
      },
      {
        "title": "An argument with the future",
        "opening": "Do you worry about getting old?",
        "first": "I dislike being spoken to as though I'm already a memory.",
        "replies": [
          [
            "Who does that?",
            "People who only ask what I used to do."
          ],
          [
            "What should I ask?",
            "What I'm doing tomorrow. I still make plans."
          ],
          [
            "What are you doing tomorrow?",
            "Something I haven't yet agreed to let the weather spoil."
          ]
        ]
      }
    ],
    "greetings": [
      "Lode. If you need a dramatic mining story, let me finish remembering an ordinary one.",
      "Corin. Ordinary will do.",
      "Corin! Good. I've been talking to myself and winning too easily.",
      "I'll offer some resistance.",
      "A dragon. There's a sight worth coming above ground for.",
      "I'm Corin. Glad he makes a good first impression."
    ]
  },
  "Pike": {
    "name": "Pike",
    "home": "Forgewick",
    "role": "Basket maker",
    "source": "08-forgewick-homes.txt:21",
    "topics": [
      {
        "title": "The basket nobody opened",
        "opening": "Have you ever delivered a mysterious basket?",
        "first": "One for a wedding, tied shut. Everyone assumed food. It contained the bride's shoes, which she'd left at home.",
        "replies": [
          [
            "Did you save the ceremony?",
            "I saved her from marrying barefoot. Different level of achievement."
          ],
          [
            "Were you thanked?",
            "Enthusiastically. The shoes were blamed for the delay."
          ],
          [
            "What was the mystery?",
            "Why anyone believed the bride would pack her own breakfast that carefully."
          ]
        ]
      },
      {
        "title": "Pike's sharp ears",
        "opening": "Why do you enjoy markets?",
        "first": "People say interesting things when they think you're only looking at their coins.",
        "replies": [
          [
            "Do you listen deliberately?",
            "I try not to. Curiosity is an undisciplined employee."
          ],
          [
            "What do you remember?",
            "The way a nervous person asks the price twice."
          ],
          [
            "What do you do then?",
            "Give them room to decide without making poverty a public event."
          ]
        ]
      },
      {
        "title": "A basket for yourself",
        "opening": "What do you keep in your own best basket?",
        "first": "Nothing. It became the best basket precisely because I never used it.",
        "replies": [
          [
            "Doesn't that annoy you?",
            "Now you've asked, yes."
          ],
          [
            "What could go in it?",
            "Bread. Or the things I keep moving off the table."
          ],
          [
            "Would using it spoil it?",
            "Probably improve our relationship."
          ]
        ]
      }
    ],
    "greetings": [
      "Pike. If you're looking for a bargain, begin by telling me your name.",
      "Corin. Conversation first?",
      "Corin! You've remembered where to find me.",
      "My feet deserve some credit.",
      "A dragon. I can confidently say I make no basket suitable for that.",
      "I'm Corin. We weren't going to ask."
    ]
  },
  "Hallow": {
    "name": "Hallow",
    "home": "Forgewick",
    "role": "Repairer",
    "source": "08-forgewick-homes.txt:26",
    "topics": [
      {
        "title": "The haunted cupboard",
        "opening": "Have you ever been asked to fix a haunting?",
        "first": "A cupboard sighed whenever it opened. The owner was convinced it regretted something.",
        "replies": [
          [
            "What was wrong?",
            "A loose fitting. I regretted only how long she'd been frightened."
          ],
          [
            "Was she relieved?",
            "Disappointed. The cupboard had made her interesting at dinner."
          ],
          [
            "Did you leave it sighing?",
            "No. I don't charge extra for atmosphere."
          ]
        ]
      },
      {
        "title": "The repairer's patience",
        "opening": "Are you patient with people too?",
        "first": "Less than with objects. Objects rarely insist they haven't been dropped while I'm holding the broken pieces.",
        "replies": [
          [
            "Do people lie often?",
            "Mostly they're embarrassed. I try to remember that before sounding clever."
          ],
          [
            "Have you broken things yourself?",
            "My own tools. The universe enjoys fairness."
          ],
          [
            "Do you admit it?",
            "Eventually, when I need someone else's help."
          ]
        ]
      },
      {
        "title": "An object beyond repair",
        "opening": "How do you tell someone a thing can't be saved?",
        "first": "Slowly. They often brought more than the object through the door.",
        "replies": [
          [
            "Have you had to do that?",
            "A child's old music box. The owner was grown. She'd carried it a long time."
          ],
          [
            "Could you save any part?",
            "The case. She kept it. That was enough for her."
          ],
          [
            "Does it upset you?",
            "Yes. I prefer a problem that yields to my hands."
          ]
        ]
      }
    ],
    "greetings": [
      "Hallow. If it rattles, describe the rattle before telling me it's cursed.",
      "Corin. Nothing cursed to report.",
      "Corin! You've returned without a sack of broken things.",
      "A purely social miracle.",
      "A dragon. For once, magic might be a reasonable explanation.",
      "I'm Corin. I promise he isn't a repair job."
    ]
  },
  "Quarrel": {
    "name": "Quarrel",
    "home": "Forgewick",
    "role": "Opinionated neighbour",
    "source": "08-forgewick-homes.txt:31",
    "topics": [
      {
        "title": "The view from the wrong side",
        "opening": "Have you ever defended a position you didn't believe?",
        "first": "Yes. Everyone agreed too quickly. I thought somebody should test the floor before we all stood on it.",
        "replies": [
          [
            "Did you admit what you were doing?",
            "Eventually. They were less grateful than anticipated."
          ],
          [
            "Was the objection useful?",
            "One was. The other six were vanity."
          ],
          [
            "Would you do it again?",
            "More briefly, I hope."
          ]
        ]
      },
      {
        "title": "The apology you practised",
        "opening": "Do you find apologising difficult?",
        "first": "I can explain exactly why I was wrong. Saying sorry without the explanation is harder.",
        "replies": [
          [
            "Why?",
            "Because explanation gives me something to hide behind."
          ],
          [
            "Does Flint notice?",
            "Instantly. He waits until I've finished protecting myself."
          ],
          [
            "What do you say then?",
            "Sorry. Astonishingly short word for so much work."
          ]
        ]
      },
      {
        "title": "Quarrel's quiet pleasure",
        "opening": "What makes you happy without starting an argument?",
        "first": "Watching somebody unwrap a present I've chosen well.",
        "replies": [
          [
            "What makes it well chosen?",
            "They stop being polite and start being pleased."
          ],
          [
            "Are you good at it?",
            "Better than I am at receiving thanks."
          ],
          [
            "Why dislike thanks?",
            "I never know where to put my face."
          ]
        ]
      }
    ],
    "greetings": [
      "Quarrel. Yes, really. You may decide later whether it suits.",
      "Corin. I'll keep an open mind.",
      "Corin! Have you come prepared to disagree?",
      "Only where necessary.",
      "A dragon. I refuse to be the first person to object to that.",
      "I'm Corin. We appreciate the restraint."
    ]
  },
  "Flint": {
    "name": "Flint",
    "home": "Forgewick",
    "role": "Retired kiln worker",
    "source": "08-forgewick-homes.txt:36",
    "topics": [
      {
        "title": "The thing you never finished",
        "opening": "Have you kept an unfinished piece?",
        "first": "A little clay bird from my first year. One wing's wrong. I stopped trying to fix it long ago.",
        "replies": [
          [
            "Why keep it?",
            "To remember I could love making something before I was good at it."
          ],
          [
            "Would you finish it now?",
            "No. I'd spoil what it tells me."
          ],
          [
            "Does anyone else like it?",
            "Quarrel. He calls it determined rather than malformed."
          ]
        ]
      },
      {
        "title": "Flint's family voice",
        "opening": "Do you sound like your parents?",
        "first": "I hear my father when I complain about a draught. It's alarming how faithfully irritation survives.",
        "replies": [
          [
            "Did you like him?",
            "Very much. I'd prefer to inherit his laugh as well."
          ],
          [
            "Have you noticed that too?",
            "Occasionally. Those are better days."
          ],
          [
            "Do you mind becoming like him?",
            "Only when it happens without asking me."
          ]
        ]
      },
      {
        "title": "The argument you enjoy",
        "opening": "What do you enjoy arguing about with Quarrel?",
        "first": "Which of us first asked the other to stay. Neither can remember, so both claim the courage.",
        "replies": [
          [
            "Does it matter?",
            "Only because we like the story."
          ],
          [
            "What if you found the truth?",
            "We'd probably dispute the evidence."
          ],
          [
            "Who do you think it was?",
            "Him. Don't tell him I said that."
          ]
        ]
      }
    ],
    "greetings": [
      "Flint. Ignore the name; I'm usually quite difficult to strike sparks off.",
      "Corin. That sounds restful.",
      "Corin! Quarrel hasn't sent you to recruit me, has he?",
      "I'm acting independently.",
      "A dragon. Finally, a sensible reason to ask about fire.",
      "I'm Corin. We've had less sensible ones."
    ]
  },
  "Bors": {
    "name": "Bors",
    "home": "Forgewick",
    "role": "Household carpenter",
    "source": "08-forgewick-homes.txt:41",
    "topics": [
      {
        "title": "The smallest commission",
        "opening": "What's the smallest thing you've made for someone?",
        "first": "A step so a child could reach a window. She wanted to watch for her father coming home.",
        "replies": [
          [
            "Did she like it?",
            "She climbed up before I finished explaining it. Best review I've had."
          ],
          [
            "Did you charge?",
            "Her mother paid. Proud people deserve the chance to pay."
          ],
          [
            "What became of it?",
            "Passed to a younger child. The father still comes home."
          ]
        ]
      },
      {
        "title": "Bors's disastrous supper",
        "opening": "Have you tried your husband's work?",
        "first": "Tried making a pot. Produced something Kiln called a bold interpretation of a container.",
        "replies": [
          [
            "Did it hold anything?",
            "Our attention, mostly."
          ],
          [
            "Were you annoyed?",
            "Until I remembered how kindly he'd described it."
          ],
          [
            "Would you try again?",
            "Yes. We enjoy being bad at each other's cleverness."
          ]
        ]
      },
      {
        "title": "A door that sticks",
        "opening": "Why do you like old houses?",
        "first": "They've already made room for mistakes. New houses sometimes look as if they're waiting to be disappointed.",
        "replies": [
          [
            "You repair the mistakes, though.",
            "The dangerous ones. A little wear isn't a failure."
          ],
          [
            "What would you keep?",
            "Marks where someone grew taller. I always ask before touching those."
          ],
          [
            "Did you have marks like that?",
            "Yes. I remember standing straighter than I really was."
          ]
        ]
      }
    ],
    "greetings": [
      "Bors. If you need something measured, say so before I start guessing.",
      "Corin. No measurements today.",
      "Corin! Good to see someone who isn't describing a cupboard.",
      "I can promise that much.",
      "A dragon. I'd need another measuring stick just for the introduction.",
      "I'm Corin. A name will do for now."
    ]
  },
  "Kiln": {
    "name": "Kiln",
    "home": "Forgewick",
    "role": "Potter",
    "source": "08-forgewick-homes.txt:46",
    "topics": [
      {
        "title": "The potter's envy",
        "opening": "What do you envy about Bors's work?",
        "first": "He can stop halfway and go to supper without his material deciding to become something else.",
        "replies": [
          [
            "What does he envy?",
            "That I can squash an ugly attempt and begin again."
          ],
          [
            "Would you trade?",
            "For an afternoon. We'd both return feeling underpaid."
          ],
          [
            "Do you help each other?",
            "We listen to complaints neither of us fully understands. It counts."
          ]
        ]
      },
      {
        "title": "A bowl for an absent friend",
        "opening": "Have you ever made something for someone who couldn't receive it?",
        "first": "A bowl after a friend died. I knew perfectly well. My hands needed something to do.",
        "replies": [
          [
            "Where is it now?",
            "At home. I use it."
          ],
          [
            "Does that hurt?",
            "Sometimes. Sometimes it feels like having him at supper."
          ],
          [
            "Would you make another?",
            "No. That one says what it needed to."
          ]
        ]
      },
      {
        "title": "The glaze nobody bought",
        "opening": "Have customers ever disliked something you loved?",
        "first": "A green glaze I thought extraordinary. Everyone said it reminded them of soup.",
        "replies": [
          [
            "Was that fair?",
            "Unfortunately. A very specific soup."
          ],
          [
            "Did you abandon it?",
            "I kept one cup. I like it even more now it's failed commercially."
          ],
          [
            "What do you drink from it?",
            "Tea. I'm not surrendering completely."
          ]
        ]
      }
    ],
    "greetings": [
      "Kiln. Yes, a potter. My parents were either prophetic or limiting my options.",
      "Corin. At least you found the right work.",
      "Corin! I haven't broken anything since breakfast. A good time to visit.",
      "I'll tread carefully.",
      "A dragon. That's one way to make firing pottery more personal.",
      "I'm Corin. I wouldn't put him on the payroll yet."
    ]
  },
  "Merrin": {
    "name": "Merrin",
    "home": "Thornwell and Forgewick",
    "role": "Keen walker",
    "source": "08-forgewick-homes.txt:51",
    "topics": [
      {
        "title": "The walk with no destination",
        "opening": "Can you enjoy a walk that goes nowhere?",
        "first": "That's my favourite sort. Nobody can tell me I'm late.",
        "replies": [
          [
            "Do you choose a route?",
            "After the first turning. It feels more like choosing then."
          ],
          [
            "What if it rains?",
            "I become a walker with a purpose. Shelter."
          ],
          [
            "Do you ever feel guilty?",
            "Less than I used to. Pleasure doesn't need a receipt."
          ]
        ]
      },
      {
        "title": "A familiar stranger",
        "opening": "Do you greet people you don't know on walks?",
        "first": "Yes. There's a man I've greeted for years. Neither of us knows the other's name.",
        "replies": [
          [
            "Why not ask?",
            "It now feels absurdly late."
          ],
          [
            "What if he asked yours?",
            "I'd be relieved beyond reason."
          ],
          [
            "You could go first.",
            "Yes. I dislike how simple that sounds when you say it."
          ]
        ]
      },
      {
        "title": "Merrin's least favourite advice",
        "opening": "What do people keep advising you to do?",
        "first": "Walk faster. As though the road were a problem I should finish.",
        "replies": [
          [
            "Sometimes it is.",
            "True. I'm fortunate when mine isn't."
          ],
          [
            "What do you notice slowly?",
            "People deciding whether they want company."
          ],
          [
            "How do you tell?",
            "I ask. I've learned not to turn noticing into mind-reading."
          ]
        ]
      }
    ],
    "greetings": [
      "Merrin. Out walking, or has someone sent you somewhere?",
      "Corin. A bit of both.",
      "Corin! Another road crossing ours.",
      "A welcome one.",
      "A dragon! I'd have to lengthen my stride considerably.",
      "I'm Corin. He doesn't always wait for short legs."
    ]
  },
  "Tallis": {
    "name": "Tallis",
    "home": "Forgewick",
    "role": "Lutenist",
    "source": "08-forgewick-homes.txt:56",
    "topics": [
      {
        "title": "A borrowed melody",
        "opening": "Have you ever used a tune someone else was humming?",
        "first": "Yes. Asked where it came from. They said they thought I'd played it earlier.",
        "replies": [
          [
            "Had you?",
            "Apparently. I was about to admire my own work in public."
          ],
          [
            "Did you confess?",
            "Too late. They looked delighted by my embarrassment."
          ],
          [
            "Was it a good tune?",
            "Better before I knew whose it was."
          ]
        ]
      },
      {
        "title": "The musician at a wedding",
        "opening": "Do you like playing weddings?",
        "first": "I like the moment people stop worrying about how they look and begin enjoying each other.",
        "replies": [
          [
            "Does that always happen?",
            "Not always. Sometimes the shoes prevent it."
          ],
          [
            "What do you play then?",
            "Something familiar. People trust a tune they know."
          ],
          [
            "Have you ever cried playing?",
            "Yes. Kept going badly. Nobody seemed to mind."
          ]
        ]
      },
      {
        "title": "Tallis's unfinished song",
        "opening": "Why haven't you finished your own song?",
        "first": "Because once it's finished, it can disappoint me in a permanent form.",
        "replies": [
          [
            "Could it surprise you?",
            "That's what keeps me working."
          ],
          [
            "What's missing?",
            "An ending that doesn't explain the feeling to death."
          ],
          [
            "Perhaps it can just stop.",
            "You're making dangerous sense, Corin."
          ]
        ]
      }
    ],
    "greetings": [
      "Tallis. If you've come to complain about the music, be specific. I'm sensitive and curious.",
      "Corin. No complaint.",
      "Corin! A returning listener. I'll try not to become conceited.",
      "I'll warn you gently.",
      "A dragon would make an excellent dramatic pause.",
      "I'm Corin. He may not hold the pose."
    ]
  },
  "Ivo": {
    "name": "Ivo",
    "home": "Forgewick",
    "role": "Young draughtsman",
    "source": "08-forgewick-homes.txt:61",
    "topics": [
      {
        "title": "A drawing of a sound",
        "opening": "Can you draw something you can't see?",
        "first": "I've tried drawing a hammer's sound. Everyone thought it was a badly frightened star.",
        "replies": [
          [
            "What did you intend?",
            "The force of it. The way you feel it before you've decided to listen."
          ],
          [
            "Would you try again?",
            "Yes. Perhaps with fewer points."
          ],
          [
            "Why draw that?",
            "Because accurate isn't always the same as recognisable."
          ]
        ]
      },
      {
        "title": "The portrait you avoided",
        "opening": "Whose face would be hardest to draw?",
        "first": "My mother's. I know too many versions to choose one.",
        "replies": [
          [
            "Which would you choose?",
            "The one when she's listening and doesn't know I'm looking."
          ],
          [
            "Would she like it?",
            "She'd ask why I hadn't made her younger."
          ],
          [
            "Would you?",
            "No. I want her, not an apology for time."
          ]
        ]
      },
      {
        "title": "Ivo's stolen afternoon",
        "opening": "Have you ever abandoned work to do nothing?",
        "first": "Once I went outside intending to think and spent an hour watching a dog decide where to sleep.",
        "replies": [
          [
            "Did it help?",
            "Immensely. The dog had a sensible relationship with deadlines."
          ],
          [
            "Did you feel guilty?",
            "Until I returned and solved something I'd been forcing all morning."
          ],
          [
            "So it wasn't nothing.",
            "Apparently not. I still wouldn't put the dog on my invoice."
          ]
        ]
      }
    ],
    "greetings": [
      "Ivo. Don't look too closely at my expression; I'm calculating something badly.",
      "Corin. I won't check your sums.",
      "Corin! I've corrected a mistake and discovered two more.",
      "A productive visit, then.",
      "A dragon. I need several pages and a very patient companion.",
      "I'm Corin. His patience varies with hunger."
    ]
  },
  "Nazim": {
    "name": "Nazim",
    "home": "Sandspire",
    "role": "Water keeper",
    "source": "09-sandspire.txt:1",
    "topics": [
      {
        "title": "The first drink of the day",
        "opening": "What's the first thing you do each morning?",
        "first": "Drink before I've started thinking about everyone else's thirst. Took me years to learn that much.",
        "replies": [
          [
            "Did someone teach you?",
            "My wife put a cup in my hand and refused to hear about work until it was empty."
          ],
          [
            "Does she still do that?",
            "Only when I look particularly indispensable."
          ],
          [
            "Do you like the work?",
            "Yes. I'd like it less if nobody noticed when it exhausted me."
          ]
        ]
      },
      {
        "title": "A quarrel over a cup",
        "opening": "What's the smallest thing you've seen cause a serious quarrel?",
        "first": "Two people arguing over who had filled a cup first. Neither was thirsty anymore. They'd become interested in winning.",
        "replies": [
          [
            "How did you stop them?",
            "I asked who was waiting behind them."
          ],
          [
            "Did that work?",
            "One looked embarrassed. That gave the other permission to stop."
          ],
          [
            "What if neither had stopped?",
            "Then we'd have needed a longer conversation and two less important egos."
          ]
        ]
      },
      {
        "title": "Nazim's impossible garden",
        "opening": "What would you grow if water were plentiful?",
        "first": "A garden so lush I'd lose things in it. Very irresponsible fantasy for a water keeper.",
        "replies": [
          [
            "What would you lose?",
            "My work hat, preferably."
          ],
          [
            "Would you really want to leave it all?",
            "For a day. Then I'd wonder whether anyone had checked the stores."
          ],
          [
            "Could you trust someone else?",
            "I should. Wanting to be useful can become wanting to be necessary."
          ]
        ]
      }
    ],
    "greetings": [
      "Welcome to Sandspire. Nazim. Take a breath before you ask where everything is.",
      "Corin. Thank you.",
      "Corin, back through town? You're beginning to look less surprised by the heat.",
      "I'm learning to respect it.",
      "A dragon. I hope he understands that water here isn't a toy.",
      "I'm Corin. We'll treat it carefully."
    ]
  },
  "Halima": {
    "name": "Halima",
    "home": "Sandspire",
    "role": "Spice trader",
    "source": "09-sandspire.txt:6",
    "topics": [
      {
        "title": "A bargain in another language",
        "opening": "Have you misunderstood a bargain while travelling?",
        "first": "Bought what I thought was a small quantity. It was the price for the whole sack.",
        "replies": [
          [
            "A lucky mistake?",
            "Until I had to carry it."
          ],
          [
            "What did you do?",
            "Shared some with fellow travellers. Acquired friends and a manageable load."
          ],
          [
            "Would you call that good business?",
            "Poor accounts, excellent journey."
          ]
        ]
      },
      {
        "title": "The scent you avoid",
        "opening": "Is there a smell you can't bear?",
        "first": "A spice my father used when he was trying too hard to impress guests. It smells of being told to sit still.",
        "replies": [
          [
            "Even now?",
            "I like the spice. I dislike suddenly being seven."
          ],
          [
            "Did you tell him?",
            "Years later. He said he'd been nervous too."
          ],
          [
            "Did that change it?",
            "A little. Now the memory has two frightened people in it."
          ]
        ]
      },
      {
        "title": "Halima's trusted customer",
        "opening": "What makes you trust a customer?",
        "first": "They admit what they don't know. I can work with a question more easily than a performance.",
        "replies": [
          [
            "Do people pretend often?",
            "Especially when someone is watching."
          ],
          [
            "Have you done it?",
            "Naturally. I once praised a spice while holding the wrong jar."
          ],
          [
            "What happened?",
            "The seller corrected me kindly. I've tried to return the favour ever since."
          ]
        ]
      }
    ],
    "greetings": [
      "Halima. If you sneeze, I promise not to take it personally.",
      "Corin. That's generous in advance.",
      "Corin! Still collecting questions?",
      "They're lighter than most souvenirs.",
      "A dragon. My strongest spices suddenly have competition.",
      "I'm Corin. We'll avoid any contest."
    ]
  },
  "Tarek": {
    "name": "Tarek",
    "home": "Sandspire",
    "role": "Caravan animal handler",
    "source": "09-sandspire.txt:11",
    "topics": [
      {
        "title": "A camel's insult",
        "opening": "Can a camel look offended?",
        "first": "With extraordinary precision. One looked at me as though I'd ruined its entire ancestry by offering the wrong feed.",
        "replies": [
          [
            "Had you?",
            "I'd offered the ordinary feed. It had tasted something nicer the day before."
          ],
          [
            "Did you give in?",
            "No. We disliked each other briefly and survived."
          ],
          [
            "Do you get attached?",
            "Of course. Annoyance is often a sign you've begun caring."
          ]
        ]
      },
      {
        "title": "The caravan child",
        "opening": "Did you grow up around caravans?",
        "first": "I thought everybody's family could pack a home in an hour. Fixed houses seemed impossibly trusting.",
        "replies": [
          [
            "Trusting how?",
            "They couldn't leave when things went wrong."
          ],
          [
            "Do you still feel that?",
            "Sometimes. I also envy knowing where a thing will be tomorrow."
          ],
          [
            "Would you settle permanently?",
            "I might. I'd keep my bags somewhere I could see them."
          ]
        ]
      },
      {
        "title": "The animal you couldn't help",
        "opening": "Have you ever failed an animal you cared for?",
        "first": "Yes. I knew too late that something was wrong. I still remember every moment I dismissed before it.",
        "replies": [
          [
            "I'm sorry.",
            "Thank you. I don't tell that one often."
          ],
          [
            "Did it change your work?",
            "I ask sooner. Pride is a poor reason to wait."
          ],
          [
            "Do you blame yourself still?",
            "Some days. On better days, I use what I learned."
          ]
        ]
      }
    ],
    "greetings": [
      "Tarek. Keep your movements easy until the animals know what you're doing.",
      "Corin. I'll follow your lead.",
      "Corin! Nothing bitten you since last time?",
      "I'd like to preserve that record.",
      "A dragon. We should introduce him slowly, to everyone concerned.",
      "I'm Corin. Slowly suits us."
    ]
  },
  "Suhaila": {
    "name": "Suhaila",
    "home": "Sandspire",
    "role": "Retired weaver",
    "source": "09-sandspire.txt:16",
    "topics": [
      {
        "title": "The wedding cloth returned",
        "opening": "Has anyone returned something you made years ago?",
        "first": "A woman brought back a cloth I'd woven for her marriage. She wanted it cut into gifts for her children.",
        "replies": [
          [
            "Did you agree?",
            "After she told me why. Her husband had died; she wanted it used, not guarded."
          ],
          [
            "Was cutting it difficult?",
            "Yes. My hands remembered making it."
          ],
          [
            "Were the gifts good?",
            "Beautiful. She chose what each child would receive."
          ]
        ]
      },
      {
        "title": "A woman without a title",
        "opening": "Do you mind people calling you retired?",
        "first": "Only when they say it as though I've become a blank page.",
        "replies": [
          [
            "What would you prefer?",
            "My name. It has served me longer than my occupation."
          ],
          [
            "Are you enjoying the time?",
            "More now I've stopped trying to justify every hour."
          ],
          [
            "What do you do?",
            "Things slowly. Sometimes simply because I like them."
          ]
        ]
      },
      {
        "title": "Suhaila's first refusal",
        "opening": "When did you learn to say no?",
        "first": "Far too late. I said it once and discovered the world could survive my unhelpfulness.",
        "replies": [
          [
            "What were you refusing?",
            "A job that required me to miss something important to my family."
          ],
          [
            "Was the customer angry?",
            "Briefly. My daughter remembered I came for years."
          ],
          [
            "Was it easier afterward?",
            "Not easy. Easier. There's a difference worth keeping."
          ]
        ]
      }
    ],
    "greetings": [
      "Suhaila. You may sit in silence if you like; visitors needn't perform.",
      "I'm Corin. I'd like a little conversation.",
      "Corin. There you are. I've had time to think since we spoke.",
      "Should I be concerned?",
      "A dragon. At my age I enjoy being wrong about having seen everything.",
      "I'm Corin. He's been correcting that idea elsewhere too."
    ]
  },
  "Idris": {
    "name": "Idris",
    "home": "Sandspire",
    "role": "Travelling-supplies merchant",
    "source": "09-sandspire.txt:21",
    "topics": [
      {
        "title": "The merchant's son",
        "opening": "Did your sons want to follow your trade?",
        "first": "One did. One didn't. One wanted to follow it only on profitable afternoons.",
        "replies": [
          [
            "Which worried you most?",
            "The one who agreed with everything I said. I needed to know what he wanted."
          ],
          [
            "Did you ask?",
            "Eventually. Parents can mistake obedience for contentment."
          ],
          [
            "What did he say?",
            "That he'd like to decide slowly. I had to learn to let him."
          ]
        ]
      },
      {
        "title": "A customer you refused",
        "opening": "Have you ever refused a sale?",
        "first": "A traveller wanted to carry far more than he could manage. I told him to put half back.",
        "replies": [
          [
            "Did he listen?",
            "After I asked him to lift it all."
          ],
          [
            "You lost money.",
            "I gained a customer who returned alive and trusted me."
          ],
          [
            "Do you always know what's best?",
            "No. I know when I ought to ask another question."
          ]
        ]
      },
      {
        "title": "The journey in your window",
        "opening": "Do you wish you travelled as much as your customers?",
        "first": "Some days. I hear their plans and imagine myself halfway there.",
        "replies": [
          [
            "What stops you?",
            "People here. That's an answer, not always an excuse."
          ],
          [
            "Where would you go first?",
            "Somewhere cold enough that I'd complain in an entirely new way."
          ],
          [
            "Would you enjoy it?",
            "I'd enjoy finding out how long before I missed Sandspire."
          ]
        ]
      }
    ],
    "greetings": [
      "Idris. Tell me where you're going before I recommend what to carry.",
      "Corin. Still learning the route.",
      "Corin! How did the road treat you?",
      "It had several opinions.",
      "A dragon. I have no strap guaranteed for that circumstance.",
      "I'm Corin. We'll begin with ordinary supplies."
    ]
  },
  "Rashida": {
    "name": "Rashida",
    "home": "Sandspire",
    "role": "Glass enthusiast",
    "source": "09-sandspire.txt:26",
    "topics": [
      {
        "title": "The colour at sunset",
        "opening": "Why do you like looking at glass late in the day?",
        "first": "Something familiar changes without being replaced. I find that comforting.",
        "replies": [
          [
            "Does it always look better?",
            "Not better. Different. That's rather the point."
          ],
          [
            "What do you notice first?",
            "Where the light stops. The dark parts make the bright ones believable."
          ],
          [
            "I'd probably miss that.",
            "You might notice something I'd miss. Looking isn't an examination."
          ]
        ]
      },
      {
        "title": "A keepsake you broke",
        "opening": "Have you ever broken something precious?",
        "first": "A cup from someone I loved. I was furious at myself, then ashamed of being so upset about a cup.",
        "replies": [
          [
            "It wasn't only a cup.",
            "No. I needed somebody to say that."
          ],
          [
            "Did you repair it?",
            "Not well enough to use. Well enough to keep."
          ],
          [
            "Would you rather have a new one?",
            "No. I wanted the afternoon it came from. No maker could replace that."
          ]
        ]
      },
      {
        "title": "Rashida's museum",
        "opening": "Would you collect glass if you had endless money?",
        "first": "I'd collect fewer pieces than you'd think. I want to know each one, not own a room I hurry through.",
        "replies": [
          [
            "Would you let others see them?",
            "Gladly. But no one would have to call them impressive."
          ],
          [
            "What would you ask instead?",
            "Which one they'd live with."
          ],
          [
            "Is that different from the finest one?",
            "Often. We don't always love what we're told to admire."
          ]
        ]
      }
    ],
    "greetings": [
      "Rashida. If you're looking at glass, I may accidentally begin talking about it.",
      "Corin. I'll risk it.",
      "Corin! I've found another reason to be fascinated.",
      "Only one?",
      "A dragon. Those scales catch light in a way I'd never have believed.",
      "I'm Corin. He'll enjoy being admired."
    ]
  },
  "Bilal": {
    "name": "Bilal",
    "home": "Sandspire",
    "role": "Goatherd",
    "source": "09-sandspire.txt:31",
    "topics": [
      {
        "title": "The goat at the wedding",
        "opening": "Has a goat ever interrupted a ceremony?",
        "first": "One ate part of a flower arrangement. The bride laughed; her mother declared it an omen.",
        "replies": [
          [
            "Of what?",
            "An inadequate fence, in my opinion."
          ],
          [
            "Did you catch it?",
            "Eventually. It had discovered the audience and wanted to stay."
          ],
          [
            "Was the wedding ruined?",
            "No. People remembered it fondly. Except the florist."
          ]
        ]
      },
      {
        "title": "A shepherd's voice",
        "opening": "Why do you talk so softly to them?",
        "first": "Because shouting only tells them something frightening is happening. Usually I'm asking them to walk ten steps.",
        "replies": [
          [
            "Does it work on people?",
            "Not consistently. People prefer reasons."
          ],
          [
            "Do you ever shout?",
            "When I'm frightened. Then I have to calm both of us."
          ],
          [
            "Can they recognise your mood?",
            "Faster than my brother can. I mention this frequently."
          ]
        ]
      },
      {
        "title": "Bilal's one complaint",
        "opening": "What bothers you most about your work?",
        "first": "People assuming it's peaceful because the trouble has hooves.",
        "replies": [
          [
            "It does look peaceful.",
            "From a distance. So does an argument you can't hear."
          ],
          [
            "What do you enjoy?",
            "Knowing each animal well enough to notice a change."
          ],
          [
            "Would you choose another job?",
            "On bad mornings. By evening I've usually chosen this one again."
          ]
        ]
      }
    ],
    "greetings": [
      "Bilal. If a goat has offended you, describe it. That won't narrow things down much.",
      "Corin. No complaints yet.",
      "Corin! You're becoming familiar enough for the goats to develop opinions.",
      "Should I be flattered?",
      "A dragon. My goats may finally meet someone less impressed by them than I am.",
      "I'm Corin. Let's keep that meeting cautious."
    ]
  },
  "Jamila": {
    "name": "Jamila",
    "home": "Sandspire",
    "role": "Former road trader",
    "source": "09-sandspire.txt:36",
    "topics": [
      {
        "title": "The farewell you prolonged",
        "opening": "Have you ever delayed leaving because saying goodbye hurt?",
        "first": "Packed and unpacked the same bag for three mornings. Finally my sister carried it to the door herself.",
        "replies": [
          [
            "Was she tired of you?",
            "She was tired of watching me suffer twice."
          ],
          [
            "Did leaving help?",
            "It made the sadness honest. Before that I kept calling it a packing problem."
          ],
          [
            "Were you glad you went?",
            "Yes. I can miss her and mean that."
          ]
        ]
      },
      {
        "title": "A trader's disguise",
        "opening": "Did you ever pretend to be wealthier than you were?",
        "first": "At my first big market. Wore borrowed finery and couldn't afford lunch.",
        "replies": [
          [
            "Did anyone believe you?",
            "Someone offered a costly purchase. I spent ten minutes escaping my own costume."
          ],
          [
            "What did you wear afterward?",
            "Clothes I could breathe in."
          ],
          [
            "Was it easier?",
            "Much. Confidence is cheaper when you aren't renting it."
          ]
        ]
      },
      {
        "title": "Jamila's newest lesson",
        "opening": "What are you learning now that you stay in one place?",
        "first": "How to have a disagreement without solving it by leaving for the next town.",
        "replies": [
          [
            "Is that difficult?",
            "Terribly. Neighbours remain inconveniently present."
          ],
          [
            "What helps?",
            "Returning the next day with less performance and more truth."
          ],
          [
            "Do you like staying?",
            "Yes. I'm becoming known in ways a quick visit never allowed."
          ]
        ]
      }
    ],
    "greetings": [
      "Jamila. Come and tell me something the road hasn't told everybody yet.",
      "I'm Corin. I'll try to find a small story.",
      "Corin! You've come back before I forgot your voice.",
      "I'm glad of that.",
      "A dragon. I used to think my luggage attracted attention.",
      "I'm Corin. Attention has become difficult to avoid."
    ]
  },
  "Farid": {
    "name": "Farid",
    "home": "Sandspire",
    "role": "Spice trader",
    "source": "09-sandspire.txt:41",
    "topics": [
      {
        "title": "The spice you hated",
        "opening": "Did you always like the flavours you sell?",
        "first": "No. My father insisted I'd acquire taste. I acquired a talent for hiding food.",
        "replies": [
          [
            "Where did you hide it?",
            "Nowhere I'd recommend. He found enough to end the experiment."
          ],
          [
            "What changed?",
            "Someone let me dislike something without treating it as a defect."
          ],
          [
            "Did you grow to like it?",
            "Some of it. Being allowed to refuse made trying easier."
          ]
        ]
      },
      {
        "title": "A merchant's memory",
        "opening": "What do you remember about customers?",
        "first": "What they cook for someone else. People soften when they describe another person's favourite food.",
        "replies": [
          [
            "Do you ask deliberately?",
            "If they seem inclined to talk."
          ],
          [
            "What would you cook for someone?",
            "Something simple enough that I could stay with them instead of fussing."
          ],
          [
            "Who cooks for you?",
            "My sister, when she decides I'm neglecting the privilege of supper."
          ]
        ]
      },
      {
        "title": "The disputed smell",
        "opening": "Can two people smell the same thing differently?",
        "first": "My brother says one spice smells like celebration. I say it smells like a crowded room I couldn't escape.",
        "replies": [
          [
            "Same memory?",
            "Same wedding. He was dancing. I was helping serve."
          ],
          [
            "Did you tell him?",
            "Yes. He brought me supper the next time."
          ],
          [
            "Did that change the smell?",
            "A little. Memories can acquire better neighbours."
          ]
        ]
      }
    ],
    "greetings": [
      "Farid. If you ask whether something's spicy, I'll ask compared with what.",
      "Corin. Fair enough.",
      "Corin! Your nose found us again.",
      "It deserves some credit.",
      "A dragon. I shall avoid making jokes about hot food until I know him better.",
      "I'm Corin. Wise of you."
    ]
  },
  "Samira": {
    "name": "Samira",
    "home": "Sandspire",
    "role": "Cloth weaver",
    "source": "09-sandspire.txt:46",
    "topics": [
      {
        "title": "The cloth nobody touched",
        "opening": "Why do people save beautiful things instead of using them?",
        "first": "Fear, sometimes. They think wearing something out means they haven't valued it enough.",
        "replies": [
          [
            "Do you agree?",
            "No. I like a cloth with a life in it."
          ],
          [
            "Even if it gets stained?",
            "Especially if the stain has a good story."
          ],
          [
            "What do you save?",
            "A piece my mother made. I'm better at giving this advice than taking it."
          ]
        ]
      },
      {
        "title": "Samira's wedding bargain",
        "opening": "Did you ever bargain with your own family?",
        "first": "My cousin wanted wedding cloth cheaply. I wanted him to stop calling my work a pleasant pastime.",
        "replies": [
          [
            "What did you agree?",
            "He helped prepare materials for a day. Then asked my usual price."
          ],
          [
            "Was he resentful?",
            "Tired. Respect arrived around the same time."
          ],
          [
            "Did you forgive him?",
            "Yes. Ignorance can be corrected if it's willing to stay for the work."
          ]
        ]
      },
      {
        "title": "The unfinished colour",
        "opening": "Can you imagine a colour you can't make?",
        "first": "Often. Usually just before sleep. By morning I remember wanting it more clearly than the colour.",
        "replies": [
          [
            "Do you write it down?",
            "Words like 'warm but lonely'. Not enormously helpful at the loom."
          ],
          [
            "Would anyone else understand?",
            "Perhaps. I'd like to meet them."
          ],
          [
            "Does it frustrate you?",
            "Pleasantly. It gives tomorrow something to attempt."
          ]
        ]
      }
    ],
    "greetings": [
      "Samira. If you've come for advice about cloth, I'll need to know what you actually do in it.",
      "Corin. Mostly travel lately.",
      "Corin! Still on your feet?",
      "With some complaints from them.",
      "A dragon. I hope his claws understand the value of finished cloth.",
      "I'm Corin. We'll keep a respectful distance."
    ]
  },
  "Leila": {
    "name": "Leila",
    "home": "Sandspire",
    "role": "Caravan provisioner",
    "source": "09-sandspire.txt:51",
    "topics": [
      {
        "title": "The forgotten luxury",
        "opening": "What luxury do travellers miss most?",
        "first": "Privacy. People plan for hunger and weather, then discover they're tired of being observed.",
        "replies": [
          [
            "Can you provide that?",
            "Not in a sack. I tell them to allow one another a quiet walk."
          ],
          [
            "Do they listen?",
            "After the first quarrel, usually."
          ],
          [
            "What do you miss on a journey?",
            "Being able to be cross without it becoming everyone else's evening."
          ]
        ]
      },
      {
        "title": "A list with one extra line",
        "opening": "Do you ever put something unnecessary on a supply list?",
        "first": "A small treat for the person organising everything. They invariably forget themselves.",
        "replies": [
          [
            "What sort of treat?",
            "Whatever they'd be embarrassed to call important."
          ],
          [
            "Do you include yourself?",
            "I'm learning. Other people's needs make a very convenient hiding place."
          ],
          [
            "Who taught you that?",
            "Someone who noticed I'd packed everybody's supper except mine."
          ]
        ]
      },
      {
        "title": "Leila's retirement plan",
        "opening": "Would you like to travel without organising it?",
        "first": "Yes. I'd be unbearable. I'd notice every omission and try to take charge by breakfast.",
        "replies": [
          [
            "Could you stop yourself?",
            "For perhaps an hour. A promising beginning."
          ],
          [
            "Where would you go?",
            "Somewhere I couldn't pretend to know the route."
          ],
          [
            "Would that frighten you?",
            "A little. I think that's part of wanting it."
          ]
        ]
      }
    ],
    "greetings": [
      "Leila. Are you setting out or recovering from arriving?",
      "Corin. Perhaps both.",
      "Corin! You look as though you've learned something inconvenient.",
      "Several things.",
      "A dragon. We should discuss appetite before quantities.",
      "I'm Corin. That's sensible planning."
    ]
  },
  "Zaid": {
    "name": "Zaid",
    "home": "Sandspire",
    "role": "Desert guide",
    "source": "09-sandspire.txt:56",
    "topics": [
      {
        "title": "The mirage you believed",
        "opening": "Have you ever trusted something you knew might be a mirage?",
        "first": "When I was young and thirsty. Knowing a trick exists doesn't mean longing stops showing it to you.",
        "replies": [
          [
            "What brought you back?",
            "My companion caught my sleeve. Didn't mock me afterward."
          ],
          [
            "Were you ashamed?",
            "Yes. He said thirst had made fools of better guides."
          ],
          [
            "Do you tell others?",
            "Often. I'd rather they borrow my embarrassment than repeat it."
          ]
        ]
      },
      {
        "title": "A guide's refusal",
        "opening": "Have you ever refused to lead someone?",
        "first": "A man wanted to prove he needed less water than other people. I declined to participate in the proof.",
        "replies": [
          [
            "Did he listen?",
            "He was angry enough to stay in town arguing. I considered that a success."
          ],
          [
            "Would you take him later?",
            "If he'd changed his plan."
          ],
          [
            "What if he offered more money?",
            "Money makes poor shade and worse drinking water."
          ]
        ]
      },
      {
        "title": "The desert at night",
        "opening": "What do you love about the desert?",
        "first": "The first cool air after a hard day. You feel your whole body forgive the world.",
        "replies": [
          [
            "Does everyone feel that?",
            "Many do. They stop talking for a little while."
          ],
          [
            "Is it beautiful?",
            "Yes. And still a place where you must pay attention."
          ],
          [
            "Can both be true?",
            "Most beautiful places I've known haven't promised to keep me safe."
          ]
        ]
      }
    ],
    "greetings": [
      "Zaid. If you're asking about the desert, tell me what you've already been told.",
      "Corin. Probably less than I need.",
      "Corin! Back with both boots. A respectable result.",
      "I'd like to keep improving it.",
      "A dragon. Even wings need somewhere sensible to land.",
      "I'm Corin. We'll take that seriously."
    ]
  },
  "Petra": {
    "name": "Petra",
    "home": "Sandspire",
    "role": "Caravan accountant",
    "source": "10-desert-homes.txt:1",
    "topics": [
      {
        "title": "A number you remember",
        "opening": "Is there a number you'll never forget?",
        "first": "The price of my first journey alone. Saved for months. I can still feel the coins disappearing from my hand.",
        "replies": [
          [
            "Was it worth it?",
            "Yes. I was terrified until the road began."
          ],
          [
            "Where did you go?",
            "Not far. Far enough that nobody could answer for me."
          ],
          [
            "Would you spend it again?",
            "Without that same fear, perhaps. I miss the bravery of the first time."
          ]
        ]
      },
      {
        "title": "The accountant's dream",
        "opening": "Do you dream about figures?",
        "first": "Occasionally. They refuse to add up while everyone watches. My mind is a cruel employer.",
        "replies": [
          [
            "Do you ever dream something nice?",
            "Flying once. No luggage, no accounts."
          ],
          [
            "Would you want to fly?",
            "Yes. Though I'd probably wonder about the expense halfway up."
          ],
          [
            "Could you forget work for an hour?",
            "I intend to. Eventually. Please note the weakness of that answer."
          ]
        ]
      },
      {
        "title": "A generous mistake",
        "opening": "Have you ever quietly forgiven a small debt?",
        "first": "Yes. A woman had forgotten it entirely. Reminding her would have made her last kindness to me feel purchased.",
        "replies": [
          [
            "Was it a large kindness?",
            "At the time. She probably doesn't remember that either."
          ],
          [
            "Did you tell her?",
            "No. This one was mine to settle."
          ],
          [
            "Is that good accounting?",
            "Not everything belongs in a ledger."
          ]
        ]
      }
    ],
    "greetings": [
      "Petra. If you owe someone money, I'm not automatically on their side.",
      "Corin. A reassuring introduction.",
      "Corin! A visitor without a disputed total.",
      "For now.",
      "A dragon. I'd hate to calculate his board and lodging.",
      "I'm Corin. So would I."
    ]
  },
  "Raff": {
    "name": "Raff",
    "home": "Sandspire",
    "role": "Town resident",
    "source": "10-desert-homes.txt:6",
    "topics": [
      {
        "title": "The neighbour's rooster",
        "opening": "What noise would you remove from the world?",
        "first": "My neighbour's rooster at the hour it considers dawn. It has ambitious ideas about sunrise.",
        "replies": [
          [
            "Have you complained?",
            "The neighbour says the bird is enthusiastic."
          ],
          [
            "What would you suggest?",
            "Enthusiasm after breakfast."
          ],
          [
            "Do you actually dislike it?",
            "Less when I'm awake. It's easy to be charitable then."
          ]
        ]
      },
      {
        "title": "A story you tell badly",
        "opening": "Is there a story you can never tell properly?",
        "first": "How I met my oldest friend. He fell over. I laughed. He laughed. Written down, it sounds unkind.",
        "replies": [
          [
            "Was he hurt?",
            "Only his pride, which recovered when mine suffered the following week."
          ],
          [
            "Are you still friends?",
            "Yes. He tells the story worse."
          ],
          [
            "Why does it matter?",
            "Because the important bit was his laugh. I can't lend you that sound."
          ]
        ]
      },
      {
        "title": "The unfinished visit",
        "opening": "Have you ever wished a visitor would stay longer?",
        "first": "My sister always says she must go just when the conversation becomes easy.",
        "replies": [
          [
            "Do you ask her to stay?",
            "I used to hint. Now I ask."
          ],
          [
            "Does she?",
            "Sometimes. Other times she really has to go, which is easier to accept when I know."
          ],
          [
            "What do you talk about?",
            "Nothing impressive. That's why I want more of it."
          ]
        ]
      }
    ],
    "greetings": [
      "Raff. Looking for someone? I might know them, which is different from knowing where they are.",
      "Corin. I'll accept the distinction.",
      "Corin! You found me again.",
      "You're easier than some destinations.",
      "A dragon. I shall have to sit down mentally before responding.",
      "I'm Corin. Take your time."
    ]
  },
  "Suri": {
    "name": "Suri",
    "home": "Sandspire",
    "role": "Clothes mender",
    "source": "10-desert-homes.txt:11",
    "topics": [
      {
        "title": "The invisible work",
        "opening": "Does it bother you when people can't see your repair?",
        "first": "Sometimes. Success makes me disappear. Then I remember they wanted their coat back, not a monument to me.",
        "replies": [
          [
            "How do you know you've done well?",
            "They forget to be careful with it."
          ],
          [
            "Do they thank you?",
            "Most. Some return with another thing, which says enough."
          ],
          [
            "Would you rather make new clothes?",
            "Occasionally. I like beginning without somebody else's damage."
          ]
        ]
      },
      {
        "title": "A wedding sleeve",
        "opening": "Have you had to mend something during a wedding?",
        "first": "A groom's sleeve five minutes before the ceremony. He kept asking whether his bride would mind.",
        "replies": [
          [
            "Did she?",
            "She was worried he'd changed his mind. A torn sleeve was excellent news."
          ],
          [
            "Was he nervous?",
            "So much that I had to ask him to stop apologising long enough to breathe."
          ],
          [
            "Did the repair hold?",
            "Through the dancing. I considered my obligation fulfilled."
          ]
        ]
      },
      {
        "title": "Suri's childhood bargain",
        "opening": "What did you want to be when you were small?",
        "first": "A queen. Mostly because I thought queens never had to untangle thread.",
        "replies": [
          [
            "Would you still want that?",
            "No. I prefer people able to tell me I'm being ridiculous."
          ],
          [
            "Could queens learn to mend?",
            "They could. Whether anybody lets them be bad at it is another question."
          ],
          [
            "Were you good at first?",
            "Terrible. A useful childhood for an ordinary person."
          ]
        ]
      }
    ],
    "greetings": [
      "Suri. If your sleeve's torn, I can look without hearing a confession.",
      "Corin. Nothing torn at the moment.",
      "Corin! Still recognisable beneath the road dust.",
      "That's encouraging.",
      "A dragon. I hope repairing his rider isn't a regular appointment.",
      "I'm Corin. I'm hoping the same."
    ]
  },
  "Tavin": {
    "name": "Tavin",
    "home": "Sandspire",
    "role": "Host to visiting traders",
    "source": "10-desert-homes.txt:16",
    "topics": [
      {
        "title": "The guest who stayed silent",
        "opening": "Have you hosted someone who hardly spoke?",
        "first": "A man who answered everything politely and briefly. I thought he disliked us. He wrote later to thank us for leaving him in peace.",
        "replies": [
          [
            "Had you left him in peace?",
            "Eventually. Took me too long to stop entertaining him."
          ],
          [
            "Why had he come?",
            "He didn't say. I decided gratitude wasn't an invitation to investigate."
          ],
          [
            "Would you host him again?",
            "Gladly, and more quietly."
          ]
        ]
      },
      {
        "title": "A host away from home",
        "opening": "Are you a good guest yourself?",
        "first": "I try. I keep offering to help until people wish I'd simply sit down.",
        "replies": [
          [
            "Why do that?",
            "Being looked after makes me feel I ought to earn it."
          ],
          [
            "Do your guests have to earn it?",
            "No. I'm aware of the inconsistency."
          ],
          [
            "What would help?",
            "Someone patient enough to hand me a cup and ignore my protests."
          ]
        ]
      },
      {
        "title": "The story over breakfast",
        "opening": "Why do people confess things over breakfast?",
        "first": "They're tired enough to forget their prepared version and about to leave, which makes honesty feel safer.",
        "replies": [
          [
            "Do you give advice?",
            "Only if asked. Toast isn't a licence to rearrange a stranger's life."
          ],
          [
            "Do you remember the confessions?",
            "Some. I remember the relief more often than the details."
          ],
          [
            "Have you confessed anything?",
            "Once. It made my own breakfast go cold."
          ]
        ]
      }
    ],
    "greetings": [
      "Tavin. New to Sandspire? Start with a little shade and your name.",
      "Corin. Gladly.",
      "Corin! You look as though you've found your bearings.",
      "Some of them.",
      "A dragon. I'll need to rethink my idea of a large travelling party.",
      "I'm Corin. There's only the two of us, thankfully."
    ]
  },
  "Una": {
    "name": "Una",
    "home": "Sandspire",
    "role": "Sister and enthusiastic correspondent",
    "source": "10-desert-homes.txt:21",
    "topics": [
      {
        "title": "The letter written angry",
        "opening": "Have you ever sent a letter while you were furious?",
        "first": "Once. Spent the next two days composing apologies faster than a courier could carry them.",
        "replies": [
          [
            "What had happened?",
            "A misunderstanding that became much clearer after I'd made it permanent in ink."
          ],
          [
            "Were you forgiven?",
            "Yes. I was asked to sleep before sending the next one."
          ],
          [
            "Do you now?",
            "Usually. My drawer is full of arguments the world has been spared."
          ]
        ]
      },
      {
        "title": "A sister's old name",
        "opening": "Does your family still use a childhood nickname?",
        "first": "My sister does. Nobody else dares. She's earned certain privileges by remembering me before I was dignified.",
        "replies": [
          [
            "Were you ever dignified?",
            "I'm attempting it currently."
          ],
          [
            "What's the nickname?",
            "That privilege hasn't transferred to you yet."
          ],
          [
            "Do you mind it?",
            "Not from her. It tells me I'm still somebody she knew first."
          ]
        ]
      },
      {
        "title": "The news you don't send",
        "opening": "What do you leave out of letters?",
        "first": "The things I'm afraid will worry people. Then I complain they don't understand how I'm doing.",
        "replies": [
          [
            "Have you changed that?",
            "I'm trying to include one honest sentence before the cheerful ones take over."
          ],
          [
            "Is it difficult?",
            "Very. I'd rather be missed than worried about."
          ],
          [
            "Can they do both?",
            "Apparently. My sister has explained this firmly."
          ]
        ]
      }
    ],
    "greetings": [
      "Una. You look like someone with news from somewhere else.",
      "Corin, from Millwood. A little news.",
      "Corin! Tell me something ordinary. Those are my favourite details.",
      "I'll choose something suitably unheroic.",
      "A dragon! My next letter will require a very patient reader.",
      "I'm Corin. Please explain that we're real."
    ]
  },
  "Vela": {
    "name": "Vela",
    "home": "Sandspire",
    "role": "Rug weaver",
    "source": "10-desert-homes.txt:26",
    "topics": [
      {
        "title": "The unfinished border",
        "opening": "Why do you sometimes leave a pattern open at the edge?",
        "first": "Because a room continues beyond a rug. I like the eye to keep going.",
        "replies": [
          [
            "Is that a tradition?",
            "In my work. I don't claim generations merely because I like an idea."
          ],
          [
            "Do customers object?",
            "Some prefer everything neatly enclosed. I can understand that."
          ],
          [
            "What do you prefer at home?",
            "Space. My thoughts make enough borders without help."
          ]
        ]
      },
      {
        "title": "Vela's earliest customer",
        "opening": "Who first believed your work was worth buying?",
        "first": "A neighbour who refused my attempt to call it a gift. She made me name a price.",
        "replies": [
          [
            "Was that difficult?",
            "Excruciating. I wanted her to decide what my hours were worth."
          ],
          [
            "Did you charge enough?",
            "No. She paid more and told me why."
          ],
          [
            "Did it change you?",
            "It made the next price come out with less apology."
          ]
        ]
      },
      {
        "title": "A pattern from a dream",
        "opening": "Have you ever tried to weave a dream?",
        "first": "Yes. In the dream it was magnificent. Awake, it was mostly triangles behaving badly.",
        "replies": [
          [
            "Did you finish it?",
            "I made something else from the attempt."
          ],
          [
            "Were you disappointed?",
            "Briefly. The new thing didn't owe me the dream."
          ],
          [
            "Would you try again?",
            "Of course. Sleep supplies ideas without charging for them."
          ]
        ]
      }
    ],
    "greetings": [
      "Vela. If you're looking for a pattern, tell me what you want to live with.",
      "Corin. I'm here to talk, if you've time.",
      "Corin! You've remembered the person behind the weaving.",
      "I'd hoped to.",
      "A dragon. No rug I make could compete with that entrance.",
      "I'm Corin. Competition wasn't our intention."
    ]
  },
  "Wystan": {
    "name": "Wystan",
    "home": "Sandspire",
    "role": "Retired trader",
    "source": "10-desert-homes.txt:31",
    "topics": [
      {
        "title": "The bargain you lost happily",
        "opening": "Have you ever been glad to lose money?",
        "first": "Paid too much for a meal when I was stranded. Years later I learned the family had shared their last supplies.",
        "replies": [
          [
            "Did you repay them?",
            "I returned what I could. They'd never called it a debt."
          ],
          [
            "Why call it losing money?",
            "I did then. I was measuring the wrong thing."
          ],
          [
            "Would you recognise that now?",
            "I hope sooner."
          ]
        ]
      },
      {
        "title": "An old trader's pockets",
        "opening": "Why do you still check your pockets so often?",
        "first": "Habit. For years, forgetting one small thing could spoil a whole day's journey.",
        "replies": [
          [
            "What do you carry now?",
            "Less than my hands expect."
          ],
          [
            "Does that feel good?",
            "Mostly. Sometimes lightness feels like having forgotten a purpose."
          ],
          [
            "What helps?",
            "Finding a new reason to go out that isn't a sale."
          ]
        ]
      },
      {
        "title": "Wystan's greatest exaggeration",
        "opening": "What's the biggest boast you ever made?",
        "first": "That I could judge a person at a glance. Took me years to realise how often a glance had lied.",
        "replies": [
          [
            "What changed your mind?",
            "Someone I dismissed helped me when people I'd admired vanished."
          ],
          [
            "Did you tell them?",
            "Yes. They were kinder about it than I deserved."
          ],
          [
            "Do you still judge quickly?",
            "Yes. I try to let the second thought speak louder."
          ]
        ]
      }
    ],
    "greetings": [
      "Wystan. No, I'm not selling anything. I enjoy watching people adjust to that.",
      "Corin. Conversation, then.",
      "Corin! You've come without an offer to consider.",
      "Only company.",
      "A dragon. I once boasted I'd traded everything worth meeting.",
      "I'm Corin. He's not available for trade."
    ]
  },
  "Rania": {
    "name": "Rania",
    "home": "Sandspire",
    "role": "Neighbour and household organiser",
    "source": "10-desert-homes.txt:36",
    "topics": [
      {
        "title": "The household election",
        "opening": "How do you decide who's right at home?",
        "first": "We used to argue until one of us got tired. Now we try asking what each of us is worried about.",
        "replies": [
          [
            "Does that work?",
            "More often than proving one another foolish."
          ],
          [
            "What worries Latif?",
            "That something important will be forgotten."
          ],
          [
            "And you?",
            "That we'll spend our whole lives preparing to enjoy them."
          ]
        ]
      },
      {
        "title": "Rania's empty afternoon",
        "opening": "What would you do if nobody needed you today?",
        "first": "At first, worry. Then remember a book I wanted to finish.",
        "replies": [
          [
            "Would you finish it?",
            "Possibly. I might sleep instead and pretend that was the plan."
          ],
          [
            "Why feel guilty?",
            "People have praised me for being useful so long that rest feels like disappointing them."
          ],
          [
            "Would you praise someone else for resting?",
            "Yes. I'm working on applying the rule fairly."
          ]
        ]
      },
      {
        "title": "A quarrel you treasure",
        "opening": "Can you remember an argument fondly?",
        "first": "Latif and I once argued about which of us loved the other more. Terrible logic, excellent evening.",
        "replies": [
          [
            "Who won?",
            "We settled out of court."
          ],
          [
            "Do you still argue like that?",
            "Less often. I sometimes miss having so much energy for nonsense."
          ],
          [
            "Could you begin again?",
            "Perhaps tonight. I'll let him think he's thought of it."
          ]
        ]
      }
    ],
    "greetings": [
      "Rania. If Latif sent you, tell me whether he's remembered the actual question.",
      "Corin. I came on my own.",
      "Corin! Good. Someone who isn't asking where they left a thing.",
      "I'll try not to disappoint you.",
      "A dragon. Latif will want to know what feeding him costs.",
      "I'm Corin. I'd rather not calculate it too closely."
    ]
  },
  "Latif": {
    "name": "Latif",
    "home": "Sandspire",
    "role": "Account keeper",
    "source": "10-desert-homes.txt:41",
    "topics": [
      {
        "title": "The account you don't keep",
        "opening": "Is there anything you refuse to count?",
        "first": "Favours between Rania and me. We'd both feel underpaid.",
        "replies": [
          [
            "Do you count everything else?",
            "Less than she claims. More than is restful."
          ],
          [
            "Why do it?",
            "Numbers feel manageable when other things aren't."
          ],
          [
            "Does that help?",
            "Until I try counting something that needs a conversation instead."
          ]
        ]
      },
      {
        "title": "Latif's secret purchase",
        "opening": "Have you ever bought something without checking the price?",
        "first": "Flowers, once. The seller looked astonished. I nearly asked whether I'd done it wrong.",
        "replies": [
          [
            "Were they for Rania?",
            "Yes. She laughed before she cried. I was briefly alarmed."
          ],
          [
            "Was it worth it?",
            "Very. An irritatingly unquantifiable success."
          ],
          [
            "Would you do it again?",
            "Yes. Though she says surprise loses something when scheduled."
          ]
        ]
      },
      {
        "title": "A future you can't total",
        "opening": "Does uncertainty bother you?",
        "first": "Immensely. I like a plan with a number at the end.",
        "replies": [
          [
            "What if there isn't one?",
            "Rania reminds me that marrying her wasn't an audited decision."
          ],
          [
            "What do you say?",
            "That the returns have been excellent. She tells me to stop speaking like a ledger."
          ],
          [
            "Is she right?",
            "Usually. Especially when she's laughing."
          ]
        ]
      }
    ],
    "greetings": [
      "Latif. Have we met? No? Good, I haven't forgotten you.",
      "Corin. A clean beginning.",
      "Corin! I remembered before asking this time.",
      "We're making progress.",
      "A dragon. There must be a sensible number of meals involved. I dread discovering it.",
      "I'm Corin. I'm still discovering it myself."
    ]
  },
  "Bevan": {
    "name": "Bevan",
    "home": "Coralmere",
    "role": "Produce grower",
    "source": "11-coast.txt:1",
    "topics": [
      {
        "title": "The inland visitor",
        "opening": "What surprises visitors most about Coralmere?",
        "first": "How far salt travels without permission. A man once accused me of seasoning his laundry.",
        "replies": [
          [
            "What did you tell him?",
            "That the sea hadn't consulted me either."
          ],
          [
            "Did he stay?",
            "Long enough to buy more clothes."
          ],
          [
            "Does the salt bother you?",
            "Some days. Other days I miss it after an hour away."
          ]
        ]
      },
      {
        "title": "A vegetable with a history",
        "opening": "Have you grown something for a particular person?",
        "first": "My father's favourite beans. After he died I kept planting them, though I never liked the taste.",
        "replies": [
          [
            "Do you still grow them?",
            "A few. I give most away."
          ],
          [
            "Why not stop?",
            "I may. I don't want stopping to feel like forgetting."
          ],
          [
            "Does anyone understand?",
            "My neighbour took a basket without telling me what I ought to feel. That helped."
          ]
        ]
      },
      {
        "title": "Bevan's seaside wish",
        "opening": "Would you ever live away from the coast?",
        "first": "I'd like to try waking without listening for the weather. Then I wonder what I'd listen for instead.",
        "replies": [
          [
            "People, perhaps.",
            "They're even less predictable."
          ],
          [
            "Do you love it here?",
            "Yes. Love includes a fair amount of complaining."
          ],
          [
            "Where would you try?",
            "Somewhere quiet enough to discover whether I am."
          ]
        ]
      }
    ],
    "greetings": [
      "Bevan. If you're after directions, tell me whether you mean by road or by smell.",
      "Corin. Road seems safer.",
      "Corin! Still keeping dry where possible?",
      "Where possible covers less than I'd hoped.",
      "A dragon. Please tell me he isn't interested in a vegetable patch.",
      "I'm Corin. We'll keep him out of yours."
    ]
  },
  "Nerissa": {
    "name": "Nerissa",
    "home": "Coralmere",
    "role": "Provisions merchant",
    "source": "11-coast.txt:6",
    "topics": [
      {
        "title": "The customer who came back",
        "opening": "Has a stranger ever surprised you by returning?",
        "first": "A traveller came back years later to pay for food I'd forgotten giving him.",
        "replies": [
          [
            "Did you take the money?",
            "Yes. He'd carried the wish to repay it much longer than I'd carried the cost."
          ],
          [
            "What did you say?",
            "That I was glad he'd made it."
          ],
          [
            "Did you ask about the years between?",
            "He told me over a meal. This time he bought mine."
          ]
        ]
      },
      {
        "title": "Nerissa's worst sales pitch",
        "opening": "Have you ever talked someone out of buying something?",
        "first": "A man wanted enough fish to impress his guests, though he didn't know how to keep it.",
        "replies": [
          [
            "What did you suggest?",
            "Less fish and less ambition."
          ],
          [
            "Did he listen?",
            "He returned to thank me. Apparently the guests survived without being overwhelmed."
          ],
          [
            "Is that good business?",
            "Dead confidence doesn't buy supper tomorrow."
          ]
        ]
      },
      {
        "title": "The shore after visitors leave",
        "opening": "What's Coralmere like when the visitors have gone?",
        "first": "You hear familiar voices again. Lovely, until you realise they know exactly what you did yesterday.",
        "replies": [
          [
            "Does that bother you?",
            "Sometimes I'd like to be mysterious for an afternoon."
          ],
          [
            "What would you do mysteriously?",
            "Buy a pastry nobody offered an opinion about."
          ],
          [
            "That's a modest ambition.",
            "You haven't met all my neighbours."
          ]
        ]
      }
    ],
    "greetings": [
      "Nerissa. Welcome. If you need food, ask before your pride starts making decisions.",
      "Corin. I'll remember that.",
      "Corin! Good to see you back on dry ground.",
      "I appreciate the ground more lately.",
      "A dragon. I ought to ask whether that's one customer or two.",
      "I'm Corin. Definitely two appetites."
    ]
  },
  "Sella": {
    "name": "Sella",
    "home": "Coralmere",
    "role": "Cook",
    "source": "11-coast.txt:11",
    "topics": [
      {
        "title": "The recipe you won't share",
        "opening": "Do you keep any recipes secret?",
        "first": "One. Not because it's special. Because the woman who taught me said I could keep something for myself.",
        "replies": [
          [
            "Do people press you?",
            "Constantly. They hear a closed door and start rattling it."
          ],
          [
            "Would you teach someone eventually?",
            "If I wanted to. That's the pleasant part."
          ],
          [
            "Is it worth all the mystery?",
            "Probably not. I enjoy it anyway."
          ]
        ]
      },
      {
        "title": "A cook's sick day",
        "opening": "Who cooks when you're ill?",
        "first": "My brother. He treats instructions as encouraging suggestions.",
        "replies": [
          [
            "Does the food turn out?",
            "Sometimes in unexpected directions."
          ],
          [
            "Do you correct him?",
            "Less now. Being cared for isn't improved by criticism from bed."
          ],
          [
            "What's the kindest thing he made?",
            "Tea. Correctly. At exactly the moment I stopped pretending I could manage."
          ]
        ]
      },
      {
        "title": "The taste of a place",
        "opening": "Can a meal tell you where you are?",
        "first": "More by what people argue about than what's in it. Every town has a correct way somebody's grandmother disputes.",
        "replies": [
          [
            "Do you argue?",
            "With conviction and very little consistency."
          ],
          [
            "What matters to you?",
            "That people at the table can eat it and enjoy being there."
          ],
          [
            "That sounds simple.",
            "Then someone asks whether my grandmother would approve."
          ]
        ]
      }
    ],
    "greetings": [
      "Sella. If you're going to praise something, taste it first.",
      "Corin. Fair rule.",
      "Corin! Arrived hungry or merely hopeful?",
      "Those often travel together.",
      "A dragon. My ordinary notion of a serving has become inadequate.",
      "I'm Corin. Mine did too."
    ]
  },
  "Neri": {
    "name": "Neri",
    "home": "Coralmere",
    "role": "Net mender",
    "source": "11-coast.txt:16",
    "topics": [
      {
        "title": "A net with no catch",
        "opening": "Have you ever made a net for something besides fishing?",
        "first": "A child wanted one to catch the moon's reflection. I explained it wouldn't work. She asked whether I was certain.",
        "replies": [
          [
            "Did you make it?",
            "A little one. She tested my theory thoroughly."
          ],
          [
            "Was she disappointed?",
            "Briefly. Then caught a leaf shaped like a boat."
          ],
          [
            "Would you have tried?",
            "At her age, yes. I admired the experiment."
          ]
        ]
      },
      {
        "title": "The hands you recognise",
        "opening": "Can you recognise another mender's work?",
        "first": "Yes. We all have habits. Sometimes I see a knot and hear the person's voice.",
        "replies": [
          [
            "Even if they're gone?",
            "Especially then."
          ],
          [
            "Does that make you sad?",
            "And glad. I don't always separate them."
          ],
          [
            "Would someone recognise yours?",
            "I hope so. Though preferably not by a mistake."
          ]
        ]
      },
      {
        "title": "Neri's first storm",
        "opening": "Do you remember your first proper storm?",
        "first": "Remember hiding because the adults looked frightened. I could bear the noise until I saw their faces.",
        "replies": [
          [
            "Did someone find you?",
            "My aunt. Sat down without calling me silly."
          ],
          [
            "What did she say?",
            "That she was frightened too, and we'd wait together."
          ],
          [
            "Did that help?",
            "More than being told there was nothing to fear."
          ]
        ]
      }
    ],
    "greetings": [
      "Neri. Mind your fingers around loose cord; it likes new acquaintances.",
      "Corin. I'll keep mine to myself.",
      "Corin! You've picked a moment when I can look up.",
      "I'll try to deserve it.",
      "A dragon. I don't suppose his claws are trained for delicate knots.",
      "I'm Corin. We won't volunteer them."
    ]
  },
  "Finnick": {
    "name": "Finnick",
    "home": "Coralmere",
    "role": "Boat worker",
    "source": "11-coast.txt:21",
    "topics": [
      {
        "title": "The boat's unpopular name",
        "opening": "What's the worst name you've heard for a boat?",
        "first": "Unsinkable. I dislike a vessel beginning a quarrel with the sea.",
        "replies": [
          [
            "Did it sink?",
            "No. The owner never put it in the water. Perfect record."
          ],
          [
            "What would you name one?",
            "Something modest. Please, perhaps."
          ],
          [
            "Would people laugh?",
            "Until a storm. Then they'd find it eloquent."
          ]
        ]
      },
      {
        "title": "Finnick's lucky charm",
        "opening": "Do you carry anything for luck?",
        "first": "A button from my mother's coat. The luck is remembering somebody expects me back.",
        "replies": [
          [
            "Does she know you have it?",
            "She complained about the missing button. I confessed years later."
          ],
          [
            "Was she pleased?",
            "She sewed another one onto a scrap for me. Said theft was an unnecessary method."
          ],
          [
            "Do you still carry the first?",
            "Yes. It's earned the position."
          ]
        ]
      },
      {
        "title": "The sea in winter",
        "opening": "Do you like the sea when it's cold?",
        "first": "From somewhere warm. People call that cowardice until I offer to swap places.",
        "replies": [
          [
            "Would you leave it?",
            "I'd miss it. I'd also enjoy dry socks."
          ],
          [
            "What would bring you back?",
            "The sound at night. Inland quiet feels unfinished."
          ],
          [
            "Do you sleep well here?",
            "Usually. Familiar noise is different from noise."
          ]
        ]
      }
    ],
    "greetings": [
      "Finnick. If you're looking for someone sensible, I can point.",
      "Corin. I'll risk you first.",
      "Corin! Still on speaking terms with the sea?",
      "We maintain a cautious distance.",
      "A dragon. That's an unusually impressive alternative to an oar.",
      "I'm Corin. Oars have advantages indoors."
    ]
  },
  "Maris": {
    "name": "Maris",
    "home": "Coralmere",
    "role": "Home cook",
    "source": "11-coast.txt:26",
    "topics": [
      {
        "title": "The meal after an argument",
        "opening": "What do you cook after a family quarrel?",
        "first": "Something everybody likes. Not to settle it. To make sure nobody has to apologise on an empty stomach.",
        "replies": [
          [
            "Does the quarrel continue?",
            "Sometimes. At a more manageable volume."
          ],
          [
            "Do you ever apologise first?",
            "When I can stop preparing my defence long enough."
          ],
          [
            "What works best?",
            "Saying what I did wrong without adding what they did wrong beside it."
          ]
        ]
      },
      {
        "title": "Maris's written recipes",
        "opening": "Why don't you write down quantities?",
        "first": "Because I learned by watching. My daughter says watching me say 'enough' isn't a transferable skill.",
        "replies": [
          [
            "Is she right?",
            "Entirely. I find that inconvenient."
          ],
          [
            "Will you write them properly?",
            "We're trying together. She measures while I object."
          ],
          [
            "Does it help?",
            "It gives us time together. Even the objections have become enjoyable."
          ]
        ]
      },
      {
        "title": "A supper alone",
        "opening": "Is eating alone lonely?",
        "first": "Sometimes. Other times it's glorious to choose exactly what I fancy and explain nothing.",
        "replies": [
          [
            "What do you choose?",
            "Something my family calls insufficient for a proper meal."
          ],
          [
            "Do you miss them then?",
            "By the second quiet evening."
          ],
          [
            "Can you want both?",
            "I seem to. Fortunately, supper doesn't demand a consistent philosophy."
          ]
        ]
      }
    ],
    "greetings": [
      "Maris. You look new to the coast. Have people given you too much advice yet?",
      "Corin. There's still room for a little.",
      "Corin! I was hoping to hear how you got on.",
      "Some parts went better than planned.",
      "A dragon. I shall have to stop calling my family difficult to feed.",
      "I'm Corin. Don't give them ideas."
    ]
  },
  "Perrin": {
    "name": "Perrin",
    "home": "Coralmere",
    "role": "Boat repairer",
    "source": "11-coast.txt:31",
    "topics": [
      {
        "title": "The boat that came home",
        "opening": "Have you recognised a boat after years away?",
        "first": "One returned with half my work replaced. I knew it by a small mark nobody had bothered smoothing out.",
        "replies": [
          [
            "Did it feel like yours?",
            "No. It felt like an old acquaintance."
          ],
          [
            "Were you proud?",
            "Mostly relieved it had served people well."
          ],
          [
            "Would you remove the mark now?",
            "If it caused trouble. Sentiment shouldn't catch a rope."
          ]
        ]
      },
      {
        "title": "Perrin's dry-land fear",
        "opening": "What frightens you on dry land?",
        "first": "Heights. Put me on a roof and I become extremely interested in coming down.",
        "replies": [
          [
            "Even low roofs?",
            "The ground's opinion of low differs from mine."
          ],
          [
            "Do people tease you?",
            "Until I invite them into a boat in rough water."
          ],
          [
            "Does that prove something?",
            "Only that everybody has a place they'd rather not be laughed at."
          ]
        ]
      },
      {
        "title": "A repair refused",
        "opening": "Would you repair a boat beyond its useful life?",
        "first": "I'd explain what I could and couldn't make safe. People hear hope very selectively when they love a thing.",
        "replies": [
          [
            "Have they argued?",
            "Of course. They're often saying goodbye to more than wood."
          ],
          [
            "Can you save part of it?",
            "Sometimes. A seat, a name board. Something that can retire without taking anyone down."
          ],
          [
            "Is that satisfying?",
            "In a quieter way than sending it out again."
          ]
        ]
      }
    ],
    "greetings": [
      "Perrin. If you're asking whether a boat is safe, I'll inspect it before sounding reassuring.",
      "Corin. I'd trust that answer.",
      "Corin! Back without a leak to report?",
      "None in anything important.",
      "A dragon. I hope nobody asks me to build a boat around him.",
      "I'm Corin. We'll avoid that commission."
    ]
  },
  "Hester": {
    "name": "Hester",
    "home": "Coralmere",
    "role": "Net maker",
    "source": "11-coast.txt:36",
    "topics": [
      {
        "title": "Hester's childhood race",
        "opening": "Were you competitive as a child?",
        "first": "Fiercely. I'd challenge people to anything I could already do and call it fair.",
        "replies": [
          [
            "Did anyone beat you?",
            "My sister, by choosing the next contest."
          ],
          [
            "What did she choose?",
            "Sitting quietly. I was defeated before she finished explaining."
          ],
          [
            "Are you still competitive?",
            "Ask me when I'm winning."
          ]
        ]
      },
      {
        "title": "A knot for a wedding",
        "opening": "Why do people talk about marriage as a knot?",
        "first": "Because somebody poetic had never spent an hour untangling wet rope.",
        "replies": [
          [
            "You dislike the comparison?",
            "I prefer a conversation. Knots aren't known for listening."
          ],
          [
            "Are you married?",
            "Widowed. We had many years of listening badly and trying again."
          ],
          [
            "Do you miss the trying?",
            "Every day. Even the arguments had somewhere to go."
          ]
        ]
      },
      {
        "title": "The pupil who rushed",
        "opening": "What's hardest to teach?",
        "first": "Slowing down before the mistake, instead of after it. Everybody understands once they're unpicking.",
        "replies": [
          [
            "Did you rush?",
            "Terribly. I have no claim to inherited wisdom."
          ],
          [
            "What changed?",
            "Having to undo my own work. Repeatedly."
          ],
          [
            "Are you patient with learners?",
            "More when I remember the hours someone gave me."
          ]
        ]
      }
    ],
    "greetings": [
      "Hester. You're welcome to talk, but don't expect me to stop my hands.",
      "Corin. I can keep up with both.",
      "Corin! You've found me doing exactly what you'd expect.",
      "There's comfort in that.",
      "A dragon. My hands have actually stopped. That takes some doing.",
      "I'm Corin. Sorry for the interruption."
    ]
  },
  "Yara": {
    "name": "Yara",
    "home": "Coralmere",
    "role": "Coastal resident",
    "source": "11-coast.txt:41",
    "topics": [
      {
        "title": "The neighbour's light",
        "opening": "Why do you like seeing lights across the water?",
        "first": "Because somebody else is still awake. It makes a lonely evening feel less exclusive.",
        "replies": [
          [
            "Do you know who's there?",
            "Some nights. Other nights I invent pleasant possibilities."
          ],
          [
            "What if the light goes out?",
            "Then I should probably go to bed too."
          ],
          [
            "Do you leave yours lit for others?",
            "Occasionally. I like imagining it helps."
          ]
        ]
      },
      {
        "title": "A house full of shells",
        "opening": "Do you collect shells?",
        "first": "I did as a child. My mother finally asked whether the sea could keep a few.",
        "replies": [
          [
            "Did you stop?",
            "I became more selective. Then called that maturity."
          ],
          [
            "Have you kept any?",
            "One from a day I barely remember except that I was happy."
          ],
          [
            "Why that one?",
            "Perhaps because happiness didn't need an explanation then."
          ]
        ]
      },
      {
        "title": "Yara's inland visit",
        "opening": "What did you miss when you went inland?",
        "first": "The changing edge of things. Here the water moves the boundary every day.",
        "replies": [
          [
            "Was inland life too still?",
            "Only at first. Then I noticed other changes."
          ],
          [
            "Would you live there?",
            "Perhaps. I'd have to stop judging it for not being here."
          ],
          [
            "That's difficult.",
            "Yes. Home makes a demanding comparison."
          ]
        ]
      }
    ],
    "greetings": [
      "Yara. If you're new here, don't trust a dry-looking seat without checking.",
      "Corin. That's useful hospitality.",
      "Corin! You've learned where to put your feet.",
      "Some lessons repeat themselves.",
      "A dragon. I'll stop complaining about gulls near the roof.",
      "I'm Corin. Hopefully he won't give you a new complaint."
    ]
  },
  "Doryn": {
    "name": "Doryn",
    "home": "Coralmere",
    "role": "Longtime coastal resident",
    "source": "11-coast.txt:46",
    "topics": [
      {
        "title": "The town before you knew it",
        "opening": "Has Coralmere changed much?",
        "first": "Enough that I sometimes give directions to things that aren't there anymore.",
        "replies": [
          [
            "Do people correct you?",
            "Young ones do. Old ones argue about when the thing disappeared."
          ],
          [
            "Does that sadden you?",
            "Some changes. Others were overdue."
          ],
          [
            "What would you keep?",
            "Places where people can stop without having to buy something."
          ]
        ]
      },
      {
        "title": "A reputation for wisdom",
        "opening": "Do people assume you're wise because you're older?",
        "first": "Constantly. I've made some of my finest mistakes quite recently.",
        "replies": [
          [
            "Do you tell them?",
            "They call it modesty. There's no escaping an audience determined to admire you."
          ],
          [
            "What mistake?",
            "Bought shoes too small because they were a bargain. Age failed to intervene."
          ],
          [
            "Did you keep them?",
            "No. I eventually respected my feet's objections."
          ]
        ]
      },
      {
        "title": "The person you waited for",
        "opening": "Have you ever waited for someone who didn't arrive?",
        "first": "Yes. Weather delayed them. I spent hours preparing to be angry and was too relieved when they came.",
        "replies": [
          [
            "Did you tell them?",
            "Not that evening. They were tired and needed warmth, not the history of my worry."
          ],
          [
            "Were you angry later?",
            "A little. Then we talked."
          ],
          [
            "What would you do differently?",
            "Ask for news sooner instead of practising speeches at the horizon."
          ]
        ]
      }
    ],
    "greetings": [
      "Doryn. Been here long enough to be suspicious of anyone calling it quaint.",
      "Corin. I'll avoid that word.",
      "Corin! Still taking an interest?",
      "There's plenty left.",
      "A dragon. That ought to discourage the word picturesque for an afternoon.",
      "I'm Corin. We make no promises about descriptions."
    ]
  },
  "Bry": {
    "name": "Bry",
    "home": "Coralmere",
    "role": "Coastal resident",
    "source": "11-coast.txt:51",
    "topics": [
      {
        "title": "A fear you acquired",
        "opening": "Have you ever become afraid of something you used to enjoy?",
        "first": "Swimming alone. Nothing happened. One day I understood what could.",
        "replies": [
          [
            "Did you stop swimming?",
            "No. I found company."
          ],
          [
            "Do you miss the old confidence?",
            "Sometimes. I don't miss the ignorance supporting it."
          ],
          [
            "Is it less enjoyable now?",
            "Different. I like having someone to laugh with afterward."
          ]
        ]
      },
      {
        "title": "The houseplant at the coast",
        "opening": "Can you keep houseplants alive here?",
        "first": "One. It has survived my care with impressive determination.",
        "replies": [
          [
            "What happened to the others?",
            "I mistook worry for watering."
          ],
          [
            "Have you learned?",
            "The surviving plant seems cautiously optimistic."
          ],
          [
            "Why keep trying?",
            "I like something growing indoors that hasn't arrived through a crack."
          ]
        ]
      },
      {
        "title": "Bry's unexpected welcome",
        "opening": "When did you feel you belonged here?",
        "first": "A neighbour borrowed something without explaining who they were. Assumed we'd reached that stage.",
        "replies": [
          [
            "Wasn't that rude?",
            "A little. I was absurdly pleased."
          ],
          [
            "Did they return it?",
            "Eventually. Belonging has inconveniences."
          ],
          [
            "Would you rather be a stranger again?",
            "For a day now and then. Not permanently."
          ]
        ]
      }
    ],
    "greetings": [
      "Bry. You look like you're learning the coast one surprise at a time.",
      "Corin. That's accurate.",
      "Corin! Fewer surprises today, I hope?",
      "I'd settle for gentler ones.",
      "A dragon. Well, that outdoes my entire morning.",
      "I'm Corin. Mine has been difficult to summarise too."
    ]
  },
  "Coral": {
    "name": "Coral",
    "home": "Coralmere",
    "role": "Sail mender",
    "source": "11-coast.txt:56",
    "topics": [
      {
        "title": "The sail you painted",
        "opening": "Have you ever decorated a sail?",
        "first": "A small one for a child. Painted a terrifying sea creature. Her mother thought it was a cheerful cabbage.",
        "replies": [
          [
            "Was the child pleased?",
            "Delighted. She made the cabbage attack things."
          ],
          [
            "Did you correct the mother?",
            "No. The child had improved the design."
          ],
          [
            "Would you paint another?",
            "With less green, perhaps."
          ]
        ]
      },
      {
        "title": "A seam in a storm",
        "opening": "Do you think about your work when the weather turns?",
        "first": "Every time. I remember where each seam went and hope I wasn't tired when I finished it.",
        "replies": [
          [
            "Does that keep you awake?",
            "Sometimes. I check carefully so I have an answer for the worry."
          ],
          [
            "Can you ever be certain?",
            "No. But I can know I didn't rush."
          ],
          [
            "Do people understand that?",
            "The ones who've waited for a boat do."
          ]
        ]
      },
      {
        "title": "Coral's private ambition",
        "opening": "What would you make if it didn't have to be useful?",
        "first": "A hanging full of impossible birds. Wings that couldn't carry them, colours no sensible creature would wear.",
        "replies": [
          [
            "Why birds?",
            "I've spent years making things obey the wind. I'd like one afternoon of disobedience."
          ],
          [
            "Would you show people?",
            "When I stopped apologising for it."
          ],
          [
            "Would it make you happy?",
            "I think so. That ought to be enough reason to start."
          ]
        ]
      }
    ],
    "greetings": [
      "Coral. No, I wasn't named after the town. The joke remains available anyway.",
      "Corin. I'll leave it available.",
      "Corin! You came back before I had time to invent a story about your absence.",
      "Please keep the true version.",
      "A dragon. Those wings make me very protective of my needle.",
      "I'm Corin. We won't ask you to mend them."
    ]
  },
  "Zella": {
    "name": "Zella",
    "home": "Coralmere",
    "role": "Cord worker",
    "source": "11-coast.txt:61",
    "topics": [
      {
        "title": "The knot in the love letter",
        "opening": "Why would someone tie a knot around a letter?",
        "first": "To make the recipient work for the words, apparently. My cousin tied his so well his sweetheart cut the cord.",
        "replies": [
          [
            "Was he offended?",
            "He called it symbolic. She called it opening a letter."
          ],
          [
            "Did it work out?",
            "They're together. She manages the knots now."
          ],
          [
            "Would you do that?",
            "No. I'd already find the words difficult enough."
          ]
        ]
      },
      {
        "title": "A skill in the fingers",
        "opening": "Can your hands remember something you've forgotten?",
        "first": "Yes. Ask me to explain a knot and I stumble. Give me the cord and I know.",
        "replies": [
          [
            "Does that frustrate you?",
            "When teaching. I have to slow the knowledge down enough to speak."
          ],
          [
            "Who taught you?",
            "My grandmother. She let me watch before asking me to perform."
          ],
          [
            "Do you teach that way?",
            "I try. Her patience took years to appreciate properly."
          ]
        ]
      },
      {
        "title": "Zella's silent contest",
        "opening": "Do you ever compete without telling the other person?",
        "first": "I used to race another worker finishing a length. She was unaware and therefore infuriatingly relaxed.",
        "replies": [
          [
            "Did you win?",
            "Sometimes. She enjoyed every afternoon, so the greater victory may have been hers."
          ],
          [
            "Did you tell her?",
            "She laughed and asked whether there were prizes."
          ],
          [
            "Were there?",
            "Only tired fingers. Poorly organised competition."
          ]
        ]
      }
    ],
    "greetings": [
      "Zella. If you're tangled in something, start by stopping the pulling.",
      "Corin. Practical advice for many things.",
      "Corin! You've arrived without a knot for me.",
      "Only conversational ones.",
      "A dragon. I can see several reasons to keep loose rope out of the way.",
      "I'm Corin. We'll mind it."
    ]
  },
  "Kip": {
    "name": "Kip",
    "home": "Coralmere",
    "role": "Shore explorer",
    "source": "11-coast.txt:66",
    "topics": [
      {
        "title": "The sea's handwriting",
        "opening": "Do the marks in sand ever look like writing to you?",
        "first": "Constantly. I used to invent messages. Mostly they said I was allowed to stay out longer.",
        "replies": [
          [
            "Did anyone believe that?",
            "My aunt asked whether the sea could sign the permission properly."
          ],
          [
            "What do they say now?",
            "Usually that the tide's been somewhere I wasn't watching."
          ],
          [
            "Do you still invent messages?",
            "Yes. Less useful ones, more interesting."
          ]
        ]
      },
      {
        "title": "A treasure you returned",
        "opening": "Have you ever found something and put it back?",
        "first": "A living creature inside a shell I wanted. I was furious with it for already owning its house.",
        "replies": [
          [
            "You returned it, though.",
            "Yes. Complained all the way."
          ],
          [
            "Were you glad afterward?",
            "I was glad I hadn't become the sort of person who kept it."
          ],
          [
            "Do you still want the shell?",
            "A little. Doing the right thing doesn't always cure wanting."
          ]
        ]
      },
      {
        "title": "Kip's distant shore",
        "opening": "Do you wonder what's on the opposite shore?",
        "first": "Every day. I know there are places beyond what I can see, but knowing doesn't stop me staring.",
        "replies": [
          [
            "Would you go?",
            "Yes. With someone who understood boats better than my imagination does."
          ],
          [
            "What would you look for first?",
            "What children there pick up and call treasure."
          ],
          [
            "Why that?",
            "I'd like to know what I've walked past without noticing."
          ]
        ]
      }
    ],
    "greetings": [
      "Kip. Are you looking for something, or just looking?",
      "Corin. Just looking sounds good.",
      "Corin! I've found something ordinary in an interesting way.",
      "That's a promising description.",
      "A dragon. I don't think I can improve on your discovery today.",
      "I'm Corin. I wasn't keeping score."
    ]
  },
  "Astrid": {
    "name": "Astrid",
    "home": "Hollybeck",
    "role": "Provisions merchant",
    "source": "12-winter.txt:1",
    "topics": [
      {
        "title": "The winter you remember",
        "opening": "Which winter stays in your mind?",
        "first": "One when neighbours began checking on each other without making it an occasion. I remember the knocking more than the snow.",
        "replies": [
          [
            "Were things bad?",
            "Bad enough that pride became less useful than company."
          ],
          [
            "Did everyone accept help?",
            "Not gracefully. We helped anyway."
          ],
          [
            "Does that still happen?",
            "Yes. I'd like it to continue when the weather gives us fewer excuses."
          ]
        ]
      },
      {
        "title": "A shopkeeper's secret",
        "opening": "What do you know about people that they don't realise?",
        "first": "Who buys less than usual. Who says they're not hungry. I notice without announcing it across the shop.",
        "replies": [
          [
            "What do you do?",
            "Offer something they can accept without an audience."
          ],
          [
            "Does anyone refuse?",
            "Yes. I leave room for another day."
          ],
          [
            "Does it weigh on you?",
            "Sometimes. It helps when somebody remembers to ask how I'm doing."
          ]
        ]
      },
      {
        "title": "Astrid's extravagant plan",
        "opening": "What would you do with a truly free evening?",
        "first": "Wear something impractical and go nowhere that required checking supplies.",
        "replies": [
          [
            "Who would you go with?",
            "People who could discuss something besides winter preparations."
          ],
          [
            "What would you talk about?",
            "I don't know. Discovering would be the luxury."
          ],
          [
            "Have you planned it?",
            "Only in the moments between more responsible plans."
          ]
        ]
      }
    ],
    "greetings": [
      "Astrid. New to Hollybeck? Tell me before pretending you aren't cold.",
      "Corin. I'm new, and a little cold.",
      "Corin! Good. I prefer seeing people to wondering whether they arrived.",
      "So do the people arriving.",
      "A dragon. He looks better prepared for winter than some travellers I've met.",
      "I'm Corin. I'm trying to keep up."
    ]
  },
  "Sverre": {
    "name": "Sverre",
    "home": "Hollybeck",
    "role": "Mountain-road veteran",
    "source": "12-winter.txt:6",
    "topics": [
      {
        "title": "The mountain's silence",
        "opening": "What's the strangest sound in the mountains?",
        "first": "Sudden silence after wind. Your ears keep expecting the noise, and you hear your own breathing as if someone else were there.",
        "replies": [
          [
            "Is it peaceful?",
            "Sometimes. Sometimes you notice how alone you've become."
          ],
          [
            "Do you like being alone?",
            "For a while. I like knowing where company is."
          ],
          [
            "What do you do in that silence?",
            "Check my direction before getting poetic about it."
          ]
        ]
      },
      {
        "title": "A young man's boast",
        "opening": "What boast do you most regret?",
        "first": "Said I never got lost. Spent the next journey refusing to admit I had.",
        "replies": [
          [
            "How did you get back?",
            "Someone with less experience asked why we were seeing the same ridge twice."
          ],
          [
            "Did you listen?",
            "After an ugly minute I still dislike remembering."
          ],
          [
            "Do you tell young travellers?",
            "Yes. They deserve better than my reputation polished clean."
          ]
        ]
      },
      {
        "title": "Sverre's soft spot",
        "opening": "What makes you sentimental?",
        "first": "Someone saving me a place without asking whether I'll come. I pretend not to notice.",
        "replies": [
          [
            "Why pretend?",
            "Habit. I've spent years sounding harder than I feel."
          ],
          [
            "Who does that for you?",
            "People here. Hollybeck can be kinder than its weather suggests."
          ],
          [
            "You could thank them.",
            "I do. Badly, but with increasing practice."
          ]
        ]
      }
    ],
    "greetings": [
      "Sverre. If you're heading into the mountains, I'd rather hear your plan than admire your confidence.",
      "Corin. I'll bring the plan first.",
      "Corin! Glad to hear your footsteps again.",
      "They're glad to be here.",
      "A dragon. Mountains still have ways of humbling wings.",
      "I'm Corin. We'll listen before finding out."
    ]
  },
  "Runa": {
    "name": "Runa",
    "home": "Hollybeck",
    "role": "Young cook",
    "source": "12-winter.txt:11",
    "topics": [
      {
        "title": "The cook you want to become",
        "opening": "What sort of cook would you like to be?",
        "first": "The sort people remember when they say they were looked after. I don't need them to remember every ingredient.",
        "replies": [
          [
            "Who cooks like that for you?",
            "Astrid, when she has time. She notices if someone goes quiet."
          ],
          [
            "Is that cooking?",
            "Partly. Food arrives in a person's day, not an empty room."
          ],
          [
            "Do you worry about getting it wrong?",
            "Constantly. I'm learning not to serve the worry with the meal."
          ]
        ]
      },
      {
        "title": "Runa's first lie",
        "opening": "What's the first lie you remember telling?",
        "first": "That I'd eaten something I hated. Then I was offered another helping because I'd finished so quickly.",
        "replies": [
          [
            "What did you do?",
            "Discovered that honesty had become more attractive."
          ],
          [
            "Were you punished?",
            "No. Asked to say what I meant next time."
          ],
          [
            "Did you?",
            "Not always. Lessons need inconvenient amounts of practice."
          ]
        ]
      },
      {
        "title": "A song from somewhere warm",
        "opening": "Why do you like songs about summer?",
        "first": "Because even in winter somebody remembered it would come back.",
        "replies": [
          [
            "Do you have a favourite?",
            "One with a ridiculous chorus. Nobody can sing it solemnly."
          ],
          [
            "Do you sing while cooking?",
            "Quietly. I'm still negotiating with my own voice."
          ],
          [
            "Would you travel south?",
            "I'd like to. Then come back with more than a description of the heat."
          ]
        ]
      }
    ],
    "greetings": [
      "Runa. Are you visiting? I'm still collecting stories about anywhere warmer.",
      "Corin, from Millwood. Warmer sometimes.",
      "Corin! I've been hoping for more road news.",
      "I'll choose the less alarming parts.",
      "A dragon. Does he feel the cold? Sorry, I should ask your name first.",
      "Corin. That's a perfectly reasonable question."
    ]
  },
  "Solveig": {
    "name": "Solveig",
    "home": "Hollybeck",
    "role": "Clothing mender",
    "source": "12-winter.txt:16",
    "topics": [
      {
        "title": "The coat passed down",
        "opening": "What do you notice in clothes passed through a family?",
        "first": "Different heights in the hems. Different hands in the repairs. Sometimes three lives in one coat.",
        "replies": [
          [
            "Do you like that?",
            "Yes. Unless the youngest is tired of being dressed in everybody else's history."
          ],
          [
            "Were you that child?",
            "Occasionally. I wanted one thing nobody had already outgrown."
          ],
          [
            "Did you get it?",
            "Eventually. I remember the colour better than the occasion."
          ]
        ]
      },
      {
        "title": "A mender's eyesight",
        "opening": "What do you do when your eyes get tired?",
        "first": "Stop. A revolutionary method I resisted for years.",
        "replies": [
          [
            "Why resist?",
            "Because unfinished work looked like failure, even when my hands were shaking."
          ],
          [
            "What changed?",
            "Someone made me look at what rushing had done."
          ],
          [
            "Do you rest easily now?",
            "More easily. I still need reminding that sitting isn't a character flaw."
          ]
        ]
      },
      {
        "title": "Solveig's summer box",
        "opening": "Do you keep anything for warmer weather?",
        "first": "A light dress folded away. Every winter I wonder whether I imagined needing it.",
        "replies": [
          [
            "Does it still fit?",
            "We'll see. I prefer not to conduct that inquiry while it's snowing."
          ],
          [
            "Why keep it?",
            "Because I like the person I feel like wearing it."
          ],
          [
            "Is that person different?",
            "A little less prepared for disaster."
          ]
        ]
      }
    ],
    "greetings": [
      "Solveig. Let me know if the cold's getting through; bravery makes poor lining.",
      "Corin. I won't argue with that.",
      "Corin! Still keeping yourself warm enough?",
      "I'm doing my best.",
      "A dragon. At least one of you arrived in a sensible coat.",
      "I'm Corin. His came fitted."
    ]
  },
  "Nils": {
    "name": "Nils",
    "home": "Hollybeck",
    "role": "Lane keeper",
    "source": "12-winter.txt:21",
    "topics": [
      {
        "title": "The neighbour with the broom",
        "opening": "Who helps you without being asked?",
        "first": "An old woman who insists she's only clearing her own step. Her step has expanded halfway down the lane.",
        "replies": [
          [
            "Do you thank her?",
            "She pretends not to hear. Then clears a little more."
          ],
          [
            "Why won't she admit helping?",
            "I think she'd rather be useful than praised."
          ],
          [
            "Does it make a difference?",
            "On bad mornings, more than she lets herself believe."
          ]
        ]
      },
      {
        "title": "Nils's weather prediction",
        "opening": "What's your most reliable sign of bad weather?",
        "first": "Everyone telling me it probably won't be much. Hope becomes remarkably loud before snowfall.",
        "replies": [
          [
            "Do you say it too?",
            "Of course. I like being wrong in company."
          ],
          [
            "Can you really predict it?",
            "Not precisely. I prepare for being surprised."
          ],
          [
            "Isn't that tiring?",
            "Less than pretending surprise was impossible."
          ]
        ]
      },
      {
        "title": "A path for one person",
        "opening": "Would you clear a route hardly anyone uses?",
        "first": "If one person needs it, yes. Popularity is a poor test for getting home.",
        "replies": [
          [
            "Have people complained?",
            "About the time. Usually from a perfectly clear path."
          ],
          [
            "What do you tell them?",
            "Who uses it. A name works better than a principle sometimes."
          ],
          [
            "Do they understand?",
            "Often enough to keep me explaining."
          ]
        ]
      }
    ],
    "greetings": [
      "Nils. Watch the ground while saying hello; it occasionally objects to visitors.",
      "Corin. I'll divide my attention.",
      "Corin! You found the safe footing again.",
      "Mostly through caution.",
      "A dragon. That's quite a footprint to plan around.",
      "I'm Corin. We'll leave you room to work."
    ]
  },
  "Freya": {
    "name": "Freya",
    "home": "Hollybeck",
    "role": "Town resident",
    "source": "12-winter.txt:26",
    "topics": [
      {
        "title": "The snowball truce",
        "opening": "Have you ever lost a snowball fight spectacularly?",
        "first": "My brother negotiated a truce, then stood behind me when his friends resumed. A gifted diplomat.",
        "replies": [
          [
            "Did you forgive him?",
            "After I put snow in his boots."
          ],
          [
            "Did that settle it?",
            "Until the following winter. Family keeps excellent records."
          ],
          [
            "Would you play now?",
            "If nobody insisted I behave according to my age."
          ]
        ]
      },
      {
        "title": "A letter never finished",
        "opening": "Why do you have trouble finishing letters?",
        "first": "I keep waiting for news important enough. Meanwhile whole ordinary weeks go unreported.",
        "replies": [
          [
            "What would you write today?",
            "That I met someone called Corin who asked an awkwardly useful question."
          ],
          [
            "I'd be honoured.",
            "Then I might actually finish one."
          ],
          [
            "Do you like ordinary letters yourself?",
            "Very much. I've been applying the wrong rule to my own life."
          ]
        ]
      },
      {
        "title": "Freya's dream of warmth",
        "opening": "Would you move somewhere without snow?",
        "first": "For a winter, perhaps. I'd like to miss it voluntarily.",
        "replies": [
          [
            "What would you miss?",
            "The hush after a fresh fall. And having an excellent reason to stay indoors."
          ],
          [
            "What wouldn't you miss?",
            "The moment cold finds the gap between glove and sleeve."
          ],
          [
            "Would you return?",
            "I think so. I want to test the thought, not swear an oath to it."
          ]
        ]
      }
    ],
    "greetings": [
      "Freya. You've picked a brisk place to stop for conversation.",
      "Corin. I'll try to make it worthwhile.",
      "Corin! Still interested in our cold little corner?",
      "More than ever.",
      "A dragon. That's an ambitious answer to winter.",
      "I'm Corin. He's more companion than heating arrangement."
    ]
  },
  "Oskar": {
    "name": "Oskar",
    "home": "Hollybeck",
    "role": "Longtime resident",
    "source": "12-winter.txt:31",
    "topics": [
      {
        "title": "The winter wedding",
        "opening": "Did people really marry in the deepest winter?",
        "first": "Yes. Fewer guests could travel, which some couples considered an advantage.",
        "replies": [
          [
            "Did you?",
            "I appreciated everyone who came. Also the people who sent food instead of advice."
          ],
          [
            "Was it a good day?",
            "Very. We remember the cold as funny now. It wasn't at the time."
          ],
          [
            "What do you remember best?",
            "My partner's face when the door opened. Everything else had to share space with that."
          ]
        ]
      },
      {
        "title": "The old man's new friend",
        "opening": "Is it difficult making friends when you're older?",
        "first": "Only if you insist everyone arrive with years of shared history. New people can't help being new.",
        "replies": [
          [
            "Have you made any lately?",
            "Yes. Someone young enough to disagree without borrowing my manners."
          ],
          [
            "Do you enjoy that?",
            "Usually after I've finished being offended."
          ],
          [
            "What makes friendship work?",
            "Coming back after an ordinary conversation. Not every meeting needs a revelation."
          ]
        ]
      },
      {
        "title": "A thing you changed your mind about",
        "opening": "What have you changed your mind about late in life?",
        "first": "Used to think leaving home meant rejecting it. Then someone I loved left and kept loving us.",
        "replies": [
          [
            "Was that hard to accept?",
            "Harder to admit I'd been unfair."
          ],
          [
            "Did you tell them?",
            "Yes. I'd spent enough years expecting the young to do all the apologising."
          ],
          [
            "Did it help?",
            "It gave their return visits more room to be happy."
          ]
        ]
      }
    ],
    "greetings": [
      "Oskar. You look new. Don't worry; the cold introduces itself thoroughly.",
      "Corin. It already has.",
      "Corin! You're beginning to move like someone who knows the ground.",
      "With appropriate suspicion.",
      "A dragon. Well, I've lived long enough for a new surprise.",
      "I'm Corin. I'm glad it's a welcome one."
    ]
  },
  "Edda": {
    "name": "Edda",
    "home": "Hollybeck",
    "role": "Householder",
    "source": "12-winter.txt:36",
    "topics": [
      {
        "title": "The room kept ready",
        "opening": "Do you keep a place ready for visitors?",
        "first": "A blanket, mostly. Keeping an entire room untouched made me feel as though I was waiting instead of living.",
        "replies": [
          [
            "Did someone stop visiting?",
            "They moved farther away. Nobody had done anything wrong, which made being sad feel foolish."
          ],
          [
            "It wasn't foolish.",
            "I know that more kindly now."
          ],
          [
            "Do they still come?",
            "When they can. I want them welcomed, not charged for the months between."
          ]
        ]
      },
      {
        "title": "Edda's extravagant cup",
        "opening": "What's your most unnecessary possession?",
        "first": "A cup far too delicate for my usual hands. I bought it on a day I wanted to be someone else.",
        "replies": [
          [
            "Do you use it?",
            "Yes. Turns out the same person can drink from different cups."
          ],
          [
            "Has it broken?",
            "Not yet. I try not to make enjoying it a waiting period for disaster."
          ],
          [
            "Would you buy it again?",
            "I would. That still surprises me."
          ]
        ]
      },
      {
        "title": "The neighbour's argument",
        "opening": "Do you get involved in neighbours' quarrels?",
        "first": "Less than I used to. Hearing one side can make you very helpfully wrong.",
        "replies": [
          [
            "Have you been wrong?",
            "Loudly. I apologised less loudly, which wasn't fair either."
          ],
          [
            "What do you do now?",
            "Ask whether they want help or company."
          ],
          [
            "Is that enough?",
            "Often. People don't always need an amateur judge."
          ]
        ]
      }
    ],
    "greetings": [
      "Edda. If you're looking for a warm welcome, I can provide the welcome immediately.",
      "Corin. I'll appreciate that part.",
      "Corin! Good to see you back among us.",
      "Good to be here.",
      "A dragon. I hope he doesn't mistake every roof for a landing place.",
      "I'm Corin. We'll be careful."
    ]
  },
  "Fennel": {
    "name": "Fennel",
    "home": "Hollybeck",
    "role": "Herb grower",
    "source": "12-winter.txt:41",
    "topics": [
      {
        "title": "The plant with the wrong name",
        "opening": "Have you ever named a plant incorrectly for years?",
        "first": "One my aunt named after an unpleasant neighbour. I discovered much later it wasn't the accepted term.",
        "replies": [
          [
            "Did you use it publicly?",
            "To someone who knew the neighbour. A complicated afternoon."
          ],
          [
            "Was your aunt embarrassed?",
            "Not remotely. She maintained the resemblance."
          ],
          [
            "What do you call it now?",
            "The proper name. Quietly, the other one survives."
          ]
        ]
      },
      {
        "title": "Fennel's impatience",
        "opening": "What makes you impatient?",
        "first": "People telling me growing things teaches patience. Mostly it gives me opportunities to discover I haven't enough.",
        "replies": [
          [
            "Do you enjoy it?",
            "Yes. Enjoyment and serenity aren't the same trade."
          ],
          [
            "What do you do while waiting?",
            "Something else, if I'm sensible."
          ],
          [
            "Are you sensible?",
            "Intermittently. Bjorn could provide references."
          ]
        ]
      },
      {
        "title": "The meal that felt like home",
        "opening": "When do you feel most at home?",
        "first": "When Bjorn asks me to taste something and really wants my answer, not approval.",
        "replies": [
          [
            "Are you blunt?",
            "Too blunt sometimes. I'm learning the difference between honest and hurried."
          ],
          [
            "Does he mind?",
            "He tells me. That's part of being at home too."
          ],
          [
            "What if you disagree?",
            "We eat it anyway and continue the argument comfortably."
          ]
        ]
      }
    ],
    "greetings": [
      "Fennel. You can ask about herbs, but I reserve the right to talk about something else.",
      "Corin. That sounds fair.",
      "Corin! Come with a question that isn't about frost.",
      "I'll try.",
      "A dragon. I suddenly feel protective of every growing thing I know.",
      "I'm Corin. He'll keep his fire to himself here."
    ]
  },
  "Bjorn": {
    "name": "Bjorn",
    "home": "Hollybeck",
    "role": "Cook",
    "source": "12-winter.txt:46",
    "topics": [
      {
        "title": "A recipe from a quarrel",
        "opening": "Have you ever invented food while angry?",
        "first": "Made a very vigorous dough after an argument. Fennel said it was the best bread I'd produced.",
        "replies": [
          [
            "Did that make you angrier?",
            "For a moment. Then it became difficult to remain impressive."
          ],
          [
            "What was the argument?",
            "I've forgotten. We remember the bread."
          ],
          [
            "Would you recommend the method?",
            "No. Too many ingredients outside the kitchen."
          ]
        ]
      },
      {
        "title": "The cook's empty chair",
        "opening": "Do you notice when someone isn't at the table?",
        "first": "Immediately. I cook the old quantity before remembering who's away.",
        "replies": [
          [
            "What do you do with the extra?",
            "Share it. Food is a practical way of admitting I miss someone."
          ],
          [
            "Do you tell them?",
            "Sometimes. A parcel says it without demanding they come home."
          ],
          [
            "Does Fennel understand?",
            "Yes. He doesn't call the extra a mistake."
          ]
        ]
      },
      {
        "title": "Bjorn's best meal out",
        "opening": "What's the best meal someone else has cooked for you?",
        "first": "One where they didn't apologise for every dish. They let me enjoy being a guest.",
        "replies": [
          [
            "Do people apologise often?",
            "They imagine I'm secretly judging. Usually I'm delighted not to be washing the pan."
          ],
          [
            "Would you say if it was bad?",
            "Only if the information could help, kindly."
          ],
          [
            "What do you praise?",
            "What I honestly liked. There's usually something."
          ]
        ]
      }
    ],
    "greetings": [
      "Bjorn. If you're cold, say so. It's the easiest problem to admit here.",
      "Corin. A little, yes.",
      "Corin! Have you been looking after yourself?",
      "With varying competence.",
      "A dragon. I ought to ask what counts as a modest appetite.",
      "I'm Corin. I haven't found that limit yet."
    ]
  },
  "Iris": {
    "name": "Iris",
    "home": "Hollybeck",
    "role": "Town resident",
    "source": "12-winter.txt:51",
    "topics": [
      {
        "title": "The winter diary",
        "opening": "Why do you keep a diary?",
        "first": "So winter doesn't become one long complaint in my memory. I write down something that actually happened.",
        "replies": [
          [
            "Even dull things?",
            "Especially those. A laugh, a visitor, a meal that turned out."
          ],
          [
            "Do you reread it?",
            "Sometimes. I'm often kinder to an old day than I was while living it."
          ],
          [
            "Would you let someone read it?",
            "Not yet. It isn't written to defend itself."
          ]
        ]
      },
      {
        "title": "Iris's secret fear",
        "opening": "What are you afraid people will notice about you?",
        "first": "How often I'm unsure. Everyone seems to expect a settled opinion by my age.",
        "replies": [
          [
            "Do they really?",
            "Perhaps not. I may be providing both sides of the pressure."
          ],
          [
            "What do you do?",
            "Ask questions anyway. The embarrassment generally passes."
          ],
          [
            "Does it get easier?",
            "With people who answer without making me feel small."
          ]
        ]
      },
      {
        "title": "The first day of thaw",
        "opening": "What do you do on the first day that feels like spring?",
        "first": "Go outside too lightly dressed and spend the afternoon claiming it's lovely.",
        "replies": [
          [
            "Why not fetch a coat?",
            "Because I've made a declaration."
          ],
          [
            "Does anyone believe you?",
            "No. They let me enjoy my stubbornness briefly."
          ],
          [
            "Wouldn't warmth be better?",
            "Yes. Please remind me when the occasion comes."
          ]
        ]
      }
    ],
    "greetings": [
      "Iris. New face, unless winter has changed someone I know beyond recognition.",
      "Corin. Genuinely new.",
      "Corin! I know the face now, even with the cold in it.",
      "That's comforting.",
      "A dragon. I'd like to revise my definition of an interesting visitor.",
      "I'm Corin. He makes a strong first impression."
    ]
  },
  "Dunstan": {
    "name": "Dunstan",
    "home": "Forgewick",
    "role": "Blacksmith",
    "source": "13-crafts-and-keepers.txt:1",
    "topics": [
      {
        "title": "The sword with a name",
        "opening": "Should a sword have a name?",
        "first": "Only if its owner can remember it isn't a person. I've met men kinder to their blades than their apprentices.",
        "replies": [
          [
            "Would you name yours?",
            "No. I'd rather the fellow holding it answer when called."
          ],
          [
            "Does a name make it special?",
            "To you, perhaps. It doesn't improve the edge."
          ],
          [
            "Maddock's sword already has a history.",
            "Then add something better to it than a boast."
          ]
        ]
      },
      {
        "title": "A letter to Sela",
        "opening": "What do you write to your brother about?",
        "first": "Orders, weather, the cost of fuel. Then Sela writes back asking whether I'm well. He knows what I've left out.",
        "replies": [
          [
            "Why leave it out?",
            "Harder to put on paper. A furnace temperature doesn't reveal much of a man."
          ],
          [
            "Do you miss him?",
            "Yes. There. Quicker than three paragraphs about coal."
          ],
          [
            "Will you tell him?",
            "I might. He'd become impossible for a week."
          ]
        ]
      },
      {
        "title": "The blacksmith's refusal",
        "opening": "Have you ever refused to make a weapon?",
        "first": "A man wanted something to frighten a neighbour. Described the neighbour before the blade. Saved us both some time.",
        "replies": [
          [
            "What did you tell him?",
            "That I was busy for the foreseeable future."
          ],
          [
            "Were you afraid he'd return?",
            "A little. Refusal doesn't come with a guarantee."
          ],
          [
            "What if the crown asked?",
            "Then it'd be harder. I won't pretend a principle makes a threat small."
          ]
        ]
      },
      {
        "title": "The day the forge went quiet",
        "opening": "What would make you close the forge for a day?",
        "first": "Someone I care about asking me plainly. I spend too much time expecting them to interrupt iron.",
        "replies": [
          [
            "Why don't they ask?",
            "Because I look busy. Busy can become a wall you build yourself."
          ],
          [
            "Would you really leave work?",
            "I'd like to think so. I've failed at it before."
          ],
          [
            "Who would you visit?",
            "Sela. He'd say the world must be ending. Then put the kettle on."
          ]
        ]
      }
    ],
    "greetings": [
      "Dunstan. Smith. You can stop looking as though you need permission to speak.",
      "Corin. Good. I've got a few questions.",
      "Corin. Still carrying yourself behind that sword?",
      "Most of me, yes.",
      "Well. That's a dragon. I'd been enjoying an ordinary day.",
      "I'm Corin. Ordinary's been difficult lately."
    ]
  },
  "Sela": {
    "name": "Sela",
    "home": "Sandspire",
    "role": "Glassmaker and Dunstan's brother",
    "source": "13-crafts-and-keepers.txt:7",
    "topics": [
      {
        "title": "The mistake that caught the light",
        "opening": "Have you ever preferred a failed piece?",
        "first": "A bowl slumped into a shape I'd never have chosen. I kept turning it in the light instead of throwing it away.",
        "replies": [
          [
            "Did you sell it?",
            "No. Wanted to understand it without a customer deciding for me."
          ],
          [
            "Was it actually good?",
            "I liked it. I'm trying to let that answer stand occasionally."
          ],
          [
            "Could you make it again?",
            "Not exactly. Annoying and rather wonderful."
          ]
        ]
      },
      {
        "title": "Two brothers at supper",
        "opening": "What were you and Dunstan like as children?",
        "first": "He insisted on being responsible. I specialised in making that difficult.",
        "replies": [
          [
            "Did you get him into trouble?",
            "Once he took the blame before discovering what I'd done. He demanded a full report afterward."
          ],
          [
            "Did you thank him?",
            "I laughed. I've been trying to improve on that response ever since."
          ],
          [
            "Who's more responsible now?",
            "We take turns claiming it. Letters are an excellent medium for untested superiority."
          ]
        ]
      },
      {
        "title": "A shield you can see through",
        "opening": "Why make a shield from glass?",
        "first": "I wanted protection that didn't shut out what was coming. The field does the hard work; the glass gives it form.",
        "replies": [
          [
            "Does it work by itself?",
            "No. Raise the field with B in battle. It can't make the decision for you."
          ],
          [
            "Is it delicate?",
            "Treat it properly. The field turns force aside; that doesn't make care unnecessary."
          ],
          [
            "What would make you proud of it?",
            "Someone coming back annoyed about an ordinary problem because they survived the extraordinary one."
          ]
        ]
      }
    ],
    "greetings": [
      "Sela. Glassmaker. If you're lost, you're welcome to remain lost here a moment.",
      "Corin. I'd like to ask about your work.",
      "Corin! You found the place again.",
      "I remembered the company.",
      "A dragon. Please spare my brother the comparison with his furnace.",
      "I'm Corin. I'll try to resist it too."
    ]
  },
  "Meriel": {
    "name": "Meriel",
    "home": "Sandspire glass shop",
    "role": "Glass seller",
    "source": "13-crafts-and-keepers.txt:12",
    "topics": [
      {
        "title": "The piece a child chose",
        "opening": "Do children choose differently from adults?",
        "first": "A child chose the smallest piece because it looked lonely. Her father kept trying to buy something impressive.",
        "replies": [
          [
            "What did you do?",
            "Asked which one the gift was for. The child answered before he could."
          ],
          [
            "Was he upset?",
            "Briefly. Then he saw how carefully she carried it."
          ],
          [
            "Would you choose like that?",
            "I have. I merely explain it in more expensive words."
          ]
        ]
      },
      {
        "title": "Meriel's honest window",
        "opening": "Would you display something with a flaw?",
        "first": "If I explain the flaw. I won't disguise it and let somebody discover it as a disappointment.",
        "replies": [
          [
            "Does that lose sales?",
            "Some. It also lets a buyer decide whether the flaw matters to them."
          ],
          [
            "What flaws do you like?",
            "Slight irregularities. Evidence of a hand, not evidence of carelessness."
          ],
          [
            "Is there a difference?",
            "A very important one. Sela could discuss it until tomorrow."
          ]
        ]
      },
      {
        "title": "A shop after closing",
        "opening": "What's the best moment of the working day?",
        "first": "Just after closing, when the place belongs to itself again. I can look without explaining.",
        "replies": [
          [
            "Does it feel different?",
            "Quieter in my head, mostly."
          ],
          [
            "Do you still enjoy the glass?",
            "Yes. That's how I know I haven't only been selling it."
          ],
          [
            "What do you look at first?",
            "Whatever the changing light has made unfamiliar."
          ]
        ]
      }
    ],
    "greetings": [
      "Meriel. Look as long as you like. Silence doesn't count as a purchase.",
      "Corin. That's a pleasant policy.",
      "Corin! Still curious about glass?",
      "And the people around it.",
      "A dragon. Sela will want to discuss those scales for an unreasonable length of time.",
      "I'm Corin. I'll warn him."
    ]
  },
  "Elin": {
    "name": "Elin",
    "home": "Sandspire glass shop",
    "role": "Local visitor",
    "source": "13-crafts-and-keepers.txt:17",
    "topics": [
      {
        "title": "The present for yourself",
        "opening": "Why is buying something for yourself difficult?",
        "first": "Because I start listing more sensible uses for the money. A gift for somebody else escapes the tribunal.",
        "replies": [
          [
            "What do you want?",
            "Something small and beautiful that needs no further explanation."
          ],
          [
            "Could you afford it?",
            "Yes. I'm arguing with permission, not the price."
          ],
          [
            "Who has to give permission?",
            "Apparently me. I'm proving a tiresome official."
          ]
        ]
      },
      {
        "title": "A friend's different taste",
        "opening": "Does it bother you when a friend dislikes something you love?",
        "first": "More than it should. I hear an opinion about a colour and somehow defend my entire personality.",
        "replies": [
          [
            "What do you do?",
            "Laugh, eventually. Preferably before the friendship requires repair."
          ],
          [
            "Have you done the same to them?",
            "Yes. I'm trying to say it isn't for me instead of declaring it ugly."
          ],
          [
            "Does that help?",
            "It leaves us both somewhere comfortable to stand."
          ]
        ]
      },
      {
        "title": "The day you noticed beauty",
        "opening": "When do you notice beautiful things most?",
        "first": "On days I've nearly walked past everything. Something catches my eye and I realise how far away I've been.",
        "replies": [
          [
            "Far away thinking?",
            "Worrying, usually."
          ],
          [
            "Does looking fix it?",
            "No. It gives the worry less than the whole world for a moment."
          ],
          [
            "Is that enough?",
            "Sometimes enough is a smaller thing than we expected."
          ]
        ]
      }
    ],
    "greetings": [
      "Elin. I'm not staff. I just look convincing while being indecisive.",
      "Corin. I'll avoid asking for prices.",
      "Corin! You've caught me considering again.",
      "An important occupation.",
      "A dragon. Now I've forgotten what I was choosing.",
      "I'm Corin. He does interrupt a plan."
    ]
  },
  "Alderic": {
    "name": "Alderic",
    "home": "Forgewick Temple",
    "role": "Keeper of the Lightning sanctuary",
    "source": "13-crafts-and-keepers.txt:22",
    "topics": [
      {
        "title": "The keeper's first morning",
        "opening": "What was your first morning here like?",
        "first": "Cold. I had imagined a calling would feel more impressive. Mostly I couldn't find a dry place to put my things.",
        "replies": [
          [
            "Did you want to leave?",
            "Yes. I stayed one more day. Several years are built out of that decision."
          ],
          [
            "What convinced you?",
            "Someone had kept the place before me without knowing who would come next."
          ],
          [
            "Was it worth it?",
            "You're asking me a question here. That is part of the answer."
          ]
        ]
      },
      {
        "title": "The stone and the listener",
        "opening": "Why can't a Heartstone simply be taken like treasure?",
        "first": "Its power belongs in the bond between rider and dragon. Possession alone doesn't teach either of you how to bear it.",
        "replies": [
          [
            "What does this one awaken?",
            "Lightning. Another way for Aurelius to answer danger."
          ],
          [
            "Do you decide whether we deserve it?",
            "The sanctuary has its trials. I can help you understand; I cannot live them for you."
          ],
          [
            "Could Halvard use it?",
            "Power does not become good merely because someone strong wants it."
          ]
        ]
      },
      {
        "title": "A lesson Halvard refused",
        "opening": "What did Halvard misunderstand about being a rider?",
        "first": "He understood enough to betray the others. I find that harder to forgive than ignorance.",
        "replies": [
          [
            "You think he knew what he was doing?",
            "He had lived beside them. He knew there were lives beneath the titles he destroyed."
          ],
          [
            "Can you be sure of his motives?",
            "No. I can judge the choices we know he made."
          ],
          [
            "Could anyone have stopped him?",
            "Perhaps. Be careful with questions that turn every survivor into someone who failed."
          ]
        ]
      },
      {
        "title": "After the last visitor",
        "opening": "What do you do when nobody is here?",
        "first": "Ordinary work. Eat, mend, sleep. Sacred places require a surprising amount of housekeeping.",
        "replies": [
          [
            "Doesn't that feel lonely?",
            "Sometimes. I don't consider loneliness proof that my work is noble."
          ],
          [
            "Why tell me that?",
            "Because people may call your suffering important when what you need is rest."
          ],
          [
            "What would you like for the sanctuary?",
            "Visitors who come to learn without first being hunted."
          ]
        ]
      }
    ],
    "greetings": [
      "Alderic. You may ask what this place is before deciding what it expects of you.",
      "Corin. I'd like that very much.",
      "Corin. You've returned with a different look about you.",
      "I may have more questions now.",
      "A dragon at the sanctuary again. Forgive me; I need a moment.",
      "I'm Corin. We're both here to listen."
    ]
  },
  "Maelis": {
    "name": "Maelis",
    "home": "Witchmoor",
    "role": "Witch and charm maker",
    "source": "13-crafts-and-keepers.txt:28",
    "topics": [
      {
        "title": "The invitation nobody sent",
        "opening": "Do people ever invite you to celebrations?",
        "first": "They invite me when something goes wrong. Apparently my talents become respectable once the roof leaks.",
        "replies": [
          [
            "Do you go?",
            "Sometimes. I don't require a fool to become wise before I stop the draught."
          ],
          [
            "Doesn't it hurt?",
            "Yes. I can admit that without granting them a very interesting curse."
          ],
          [
            "Would you accept a proper invitation?",
            "If the food were good and nobody expected a demonstration."
          ]
        ]
      },
      {
        "title": "A witch's education",
        "opening": "What was the first thing you learned that frightened you?",
        "first": "How easily a confident voice can make people believe. Including mine.",
        "replies": [
          [
            "Had you misled someone?",
            "I sounded certain before I was. I've remembered the temptation ever since."
          ],
          [
            "How do you resist it?",
            "By saying what I don't know while I still have the chance."
          ],
          [
            "Does that weaken your reputation?",
            "With people who prefer a performance. They'll find one elsewhere."
          ]
        ]
      },
      {
        "title": "The marsh after midnight",
        "opening": "What keeps you awake out here?",
        "first": "Frogs, usually. People imagine I spend midnight consulting dreadful powers. Mostly I'm considering dreadful language.",
        "replies": [
          [
            "Don't you like the marsh?",
            "Very much. Affection doesn't require agreeing with its volume."
          ],
          [
            "Do you ever get frightened?",
            "Of course. I investigate in daylight when possible. Being a witch isn't an obligation to be stupid."
          ],
          [
            "Would town be quieter?",
            "The frogs ask fewer personal questions."
          ]
        ]
      },
      {
        "title": "The cost of kindness",
        "opening": "Why help someone you've only just met?",
        "first": "Because I decide what my hands are for. I needn't wait for the whole world to become grateful.",
        "replies": [
          [
            "Do you expect repayment?",
            "No. I'd ask plainly if I wanted a bargain."
          ],
          [
            "What if someone abuses it?",
            "Then I remember their name and change what I offer next time."
          ],
          [
            "What does your ward ask of me?",
            "To wear it. Equip it in your Bag; even useful magic dislikes being forgotten among spare socks."
          ]
        ]
      }
    ],
    "greetings": [
      "Maelis. You can ask your question without backing toward the door.",
      "Corin. I was trying to be polite, not ready to flee.",
      "Corin. You've survived one conversation with me and risked another.",
      "I found the first encouraging.",
      "A dragon. At least one of you has arrived without pretending to be ordinary.",
      "I'm Corin. Pretending wasn't likely to work."
    ]
  },
  "Sahir": {
    "name": "Sahir",
    "home": "Sandspire",
    "role": "Desert-route traveller",
    "source": "13-crafts-and-keepers.txt:34",
    "topics": [
      {
        "title": "A ruin in the distance",
        "opening": "Have you ever approached a ruin and changed your mind?",
        "first": "Yes. Something about the ground bothered me. I couldn't explain it well enough to sound impressive, so I left unimpressively.",
        "replies": [
          [
            "Did you learn whether you were right?",
            "No. I'm content with that particular ignorance."
          ],
          [
            "Would you tell other travellers?",
            "What I noticed, not a monster I invented afterward."
          ],
          [
            "Did you feel cowardly?",
            "For a while. Then I enjoyed being alive enough to be embarrassed."
          ]
        ]
      },
      {
        "title": "The companion who sang",
        "opening": "What's the best company on a difficult road?",
        "first": "Someone who knows when to stop cheering you up. I once travelled with a man determined to improve every silence.",
        "replies": [
          [
            "Was he kind?",
            "Yes. Exhaustingly."
          ],
          [
            "Did you tell him?",
            "We agreed on quiet stretches. He discovered he liked them."
          ],
          [
            "Would you travel together again?",
            "Gladly. He'd learned to hear a request without hearing rejection."
          ]
        ]
      },
      {
        "title": "Sahir's return gift",
        "opening": "What do you bring home from a journey?",
        "first": "A small story for each person who worried. Something they'd find funny or interesting.",
        "replies": [
          [
            "Why not a souvenir?",
            "Sometimes I do. A story travels without taking water or space."
          ],
          [
            "Do you leave out danger?",
            "Some. I try not to make comfort into dishonesty."
          ],
          [
            "What would you tell me?",
            "That asking sensible questions rarely looks heroic. It remains a good idea."
          ]
        ]
      }
    ],
    "greetings": [
      "Sahir. If you're planning a desert detour, I'd like to hear how much water you consider enough.",
      "Corin. I'm willing to be corrected.",
      "Corin! Arrived with questions again?",
      "Safer than arriving with assumptions.",
      "A dragon. That's useful company, provided you both know the way.",
      "I'm Corin. We're asking before setting off."
    ]
  },
  "Olin": {
    "name": "Olin",
    "home": "Winter supply camp",
    "role": "Supply driver",
    "source": "13-crafts-and-keepers.txt:39",
    "topics": [
      {
        "title": "The borrowed bravery",
        "opening": "Are you braver with Signe beside you?",
        "first": "Usually. Sometimes I only act braver and make her do the worrying for both of us.",
        "replies": [
          [
            "Does she notice?",
            "Immediately. She's become an expert on my cheerful voice."
          ],
          [
            "What do you do then?",
            "Tell her the actual problem."
          ],
          [
            "Does that make you feel weaker?",
            "No. Mostly tired of the time I wasted pretending."
          ]
        ]
      },
      {
        "title": "A traveller's unfinished meal",
        "opening": "What meal do you keep imagining on the road?",
        "first": "One where nobody asks when we must leave again. The food changes. That part doesn't.",
        "replies": [
          [
            "Who would be there?",
            "Signe. Whoever wants to join without discussing loads."
          ],
          [
            "Would silence be welcome?",
            "After the first few mouthfuls, very."
          ],
          [
            "Do you like travelling?",
            "Yes. I also like being expected somewhere warm."
          ]
        ]
      },
      {
        "title": "Olin's small souvenir",
        "opening": "Do you keep anything from your journeys?",
        "first": "A scrap from an old packing list. Signe wrote something kind beneath the supplies.",
        "replies": [
          [
            "What did it say?",
            "That's mine, if you don't mind."
          ],
          [
            "Of course.",
            "Thank you. Not everything precious improves by being explained."
          ],
          [
            "Does she know you kept it?",
            "Yes. She pretends to be embarrassed and checks it hasn't torn."
          ]
        ]
      }
    ],
    "greetings": [
      "Olin. I'd shake your hand if mine weren't busy remembering warmth.",
      "Corin. What happened here?",
      "Corin! Good to see someone returning on purpose.",
      "I wanted to see how you were.",
      "A dragon. Signe, our circumstances have become more interesting.",
      "I'm Corin. We'd like them to become better, too."
    ]
  },
  "Signe": {
    "name": "Signe",
    "home": "Winter supply camp",
    "role": "Supply driver",
    "source": "13-crafts-and-keepers.txt:44",
    "topics": [
      {
        "title": "The plan you didn't share",
        "opening": "Do you always tell Olin when you're worried?",
        "first": "Not always. Then I resent him for not guessing. I'm attempting to retire that system.",
        "replies": [
          [
            "Does he do the same?",
            "With a different expression. We each think ours is convincing."
          ],
          [
            "What helps?",
            "Naming one worry at a time. Otherwise everything sounds impossible."
          ],
          [
            "Does that solve it?",
            "It lets us begin. I don't demand more from the first sentence."
          ]
        ]
      },
      {
        "title": "Signe's homecoming ritual",
        "opening": "What do you do first after a long journey?",
        "first": "Put everything down. Properly down, not ready to lift again. Then I wash my face.",
        "replies": [
          [
            "Why that first?",
            "Until then, some part of me thinks we're still travelling."
          ],
          [
            "What comes after?",
            "Food, and refusing to discuss the next trip before morning."
          ],
          [
            "Does Olin cooperate?",
            "After one reminder. Sometimes two affectionate ones."
          ]
        ]
      },
      {
        "title": "A kindness on the road",
        "opening": "What's the smallest kindness you've remembered longest?",
        "first": "Someone warming my gloves without saying I should have brought better ones.",
        "replies": [
          [
            "You were expecting criticism?",
            "I'd prepared a whole defence. Didn't need any of it."
          ],
          [
            "Did you thank them?",
            "I hope well enough. I was younger and less good at it."
          ],
          [
            "Do you do that for others?",
            "When I notice. I'd like to notice more without being congratulated for it."
          ]
        ]
      }
    ],
    "greetings": [
      "Signe. Before Olin tells you we're managing splendidly, we're managing.",
      "Corin. I'd rather hear it plainly.",
      "Corin. Thank you for coming back.",
      "I didn't want you left guessing.",
      "A dragon. Perhaps there's a practical possibility behind all this astonishment.",
      "I'm Corin. We'll hear what you need."
    ]
  },
  "Dorrick": {
    "name": "Dorrick",
    "home": "Forgewick",
    "role": "Miner",
    "source": "14-remaining-cast.txt:1",
    "topics": [
      {
        "title": "The miner's hearing",
        "opening": "Can you sleep through loud noises?",
        "first": "Through familiar ones. A tiny sound where there shouldn't be one wakes me immediately.",
        "replies": [
          [
            "From working underground?",
            "Partly. The body keeps lessons after the shift ends."
          ],
          [
            "Is that useful?",
            "And tiring. I don't always need to be on watch."
          ],
          [
            "What helps you rest?",
            "Somebody I trust saying they'll listen for a while."
          ]
        ]
      },
      {
        "title": "The tool you lent",
        "opening": "Have you ever regretted lending a tool?",
        "first": "Lent my best pick to someone who returned it cleaned and sharpened. Made my own care look shameful.",
        "replies": [
          [
            "That's your regret?",
            "I had to improve. Very inconsiderate of him."
          ],
          [
            "Did you lend it again?",
            "Of course. I'm not entirely foolish."
          ],
          [
            "Did you thank him?",
            "With supper. We both preferred it to a speech."
          ]
        ]
      },
      {
        "title": "Dorrick's imagined riches",
        "opening": "What would you do if you struck it rich?",
        "first": "Pay what I owe, fix my roof, then discover I don't know how to be rich.",
        "replies": [
          [
            "Would you stop mining?",
            "For a while. I'd like the next decision to be mine."
          ],
          [
            "Would you miss the others?",
            "Yes. I'd come back to hear them complain about my leisure."
          ],
          [
            "What's left after the roof?",
            "A quiet amount of time. That's the expensive thing."
          ]
        ]
      }
    ],
    "greetings": [
      "Dorrick. If you're asking about the mine, don't begin with 'surely'.",
      "Corin. I'll begin with hello.",
      "Corin! Still asking before entering dark places?",
      "Whenever possible.",
      "A dragon. Mind where those wings go near a tunnel mouth.",
      "I'm Corin. We'll keep clear."
    ]
  },
  "Hask": {
    "name": "Hask",
    "home": "Forgewick",
    "role": "Innkeeper",
    "source": "14-remaining-cast.txt:6",
    "topics": [
      {
        "title": "The guest who cleaned",
        "opening": "Have you ever had a guest leave a room better than they found it?",
        "first": "One repaired a loose catch. Left a note apologising for interfering.",
        "replies": [
          [
            "Did you mind?",
            "Not at all. I minded that I'd stopped noticing it needed fixing."
          ],
          [
            "Did they return?",
            "Yes. I made sure the next room required no improvement."
          ],
          [
            "What did the note say?",
            "That they'd slept well. I kept that part."
          ]
        ]
      },
      {
        "title": "An innkeeper's ear",
        "opening": "Can you tell why someone has travelled?",
        "first": "Sometimes. I try not to force the reason out of them.",
        "replies": [
          [
            "What gives it away?",
            "The questions they avoid more than the ones they ask."
          ],
          [
            "Do you want to know?",
            "Of course. Wanting isn't a right."
          ],
          [
            "What do you offer instead?",
            "A clear price, a place to rest, and no surprise interrogation."
          ]
        ]
      },
      {
        "title": "Hask's own journey",
        "opening": "Where would you go if someone else watched the inn?",
        "first": "I'd visit someone I keep promising to visit. Distance has become a very respectable excuse.",
        "replies": [
          [
            "Who?",
            "An old friend. We write as though next month is infinitely available."
          ],
          [
            "Could you go soon?",
            "I could try arranging it instead of describing the difficulty."
          ],
          [
            "Would they be pleased?",
            "Yes. That's the part I should keep thinking about."
          ]
        ]
      }
    ],
    "greetings": [
      "Hask. Welcome. Let me know what you need before deciding we're too busy.",
      "Corin. Thank you.",
      "Corin! You know the way in now.",
      "And a familiar face inside.",
      "A dragon. We'll need to be sensible about where everyone stays.",
      "I'm Corin. Sensible sounds welcome."
    ]
  },
  "Marek": {
    "name": "Marek",
    "home": "Forgewick",
    "role": "Fisher",
    "source": "14-remaining-cast.txt:11",
    "topics": [
      {
        "title": "The fish nobody believed",
        "opening": "Have you ever told the truth and been accused of boasting?",
        "first": "Caught a very large fish. Nobody believed me. Invented a smaller version and became credible.",
        "replies": [
          [
            "Did that annoy you?",
            "Enormously. Honesty shouldn't require editing the fish."
          ],
          [
            "Did you have proof?",
            "By then, supper. The evidence was unavailable."
          ],
          [
            "Would you tell it properly now?",
            "Only to someone prepared to be unusually trusting."
          ]
        ]
      },
      {
        "title": "Marek's silence",
        "opening": "Why do you like fishing near a busy town?",
        "first": "I can be alone without feeling far away. The noise says life is continuing somewhere behind me.",
        "replies": [
          [
            "Don't the sounds bother you?",
            "Less than being asked whether I'm lonely."
          ],
          [
            "Are you?",
            "Sometimes. Then I go and speak to someone."
          ],
          [
            "So being alone is a choice?",
            "On good days. I try to notice when it stops being one."
          ]
        ]
      },
      {
        "title": "A promise to a child",
        "opening": "Have you ever promised a child they'd catch something?",
        "first": "Once. Never again. Fish are poor partners in an adult's guarantee.",
        "replies": [
          [
            "Were they disappointed?",
            "Until we found something else to enjoy. I took longer to forgive the afternoon."
          ],
          [
            "Why?",
            "I'd wanted to be impressive."
          ],
          [
            "What do you promise now?",
            "Time together. I can actually provide that."
          ]
        ]
      }
    ],
    "greetings": [
      "Marek. You may talk, but I reserve the right to blame you for any fish I don't catch.",
      "Corin. An unusually generous warning.",
      "Corin! Back to test my patience socially?",
      "Only gently.",
      "A dragon. That's a larger fishing companion than I'd planned.",
      "I'm Corin. He'll keep his appetite at a distance."
    ]
  },
  "Bregga": {
    "name": "Bregga",
    "home": "Hollybeck",
    "role": "Farmer",
    "source": "14-remaining-cast.txt:16",
    "topics": [
      {
        "title": "The farmer's calendar",
        "opening": "How do you remember important dates?",
        "first": "By what was growing, freezing, or failing to do either. My family would prefer numbers.",
        "replies": [
          [
            "Does that confuse them?",
            "Apparently 'the year the potatoes sulked' lacks precision."
          ],
          [
            "Do you remember birthdays?",
            "Yes. I simply have a different filing system."
          ],
          [
            "What date matters most?",
            "The first day somebody trusted me to manage without supervising."
          ]
        ]
      },
      {
        "title": "A crop you won't grow",
        "opening": "Is there something you refuse to grow?",
        "first": "A vegetable I detested as a child. I could grow it perfectly well. I choose peace.",
        "replies": [
          [
            "Is that sensible?",
            "Not especially. It's a small freedom."
          ],
          [
            "Does anyone complain?",
            "People who don't have to eat it."
          ],
          [
            "Would you try it again?",
            "Perhaps. Let me enjoy the refusal a little longer."
          ]
        ]
      },
      {
        "title": "The work you share",
        "opening": "What's hardest about accepting help?",
        "first": "Not explaining every detail while someone is trying to do it.",
        "replies": [
          [
            "Why do you explain?",
            "Because worry disguises itself as instruction very convincingly."
          ],
          [
            "Do you catch yourself?",
            "Sometimes after the third unnecessary sentence."
          ],
          [
            "What do you say then?",
            "Thank you. And, with effort, nothing else."
          ]
        ]
      }
    ],
    "greetings": [
      "Bregga. If you're new here, don't mistake stubbornness for immunity to cold.",
      "Corin. I'll wear the distinction carefully.",
      "Corin! Still sensible enough to stop and speak?",
      "Usually.",
      "A dragon. I hope he respects fences better than the weather does.",
      "I'm Corin. We'll make an effort."
    ]
  },
  "Torvald": {
    "name": "Torvald",
    "home": "Hollybeck",
    "role": "Miner",
    "source": "14-remaining-cast.txt:21",
    "topics": [
      {
        "title": "A miner's last shift",
        "opening": "Did you know your last shift would be the last?",
        "first": "No. I left expecting another ordinary morning. Strange how a life can finish a chapter without telling you.",
        "replies": [
          [
            "Do you regret that?",
            "Sometimes I'd like to have looked around properly."
          ],
          [
            "What would you look at?",
            "The people. I can remember the stone well enough."
          ],
          [
            "Can you still see them?",
            "Some. I try not to wait for a grand occasion."
          ]
        ]
      },
      {
        "title": "The lantern's keeper",
        "opening": "Why entrust your lantern to Sverre?",
        "first": "Because he'd lend it for a good reason and refuse for a foolish one. Both mattered.",
        "replies": [
          [
            "Did it mean much to you?",
            "Yes. That's why I wanted it useful rather than hidden."
          ],
          [
            "Were you afraid to part with it?",
            "A little. An object can begin pretending it's the only keeper of your memories."
          ],
          [
            "Was it?",
            "No. I remember without holding it."
          ]
        ]
      },
      {
        "title": "Torvald's newer life",
        "opening": "What's surprised you since leaving mine work?",
        "first": "How long I kept introducing myself by a job I wasn't doing.",
        "replies": [
          [
            "What do you say now?",
            "My name. Then see whether anyone wants the rest."
          ],
          [
            "Does that feel empty?",
            "Less so now I've put other things into the days."
          ],
          [
            "What things?",
            "Family. Walking. Being bad at activities nobody pays me for."
          ]
        ]
      }
    ],
    "greetings": [
      "Torvald. You're new to me. Travelling through, or looking for someone?",
      "Corin. Travelling, with a few questions.",
      "Corin! Glad to see you above ground.",
      "It has its advantages.",
      "A dragon. That's a companion a man would notice missing.",
      "I'm Corin. I certainly would."
    ]
  },
  "Ingrid": {
    "name": "Ingrid",
    "home": "Hollybeck",
    "role": "Tavern worker",
    "source": "14-remaining-cast.txt:26",
    "topics": [
      {
        "title": "The guest who listened",
        "opening": "What makes a memorable customer?",
        "first": "Someone who asks how I am and waits through the answer. The waiting is rarer than the question.",
        "replies": [
          [
            "Do people rush you?",
            "Usually they don't notice they've done it."
          ],
          [
            "What would your answer be today?",
            "That I'm tired, but glad of a decent conversation."
          ],
          [
            "Can I help?",
            "Being here without demanding a performance already helps."
          ]
        ]
      },
      {
        "title": "A tavern in a storm",
        "opening": "Does the tavern feel different during bad weather?",
        "first": "People stop pretending they came only for a drink. They listen when the door opens.",
        "replies": [
          [
            "For someone expected?",
            "Often. Sometimes just to know another person made it inside."
          ],
          [
            "Does it frighten you?",
            "A little. Keeping busy gives the fear somewhere to go."
          ],
          [
            "What's the best moment?",
            "When the last expected face comes through the door."
          ]
        ]
      },
      {
        "title": "Ingrid's little deception",
        "opening": "Have you ever pretended not to recognise someone?",
        "first": "A person who'd embarrassed himself badly the night before. He looked ready to flee.",
        "replies": [
          [
            "Did you let him forget it?",
            "I let him order breakfast without an audience for his shame."
          ],
          [
            "Was he grateful?",
            "He came back sober and friendly. Good enough."
          ],
          [
            "Would you do it for everyone?",
            "For ordinary foolishness. Cruelty doesn't get the same breakfast."
          ]
        ]
      }
    ],
    "greetings": [
      "Ingrid. If you need something, ask before shivering becomes your introduction.",
      "Corin. Fair advice.",
      "Corin! You've returned. Good news before you've even spoken.",
      "I'll try to keep it good.",
      "A dragon. I'll need advance warning before anyone attempts an indoor visit.",
      "I'm Corin. He'll stay clear of the doorway."
    ]
  },
  "Sigrun": {
    "name": "Sigrun",
    "home": "Hollybeck",
    "role": "Cook",
    "source": "14-remaining-cast.txt:31",
    "topics": [
      {
        "title": "The pot you inherited",
        "opening": "Have you inherited any kitchen things?",
        "first": "A pot that looks older than several buildings. My aunt swore nothing burned in it. My first supper disproved her.",
        "replies": [
          [
            "Was she teasing you?",
            "I suspect she was encouraging me with unreliable evidence."
          ],
          [
            "Do you still use it?",
            "Yes. It has survived my education."
          ],
          [
            "Does it remind you of her?",
            "Especially when I blame it instead of myself."
          ]
        ]
      },
      {
        "title": "A meal for a stranger",
        "opening": "How do you cook for someone you know nothing about?",
        "first": "Ask what they can eat. Start simply. Don't make them praise the effort before they've tasted it.",
        "replies": [
          [
            "Have you ever got it wrong?",
            "Yes. I once tried so hard to impress that I forgot to listen."
          ],
          [
            "What did they want?",
            "Something familiar after a difficult day."
          ],
          [
            "What did you learn?",
            "To ask before deciding what kindness should look like."
          ]
        ]
      },
      {
        "title": "Sigrun's favourite sound",
        "opening": "What's your favourite sound at supper?",
        "first": "The first quiet after everyone begins eating. Then the conversation returning.",
        "replies": [
          [
            "Why that?",
            "It tells me they've stopped worrying about the meal and started being together."
          ],
          [
            "Do you join them?",
            "More often now. I used to hide in the work."
          ],
          [
            "Why hide?",
            "It's easier to be useful than to discover whether you're wanted sitting down."
          ]
        ]
      }
    ],
    "greetings": [
      "Sigrun. Hungry, cold, curious? We can usually address one of those quickly.",
      "Corin. Curious, for now.",
      "Corin! Good. A familiar appetite for questions.",
      "Still healthy.",
      "A dragon. I'd better not casually offer seconds.",
      "I'm Corin. That could become a lengthy commitment."
    ]
  },
  "Serjeant Bram": {
    "name": "Serjeant Bram",
    "home": "Royal entourage",
    "role": "Veteran serjeant",
    "source": "14-remaining-cast.txt:36",
    "topics": [
      {
        "title": "The serjeant's gloves",
        "opening": "Why keep your gloves on at the table?",
        "first": "So I needn't apologise for leaving quickly. A royal visit is work, whatever the furniture suggests.",
        "replies": [
          [
            "Does the king ever let you rest?",
            "When I'm no longer required."
          ],
          [
            "That sounds like a convenient answer.",
            "It is also the answer available to you."
          ],
          [
            "I'll keep this short.",
            "An excellent beginning."
          ]
        ]
      },
      {
        "title": "A recruit's question",
        "opening": "Do recruits ever question your orders?",
        "first": "Frequently. The sensible ones ask before obeying badly.",
        "replies": [
          [
            "What if the order is cruel?",
            "They should understand exactly what they're refusing before calling refusal easy."
          ],
          [
            "You could refuse too.",
            "I know. You aren't the first person to imagine that hadn't occurred to me."
          ],
          [
            "I wouldn't want your position.",
            "Many people prefer authority at a distance. Fewer enjoy its actual arrangements."
          ]
        ]
      },
      {
        "title": "The road after service",
        "opening": "What would you do if you left royal service?",
        "first": "Walk through a town without anyone trying to guess what I want from them.",
        "replies": [
          [
            "Could you?",
            "Eventually. A uniform leaves a longer shadow than people think."
          ],
          [
            "Would you miss the power?",
            "I'd miss being obeyed. I'd prefer not to disguise that as a nobler feeling."
          ],
          [
            "I hope you get that walk.",
            "Perhaps. For now, remain clear of the royal route."
          ]
        ]
      },
      {
        "title": "An entry crossed out",
        "opening": "Have you ever changed a report to help someone?",
        "first": "I've corrected reports. Whether that helped somebody depended on what was wrong.",
        "replies": [
          [
            "That's a careful answer.",
            "You're asking an officer about his records in public."
          ],
          [
            "Does the king read them?",
            "He reads what interests him. I don't rely on knowing which part that will be."
          ],
          [
            "Then I'll stop asking.",
            "Sensible. We may yet finish this conversation comfortably."
          ]
        ]
      }
    ],
    "greetings": [
      "State your business. Bram, royal serjeant.",
      "Corin. I was hoping to ask a question.",
      "You again, Corin. Be concise.",
      "I'll choose my words.",
      "A dragon. Explain yourself before anybody reaches for a weapon.",
      "Corin. We're speaking peacefully."
    ]
  },
  "Doran": {
    "name": "Doran",
    "home": "Royal entourage",
    "role": "Knight",
    "source": "14-remaining-cast.txt:42",
    "topics": [
      {
        "title": "The weight of a title",
        "opening": "Did becoming a knight feel how you expected?",
        "first": "No. I expected to feel larger. Mostly I felt watched.",
        "replies": [
          [
            "By whom?",
            "Officers. Recruits. People waiting to see whether I'd behave like the stories."
          ],
          [
            "Did you?",
            "Not consistently."
          ],
          [
            "What did you learn?",
            "A title makes people expect things. It doesn't make you able to provide them."
          ]
        ]
      },
      {
        "title": "Doran's first pay",
        "opening": "What did you buy with your first pay?",
        "first": "A gift too expensive to send home without admitting what I'd spent.",
        "replies": [
          [
            "Did your family like it?",
            "My mother kept asking whether I had enough to eat."
          ],
          [
            "Were you annoyed?",
            "Then. Now I understand what she was actually asking."
          ],
          [
            "Would you choose differently?",
            "I'd send something smaller and a longer letter."
          ]
        ]
      },
      {
        "title": "A knight at home",
        "opening": "Does your family treat you like a knight?",
        "first": "My brother treats me like someone who once got stuck in a fence. Historical evidence is against me.",
        "replies": [
          [
            "Does that bother you?",
            "Not often. It's restful to be ridiculous safely."
          ],
          [
            "How did you get stuck?",
            "That account remains under seal."
          ],
          [
            "Who rescued you?",
            "The brother. Hence his regrettably permanent authority."
          ]
        ]
      }
    ],
    "greetings": [
      "Doran. Keep your hands where I can see them while we talk.",
      "Corin. They're staying right here.",
      "Corin. You're becoming a familiar interruption.",
      "I'll try to be a brief one.",
      "A dragon. Everyone stay still a moment.",
      "I'm Corin. We're not here to attack."
    ]
  },
  "King Halvard": {
    "name": "King Halvard",
    "home": "Cinderhold",
    "role": "King of Emberfell",
    "source": "14-remaining-cast.txt:47",
    "topics": [
      {
        "title": "A crown at supper",
        "opening": "Why do you need ceremony even when you're eating?",
        "first": "Because familiarity spreads. A man who forgets his place at supper may remember himself too grandly tomorrow.",
        "replies": [
          [
            "A crown shouldn't need people kept small.",
            "A charming principle from someone who has never had to hold a kingdom together."
          ],
          [
            "Surely you could let people relax.",
            "They may relax when I leave. I don't require their comfort to accompany mine."
          ],
          [
            "I see that the visit matters to you.",
            "Everything done in public matters. Remember that before you mistake a casual tone for privacy."
          ]
        ]
      },
      {
        "title": "Six empty places",
        "opening": "Do you ever think about the riders who aren't here?",
        "first": "You mean the six who believed a disagreement gave them power over me. Yes. Their absence resolved several difficulties.",
        "replies": [
          [
            "You speak as if killing them was housekeeping.",
            "I speak as someone who survived the decision. They would have described their victory differently."
          ],
          [
            "They trusted you before Wingfall.",
            "Then they should have understood me better. Trust is no defence against misjudgement."
          ],
          [
            "I wanted to hear your account.",
            "Now you have. Take care which parts you repeat and to whom."
          ]
        ]
      },
      {
        "title": "The bill nobody presents",
        "opening": "Who pays when your party visits a town?",
        "first": "The town contributes to its own stability. Merchants have a tiresome habit of imagining every obligation ends in a sale.",
        "replies": [
          [
            "Those people still need to feed their families.",
            "Then they ought to welcome a kingdom in which their families know who rules."
          ],
          [
            "They can't refuse you, can they?",
            "They can petition. I don't promise to find the petition persuasive."
          ],
          [
            "I hadn't understood the arrangement.",
            "Few subjects do. They enjoy the benefits before asking which portions they may decline to fund."
          ]
        ]
      },
      {
        "title": "An egg in a boy's hands",
        "opening": "Why remember a boy carrying eggs?",
        "first": "Because you looked determined to protect something ordinary. People reveal themselves before they learn to perform.",
        "replies": [
          [
            "You took what didn't belong to you.",
            "I accepted what the village owed its king. Your elder evidently neglected that lesson."
          ],
          [
            "You frightened people over a basket.",
            "I made a small request. If they were frightened, they understood something you did not."
          ],
          [
            "It was an unusual morning.",
            "For you. For me, one village on a royal road. Consider the difference in scale."
          ]
        ]
      },
      {
        "title": "A creature born guilty",
        "opening": "Why should a dragon be condemned before it harms anyone?",
        "first": "Because waiting for a rival to become dangerous is the luxury of someone who doesn't occupy my throne.",
        "replies": [
          [
            "A living creature isn't a claim on your throne.",
            "A dragon gives its rider the strength to make one. Intentions are reassuring until they change."
          ],
          [
            "You're afraid of someone else having what you have.",
            "I recognise power. Call that fear if the smaller word comforts you."
          ],
          [
            "You take the possibility seriously.",
            "As should you. Do not mistake a young creature for a small consequence."
          ]
        ]
      },
      {
        "title": "A witness with nothing to say",
        "opening": "What do you expect people to report from the woods?",
        "first": "Anything too large, too strange, or too conveniently forgotten. My men can decide which details matter.",
        "replies": [
          [
            "People shouldn't be punished for being afraid.",
            "Fear is a reason to speak carefully. It isn't a licence to conceal."
          ],
          [
            "Perhaps they saw nothing.",
            "Then a truthful account should be brief. Evasion usually requires more effort."
          ],
          [
            "I'll remember what you've said.",
            "See that you do. Memory is a useful quality when properly directed."
          ]
        ]
      },
      {
        "title": "A kindness forbidden",
        "opening": "Would you punish someone for helping an injured dragon?",
        "first": "I'd ask why they preferred a creature's needs to their king's command. Their answer would interest me greatly.",
        "replies": [
          [
            "Because suffering matters even when you forbid it.",
            "You confuse tenderness with exemption. The law needn't share your sympathies."
          ],
          [
            "What if they couldn't bear to leave it?",
            "Then they would learn what their compassion cost. People should understand their own choices."
          ],
          [
            "I wanted the rule made clear.",
            "It is clear. Report it, withdraw, and allow my officers to act."
          ]
        ]
      },
      {
        "title": "The future you allow",
        "opening": "What kind of future do you want for Emberfell?",
        "first": "One that does not require me to survive the same challenge twice. Continuity is underrated by those who have never secured it.",
        "replies": [
          [
            "People deserve more than an endless version of you.",
            "They deserve peace under a law that can be enforced. Gratitude would be pleasant, but I have learned to manage without it."
          ],
          [
            "You can't prevent everything from changing.",
            "I can decide which changes are permitted to gather strength. That is what governing means."
          ],
          [
            "You intend your rule to endure.",
            "At last, a conclusion we needn't debate."
          ]
        ]
      }
    ],
    "greetings": [
      "Speak. If I must ask your business twice, make it worth the trouble.",
      "Corin, Your Majesty. I have a question.",
      "Corin. Still collecting answers you may not enjoy?",
      "I'd rather hear them than guess.",
      "A dragon at your side. You have made yourself difficult to overlook.",
      "Corin. We came together."
    ]
  },
  "Demon": {
    "name": "Demon",
    "home": "Witchmoor and Cinderhold",
    "role": "Keeper of the trials",
    "source": "14-remaining-cast.txt:57",
    "topics": [
      {
        "title": "The pleasure of a rule",
        "opening": "Why do you bother with rules?",
        "first": "Because watching someone choose is more interesting than simply devouring them. Rules give a contest its shape.",
        "replies": [
          [
            "Do you obey them?",
            "The trials' rules, yes. Otherwise your victories would be worthless and my amusement brief."
          ],
          [
            "That doesn't make you trustworthy.",
            "No. It makes this particular arrangement intelligible. Don't inflate a useful fact into a friendship."
          ],
          [
            "What do you get from it?",
            "An answer to what you can survive when survival isn't being demanded of you."
          ]
        ]
      },
      {
        "title": "An audience after death",
        "opening": "Do you ever get bored?",
        "first": "Dreadfully. Mortals imagine eternity as plenty of time. They rarely ask what happens when novelty becomes scarce.",
        "replies": [
          [
            "Is that why you watch fights?",
            "Partly. Courage remains interesting because it costs its owner something."
          ],
          [
            "That sounds cruel.",
            "It is certainly comfortable for the spectator. You are right to notice."
          ],
          [
            "What else interests you?",
            "A refusal made without fear. People so often need an excuse to leave."
          ]
        ]
      },
      {
        "title": "The door you offer",
        "opening": "What exactly does your seal open?",
        "first": "The Cinderhold trials. Lesser creatures in pairs, greater ones alone. An invitation to a fight, not an obligation to accept it.",
        "replies": [
          [
            "Can I return another time?",
            "Yes. The seal is patient. I find patience easier when it belongs to an object."
          ],
          [
            "Does it change what we already won?",
            "No. A finished struggle needn't be made unfinished to furnish another."
          ],
          [
            "Why would I accept?",
            "Because you want to test yourselves. If you don't, you've already answered my offer."
          ]
        ]
      }
    ],
    "greetings": [
      "A visitor with a pulse. How reassuringly temporary. What shall I call you?",
      "Corin. What should I call you?",
      "Corin. Still interested in choices nobody forced upon you?",
      "Some of them.",
      "A dragon. Two formidable appetites, I imagine: his for food, yours for trouble.",
      "I'm Corin. Don't confuse curiosity with agreement."
    ]
  },
  "Aurelius": {
    "name": "Aurelius",
    "home": "Beside Corin",
    "role": "Dragon companion",
    "source": "15-aurelius.txt:1",
    "topics": [
      {
        "title": "Between us / An unwanted rescue",
        "opening": "Would you always rescue me, even if I told you not to?",
        "first": "I'd want to. Then I'd have to work out whether you meant it or were trying to spare me a choice.",
        "replies": [
          [
            "What if helping me put you in danger?",
            "It often will. I'd still like to be consulted before you decide I'm too precious to help."
          ],
          [
            "I might be trying to protect you.",
            "I know. We could make a dreadful team by protecting each other out of every conversation."
          ],
          [
            "Then we should have a signal.",
            "A plain request would do. We spend enough time guessing what strangers mean."
          ]
        ]
      },
      {
        "title": "Between us / A day without words",
        "opening": "Would you mind if I didn't want to talk for a whole day?",
        "first": "I'd mind if you felt obliged to invent a reason. Quiet is quite comfortable when I know I'm welcome in it.",
        "replies": [
          [
            "You wouldn't think I was angry?",
            "I might ask once. You could answer once. An efficient arrangement, almost suspiciously mature."
          ],
          [
            "Sometimes I don't know what's wrong.",
            "Then you could say that. I won't demand a name before believing the feeling exists."
          ],
          [
            "Could you do the same for me?",
            "Yes. Though you may have to resist solving me immediately. You're enthusiastic about repairs."
          ]
        ]
      },
      {
        "title": "Between us / A terrible bargain",
        "opening": "Would you ever wish you'd chosen somebody else?",
        "first": "On a steep path, I occasionally wish I'd chosen somebody who packed less. That's as far as the fantasy goes.",
        "replies": [
          [
            "You could have anyone lighter.",
            "And miss your expression when someone says something ridiculous? A poor exchange."
          ],
          [
            "I'm serious.",
            "So am I, underneath the teasing. I don't want an improved stranger. I want us to learn together."
          ],
          [
            "I worry I'm not enough sometimes.",
            "I didn't choose an amount, Corin. I chose a person."
          ]
        ]
      },
      {
        "title": "Between us / The word rider",
        "opening": "Do you like people calling me your rider?",
        "first": "When it describes what we do, yes. When it makes them speak to you as though I'm luggage, less so.",
        "replies": [
          [
            "Should I correct them?",
            "You can introduce me. I'll handle the rest when I can."
          ],
          [
            "Does being called a companion suit you better?",
            "Usually. It leaves more room for the days we do nothing impressive."
          ],
          [
            "What should I call you?",
            "Aurelius. You've had excellent results with that one."
          ]
        ]
      },
      {
        "title": "Small wonders / A dragon's favourite smell",
        "opening": "What's the best thing you've smelled so far?",
        "first": "Supper when I hadn't realised how hungry I was. The world becomes wonderfully uncomplicated for a moment.",
        "replies": [
          [
            "That's not very mystical.",
            "I apologise. Shall I claim it was starlight and disappoint my stomach?"
          ],
          [
            "What smell do you dislike?",
            "Fear on someone who is trying to be welcoming. I wish I could make introductions easier."
          ],
          [
            "Can you smell my fear?",
            "Sometimes. I don't treat it as a confession you failed to conceal."
          ]
        ]
      },
      {
        "title": "Small wonders / A very bad hiding place",
        "opening": "Where would you hide if you were my size?",
        "first": "Somewhere everyone was too busy being important to look down. Humans overlook a remarkable amount beneath their own opinions.",
        "replies": [
          [
            "Under a table, then?",
            "An excellent centre of unnoticed political life, I suspect."
          ],
          [
            "Where do you hide at your size?",
            "With considerably less smugness. Trees help. Silence helps more."
          ],
          [
            "Would you enjoy being small?",
            "For an afternoon. I'd like to enter a room without the room becoming the subject."
          ]
        ]
      },
      {
        "title": "Small wonders / The shape of boredom",
        "opening": "Do you ever get bored waiting for me?",
        "first": "Yes. Then I inspect something, imagine supper, or judge the doorway that has taken you hostage.",
        "replies": [
          [
            "Do you want me to hurry?",
            "Sometimes. I also want you to enjoy talking to people. Two wants can occupy one dragon."
          ],
          [
            "What do you inspect?",
            "Clouds. Insects. Humans who glance at me and pretend they weren't. They're not convincing."
          ],
          [
            "You could tell me when you've had enough.",
            "I will. Before I begin naming the stones beneath my feet."
          ]
        ]
      },
      {
        "title": "Small wonders / A name for the moon",
        "opening": "Would you give the moon a different name?",
        "first": "Something less solemn. Everybody looks at it as though it's about to deliver advice. Perhaps Turnip.",
        "replies": [
          [
            "That ruins a great many poems.",
            "Some could stand the improvement."
          ],
          [
            "Why does solemn bother you?",
            "It doesn't always. I simply dislike being told what feeling a beautiful thing requires."
          ],
          [
            "I think I'll keep moon.",
            "Then we have reached a peaceful disagreement of enormous astronomical importance."
          ]
        ]
      },
      {
        "title": "On the road / A stop worth making",
        "opening": "What would make you ask us to stop somewhere?",
        "first": "Something neither of us had planned to see. I'd like our journey to contain a few things that aren't trying to improve us.",
        "replies": [
          [
            "Such as?",
            "A good view. A peculiar tree. You laughing before you've remembered to worry."
          ],
          [
            "We haven't always got time.",
            "No. But sometimes we do, and keep walking out of habit."
          ],
          [
            "Will you tell me when you notice?",
            "Yes. You're allowed to say no. I'd just like us both to notice the choice."
          ]
        ]
      },
      {
        "title": "On the road / The story we tell later",
        "opening": "How will we tell people about this journey afterward?",
        "first": "You'll begin in the middle, remember three earlier things, and accuse me of interrupting when I repair the order.",
        "replies": [
          [
            "That sounds unfairly plausible.",
            "I've been gathering evidence."
          ],
          [
            "What will you leave out?",
            "Perhaps the worst fear, at first. I'll need time before turning some moments into something listeners can carry."
          ],
          [
            "Will we tell it together?",
            "I'd like that. You notice people; I notice the things above their heads."
          ]
        ]
      },
      {
        "title": "On the road / The thing I watch",
        "opening": "What do you watch while I'm busy watching the road?",
        "first": "You, rather often. You get a particular set to your shoulders when you're determined not to ask for help.",
        "replies": [
          [
            "That must get tiresome.",
            "Only when you insist the shoulders are lying."
          ],
          [
            "What should I do differently?",
            "Ask before the problem becomes proof of your character. Sometimes a heavy bag is simply heavy."
          ],
          [
            "You can ask me too.",
            "I intend to. Try not to look so delighted at being useful that I feel obliged to need rescuing."
          ]
        ]
      },
      {
        "title": "On the road / An ordinary tomorrow",
        "opening": "What would a good ordinary day look like for us?",
        "first": "Enough food. No pursuit. Somewhere you could walk without keeping a hand near your sword. I'd like to learn what we argue about then.",
        "replies": [
          [
            "Probably whose turn it is to choose the route.",
            "Good. A disagreement with a tolerable worst outcome."
          ],
          [
            "Would you miss the excitement?",
            "I suspect excitement would miss us more than we'd miss it."
          ],
          [
            "I want that day.",
            "So do I. We can want it without pretending it's already here."
          ]
        ]
      },
      {
        "title": "What survives / A dragon's witness",
        "opening": "Whose memories do you trust most?",
        "first": "The ones that admit what they didn't see. A memory with no gaps makes me suspicious; living is rarely so well arranged.",
        "replies": [
          [
            "Even your inherited memories?",
            "Especially those. A powerful feeling can make a fragment seem complete."
          ],
          [
            "Does that make knowing the past impossible?",
            "No. It makes comparing accounts necessary. Certainty shouldn't arrive simply because a voice sounds ancient."
          ],
          [
            "What can you be certain of?",
            "That I'm here with you. I begin there when the older voices crowd too close."
          ]
        ]
      },
      {
        "title": "What survives / A king without an audience",
        "opening": "What do you think Halvard is like when nobody's watching?",
        "first": "I don't know. I'd rather not invent a private sadness that excuses what he does in public.",
        "replies": [
          [
            "I wasn't trying to excuse him.",
            "I know. Curiosity is allowed. I only want to keep a guess from becoming an explanation we trust."
          ],
          [
            "Could he love his dragon?",
            "He might. Loving someone doesn't prevent a person from being cruel to others."
          ],
          [
            "Does that make him harder to fight?",
            "It makes him harder to reduce to a story. We still have to stop what he does."
          ]
        ]
      },
      {
        "title": "What survives / The unwritten names",
        "opening": "Do dragons remember people the histories forgot?",
        "first": "Sometimes a face without a name, or a hand held out with food. Such small things can remain after grander matters blur.",
        "replies": [
          [
            "I'd want to find their names.",
            "So would I. We may never manage it, but wanting matters to how we listen."
          ],
          [
            "Were they riders?",
            "Not all. Dragons met people who never climbed onto their backs."
          ],
          [
            "What do you remember most clearly?",
            "The feeling of being welcomed without being claimed. I understand it better now."
          ]
        ]
      },
      {
        "title": "What survives / A future with no prophecy",
        "opening": "What if there's no grand purpose behind us meeting?",
        "first": "Then we met, and it changed our lives. That seems substantial without somebody having written it in advance.",
        "replies": [
          [
            "Doesn't destiny make it less frightening?",
            "Perhaps. It can also make people very comfortable asking you to suffer."
          ],
          [
            "I'd like to know we matter.",
            "To Nan, you already did. To me, you do. We needn't wait for the realm to vote."
          ],
          [
            "So we decide what comes next?",
            "As far as we can. The world will interrupt, but it doesn't get every word."
          ]
        ]
      },
      {
        "title": "Just us / What I haven't told Nan",
        "opening": "How do I tell Nan about the parts that frightened me?",
        "first": "Begin with one true thing. You needn't empty the whole journey into her lap before she can hold your hand.",
        "replies": [
          [
            "She'll worry more.",
            "She already worries. Truth might give the worry a shape instead of leaving it everywhere."
          ],
          [
            "What if I cry?",
            "Then she'll have her grandson in front of her instead of a brave report. I doubt she'll consider that a failure."
          ],
          [
            "Will you stay nearby?",
            "Of course. I can be quiet company when it matters."
          ]
        ]
      },
      {
        "title": "Just us / The joke worth keeping",
        "opening": "What's the funniest thing about travelling with me?",
        "first": "The way you apologise to things you bump into. A tree received a very sincere explanation yesterday.",
        "replies": [
          [
            "It startled me.",
            "You startled it too, apparently. I'm glad you settled matters politely."
          ],
          [
            "You could have warned me.",
            "I thought you'd seen it. It had made considerable effort to be a tree."
          ],
          [
            "You're never letting that go, are you?",
            "Eventually. I expect you'll provide replacement material before then."
          ]
        ]
      }
    ],
    "greetings": [
      "You're forming a question. I can tell by what your eyebrows are doing.",
      "I didn't know they were involved.",
      "Shall we talk before one of us decides the silence means something?",
      "Probably wise.",
      "Corin, you have my attention. You needn't clear your throat inside your own head.",
      "I wasn't certain the first attempt worked."
    ]
  }
};
