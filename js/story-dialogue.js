/* Story voices are applied after the shared NPC dialogue pass. */
const MILLWOOD_STORY_DIALOGUE={
  "Hettie": {
    "d": [
      "Hettie: Corin, mind your toes. They have four feet apiece and no regard for where yours happen to be.",
      "Corin: I can see who has right of way."
    ],
    "d2": [
      "Hettie: Six eggs for Maddock. Coop behind the mill. The basket will spare you trying to grow a third hand."
    ],
    "dm": [
      "Hettie: That's a serious bit of steel, Corin.",
      "Corin: Maddock thought I should take it.",
      "Hettie: Then listen to the rest of what he told you as well."
    ],
    "dd": [
      "Hettie: Well. I knew something had happened, but I had not allowed for wings.",
      "Corin: Neither had I.",
      "Hettie: Keep him clear of the cows until they have made up their minds."
    ],
    "dd2": [
      "Hettie: You look as though you are about to apologise for leaving the farm work.",
      "Corin: Was it that obvious?",
      "Hettie: Go on with you. Gwil and I can manage a few muddy mornings."
    ],
    "dragonNear": [
      "Hettie: Those hens are not his dinner. Tell him before he starts thinking hopefully."
    ],
    "dragonRumor": [
      "Hettie: Someone asked me about a rider from Millwood. I asked what business it was of theirs.",
      "Corin: What did they say?",
      "Hettie: Not enough to earn another answer."
    ],
    "dragonRumor2": [
      "Hettie: Nan has been listening for your steps. Go and give her the sound itself."
    ],
    "dv": [
      "Hettie: Come into the light, lad. I want to see for myself.",
      "Corin: All the important bits are here.",
      "Hettie: Good. I was fond of every one of them."
    ],
    "dv2": [
      "Hettie: I saw travellers go past without looking over their shoulders. Took me a moment to work out what was different."
    ]
  },
  "Elder Maddock": {
    "d": [
      "Maddock: Corin. Come and put a younger pair of eyes on this map. The ink seems to be retreating from mine."
    ],
    "d2": [
      "Maddock: Nan once walked to Thornwell and back with a sack of flour.",
      "Corin: She never told me that.",
      "Maddock: Ask her. I expect she will add that I complained about carrying the smaller sack."
    ],
    "dm": [
      "Maddock: A sword is not a reason to keep going when your sense tells you to stop. Turn back if the road demands more than you can give it."
    ],
    "dd": [
      "Maddock: Forgewick is east of Thornwell. Take the road through town, then look for the rider temple south of Forgewick.",
      "Maddock: Halvard is at Cinderhold. What waits in the temples may give you a chance to reach him."
    ],
    "dd2": [
      "Maddock: I find myself listening for wings. I had not realised how much I missed doing that."
    ],
    "dragonNear": [
      "Maddock: He keeps an eye on you even while he looks elsewhere. You will have to grow used to being cared for."
    ],
    "dragonRumor": [
      "Maddock: Keep Forgewick in mind, east of Thornwell. Its temple is your first step toward being ready for Cinderhold.",
      "Maddock: You need not carry the whole journey in your head at once."
    ],
    "dragonRumor2": [
      "Maddock: Have you been sleeping? I ask because brave young people are tiresome about admitting they need a bed."
    ],
    "dv": [
      "Maddock: For years I wondered what I should have done. You gave me something better to wonder about: what we might do now."
    ],
    "dv2": [
      "Maddock: Sit down, Corin. Tell me a part of the journey nobody else will think to ask about."
    ]
  },
  "Nan Ferrow": {
    "d": [
      "Nan Ferrow: Hettie is outside with the cows, love. See what she needs before you disappear into a book."
    ],
    "d2": [
      "Nan Ferrow: Did you eat enough? That was a question, Corin, not an invitation to look innocent."
    ],
    "dm": [
      "Nan Ferrow: Maddock lent you his sword? Then I hope he lent you some sense to go with it."
    ],
    "dd": [
      "Nan Ferrow: I am trying to look at the dragon and look at you at the same time. One of you must stand still."
    ],
    "dd2": [
      "Nan Ferrow: Come here a moment. There is something on your sleeve.",
      "Corin: You could have asked for a hug.",
      "Nan Ferrow: I could. Hold still anyway."
    ],
    "dragonNear": [
      "Nan Ferrow: He can rest nearby, but I am not widening the door. Your grandfather hung that one properly."
    ],
    "dragonRumor": [
      "Nan Ferrow: I have heard several accounts of your journey. I should like the one in which you tell me how you actually are."
    ],
    "dragonRumor2": [
      "Nan Ferrow: You can be quiet here, love. Nobody needs you to be impressive at the kitchen table."
    ],
    "dv": [
      "Nan Ferrow: There you are. Come here. We can talk about everything else when I have held you for a moment."
    ],
    "dv2": [
      "Nan Ferrow: I keep making enough for a visit. It is a much happier habit now I know you can come."
    ]
  }
};
function applyMillwoodStoryDialogue(){
  for(const map of Object.values(W.maps))for(const npc of map.npcs||[]){
    const lines=MILLWOOD_STORY_DIALOGUE[npc.n];
    if(lines)for(const [field,words] of Object.entries(lines))npc[field]=words.slice();
  }
}
