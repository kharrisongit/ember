/* Four distinct residents per town. Art, identity and placement keys remain stable. */
const REGIONAL_VILLAGERS=[
  {
    "id": "tilda",
    "name": "Tilda",
    "town": "Millwood",
    "home": [
      536,
      6784
    ],
    "lines": [
      "Wool remembers a hurried hand. Pull too hard and you spend the afternoon untangling it.",
      "I leave the bright scraps for the birds. Every spring, someone finds a nest wearing my best yarn."
    ]
  },
  {
    "id": "emmet",
    "name": "Emmet",
    "town": "Millwood",
    "home": [
      728,
      7024
    ],
    "lines": [
      "The apples on the sunny side always ripen first. The children know exactly which side that is.",
      "I planted that tree when I was small enough to hide behind its stake. Now it shades the whole cart."
    ]
  },
  {
    "id": "lark",
    "name": "Lark",
    "town": "Millwood",
    "home": [
      248,
      7088
    ],
    "lines": [
      "The bread is cooling. If you pinch a corner, at least make it a tidy one.",
      "A good loaf should crackle when it comes out. I listen before I decide whether to be proud of it."
    ]
  },
  {
    "id": "hal",
    "name": "Hal",
    "town": "Millwood",
    "home": [
      728,
      6736
    ],
    "lines": [
      "I still wake when the mill starts. Forty years of listening does that to a man.",
      "People ask what I do now I have retired. Mostly I stop myself telling the miller how to do his job."
    ]
  },
  {
    "id": "elric",
    "name": "Elric",
    "town": "Thornwell",
    "home": [
      3880,
      1648
    ],
    "lines": [
      "Fresh ink, a clean page, and no one leaning on my elbow. That is all I ask.",
      "Half the town cannot read its own shopping lists. My finest work is usually deciphering onions."
    ]
  },
  {
    "id": "mara",
    "name": "Mara",
    "town": "Thornwell",
    "home": [
      4600,
      1904
    ],
    "lines": [
      "The oven has two temperatures: not yet and you've left it too long.",
      "I know who is coming by the way they knock. The hungry ones use both hands."
    ]
  },
  {
    "id": "kit",
    "name": "Kit",
    "town": "Thornwell",
    "home": [
      4008,
      2240
    ],
    "lines": [
      "If a letter says urgent, it generally means someone forgot to send it yesterday.",
      "I know every loose paving stone between the school and the inn. My knees know them better."
    ]
  },
  {
    "id": "mabel",
    "name": "Mabel",
    "town": "Thornwell",
    "home": [
      4872,
      1472
    ],
    "lines": [
      "Hold the cloth to the light. Good weaving has nothing to hide.",
      "A cloak ought to last longer than the weather it was bought for. Mine usually do."
    ]
  },
  {
    "id": "garran",
    "name": "Garran",
    "town": "Forgewick",
    "home": [
      11368,
      3056
    ],
    "lines": [
      "Wait for the metal to tell you it is ready. Hammering cold iron only makes you tired.",
      "I can hear Dunstan's hammer from here. He has a rhythm like a man who knows exactly where supper is coming from."
    ]
  },
  {
    "id": "nessa",
    "name": "Nessa",
    "town": "Forgewick",
    "home": [
      12248,
      3056
    ],
    "lines": [
      "Glass looks still until you work with it. Then you discover it has opinions.",
      "The blue comes from a pinch of mineral powder. Too much and it looks like someone bottled a bruise."
    ]
  },
  {
    "id": "kerr",
    "name": "Kerr",
    "town": "Forgewick",
    "home": [
      11896,
      3632
    ],
    "lines": [
      "Coal dust gets everywhere. I have washed my ears twice and still look as though I borrowed them from a chimney.",
      "I leave the clean shirt at home. It deserves one peaceful day."
    ]
  },
  {
    "id": "brigid",
    "name": "Brigid",
    "town": "Forgewick",
    "home": [
      12600,
      3600
    ],
    "lines": [
      "A wall should look quiet. All the clever work is where you cannot see it.",
      "We fit the stone before we mix the mortar. There is no sense asking wet sand to mend poor judgment."
    ]
  },
  {
    "id": "farid",
    "name": "Farid",
    "town": "Sandspire",
    "home": [
      24200,
      1472
    ],
    "lines": [
      "Smell the spice before you buy it. A good trader is happy to wait.",
      "Keep your jars in the shade. Sunlight is generous with warmth and rather careless with flavour."
    ]
  },
  {
    "id": "samira",
    "name": "Samira",
    "town": "Sandspire",
    "home": [
      24360,
      1696
    ],
    "lines": [
      "The weave is loose enough for the breeze and tight enough to keep the sand out. That takes practice.",
      "I learned this border from my mother. Her mother called it old-fashioned, too."
    ]
  },
  {
    "id": "leila",
    "name": "Leila",
    "town": "Sandspire",
    "home": [
      24168,
      1776
    ],
    "lines": [
      "Water, grain, spare rope. I count them twice before a caravan leaves.",
      "Everyone remembers the camels. Someone has to remember what the camels are carrying."
    ]
  },
  {
    "id": "zaid",
    "name": "Zaid",
    "town": "Sandspire",
    "home": [
      24472,
      1456
    ],
    "lines": [
      "Drink before you feel thirsty, and give your travelling companion a turn in the shade.",
      "A cool jar is a small kindness. Out here, small kindnesses travel a long way."
    ]
  },
  {
    "id": "neri",
    "name": "Neri",
    "town": "Coralmere",
    "home": [
      32200,
      8208
    ],
    "lines": [
      "A torn net gets mended from the sound edge inward. Start with something you can trust.",
      "The sea returns all sorts of things. I would settle for the knife I dropped last autumn."
    ]
  },
  {
    "id": "finnick",
    "name": "Finnick",
    "town": "Coralmere",
    "home": [
      32456,
      8240
    ],
    "lines": [
      "If you hear someone shout catch, make sure they are not throwing a fish before you open your arms.",
      "The harbor bell is my clock. It is louder than the one I used to sleep through."
    ]
  },
  {
    "id": "maris",
    "name": "Maris",
    "town": "Coralmere",
    "home": [
      32744,
      8240
    ],
    "lines": [
      "Today's soup depends on what the boats bring in. That keeps the recipe honest.",
      "Salt goes in a pinch at a time. The sea has done quite enough seasoning already."
    ]
  },
  {
    "id": "perrin",
    "name": "Perrin",
    "town": "Coralmere",
    "home": [
      32616,
      8480
    ],
    "lines": [
      "Listen to a boat at its mooring. A loose plank will complain long before it gives way.",
      "I made my first oar too heavy. Learned more rowing home than I did making it."
    ]
  },
  {
    "id": "solveig",
    "name": "Solveig",
    "town": "Hollybeck",
    "home": [
      43064,
      3184
    ],
    "lines": [
      "Keep the spare mittens inside your coat. Snow finds its way into every pocket eventually.",
      "I knit while the kettle heats. Anyone who says that is a short time has never used my stove."
    ]
  },
  {
    "id": "nils",
    "name": "Nils",
    "town": "Hollybeck",
    "home": [
      43320,
      3264
    ],
    "lines": [
      "I tread this lane before the snow hardens. Easier than persuading a cart through it tomorrow.",
      "A good coat keeps the warmth in. Good company gives you a reason to go outside."
    ]
  },
  {
    "id": "freya",
    "name": "Freya",
    "town": "Hollybeck",
    "home": [
      43096,
      3472
    ],
    "lines": [
      "The red scarf makes it harder to lose me in the snow. My brother considers that a disadvantage.",
      "I like the quiet after fresh snow. Even the roofs seem to listen."
    ]
  },
  {
    "id": "oskar",
    "name": "Oskar",
    "town": "Hollybeck",
    "home": [
      43448,
      3568
    ],
    "lines": [
      "Tap the snow off your boots before you go in. A puddle has never improved a hearth.",
      "The wind has changed. I know because my moustache has stopped pointing home."
    ]
  }
];
async function prepareRegionalVillagerArt(){
  if(SPR.regional_tilda_idle_d)return;
  for(let start=0;start<REGIONAL_VILLAGERS.length;start+=4)await Promise.all(REGIONAL_VILLAGERS.slice(start,start+4).map(async person=>{
    const image=await loadStartupImage('assets/sprites/regional/'+person.id+'.png?v=20260930-complete-feet');
    for(const [action,baseRow,frames]of [['idle',0,4],['walk',4,6]])for(const [row,dir]of ['d','u','e','w'].entries()){
      const key='regional_'+person.id+'_'+action+'_'+dir,strip=document.createElement('canvas');
      strip.width=frames*64;strip.height=64;strip.spriteScale=2;strip.pixelLocked=true;
      const g=strip.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,(baseRow+row)*64,frames*64,64,0,0,frames*64,64);
      animalSheets[key]=strip;SPR[key]=[0,0,32,32,frames,key];
    }
  }));
}
function prepareRegionalVillagers(map,id){
  if(id!=='world')return;
  for(const [index,person]of REGIONAL_VILLAGERS.entries()){
    const editKey='npc:regional:'+person.id;if(map.npcs.some(n=>n.editKey===editKey))continue;
    map.npcs.push({n:person.name,editKey,x:person.home[0],y:person.home[1],packSpr:'regional_'+person.id,packDirections:true,packWalk:true,
      f:'d',kf:'d',stationary:false,patrol:true,patrolSpeed:22+(index%4)*2,patrolRest:3200+(index%5)*380,routeSeed:index,idleFps:4,
      loc:person.town,noTalk:false,d:[person.name+': '+person.lines[0]],d2:[person.name+': '+person.lines[1]],
      dd:[person.name+': '+person.lines[0]],dd2:[person.name+': '+person.lines[1]]});
  }
}
function settleRegionalVillagers(){
  if(MAPID!=='world')return;
  for(const person of REGIONAL_VILLAGERS){
    const key='npc:regional:'+person.id,source=MD.npcs.find(n=>n.editKey===key),n=npcs.find(n=>n.editKey===key);
    if(!n||!source||source.regionalPlaced||n.editorDeleted)continue;
    // Later published editor moves belong to the user, including intentional staging.
    if(n.x!==person.home[0]||n.y!==person.home[1]){source.regionalPlaced=true;continue;}
    const town=features.find(f=>f.kind==='area'&&(f.label||f.place)===person.town);
    // Leave room for a visible north/south stroll, not just a clear standing spot.
    const canStroll=(x,y)=>[1,-1].some(dir=>[4,8,12,16,20,24].every(d=>canNpcStand(x,y+dir*d,n)));
    const clear=(x,y)=>x>(town.x0+3)*TS&&x<(town.x1-3)*TS&&y>(town.y0+3)*TS&&y<(town.y1-3)*TS&&canNpcStand(x,y,n)&&
      canStroll(x,y)&&
      npcs.every(other=>other===n||other.editorDeleted||Math.hypot(x-other.x,y-other.y)>48)&&
      (MD.doors||[]).every(d=>Math.hypot(x-(d.x+.5)*TS,y-(d.y+1)*TS)>48);
    let spot=clear(n.x,n.y)?[n.x,n.y]:null;
    for(let radius=16;!spot&&radius<=256;radius+=16)for(let dy=-radius;dy<=radius&&!spot;dy+=16)for(let dx=-radius;dx<=radius;dx+=16){
      if(Math.abs(dx)!==radius&&Math.abs(dy)!==radius)continue;
      if(clear(person.home[0]+dx,person.home[1]+dy)){spot=[person.home[0]+dx,person.home[1]+dy];break;}
    }
    if(spot){[n.x,n.y]=spot;[source.x,source.y]=spot;n.px=n.x;n.py=n.y;n.route=null;n.goto=null;source.regionalPlaced=true;}
  }
}
