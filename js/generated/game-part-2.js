function registerDockOriginalSprites(){
  let y=1034240;DOCK_ORIGINAL_ASSETS.forEach(a=>{a.atlasY=y;SPR[a.name]=[0,y,a.w,a.h,a.frames];y+=Math.ceil(a.h/1024)*1024;});
  const wall=SPR.wall78_sheet;for(const [id,x,y,sx,sy]of WALL78_PIECES)SPR[`wall78_${id}_${x}_${y}`]=[sx,wall[1]+sy,16,16,1];
}
async function loadDockOriginalAssets(){
  // Startup decodes images before inflateWorld: assign virtual pages before registering them.
  registerDockOriginalSprites();
  for(const [i,a]of DOCK_ORIGINAL_ASSETS.entries()){
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=a.src;});
    let sheet=img;
    if(a.cellW){
      sheet=document.createElement('canvas');sheet.width=a.w*a.frames;sheet.height=a.h;
      const g=sheet.getContext('2d');
      for(let f=0;f<a.frames;f++)g.drawImage(img,f*a.cellW+a.cropX,a.cropY,a.w,a.h,f*a.w,0,a.w,a.h);
    }
    registerAtlasPage({img:sheet,x:0,y:a.atlasY,w:a.w*a.frames,h:a.h});
  }
}
function registerDesertNpcSprites() {
  for(let i=1;i<=4;i++)for(const [row,suffix]of ['idle','sidle','uidle'].entries())
    SPR['npc_desert'+i+'_'+suffix]=[0,1030144+(i-1)*1024+row*21,16,21,6];
  for (const [dir, row] of [["d",0],["s",1],["u",2]]) {
    SPR["npc_pharaoh_" + dir] = [0,1026048 + (row+3)*24,32,24,6];
    SPR["npc_pharaoh_" + ({d:"idle",s:"sidle",u:"uidle"})[dir]] = [0,1026048 + row*24,32,24,6];
  }
  for(let i=1;i<=3;i++) SPR["desert_trader"+i]=[0,1026048+i*1024,32,24,6];
}
async function loadDesertNpcAssets() {
  for(let i=0;i<DESERT_IDLE_ASSETS.length;i++){
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=DESERT_IDLE_ASSETS[i];});
    registerAtlasPage({img,x:0,y:1030144+i*1024,w:96,h:63});
  }
  for(let i=0;i<DESERT_NPC_ASSETS.length;i++) {
    const img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=DESERT_NPC_ASSETS[i];});
    const c=document.createElement("canvas");c.width=192;c.height=i===0?144:24;
    const g=c.getContext("2d");
    for(let row=0;row<(i===0?6:1);row++)g.drawImage(img,0,row*32,192,24,0,row*24,192,24);
    registerAtlasPage({img:c,x:0,y:1026048+i*1024,w:c.width,h:c.height});
  }
}
function dressSandspire() {
  const looks={Nazim:"desert1",Halima:"desert2",Tarek:"desert3",Suhaila:"desert4",
    Idris:"pharaoh",Rashida:"desert_trader2",Bilal:"desert_trader1",Jamila:"desert_trader3",
    Petra:"desert4",Raff:"desert1",Suri:"desert2",Tavin:"desert3",Una:"desert4",
    Vela:"desert2",Wystan:"desert1",Rania:"desert3",Latif:"pharaoh"};
  for(const mid of ["world",...Array.from({length:9},(_,i)=>"house"+(33+i))]) {
    for(const n of W.maps[mid]?.npcs||[]) {
      const look=looks[n.n];if(!look)continue;
      n.lookId=look;n.body=undefined;n.tone=0;n.desertNative=true;
      n.packDirections=false;n.packWalk=false;
      n.stationary=true;n.patrol=undefined;n.idleFrame=undefined;
      if(mid==='world'&&(n.n==='Tarek'||n.n==='Suhaila')){
        n.stationary=false;
        // Short routes beside their original spots; all other townsfolk rest.
        n.patrol=[n.x/16-.5,n.y/16-1,n.x/16+1.5,n.y/16-1];
        n.patrolRest=3000;
      }
      if(look.startsWith("desert_trader")){n.packSpr=look;n.stationary=true;}
      else {n.packSpr=undefined;n.sk=look;}
    }
  }
}
/* Authored per-character responses: no shared merchant or quest pool. */
const NPC_VOICES={"Bryn":["Keep those wings clear of the rowan baskets, Corin.","I counted the hens when I heard about your new companion.","Does it eat windfalls, or should I hide the whole orchard?","Tonight we press the rowan without saving the best for a royal collector."],"Hettie":["It watches the doorway until you come back. I know the feeling.","You could have mentioned the dragon before everyone else did.","Promise me your adventures include coming home for supper.","There you are. The hero can carry his own dishes tonight."],"Gwil":["Those claws could split a trunk. I would still want my axe.","A dragon in the north wood explains the silence of the birds.","Ask your winged friend to leave the oldest trees standing.","The woods outlasted Halvard. I intend to do the same."],"Odo":["If that tail hits my line, the dragon owes me a fish.","They said you took to the sky. I am keeping to my bank.","A fish for a dragon is still a fish out of my catch.","Kings come and go. That large fish is still in there."],"King Halvard":["You mistake an animal's obedience for loyalty.","A boy playing rider cannot undo what I built.","Every wing over this country flies beneath my crown.","You have broken my throne, not answered what comes after it."],"Serjeant Bram":["Keep its claws beyond my boots. That is an order.","A dragon does not excuse you from answering a serjeant.","I have no drill for this situation, and you will not repeat that.","Without the king's command, I must decide where I stand."],"Doran":["So fifty years of searching ended at your doorstep.","I owe somebody an apology about dragons not existing.","Does yours listen any better than the men I march with?","I have spent long enough looking over my shoulder."],"Tolan":["There is no instruction about letting a dragon through.","Your name has made the road reports considerably longer.","Do not ask me to search its saddlebags.","An open road. I had forgotten that could be the whole order."],"Elder Maddock":["Easy with the wings. The youngster is still learning its size.","They call you a rider now. Remember the boy who carried the egg.","Trust grows more slowly than wings, Corin. Give it time.","I kept that blade for a better day. You brought one."],"Pip":["Its footsteps run through every cap in the hollow.","The ground told us something large was following you.","I can tell its tread from yours now. Yours hurries.","Tonight the caps will carry singing instead of warnings."],"Mycella":["Yes. That is how their wings caught the light before.","I wondered whether I would live to hear of another rider.","Do not make it a weapon before you let it be itself.","There is room for old memories to become hopes again."],"Bolete":["Mind the young shoots under that heavy foot.","Your dragon could cross the lane even when autumn closes it.","Would it notice if the road disappeared beneath it?","Perhaps someone will help us keep the lane open this year."],"Truffle":["That is the heartbeat we felt through the north field.","The creature that fell did not fall without leaving something behind.","Tell it the hollow remembers the sound of its beginning.","The ground is quieter. Not empty, just no longer afraid."],"Chanter":["Do dragons know which mushrooms are poisonous? Test nothing here.","I hope somebody warned your companion about the pale caps.","If it starts sneezing spores, keep it away from my supper.","A celebration is no excuse to eat the wrong mushrooms."],"Morel":["Stay after sunset. I want to see the glow on those scales.","A flying guest could see our whole hollow lit at once.","There is a dark field north of us where its wings have room.","We will light the hollow for you, even if you cannot stay."],"Orin":["Your father would have pretended not to be astonished.","First his walk, now a dragon. You are becoming difficult to overlook.","Sit a moment. Let the creature rest as well as you.","I wish your father could pull up a chair for this story."],"Mella":["Its shadow sent the bees straight into the highest blossom.","The hives were restless the day the dragon rumours arrived.","No fire near my bees. Smoke is quite enough excitement.","The bees have no opinion of kings. I envy them that."],"Sennet":["I cook for hungry travellers, not whatever that appetite costs.","I had just enough stew before people started bringing dragons.","Would it consider a bucket a respectable bowl?","For once I am cooking for a feast instead of a departure."],"Calder":["Your companion will need more room than one campsite.","Word is your travelling party has outgrown ordinary tents.","I can offer a fire, but it seems you brought your own.","People are asking about the eastern road again. Paying people."],"Weft":["Now there is a guest who could fill my spare ground.","Perhaps a dragon will attract business. Or frighten off the rest.","I will not charge for its shadow, provided it stays off the fire.","Both camps may have customers this autumn. Imagine that."],"Dorrick":["Could it smell what is behind a stone door?","If you take the dragon below, mind the ceiling before the monsters.","I still do not like that door in the deep levels.","I might return to the lower seam with a steadier hand now."],"Hask":["At last, a visitor who makes the doorway look small.","A young rider is better news than another empty chair.","Does it grow every time you leave town, or am I shrinking?","Perhaps next spring this place will need a longer bench."],"Prue":["My father would have wanted to carve those scales in stone.","They say your dragon shines like fresh-cut rock.","A stone portrait would be easier if it stopped moving.","I am thinking of a memorial my father would have liked."],"Toft":["If its breath lights the shaft, we might keep a lamp burning.","A dragon sounds useful until you picture one in a narrow gallery.","Carry a spare light even if your friend can make fire.","I want to hear miners laughing underground again."],"Ada":["I will not put the dragon in charge of roasting the onions.","Your mother must be thrilled about another mouth to feed.","Marrow is for the pot, not for feeding a passing winged beast.","I made enough for a celebration. My husband can complain tomorrow."],"Linnet":["I will need a wider column if the mill starts feeding dragons.","The dragon rumour has been entered in the unofficial tally.","I count sacks, Corin. Do not make me start counting scales.","I have crossed out the royal levy. Best arithmetic I ever did."],"Garrow":["That would have been something to see from my previous bench.","At my age, a dragon is a good reason not to move indoors.","Let it come closer. My eyes are older than my opinions.","I sat through a reign. I can sit through its ending."],"Wren":["That heartbeat and yours keep nearly the same time now.","My little charm chose an interesting pair of hearts.","Care for your companion before you spend its strength for yours.","I can finally gather herbs without listening for soldiers."],"Bevan":["Do not ask for a bridle. I would need half the town's iron.","If riders return, somebody will have to make their fittings.","Those claws make a convincing argument against iron shoes.","I would like to hammer something that is not ordered by the crown."],"Marek":["One dragon could carry what takes my customers three carts.","Perhaps the next thing going north will be you, not another wagon.","You can see what is in those carts from up there.","The carts stopped for once. Their drivers wanted to share the news."],"Isolde":["Keep its weight off the mine supports, however brave it is.","The men talked about your dragon through an entire shift.","A rider cannot make a frightened miner forget the dark.","The seam has not changed, but the men came to work singing."],"Nazim":["Its shadow is large enough to give the cistern shade.","A flying traveller still needs water when it lands.","Let it drink slowly. We share this well with the whole town.","My father dug water for free people. Today that means something again."],"Halima":["Even a dragon will carry sand out of Sandspire.","The spice caravans disagree about the colour of your companion.","If its scales itch, blame the dunes, not my spices.","I kept my finest spice sealed. Tonight I will open it."],"Tarek":["That camel is considering biting your dragon. Move along gently.","Your companion has replaced camels as the traders' favourite complaint.","Flying does not teach a creature road manners.","A caravan arrived without a royal escort demanding its cut."],"Suhaila":["My daughter wants to weave that colour. Please keep it still.","The loom has produced nothing but wing patterns since your news.","The well is cooler at dawn, for people and dragons both.","I am weaving a cloth without the king's colours in it."],"Idris":["My sons wanted ships. Perhaps I should have offered them wings.","A dragon rider might persuade my boys that trade is not dull.","You can visit the coast and still come back to Sandspire.","I wrote to all three sons. This time I asked them to come home."],"Rashida":["Look how the sun breaks across those scales. Better than glass.","A dragon makes my little flame seem rather modest.","Keep that grip steady. Gifts are not a substitute for practice.","I have put clear glass in the window where the tax notice hung."],"Bilal":["The goats have met something more stubborn than themselves.","Every missing goat is being blamed on your dragon. I know better.","If they run from it, stand still. Chasing makes a game of it.","The goats do not know we are celebrating, but they have eaten the ribbons."],"Bregga":["Let it warm the air, but spare the living trees.","A creature of flame could make this winter feel shorter.","Our forest gives slowly. Ask your dragon to tread softly.","The forest will hear axes for hearthwood, not royal wagons."],"Torvald":["A dragon can light a passage, but not every corner of it.","Your wings will not help in the two galleries below the third.","Keep the lantern stone. Cold light can reach where flame cannot.","Perhaps we can finally learn what the abandoned galleries were hiding."],"Ingrid":["Bring it away from the graves before the light goes.","People say you travel with fire. I hope it keeps you warm.","Do not mistake a bright companion for a safe dusk.","I can walk the west road thinking of the living again."],"Sigrun":["I have broth, not a cauldron big enough for that friend.","Five houses, forty graves, and now one dragon. A peculiar tally.","It can have the warm side of the yard if it keeps the chimney clear.","For once I count guests instead of graves."],"Hakon":["Those wings could shake the snow out of a whole stand of trees.","If a dragon needs a shelter, I hope you have the timber.","The south camp has room beside its fire for a tired rider.","I will cut timber for roofs before I cut another royal beam."],"Maren":["Keep the tail out of my nets. They have enough holes.","I suppose the ferry has lost its most interesting passenger.","Wings will take you to the witch faster, not make her friendlier.","I am mending a sail for a journey I actually want to take."],"Doryn":["The gulls have found a second reason to abandon this shore.","I heard wings and expected a storm. Then they told me about you.","Watch the weather even from a dragon's back.","The harbour bells sounded like warnings until someone started cheering."],"Sella":["Do not look at my stew like that. It is not a dragon portion.","My husband says he saw your dragon beyond the point.","Perhaps your companion can remind him where the shore is.","He came back before dark to tell me the king had fallen."],"Orrin":["Those wings make my boat repairs look rather unnecessary.","There is no timber bill for a dragon, I suppose.","If you land on a boat, it becomes a repair, not a boat.","I have orders for fishing boats again instead of patrol craft."],"The Shroom King":["Your young wings are welcome beneath our ancient caps.","The deep ring has heard that another rider walks above it.","Feed the bond as you feed the creature, small one.","Our ring will remember a crown broken beyond the forest."],"Berta":["Keep that curious nose away from my open bottles.","I have been asked for dragon medicine three times today.","The consecration salt is for the ground, not its dinner.","I can stock healing before I stock protection for a change."],"Ovid":["Do not let it sniff the madness dust. I mean that.","A dragon makes an excellent advertisement for buying supplies early.","Fifty gold for the dust. Keep the lid tightly closed.","I am taking the royal surcharge off my own accounts as well."],"Jamila":["Its scales are warm enough to spoil a bottle left beside them.","I have set aside extra provisions since the rider rumours began.","A potion for you and a proper meal for it. Different needs.","The caravans brought bottles without bringing a warning this time."],"Nerissa":["I would rather sell fish than have it take them off the stall.","A rider by the sea ought to know where to buy fresh fish.","Do not ring a bell stake here. The market is busy enough.","The first catch after the news tasted of a new season."],"Astrid":["If that great creature falls, do not leave it in the snow.","I have stocked food for the companion everyone keeps describing.","Markers recover what you lost. They cannot replace careful travelling.","I can put away the shutters before the patrol passes now."],"Merrin":["Its wings would shade this whole table. A useful companion.","The view of the road has become considerably more interesting.","I chose this seat for the breeze, not dragon breath.","From this table I watched strangers embrace when the news arrived."],"Asta":["Please keep its paws off my notes. They are in order for once.","I tried sketching the dragon from descriptions. Nobody agreed.","I need one quiet moment to draw the shape of its eye.","My notes now have a page I never thought I would write."],"Colm":["If it is hungry, it can find its own supper.","I was eating when they announced the dragon. I finished first.","A long journey begins with finishing what is on your plate.","I saved the last bite to toast you with. Then I ate it."],"Ember":["Dunstan will want to examine those claws instead of my work.","A dragon rider gets a new blade; an apprentice gets more sweeping.","I wonder whether dragon fire heats iron evenly.","The forge sounds happier without an officer counting every strike."],"Tessa":["The wingbeats almost keep time. Almost.","I have a melody for the rider, but no ending yet.","Does your companion prefer a flute or a little silence?","Now I know how that melody ends. With somebody coming home."],"Rowan the Hunter":["Bramble is trying very hard not to look impressed.","My dog followed you, and now the whole town follows your story.","Keep room in your travels for an animal to stop and sniff.","The woods might belong to hunters again, not frightened patrols."],"Bramble":["Bramble sniffs a claw, then sneezes and wags his tail.","Bramble lifts his ears at the distant beat of wings.","Bramble circles once and settles where he can watch both companions.","Bramble bounds toward Corin with a muddy, delighted bark."],"Bren":["The librarian would give a shelf for a close look at those scales.","I was about to ask Elowen whether the dragon story was possible.","Take your questions to the school; I only collect them.","I have stopped hiding the books with the old rider emblems."],"Della":["The witch might envy a creature that carries its own fire.","I heard the dragon tale before the kettle had boiled.","A little knowledge is safer than a great deal of guessing.","I can repeat what the librarian told me without closing the door first."],"Ewan":["There is an old illustration that did not do those wings justice.","For once a story from school has walked out into the road.","I prefer the version where the rider lives to tell the tale.","I am borrowing a fresh notebook for the history you have made."],"Fara":["I was polishing a glass bird. Yours is rather more demanding.","Somebody asked me for a glass dragon before I had seen yours.","The workshop furnace is hot enough without help.","I am making a window that catches morning light instead of hiding it."],"Garrick":["The hammering has finally met something louder.","I thought the dragon rumours were another apprentice's excuse.","Let it sleep somewhere quieter than our forge street.","I slept through the morning bell for the first time in years."],"Hester":["I would need an enormous net to mend a torn wing.","The dock stories have grown wings, apparently real ones.","Good thread and patience mend more than people think.","There are fishing nets to repair again, not barriers for soldiers."],"Junia":["That shine is the colour I wanted for my glass lamp.","I went to the glass shop asking whether scales really catch light that way.","Bring it past the window when the sun is lower.","I lit every coloured lamp when the news reached our street."],"Kellan":["It turns its head every time the hammers strike.","Someone claimed a dragon could outwork a bellows. I want proof.","It had better not nap against a hot chimney.","Tomorrow I can choose my own work instead of the king's quota."],"Lysa":["I hope it is gentler than it looks around breakable things.","Your companion has inspired a very fragile display in the shop.","I spent all morning arranging that glass. No sudden wingbeats.","I sold the last royal crest and will not make another."],"Cinder":["Those scales have seen heat that would empty my hearth.","A dragon must never wake to a cold grate.","I keep one coal alive overnight. Yours carries a whole furnace.","The forge can rest a night without somebody calling it disloyal."],"Warden":["It watches you like I watch the road from the seam.","The miners' families have been asking whether your dragon can hear underground.","Bring back the people who go with you. That is what matters.","My husband arrived before the shift bell, carrying the good news."],"Dagna":["Shake the dust off before that creature comes any closer.","A dragon is the one guest who might appreciate a sooty room.","Coal stains everything except the promises the overseer makes.","I washed the curtains to celebrate. They may stay clean a day."],"Lode":["Could it breathe quietly? I have just escaped the forge.","A dragon outside would complete the noise inside these walls.","There are quieter trades. I chose badly when I was young.","Tonight I intend to hear the rain instead of the night shift."],"Pike":["Mind the bundle by the door. It is a miner's supper.","I heard your companion was brave. Brave creatures still need feeding.","I pack an extra crust in case the shift runs long.","Nobody has taken the food from my husband's bag for a levy today."],"Hallow":["The window rattles when it moves. I should fix that hinge.","I mistook a wingbeat for a blast from the mine.","This house has survived worse than a curious dragon, I hope.","I opened both windows when they rang the freedom bell."],"Quarrel":["If it shakes soot on my bread, we are going to argue.","They told me to be polite if the rider visited. We shall see.","I complain because things need fixing, not because I enjoy dust.","I have run out of complaints about the king. A strange morning."],"Flint":["That creature glows like the heart of a good coal.","I want to see whether dragon fire leaves an ordinary cinder.","No, I will not poke it with the hearth iron.","I kept a bright coal for the celebration fire."],"Winnie":["Nan told me you were travelling. She omitted the enormous details.","Your mother says you are managing. I recognise that worried voice.","Visit home before another neighbour has to carry your news.","I have put the good cups out. This calls for more than ordinary tea."],"Ned":["That harness I mended will not fit your new companion.","I heard you need a saddle now. A horse was too simple, was it?","Leather gives a little. Remember that before you tighten a strap.","Bryn and I can mend farm gear without soldiers taking it for their horses."],"Nan Ferrow":["Come here, both of you. Let me look at you properly.","I hear about my own son from travellers now. Imagine that.","Your grandmother would have believed every word of this.","You are home. Let somebody else speak of kings for a while."],"Joss":["Tam will have a dozen questions. I have just one: does it shed?","They say you found a dragon. I am still trying to find a quiet room.","Do not let the children decide it needs to stand trial.","Perhaps I will visit Thornwell instead of only thinking about it."],"Greta":["Keep its claws away from that door. It sticks enough already.","A dragon would solve the doorway problem permanently.","Lift the latch before you push. Tell your companion too.","I might replace the whole door now that timber is not being requisitioned."],"Osric":["I prefer dragons between covers, where they cannot knock anything over.","The school will never stop asking you questions about this.","Leave me the book version when all the running is finished.","I have found a story whose ending I actually want to hear again."],"Alder":["That warmth could wake a hive before its proper season.","Bees are quieter company than a dragon, but less impressive.","Keep it beyond the orchard if the bees begin to gather.","I can plan next spring's hives without counting a royal share."],"Gwyneth":["It can keep the doorway warm while you take the fireside chair.","I knitted a scarf for you. I did not account for a dragon.","You still need dry socks, rider or not.","I have enough wool for gifts this winter instead of another tax parcel."],"Mattock":["Leave those muddy claws outside; I have just swept.","They say your dragon flies. A useful way to avoid coal dust.","My husband brings half the seam home in his cuffs.","I have set two places early. He is coming home before dark."],"Kiln":["That breath has the right heat for a firing, I wager.","A dragon might save us fuel, if anyone dared ask.","Some heat strengthens clay. Too much ruins the whole pot.","I am firing bowls for the feast, not mugs stamped with the crown."],"Petra":["A dragon would make an excellent caravan lookout.","I have heard four accounts of you and believe roughly half.","Tell me which route you actually took before the merchants improve it.","For once every caravan brought the same piece of wonderful news."],"Raff":["Its shadow reaches right across my shutters.","People talk of your dragon when they ought to be staying out of the heat.","Afternoons are for shade, even if you can fly above the dunes.","I left the shutters open after sunset to hear the celebrating."],"Suri":["I could stitch a pouch to match those scales.","The travellers want dragon patterns sewn into everything now.","Sand works into every seam. Check the straps often.","I have orders for bright cloth again instead of mourning bands."],"Tavin":["That tail is exactly why I keep the doorway clear.","A winged guest makes a change from another dusty trader.","If it knocks the shutter loose, you are helping me hang it.","I threw open the front room for the neighbours when the news came."],"Una":["Would it object to carrying a parcel to the next town?","Your dragon could deliver news before the caravans finish arguing.","I still wrap parcels against rain, even here. Habits travel.","I sent a letter east with no coded warnings tucked between the lines."],"Vela":["Its scales would make a difficult pattern for my rug.","I have been counting wing shapes in everyone's new weaving.","Stand back; I need to see the whole silhouette.","I am weaving the date into the border so I will not forget it."],"Wystan":["That animal could settle a caravan dispute by simply looking at us.","Every trader claims to have met you before you had wings beside you.","I write down the prices before the stories begin.","The caravan master returned the toll money and almost smiled."],"Rania":["Move it from the doorway before we both cook in here.","A dragon outside would explain why this room never cools.","There is room on the bench for you, but not for its tail.","We carried the chairs outside and argued about happy things for once."],"Latif":["Keep the wingtip away from my shutter latch.","Your dragon has given the evening market something new to discuss.","I close the shutters for heat, not for fear of your companion.","Tonight the shutters stay open until the singing stops."],"Yara":["Even those scales will need rinsing after sea spray.","A dragon by the coast is one more thing for salt to settle on.","Fresh water after a flight over the bay. Trust me.","I scrubbed the doorstep for visitors who brought no demands."],"Bry":["Watch the wet step. A dragon can slip as easily as a fisher.","Someone said your companion shook the spray off over the entire dock.","I keep a dry rag by the door for a reason.","For a day, the harbour smells of baking as much as salt."],"Coral":["Could it see a small boat beyond the point from up there?","I hoped the dragon story would bring my husband ashore to listen.","Tell any solitary fisher you pass that somebody is waiting.","His boat came in flying a ribbon instead of a warning flag."],"Edda":["Let it warm the yard while I mind the hearth.","I have heard of your travels from people who needed a bed afterwards.","A roof is worth returning to, however far those wings take you.","The house feels larger without so much fear inside it."],"Fennel":["If the ghosts notice those wings, keep them following you away from here.","A dragon is almost enough to make me brave about the graveyard.","Almost brave is not brave. I am still staying indoors at dusk.","I opened the back door after sunset. That is a start."],"Bjorn":["I would need a larger pot to offer your companion broth.","Riders must get hungry; nobody has explained what dragons prefer.","You can warm your hands here without buying a story to go with it.","There is a pot for the neighbours and nobody is counting the portions."],"Cap":["Your companion is drying the moss just by standing there.","I heard of a warm-blooded guest with a very large shadow.","Leave a little damp for those of us who live in it.","We planted a new bed in honour of the road opening again."],"Ilsa":["Does it eat what it grows? No, I suppose it does not grow anything.","The hollow has been arguing about the size of a dragon's breakfast.","Our food takes patience. Tell it not to sample the young shoots.","I have saved our best harvest for the feast under the caps."],"Alderic":["The heartstones answer it. I can feel the old binding stir.","Another rider proves the stones were waiting, not dead.","Power is an answer only when you have asked the right question.","Keep the stones apart from ambition, now that ambition's throne is empty."],"Elin":["I wanted a glass flower. Now I want a glass wing.","The shop ought to make something to remember your dragon by.","A small ornament is easier to take home than a large adventure.","I bought the brightest flower in the window to mark the day."],"Maelis":["Do not let it nose through my herbs. Some bite back.","A dragon at your heel does not make you harder to curse.","My ward protects you. It does not excuse foolishness.","One king gone. Try not to grow another in his place."],"Archivist Elowen":["I should be taking notes, but I keep looking at its wings.","We have an opportunity to record a living rider without a royal censor.","Bring your observations, not just your victories, to these shelves.","The suppressed histories are returning to the public shelf today."],"Mira":["I wonder how its eyes adjust to a dark mine.","Your companion could help test the miners' oldest accounts.","Torvald's lantern is still worth carrying below the third gallery.","I can ask the miners for honest accounts without putting them in danger."],"Oren":["Do the restless dead fear a creature that remembers old magic?","I wonder whether your dragon senses the graveyard before you do.","Wait for every wave before you call those graves quiet.","I hope the names of the dead will be read for mourning, not fear."],"Master Iven":["My geography lesson has just acquired a better means of travel.","The children have started measuring journeys in dragon flights.","The map is not the country, even when you can see it from above.","Tomorrow's lesson will begin with how towns might help each other again."],"Bram":["Those wings look like the carvings in the old temples.","Your dragon makes me wonder what the builders knew that we forgot.","Look closely at the temple lintels when you pass them.","I want to visit the temples while their carvings can be studied freely."],"Nell":["It does not bow when Halvard's name is spoken. Sensible creature.","A new rider is the part the official history did not plan for.","Remember what happened to the six who trusted the seventh.","I will not lower my voice to say the king's name any more."],"Sable":["No illustration agrees with another, but yours is standing right there.","I have found a royal account claiming dragons were never gentle.","I trust what I see beside you more than the expensive edition.","I am annotating every lie in the newest history. I need more ink."],"Pella":["From its back the globe must look a little less misleading.","Your dragon could connect the places I can only point to.","When you fly, look for the roads that still need travellers.","I can turn this globe and imagine journeys instead of borders."],"Bess":["That guest stays outside. I have just swept the Copper Cup.","A dragon rider may drink here, but the dragon may not test the roof.","No wings among the musicians, and no quarrels near my tables.","The first toast was for you. I lost count after the fifth."],"Ronan":["Cider is wasted on a dragon. I am fairly certain.","We have heard three dragon songs and none of them scan.","If somebody names a drink after you, ask what is in it.","I poured Thornwell cider until the last barrel sounded hollow."],"Venn":["A letter could cross the kingdom beneath those wings.","People are asking whether riders will carry messages again.","There are children waiting for letters older than they are.","I can take my old mail route without hiring a guard now."],"Hobb":["That is a very large table ornament. Oh. Not an ornament.","I have heard about the dragon twice, unless that was one very long story.","Tell it the complicated grain is my discovery.","I raised a cup to you and found I could still stand afterwards."],"Edric":["I hope it has a quieter room than the one above mine.","Tomorrow's road seems less dull when a dragon might be on it.","Your companion is welcome to watch the lane while I sleep.","Tonight I am staying for the celebration instead of leaving at dawn."],"Dorr":["Wake me when the dragon learns to whisper.","Someone said wings. I assumed they meant the pillows.","If it wants my seat, it can wait five more minutes.","I slept through the announcement, but not through the cheering."],"Ser Anwen":["That bond deserves more respect than a badge bought with obedience.","I heard a rider was travelling without the king's permission. Good.","A command is not a conscience, however loudly it is given.","This armour will answer to something better than Halvard's orders."],"Grusk":["We are not letting the dragon sit in on cards.","Dain wants odds on your next journey. I told him to ask you.","Claws on the table would discourage a few bad habits.","Dain tried to bet on the news after it arrived. We refused."],"Fen":["Its wings have rhythm. Its feet need practice.","There is a dragon dance already, and nobody agrees on the steps.","An evening off will not injure your reputation, Corin.","I danced until the candles needed replacing twice."],"Tobin":["Has it seen a traveller running very late?","I hoped the next person through the door would be my friend, not a rider.","If you pass a man with too many excuses, send him here.","The person I was waiting for finally arrived with the news."],"Senn":["A dragon behind you makes bluffing rather unfair.","I would wager on your companion, but nobody will offer decent odds.","Do not breathe on the cards. We already distrust the candle.","I won one honest hand on the night the king fell. Both things surprised me."],"Dain":["A copper says it can tell a miner from a merchant by smell.","The rider rumours have ruined my simple wagers about travellers.","I am not betting against a dragon that can hear this conversation.","I lost a wager on how long Halvard would rule. Gladly."],"Rusk":["It could cross the northern pass without testing a single loose stone.","Flying over a dangerous road does not make the road safe for the rest.","Ask at the school about the pass before you take anyone through it.","I might travel north for pleasure instead of necessity next time."],"Vale":["A dragon is an even less discreet hat than mine.","I hear your arrival is impossible to keep quiet now.","Please do not mistake my brim for a perch.","I took my hat off for the news. That should tell you enough."],"Cerys":["My sister studies dragons on paper. I prefer this unexpected lesson.","The school has lost half its students to watching for your wings.","If it joins our card game, I am charging tuition.","Both my sister and I found something worth learning from your victory."],"Nyra":["Good. Perhaps it can watch Dain's other hand.","A dragon at the table would make sleight of hand less appealing.","You watch the claws; I will keep watching the cards.","Dain dealt fairly during the toast. I checked."],"Dunstan":["Hold still. I want to see how those claws meet their edges.","A rider needs equipment that survives more than a good story.","Keep the whetstone dry and the blade clean, dragon or no dragon.","That edge did its work. Let me see what it cost the steel."],"Sela":["There is a colour in those scales I have never caught in glass.","Everyone wants dragon-shaped glass before I have studied a real one.","Tell it not to help with the furnace. I know my own heat.","I am making something clear, with no royal stamp clouding it."],"Tam":["The children have already appointed it judge. I advise refusing.","Our little barn court has added laws about visiting dragons.","If they ask for a ride, send them to me before answering.","The children voted to abolish wicked kings. They were pleased you agreed."],"Celia":["I was reading of wings exactly like those. The ink feels inadequate.","The old stories seem less distant when your name appears in them.","Leave a space in your story for people who could not travel.","I have started a page for the day the stories changed."],"Ivo":["That wingbeat shook the tools hanging over my bed.","I hear you can escape the forge noise by flying above it.","I still hear the hammer rhythm even when the room is quiet.","For once the dawn hammering sounded like somebody choosing to work."],"Zella":["A net would never hold that creature, but a loose cord might trip it.","The fishers are arguing over whether a dragon frightens away the shoals.","Check your straps as carefully as I check my knots.","We repaired the festival bunting instead of another torn patrol net."],"Iris":["It must be pleasant to carry warmth wherever you go.","I heard of your dragon while stacking wood against the next cold night.","A warm companion is not a replacement for a sound roof.","I left a lamp in the window for people coming home to celebrate."]};
const NPC_BASE_LINES={"Merrin":["I chose this table because I can see who arrives from the road.","The Copper Cup is behind me; the inn is east of the school.","I shall keep an eye on the lane while you rest."],"Asta":["I brought my notes outside and have spent the morning watching people instead.","If you need a bed, look east of the school for the inn's dark roof.","This page was blank when I sat down. It remains impressively blank."],"Colm":["A hot meal is wasted on somebody rushing away from it.","The Copper Cup supplies the noise; this table supplies a little peace.","I intend to finish supper before I make any grand plans."],"Bren":["Elowen keeps accounts of the witch that the tavern storytellers have never read.","Ask her at the school if you want more than a frightening rumour."],"Della":["People will tell you anything about Maelis except that they have asked her for help.","The librarian is less easily frightened than most of them."],"Ewan":["I borrow school histories so I can argue with them in the comfort of my own room.","The old margins are often more interesting than the printed page."],"Fara":["I take broken glass to the workshop. Sometimes Sela finds a use for it.","A cracked cup need not be the end of the material."],"Garrick":["The early hammers wake me before the birds have decided to bother.","I could tell the apprentices apart by the rhythm with my eyes shut."],"Hester":["A net mended on shore is a catch not lost at sea.","I check the knots twice; the tide does not offer refunds."],"Junia":["I have been saving for one of the coloured lamps in the glass shop.","A plain room deserves a little borrowed sunlight."],"Kellan":["The hammering next door stops at mealtimes, which is how I know when to eat.","No clock I have owned has been half so dependable."],"Lysa":["There is a glass bird in the shop window with a crooked little beak.","I like that one better than all the perfect ones."],"Cinder":["I keep the last coal covered so the morning fire catches quickly.","It is a small kindness to whoever wakes first."],"Warden":["My husband works the seam; I keep his supper warm until his boots reach the step.","I know every cart that comes down that road."],"Dagna":["Coal dust clings to a wet cloth, a dry cloth, and anything you hoped was clean.","Tomorrow I shall try glaring at it."],"Lode":["The night forge rattles the cup beside my bed.","I have learned to sleep between the heavy blows."],"Pike":["That bundle is for my husband's next shift below ground.","An extra crust weighs very little until you need it."],"Hallow":["The mine blasts loosen this window hinge every month.","I mend it, the mountain shakes, and we begin our argument again."],"Quarrel":["I asked for bread without coal in it. The baker said I was asking for foreign bread.","I did not find that as funny as he did."],"Flint":["A clean hearth wastes good embers, if you ask me.","I keep enough under the ash to light the next morning."],"Osric":["The school's old tales are safer company when they stay in their books.","An adventure ought to knock before coming into a house."],"Alder":["The hives are quiet today. I will check them again when the air warms.","A bee does not hurry because a person has plans."],"Gwyneth":["Take the fireside chair; your boots look colder than the floor.","I have nearly finished this scarf and refuse to start it again."],"Mattock":["I swept half the mine out of this room yesterday.","My husband says his cuffs are clean. The broom disagrees."],"Kiln":["Clay tells you whether you heated it properly after it is too late to change your mind.","I have a shelf of expensive lessons to prove it."],"Petra":["I compare the caravan accounts before I believe their news.","Two witnesses and a matching date are worth more than an exciting tale."],"Raff":["I close these shutters before the worst heat arrives.","People who call that laziness are welcome to stand outside."],"Suri":["Sand finds every loose stitch, so I finish the seams twice.","A traveller remembers the tailor when the strap breaks."],"Tavin":["The front room stays coolest if you leave that doorway clear.","Every guest puts a bundle there. Every guest thinks theirs is different."],"Una":["I wrap parcels as if they might cross the whole country.","Sometimes they do; sometimes the neighbour just takes a very long route."],"Vela":["I count the knots in a rug when I cannot sleep.","It works until I notice a mistake and get up to fix it."],"Wystan":["Write down a trader's offer before accepting a second cup of tea.","The price grows friendlier in the telling, not on the bill."],"Rania":["The bench is warm, but standing will not make you any cooler.","We take the chairs outside after sunset and let the walls breathe."],"Latif":["I latch these shutters before noon and do my accounts by the shaded window.","The evening market is worth waiting through the heat."],"Yara":["Sea salt gets past a closed door more easily than any visitor.","I wipe the hinges before it eats them."],"Bry":["Mind that damp step. It has defeated better boots than yours.","The sea is generous with water we cannot drink."],"Coral":["My husband has taken the boat beyond the point again.","I keep the lamp trimmed so he can find our window from the bay."],"Edda":["A sound roof is a luxury you notice most during a storm.","I patched ours before buying anything for the front room."],"Fennel":["I shut the back door before the graveyard falls into shadow.","You may call it caution. I call it being here tomorrow."],"Bjorn":["The broth is thin today, but it is hot all the way through.","I keep a second ladle by the fire for late arrivals."],"Cap":["The moss bed likes this damp corner better than any sunny window.","It takes care to grow something that looks after itself."],"Ilsa":["I save the youngest shoots instead of eating everything that sprouts.","Next month's supper begins with what you leave today."],"Celia":["I copy passages from the school histories into a notebook of my own.","Writing them slowly makes the gaps in a story easier to notice."],"Ivo":["The tools over my bed rattle when the forge starts up.","I have moved them twice. The noise follows them."],"Zella":["A small hole in a net becomes a large hole in a fisher's dinner.","I keep spare cord even on days when nothing needs mending."],"Iris":["I stack the driest wood beneath the window where I can reach it in a storm.","Comfort is mostly work done before you need it."]};
const BRAMBLE_HINTS={"Orin":["Rowan left his dog out here and took himself to the Copper Cup. That tells you which of them has manners."],"Mella":["Bramble has stayed clear of my hives. Rowan should reward him; try the tavern north of here."],"Sennet":["I saved a scrap for that dog, but his hunter is eating at the Copper Cup. You could take Bramble up there."],"Ada":["Rowan is in the northern tavern while his poor dog follows strangers. Go fetch the man before I do."],"Linnet":["One hunter entered the Copper Cup; no dog followed him in. Your travelling companion balances that tally."],"Garrow":["Saw Rowan go north to the tavern from this very bench. Bramble evidently chose the scenic route."],"Wren":["That dog is looking for a familiar voice. Rowan's will be coming from the Copper Cup, I expect."],"Berta":["I would stock dog biscuits if Rowan stopped leaving Bramble behind. His owner is at the northern tavern."],"Merrin":["Rowan went past my table toward the Copper Cup. Bramble missed him by a few minutes."],"Asta":["I sketched that dog this morning. His hunter went into the tavern before I could finish the ears."],"Colm":["Rowan had the sensible idea of eating at the Copper Cup. Take Bramble there before my supper interests him."],"Bren":["You want a hunter, not a librarian, for this mystery. Rowan is at the Copper Cup in north Thornwell."],"Della":["Bramble knows a kind face when he sees one. His owner is enjoying the northern tavern; reunite them there."],"Ewan":["This resembles a tale where the dog chooses the hero. The less dramatic ending is Rowan at the Copper Cup."],"Osric":["A missing hunter sounds like an adventure I can solve from home: try Thornwell's northern tavern."],"Alder":["I saw Bramble sniffing by the orchard. Rowan had already headed north for a drink at the Copper Cup."],"Gwyneth":["That is Rowan's dog. Take him to the tavern and tell his owner to mind his companion as carefully as his boots."],"Archivist Elowen":["Rowan is taking his refreshment at the Copper Cup north of the school. Bramble is not one of our pupils."],"Mira":["Bramble belongs to Rowan. I passed the hunter on my way from the tavern; he was settling in, not leaving."],"Oren":["No graveyard mystery this time. Rowan is alive and comfortable at the Copper Cup, waiting for that dog."],"Tessa":["The hunter heard our music and went into the Copper Cup. Bramble seems to have followed a different tune."],"Master Iven":["A small geography exercise: north through Thornwell, then into the Copper Cup. That is where Rowan went."],"Bram":["You will find Rowan among the tavern tables, not out exploring temples. Bramble can lead the conversation."],"Nell":["Rowan is at the northern tavern. At least somebody missing today has only gone for a drink."],"Sable":["I can confirm one account without consulting a book: Rowan went into the Copper Cup without his dog."],"Pella":["The journey you need is shorter than anything on my globe. Take Bramble north to the town tavern."],"Bess":["Rowan is here. Bring Bramble to him before those paws make a tour of every table."],"Ronan":["I poured Rowan a cider a little while ago. His dog has arrived before he has finished it."],"Venn":["For once I can deliver directions without crossing a border. Rowan is right here in the Copper Cup."],"Hobb":["That dog belongs to the hunter. The hunter belongs to a chair in this tavern, for the moment."],"Edric":["Rowan is taking his evening here. Walk Bramble over to him and spare us a search party tomorrow."],"Dorr":["...Rowan. In here. Ask the dog which one. Let me sleep."],"Ser Anwen":["The hunter is inside this tavern, Corin. No need to question the entire town on his dog's behalf."],"Grusk":["Rowan is here, but he is not in our game. Bramble would probably play more honestly than Dain."],"Fen":["The hunter has been sitting in here through the music. Bring his dog over before someone invites it to dance."],"Tobin":["You found the person Rowan was waiting for. Well, the dog. His owner is already inside the Copper Cup."],"Senn":["I would wager Bramble finds Rowan in this very room. Finally, odds I like."],"Dain":["A copper says that is Rowan's dog. No? Very well, the hunter is here and you can ask him for free."],"Rusk":["Rowan came into the tavern instead of taking the pass. Wise choice. Take Bramble to him."],"Pip":["Bramble's footsteps have been circling outside. Rowan is in this tavern; I heard him come in."],"Vale":["If that dog is seeking the hunter, Rowan is here. Kindly do not make my hat part of the search."],"Cerys":["Rowan has been watching the room instead of our cards. I think he has noticed his dog is missing."],"Nyra":["The hunter is here, and neither of his hands is hiding cards. You want Rowan, not our table."],"Maren":["Rowan chose the Copper Cup over the docks today. Take his dog to the tavern north of the square."],"Celia":["I heard Rowan asking about supper at the Copper Cup. His dog seems to be asking you about Rowan."]};
function individualizeDialogue() {
  const fields=["d","d2","dm","dd","dd2","dv","dv2","dragonNear","dragonRumor","dragonRumor2"];
  const owners=new Map();
  const body=s=>s.replace(/^[^:]{1,21}: /,"").trim();
  for(const m of Object.values(W.maps))for(const n of m.npcs||[])
    for(const k of fields)for(const s of Array.isArray(n[k])?n[k]:[]) {
      if(s.startsWith("Corin: "))continue;
      const line=body(s);if(!owners.has(line))owners.set(line,new Set());owners.get(line).add(n.n);
    }
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]) {
    const p=NPC_VOICES[n.n];if(!p)continue;
    const b=NPC_BASE_LINES[n.n];
    if(b){n.d=b.slice(0,2);n.d2=[b[2]||p[2]];}
    n.dragonNear=[p[0]];n.dragonRumor=[p[1]];n.dragonRumor2=[p[2]];
    // Keep individually written story exchanges; replace shared victory filler.
    for(const k of ["dv","dv2"]) {
      const old=Array.isArray(n[k])?n[k]:[];
      n[k]=old.some(s=>(owners.get(body(s))?.size||0)>1)||!old.length?[p[3]]:old;
    }
    if(n.dd2 && JSON.stringify(n.dd2)===JSON.stringify(n.dd))n.dd2=[p[0]];
    for(const k of fields)if(Array.isArray(n[k])) {
      const used=new Set();n[k]=n[k].map(s=>s.replace("Fifty-five.","Fifty gold.").replace("A hundred and twenty.","A hundred gold.")).filter(s=>{
        const v=body(s);if(used.has(v))return false;used.add(v);return true;
      });
    }
  }
}

const ROYAL_DATA = window.EMBER_ASSETS.ROYAL_DATA;

const royalDefeated = {};
function registerRoyalSprites(){Object.assign(SPR, ROYAL_DATA.sprites);}
async function loadRoyalAssets(){
 for(const [x,y,w,h,src] of ROYAL_DATA.pages){const img=new Image();img.src=src;await img.decode();registerAtlasPage({img,x,y,w,h});}
}
function installRoyalCastle(){
 for(const [id,m] of Object.entries(ROYAL_DATA.maps))W.maps[id]=JSON.parse(JSON.stringify(m));
 const entrance=W.maps.world.doors.find(d=>d.to==='cinderhold');
 if(entrance){entrance.to='royal_vestibule';entrance.tx=10.5;entrance.ty=7;}
 const throne=W.maps.cinderhold;
 const treasury=W.maps.royal_treasury,seal=W.maps.royal_seal;
 treasury.doors=treasury.doors.filter(d=>d.to!=='royal_seal');
 treasury.roomActors=treasury.roomActors.filter(a=>!(a.royalDoor&&a.x===112));
 Object.assign(seal.doors[0],{to:'cinderhold',tx:19,ty:5.5});
 throne.doors.push({x:18.5,y:3,to:'royal_seal',tx:6.5,ty:10,dir:'u',explicitDir:true,triggerRect:{x:296,y:48,w:32,h:16}});
 (throne.roomActors ||= []).push({spr:'royal_door',x:312,y:64,sy:96,schoolArt:true,royalDoor:true});
 throne.title='Cinderhold — Throne Room';throne.travel=true;throne.travel_kind='Castle';
 // Royal water statues flank the throne against its north wall.
 throne.roomActors=(throne.roomActors||[]).filter(a=>!a.royalStatue);
 throne.roomBlocks=(throne.roomBlocks||[]);
 for(const x of [72,280]){
  throne.roomActors.push({spr:'royal_fountain',x,y:88,schoolArt:true,royalStatue:true});
  throne.roomBlocks.push([x-12,70,x+12,89]);
 }
 for(const d of throne.doors)if(d.to==='world')Object.assign(d,{to:'royal_northhall',tx:10.5,ty:4.5,dir:'d',explicitDir:true});
 // Exterior dragon statues face inward beside the throne-room aisle.
 for(const [spr,x] of [['royal_dragon_statue_left',72],['royal_dragon_statue_right',280]]){
  throne.roomActors.push({spr,x,y:168,schoolArt:true,royalStatue:true,statueTint:'#397b79'});
  throne.roomBlocks.push([x-27,153,x+27,168]);
 }
 // Paired plants mark south-facing castle exits without narrowing their thresholds.
 for(const map of Object.values(W.maps).filter(m=>m.royal)){
  map.roomActors=(map.roomActors||[]).filter(a=>!a.royalExitPlant&&!a.royalExitMarker);
  for(const exit of map.doors||[]){
   if(exit.dir!=='d'||exit.stairDown)continue;
   const cx=exit.triggerRect?exit.triggerRect.x+exit.triggerRect.w/2:exit.x*TS+8;
   const y=exit.triggerRect?exit.triggerRect.y-4:exit.y*TS+12;
   for(const x of [cx-36,cx+36]){
    map.roomActors.push({spr:'royal_exit_plant',x,y,schoolArt:true,royalExitPlant:true});
    (map.roomBlocks ||= []).push([x-7,y-12,x+7,y]);
   }
  }
 }
 // The innkeeper sits directly behind her counter, without an extra chair.
 const inn=W.maps.inn;
 inn.roomActors=(inn.roomActors||[]).filter(a=>!(a.castSeat&&/^ichair/.test(a.spr)));
 const keeper=inn.npcs.find(n=>n.n==='Maren');
 if(keeper){keeper.y=114;keeper.seatClipY=112;keeper.talkY=147;}
 // The roadside escort uses the Royal pack ceremonial halberd guards.
 for(const n of W.maps.world.npcs||[])if(['Serjeant Bram','Doran','Tolan'].includes(n.n)){n.packSpr='royal_intro_guard_'+(n.n==='Serjeant Bram'?'black':'white');n.packDirections=false;n.packWalk=false;n.body=undefined;n.sk=undefined;n.idleFps=6;}
 // Use the edited vestibule corner as the template for every castle stair.
 for(const [id,m] of Object.entries(W.maps))if(m.royal){
  for(const a of m.roomActors||[])if(a.stairTo){
   const east=a.spr==='royal_stairs_right',width=m.w*TS,height=m.h*TS;
   shiftActorData(m,a,east?width-34:34,height-14,true);
   const d=m.doors.find(d=>d.stairDown&&d.to===a.stairTo);
   if(d){
    d.triggerRect={x:east?width-55:47,y:height-43,w:8,h:26};
    d.x=d.triggerRect.x/TS;d.y=d.triggerRect.y/TS;
    d.dir=east?'r':'l';d.explicitDir=true;
   }
   const cells=m.collisionOverrides ||= {},row=height/8-6;
   for(let n=1;n<=6;n++)cells[(east?width/8-1-n:n)+','+row]=true;
   cells[(east?width/8-7:6)+','+(row-1)]=false;
   const back=W.maps[a.stairTo]?.doors.find(d=>d.to===id);
   if(back){back.tx=((east?width-72:72)-8)/TS;back.ty=(height-24-16)/TS;}
  }
 }
 // Apply saved stair placements before any connected doorway can be used.
 for(const [id,map] of Object.entries(W.maps))if(map.royal)applyActorLayout(map,id);
 // Preserve each villager's identity, furniture, dialogue, and existing table lip.
 for(const [mapId,name,spr] of [['house03','Della','royal_guest_woman'],['house07','Garrick','royal_guest_man'],['house04','Ewan','royal_reader']]){
  const n=W.maps[mapId]?.npcs.find(n=>n.n===name);if(!n)continue;
  n.packSpr=spr;n.lookId=spr;n.packWalk=false;n.packDirections=false;n.stationary=true;n.idleFps=5;
  n.y=(n.seatClipY??n.y-3)+3;
 }
}

const KNIGHT_ARENA_ID = 9146;
function installKnightEncounter() {
  const m = W.maps.world;
  if (!m) return;
  if (!m.features.some(f => f.id === KNIGHT_ARENA_ID))
    m.features.push({ id:KNIGHT_ARENA_ID, kind:"arena", x:2020, y:300, r:7.3,
                      style:"blossom", storyKnight:true });
  if (!m.foes.some(f => f.storyKnight))
    m.foes.push({ k:"knight", x:2020, y:300, storyKnight:true });
}
function installFishingVillager() {
  const m=W.maps.world;
  if(!m)return;
  // The dock's decorative old man reused Odo's portrait, but was not an NPC.
  const keep=[];
  for(let i=0;i<m.objs.length;i+=3){
    const [s,x,y]=m.objs.slice(i,i+3);
    if(W.names[s]==='hb_oldman'&&x===32376&&y===8520)continue;
    keep.push(s,x,y);
  }
  m.objs=keep;
  NPC_VOICES.Liora=['Tell your winged friend the catch is coming; glaring at the water will not hurry it.',
    'They say your travelling companion has scales. Mine usually fit in a bucket.',
    'If the road leaves your dragon tired, bring it something fresh from the river.',
    'Even the falls sound gentler without Halvard casting a shadow over the valley.'];
  if(!m.npcs.some(n=>n.n==='Liora'))m.npcs.push({
    n:'Liora',x:416*W.ts,y:329.5*W.ts,f:'d',stationary:true,
    packSpr:'pack_fisher_boy',packDirections:false,packWalk:false,idleFps:6,lookId:'pack_fisher_boy',loc:'Forgefalls',
    d:['The spray keeps my hair damp, but the trout make up for it.'],
    d2:['Watch the green arc, not the waterfall. A patient thumb catches supper.'],
    dd:['Your dragon has been watching my creel. I think we share an interest.'],
    dd2:['A fish from your own line tastes better. Your dragon seems to agree.'],
    dragonNear:['Tell your winged friend the catch is coming; glaring at the water will not hurry it.'],
    dragonRumor:['They say your travelling companion has scales. Mine usually fit in a bucket.'],
    dragonRumor2:['If the road leaves your dragon tired, bring it something fresh from the river.'],
    dv:['Even the falls sound gentler without Halvard casting a shadow over the valley.'],
    dv2:['You have earned a quiet afternoon here, Corin. Cast a line and let the world wait.']
  });
}
function installMarketCounters(){
  const world=W.maps.world;
  const placements={
    Berta:{spr:'stall1',x:4120,y:1816},
    Nerissa:{spr:'stall2',x:32136,y:8176}
  };
  for(const [name,p] of Object.entries(placements)){
    const n=(world.npcs||[]).find(n=>n.n===name);if(!n)continue;
    const sid=W.names.indexOf(p.spr);if(sid<0)continue;
    let found=-1,best=Infinity;
    for(let i=0;i<(world.objs||[]).length;i+=3){
      if(world.objs[i]!==sid)continue;
      const d=Math.hypot(world.objs[i+1]-n.x,world.objs[i+2]-n.y);
      if(d<best){best=d;found=i;}
    }
    if(found<0){world.objs.push(sid,p.x,p.y);found=world.objs.length-3;}
    world.objs[found+1]=p.x;world.objs[found+2]=p.y;
    Object.assign(n,{x:p.x,y:p.y-30,stationary:true,patrol:undefined,
      talkX:p.x,talkY:p.y+14,counter:{x:p.x,y:p.y}});
  }
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]){
    if(!n.sells)continue;
    if(n.counter)continue;
    let stall=null,near=64;
    for(let i=0;i<(m.objs||[]).length;i+=3){
      const [s,x,y]=m.objs.slice(i,i+3);
      if(!/^stall[123]$/.test(W.names[s]))continue;
      const d=Math.hypot(x-n.x,y-n.y);if(d<near){near=d;stall={x,y};}
    }
    if(!stall)continue;
    n.x=stall.x;n.y=stall.y-30;n.stationary=true;n.patrol=undefined;
    n.talkX=stall.x;n.talkY=stall.y+14;n.counter={x:stall.x,y:stall.y};
  }
}
function installFirstTemple(){
 const m=W.maps.tp1,outside={...m.doors.find(d=>d.to==='world')},alderic=W.maps.tp4.npcs.find(n=>n.n==='Alderic');
 Object.assign(m,{w:20,h:120,firstTemple:true,templeContinuous:true,title:'Forgewick Temple',roomArt:'first_temple_continuous',bg:'#19171c',floorbg:'#615b50',spawn:[160,1888]});
 m.terr=terrRLE(Array(2400).fill(DIRT));m.base_terr=m.terr;m.objs=[];m.scatter=[];m.sanim=[];m.fsanim=[];m.fobjs=[];m.features=[];m.hidden=[];m.npcs=[];
 m.roomActors=[];m.roomBlocks=[];m.collisionOverrides={};m.templeActive={};
 m.templeFloors=[[112,192,208,1904],[64,64,256,192],[68,416,252,536],[68,1216,252,1336],[144,1904,176,1920]];
 m.templeWalls=[];
 for(const [y,l,r] of [[192,64,256],[368,68,252],[536,68,252],[1168,68,252],[1336,68,252],[1776,112,208]]){m.templeFloors.push([144,y,176,y+48]);m.templeWalls.push([l,y,144,y+48],[176,y,r,y+48]);}
 m.doors=[{x:9.5,y:119,to:'world',tx:outside.tx,ty:outside.ty,dir:'d',explicitDir:true,triggerRect:{x:144,y:1904,w:32,h:16}}];
 m.templeGates=[{y:1824,style:'door'},{y:1384,style:'door'},{y:1216,style:'bars',room:'ghost'},{y:584,style:'door'},{y:416,style:'bars',room:'golem'},{y:240,style:'door'}];
 m.templeGates.forEach((g,i)=>{g.open=0;m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 for(const y of [64,416,1216])for(const x of [88,232])m.roomActors.push({spr:'first_temple_torch',x,y,schoolArt:true});
 for(const y of [240,584,1384,1824])for(const x of [128,192])m.roomActors.push({spr:'first_temple_torch',x,y,schoolArt:true});
 m.foes=[{x:6,y:78,k:'ghost'},{x:13,y:78,k:'ghost'},{x:7,y:81,k:'ghost'},{x:12,y:81,k:'ghost'},{x:6,y:29,k:'golem2'},{x:13,y:30,k:'golem2'}];
 // Reserve the silver-haired armored elder for Alderic.
 W.maps.world.npcs=W.maps.world.npcs.filter(n=>n.n!=='Sennet');
 if(alderic){for(const k of ['sk','body','seatSpr','seatClipY','seated','school','sy','counter','talkX','talkY','patrol','goto','idleFrame'])delete alderic[k];
  Object.assign(alderic,{x:112,y:144,packSpr:'guild_elder',lookId:'guild_elder',packDirections:false,packWalk:false,stationary:true,idleFps:5,gift:undefined});alderic.d=['You came further than the others, then. Come closer.','You are carrying a heartstone. Do you know what you carry?','Corin: I know it was in the shell.','Alderic: They were cut from the first dragon. One stone for each thing she could do.','Alderic: A rider holds them. A dragon answers to them.','Alderic: The chest beside me holds the storm. It is yours, Corin.','Corin: Why keep them apart?','Alderic: Because a dragon with all four answers to nobody.'];m.npcs.push(alderic);}

 for(const y of [440,1240])for(const x of [128,192]){m.roomActors.push({spr:'temple67_sentinel',x,y,schoolArt:true});m.roomBlocks.push([x-6,y-10,x+6,y]);}
 for(const y of [240,584,1384])for(const x of [80,240])m.roomActors.push({spr:y===584?'temple67_skull':'first_temple_dragon_head',x,y:y-8,schoolArt:true});
 m.roomActors.push({spr:'temple73_fire_statue',x:160,y:112,schoolArt:true});m.roomBlocks.push([144,94,176,112],[148,118,172,128]);
 // Small native skulls and bones are floor details, outside the spike crossing rows.
 for(const [x,y,spr] of [[92,168,'skull'],[236,180,'bones'],[88,492,'skull'],[228,516,'bones'],[124,306,'skull'],[194,340,'bones'],[124,620,'bones'],[194,806,'skull'],[124,950,'skull'],[192,1138,'bones'],[88,1290,'bones'],[234,1308,'skull'],[124,1410,'skull'],[194,1550,'bones'],[124,1660,'skull'],[194,1746,'skull'],[124,1860,'bones']])m.roomActors.push({spr:'temple73_'+spr,x,y,sy:-100,schoolArt:true,stillFrame:0});
 m.templeClock=0;m.templeTraps=[{id:'lower',rows:Array.from({length:6},(_,i)=>1456+i*48),leverX:188,leverY:1408},{id:'upper',rows:Array.from({length:10},(_,i)=>656+i*48),leverX:188,leverY:608}];
 for(const h of m.templeTraps){h.leverOpen=0;m.roomActors.push({spr:'temple71_lever',x:h.leverX,y:h.leverY,schoolArt:true,templeLever:h.id});for(let i=0;i<h.rows.length;i++)for(let x=120;x<=200;x+=16)m.roomActors.push({spr:'temple71_spikes',x,y:h.rows[i]+8,sy:-100,schoolArt:true,templeSpike:h.id,trapRow:i});}
 for(const id of ['tp2','tp3','tp4']){W.maps[id].travel=false;W.maps[id].templeLegacy=true;}
 const entry=W.maps.world.doors.find(d=>d.to==='tp1');if(entry){entry.tx=9.5;entry.ty=117;}
}
function restoreTempleEntrances(){
 const m=W.maps.world;
 for(const [to,spr] of [['tp1','rt_ext2'],['sn1','rt_snow'],['ds1','rt_desert']]){
  const d=m.doors.find(d=>d.to===to);if(!d)continue;
  const x=d.x*16+8,y=d.y*16;
  if(to==='sn1'&&m.scatter.some((v,i)=>i%3===0&&W.names[v]===spr&&Math.abs(m.scatter[i+1]-x)<128&&Math.abs(m.scatter[i+2]-y)<128))continue;
  // Keep these landmark buildings out of procedural decoration hiding and saved object deletions.
  (m.roomActors ||= []).push({spr,x,y,sy:y-32,schoolArt:true,stillFrame:0,sceneReserved:true,templeEntrance:to});
  for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]===spr)(m.hidden ||= []).push(i/3);
  (m.roomBlocks ||= []).push([x-74,y-76,x-18,y-32],[x+18,y-76,x+74,y-32],[x-60,y-102,x+60,y-76]);
 }
}
function installSecondTemple(){
 const m=W.maps.ds1,oldExit=m.doors.find(d=>d.to==='world');
 Object.assign(m,{w:20,h:140,title:'Sandspire Temple',roomArt:'scientist_interior',templeContinuous:true,templeScience:true,templeOldGolem:'ds3',templeOldChest:'ds4',templeRooms:[['ghost',1536,1656],['golem',736,856]],bg:'#19171c',floorbg:'#615b50',spawn:[160,2208]});
 m.terr=terrRLE(Array(2800).fill(DIRT));m.base_terr=m.terr;
 for(const key of ['objs','scatter','sanim','fsanim','fobjs','features','hidden','npcs','roomActors','roomBlocks'])m[key]=[];
 m.collisionOverrides={};m.templeActive={};
 m.templeFloors=[[96,64,224,112],[32,112,288,288],[64,336,256,512],[112,512,208,2224],[68,736,252,856],[68,1536,252,1656],[144,2224,176,2240]];
 m.templeWalls=[];for(const [y,l,r]of [[288,32,288],[512,64,256],[688,68,252],[856,68,252],[1488,68,252],[1656,68,252],[2096,112,208]]){m.templeFloors.push([144,y,176,y+48]);m.templeWalls.push([l,y,144,y+48],[176,y,r,y+48]);}
 m.doors=[{x:9.5,y:139,to:'world',tx:oldExit.tx,ty:oldExit.ty,dir:'d',explicitDir:true,triggerRect:{x:144,y:2224,w:32,h:16}}];
 m.templeGates=[{y:2144,style:'door'},{y:1704,style:'door'},{y:1536,style:'bars',room:'ghost'},{y:904,style:'door'},{y:736,style:'bars',room:'golem'},{y:560,style:'door'},{y:336,style:'bars'}];
 m.templeGates.forEach((g,i)=>{g.open=0;m.roomActors.push({spr:i===6?'scientist_vault_gate':'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 m.foes=[{x:6,y:98,k:'ghost'},{x:13,y:98,k:'ghost'},{x:7,y:101,k:'ghost'},{x:12,y:101,k:'ghost'},{x:6,y:49,k:'golem1'},{x:13,y:50,k:'golem1'}];
 const prop=(spr,x,y,box)=>{m.roomActors.push({spr,x,y,schoolArt:true});if(box)m.roomBlocks.push(box);};
 // Webbed treasure chamber, with the glowing skull in its recessed north wall.
 prop('scientist_skull',160,80,[144,64,176,80]);
 prop('scientist_pod_tall',76,220,[57,191,92,218]);prop('scientist_pod_mid',112,159,[96,140,125,159]);
 prop('scientist_pod_mid',235,163,[219,144,249,162]);prop('scientist_pod_round',211,253,[197,239,224,252]);
 prop('scientist_roots_tall',68,154);prop('scientist_roots_tall',264,279);prop('scientist_roots_small',58,276);
 for(const [x,y]of [[60,140],[259,141],[270,260]])prop('scientist_web',x,y);
 for(const [x,y]of [[114,228],[178,257],[252,199],[96,264]])prop('scientist_gold',x,y);
 m.roomBlocks.push([148,214,172,224]);
 // Laboratory antechamber: animated specimens, shelves, and a work table.
 prop('scientist_shelf',88,393,[70,380,106,393]);prop('scientist_shelf_plant',232,393,[215,380,248,393]);
 prop('scientist_flask',111,445,[97,432,125,445]);prop('scientist_flask',222,485,[209,472,235,485]);
 prop('scientist_desk',108,508,[80,494,135,508]);
 for(const y of [736,1536]){for(const x of [88,232])prop('first_temple_torch',x,y);for(const x of [128,192])prop('scientist_flask',x,y+28,[x-10,y+16,x+10,y+28]);}
 for(const y of [560,904,1704,2144])for(const x of [128,192])prop('first_temple_torch',x,y);
 for(const [x,y]of [[124,615],[191,1160],[123,1470],[190,1950],[124,2180]])m.roomActors.push({spr:'temple73_bones',x,y,schoolArt:true,sy:-100,stillFrame:0});
 m.templeClock=0;m.templeTraps=[{id:'lower',rows:[],leverX:188,leverY:1728},{id:'upper',rows:[],leverX:188,leverY:928}];
 for(const h of m.templeTraps){h.leverOpen=0;prop('temple71_lever',h.leverX,h.leverY);m.roomActors[m.roomActors.length-1].templeLever=h.id;}
 m.templeMachines=[];m.templeShots=[];
 for(const [hall,type,n,start]of [['lower','arrow',6,1776],['upper','cannon',10,976]])for(let i=0;i<n;i++){
  const dir=i%2?-1:1,y=start+i*48,id=m.templeMachines.length;
  m.templeMachines.push({hall,type,x:dir===1?116:204,y,dir,offset:i*.43,lastCycle:-1,frame:0});
  m.roomActors.push({spr:'scientist_'+(type==='cannon'?'cannon_':'arrow_port_')+(dir===1?'r':'l'),x:dir===1?112:208,y:y+16,sy:y+16,schoolArt:true,templeMachine:id});
 }
 for(const id of ['ds2','ds3','ds4']){W.maps[id].travel=false;W.maps[id].templeLegacy='ds1';W.maps[id].npcs=[];}
 const entry=W.maps.world.doors.find(d=>d.to==='ds1');if(entry){entry.tx=9.5;entry.ty=137;}
}
function refineSecondTemple(){
 const m=W.maps.ds1;
 m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([96,240,224,288],[32,288,288,512]);
 m.templeWalls=m.templeWalls.filter(r=>r[1]>=512);m.templeWalls=m.templeWalls.filter(r=>r[1]!==512);m.templeWalls.push([32,512,144,560],[176,512,288,560]);
 m.templeGates=m.templeGates.filter(g=>g.y!==336);
 m.roomActors=m.roomActors.filter(o=>o.y>=560&&!o.templeGate&&o.templeGate!==0);
 m.roomBlocks=m.roomBlocks.filter(b=>b[1]>=560);
 m.templeGates.forEach((g,i)=>m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i}));
 for(const o of m.roomActors){if(o.spr==='scientist_flask')o.spr='temple67_sentinel';if(o.spr.startsWith('scientist_arrow_port_'))o.x+=o.x<160?-5:5;}
 const prop=(spr,x,y,box)=>{m.roomActors.push({spr,x,y,schoolArt:true});if(box)m.roomBlocks.push(box);};
 prop('scientist_skull',160,276,[144,258,176,276]);
 prop('scientist_pod_tall',64,360,[48,340,79,360]);prop('scientist_pod_mid',250,359,[236,340,265,359]);
 prop('scientist_pod_round',236,445,[224,434,249,445]);
 prop('scientist_flask',101,404,[89,390,113,404]);prop('scientist_flask',210,404,[198,390,222,404]);
 prop('scientist_shelf',61,475,[42,463,79,475]);prop('scientist_shelf_plant',256,501,[240,488,272,501]);
 prop('scientist_desk',111,500,[84,488,136,500]);
 prop('scientist_roots_tall',47,332);prop('scientist_roots_small',276,437);
 prop('scientist_web',57,313);prop('scientist_web',270,313);
 for(const [x,y]of [[111,351],[211,352],[170,446]])prop('scientist_gold',x,y);
 m.roomBlocks.push([148,334,172,344]);
 for(const machine of m.templeMachines)if(machine.type==='cannon'){
  const y=machine.y,left=machine.dir>0;m.templeFloors.push(left?[80,y-8,112,y+24]:[208,y-8,240,y+24]);
  m.roomBlocks.push(left?[80,y-8,105,y+16]:[215,y-8,240,y+16]);
 }
}
function installThirdTemple(){
 const exit=W.maps.sn1.doors.find(d=>d.to==='world');
 const m=W.maps.sn1=JSON.parse(JSON.stringify(W.maps.ds1));
 Object.assign(m,{title:'Frostvault Temple',roomArt:'dragon75_interior',templeScience:false,templeDragon:true,templeOldGolem:'sn3',templeOldChest:'sn4',bg:'#19171c',floorbg:'#535d70',roomActors:[],roomBlocks:[],templeMachines:[],templeShots:[],templeHazards:[],templeActive:{}});
 Object.assign(m.doors[0],{tx:exit.tx,ty:exit.ty});
 m.foes=m.foes.map(f=>({...f,k:f.k==='golem1'?'golem3':f.k}));
 m.templeGates.forEach((g,i)=>{g.open=0;delete g.entered;m.roomActors.push({spr:'first_temple_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i});});
 const prop=(spr,x,y,box,ground=false)=>{m.roomActors.push({spr,x,y,schoolArt:true,sy:ground?-100:y});if(box)m.roomBlocks.push(box);};
 // Three weapon-free dragon skulls in a stepped treasure alcove.
 prop('dragon75_plinth_blue',160,144,[142,122,178,144],true);prop('dragon75_skull',160,130);
 for(const [x,spr]of [[96,'dragon75_skull_small'],[224,'dragon75_skull_round']]){prop('dragon75_plinth_red',x,202,[x-12,180,x+12,202],true);prop(spr,x,187);}
 for(const x of [112,208])prop('dragon75_banner_red',x,94);
 for(const x of [56,264])prop('dragon75_banner_blue',x,143);
 for(const [x,y]of [[65,232],[94,262],[231,256],[256,219],[134,170],[181,175]])prop('scientist_gold',x,y,null,true);
 m.roomBlocks.push([148,230,172,240]);
 for(const y of [736,1536]){for(const x of [88,232])prop('first_temple_torch',x,y);for(const x of [128,192])prop('dragon75_statue',x,y+25,[x-7,y+15,x+7,y+25]);}
 for(const y of [336,560,904,1704,2144])for(const x of [128,192])prop('first_temple_torch',x,y);
 for(const [x,y]of [[88,388],[232,388]])prop('dragon75_statue',x,y,[x-7,y-10,x+7,y]);
 for(const [x,y]of [[124,615],[191,1160],[123,1470],[190,1950],[124,2180],[84,460],[235,487]])prop('temple73_bones',x,y,null,true);
 for(const h of m.templeTraps){h.leverOpen=0;prop('temple71_lever',h.leverX,h.leverY);m.roomActors.at(-1).templeLever=h.id;}
 for(const [hall,type,n,start]of [['lower','flame',6,1776],['upper','saw',10,976]])for(let i=0;i<n;i++){
  const y=start+i*48,dir=i%2?-1:1; m.templeHazards.push({hall,type,y,dir,offset:i*.48,x:128,frame:0,active:false});
  if(type==='saw')prop('dragon75_rail',160,y+2,null,true);
 }
 for(const id of ['sn2','sn3','sn4']){W.maps[id].travel=false;W.maps[id].templeLegacy='sn1';W.maps[id].npcs=[];}
 const entry=W.maps.world.doors.find(d=>d.to==='sn1');if(entry){entry.tx=9.5;entry.ty=137;}
}
function finishTempleLayouts77(){
 const m=W.maps.sn1;
 m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([96,240,224,288],[32,288,288,512]);
 m.templeWalls=m.templeWalls.filter(r=>r[1]>512);m.templeWalls.push([32,512,144,560],[176,512,288,560]);
 m.templeGates=m.templeGates.filter(g=>g.y!==336);
 m.roomActors=m.roomActors.filter(o=>o.y>=560&&!Number.isInteger(o.templeGate));
 m.roomBlocks=m.roomBlocks.filter(b=>b[1]>=560);
 m.templeGates.forEach((g,i)=>m.roomActors.push({spr:'dragon77_'+g.style,x:160,y:g.y,sy:g.y,schoolArt:true,templeGate:i}));
 const prop=(spr,x,y,box,ground=false)=>{m.roomActors.push({spr,x,y,schoolArt:true,sy:ground?-100:y});if(box)m.roomBlocks.push(box);};
 // Banners sit on the stone faces, with the skull collection gathered in one chamber.
 for(const x of [112,208])prop('dragon75_banner_red',x,239);
 for(const x of [56,264])prop('dragon75_banner_blue',x,287);
 prop('dragon75_plinth_blue',160,309,[142,287,178,309],true);prop('dragon75_skull',160,295);
 for(const [x,spr]of [[96,'dragon75_skull_small'],[224,'dragon75_skull_round']]){prop('dragon75_plinth_red',x,366,[x-12,344,x+12,366],true);prop(spr,x,351);}
 for(const [x,y]of [[63,405],[97,454],[228,450],[257,397],[136,342],[183,347]])prop('scientist_gold',x,y,null,true);
 m.roomBlocks.push([148,406,172,416]);
 for(const [x,y]of [[64,495],[256,495]])prop('dragon75_statue',x,y,[x-7,y-10,x+7,y]);
 // Insert whole native floor/wall strips, retaining sprite sizes and hazard animation timing.
 const cuts=[632,1136,1168,...Array.from({length:10},(_,i)=>680+i*48),1432,1744,1776,...Array.from({length:6},(_,i)=>1480+i*48)].sort((a,b)=>a-b);
 for(const id of ['tp1','ds1','sn1']){
  const map=W.maps[id],offset=id==='tp1'?0:320,points=cuts.map(y=>y+offset),Y=y=>y+16*points.filter(c=>c<=y).length;
  map.templeRooms=(map.templeRooms||[['ghost',1216,1336],['golem',416,536]]).map(([kind,a,b])=>[kind,Y(a),Y(b)]);
  for(const key of ['templeFloors','templeWalls','roomBlocks'])map[key]=map[key].map(([l,t,r,b])=>[l,Y(t),r,Y(b)]);
  for(const actor of map.roomActors){actor.y=Y(actor.y);if(actor.sy>=0)actor.sy=Y(actor.sy);if(actor.spr==='first_temple_torch')actor.spr='torch77_'+id;}
  for(const npc of map.npcs){npc.y=Y(npc.y);if(npc.sy>=0)npc.sy=Y(npc.sy);}
  for(const foe of map.foes)foe.y=(Y(foe.y*16+16)-16)/16;
  for(const gate of map.templeGates)gate.y=Y(gate.y);
  for(const trap of map.templeTraps){trap.rows=trap.rows.map(Y);trap.leverY=Y(trap.leverY);}
  for(const machine of map.templeMachines||[])machine.y=Y(machine.y);
  for(const hazard of map.templeHazards||[])hazard.y=Y(hazard.y);
  for(const door of map.doors){door.y=Y(door.y*16)/16;if(door.triggerRect)door.triggerRect.y=Y(door.triggerRect.y);}
  map.spawn[1]=Y(map.spawn[1]);map.h+=points.length;map.terr=terrRLE(Array(map.w*map.h).fill(DIRT));map.base_terr=map.terr;
  const entry=W.maps.world.doors.find(d=>d.to===id);if(entry){entry.tx=(map.spawn[0]-8)/16;entry.ty=(map.spawn[1]-16)/16;}
 }
}
function refineTemples78(){
 for(const id of ['ds1','sn1']){
  const m=W.maps[id],X=x=>Math.round(64+(x-32)*.75),Y=y=>y<288?y+64:Math.round(352+(y-288)*160/224);
  for(const o of m.roomActors)if(o.y<512){o.x=X(o.x);o.y=Y(o.y);if(o.sy>=0)o.sy=Y(o.sy);}
  m.roomBlocks=m.roomBlocks.map(([l,t,r,b])=>b<512?[X(l),Y(t),X(r),Y(b)]:[l,t,r,b]);
  m.templeFloors=m.templeFloors.filter(r=>r[1]>=512);m.templeFloors.push([112,304,208,352],[64,352,256,512]);
  m.templeWalls=m.templeWalls.filter(r=>r[1]>512);m.templeWalls.push([64,512,144,560],[176,512,256,560]);
  const chest=CHESTS.find(c=>c.map===id);chest.y=(Y(chest.y*16+16)-16)/16;
 }
  // Smaller treasure rooms; preserve native sprite sizes and the existing exit thresholds.
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],first=id==='tp1',limit=first?192:512;
  const X=x=>Math.round(80+(x-64)*5/6),Y=y=>first?Math.round(80+(y-64)*.875):(y<352?y+16:Math.round(368+(y-352)*.9));
  for(const o of m.roomActors)if(o.y<limit){o.x=X(o.x);o.y=Y(o.y);if(o.sy>=0)o.sy=o.y;}
  for(const n of m.npcs)if(n.y<limit){n.x=X(n.x);n.y=Y(n.y);}
  m.roomBlocks=m.roomBlocks.map(([l,t,r,b])=>b<limit?[X(l),Y(t),X(r),Y(b)]:[l,t,r,b]);
  const chest=CHESTS.find(c=>c.map===id);chest.x=(X(chest.x*16+8)-8)/16;chest.y=(Y(chest.y*16+16)-16)/16;
  m.templeFloors=m.templeFloors.filter(b=>b[1]>=limit);m.templeFloors.push(...(first?[[80,80,240,192]]:[[128,320,192,368],[80,368,240,512]]));
  m.templeWalls=m.templeWalls.filter(b=>b[1]>limit);m.templeWalls.push([80,limit,144,limit+48],[176,limit,240,limit+48]);
 }
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],safe=y=>!(m.templeTraps||[]).some(h=>h.rows.some(row=>Math.abs(y-row)<36))&&!(m.templeHazards||[]).some(h=>Math.abs(y-h.y)<30)&&!(m.templeMachines||[]).some(h=>Math.abs(y-h.y)<30)&&!m.templeGates.some(g=>Math.abs(y-g.y)<42);
  m.roomActors=m.roomActors.filter(o=>!/^temple73_(skull|bones)$/.test(o.spr)||safe(o.y));
  let variant=0;for(const o of m.roomActors)if(/^temple73_(skull|bones)$/.test(o.spr))o.spr='floor78_'+(variant++%9);
  for(let y=600;y<m.h*16-80;y+=112){if(!safe(y))continue;const x=variant%2?126:194;if(!m.templeFloors.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]))continue;m.roomActors.push({spr:'floor78_'+(variant++%9),x,y,sy:-100,schoolArt:true,stillFrame:0});}
  if(id==='ds1')m.templeFloors.push(...[[80,1032,112,1048],[208,1096,240,1112],[80,1160,112,1176],[208,1224,240,1240],[80,1288,112,1304],[208,1352,240,1368],[80,1416,112,1432],[208,1480,240,1496]]);
  if(id==='ds1'){const placed={scientist_pod_tall:120,scientist_pod_mid:208,scientist_roots_tall:112,scientist_roots_small:220,scientist_web:112};for(const o of m.roomActors)if(o.y<512&&placed[o.spr]){const old=o.x;o.x=o.spr==='scientist_web'&&old>160?216:placed[o.spr];for(const b of m.roomBlocks)if(Math.abs((b[0]+b[2])/2-old)<5&&Math.abs(b[3]-o.y)<3){b[0]+=o.x-old;b[2]+=o.x-old;}}}
  m.editableWallOrigins=[];
  for(const [map,x,y,sx,sy,wallKey]of WALL78_PIECES){if(map!==id)continue;
   const solid=!m.templeFloors.some(b=>x+8>=b[0]&&x+8<b[2]&&y+8>=b[1]&&y+8<b[3])||m.templeWalls.some(b=>x+8>=b[0]&&x+8<b[2]&&y+8>=b[1]&&y+8<b[3]);
   m.editableWallOrigins.push([x,y,x+16,y+16]);m.roomActors.push({spr:`wall78_${id}_${x}_${y}`,editKey:wallKey||`wall:${x}:${y}`,x:x+8,y:y+16,sy:-50,schoolArt:true,stillFrame:0,editableWall:true,wallSolid:solid});
  }
 }
 for(const h of W.maps.sn1.templeHazards)if(h.type==='flame')W.maps.sn1.roomActors.push({spr:'flame78_vent',x:h.dir>0?108:212,y:h.y+8,sy:-40,schoolArt:true,stillFrame:0});
}
function finishTempleLayouts82(){
 const allCuts={"tp1":[704,752,800,848,896,960,1008,1056,1104,1152,1200,1264,1312,1696,1744,1792,1840,1888,1936,1968,2016,2064],"ds1":[1024,1072,1120,1168,1216,1280,1328,1376,1424,1472,1520,1584,1632,2016,2064,2112,2160,2208,2256,2288,2336,2384],"sn1":[1024,1072,1120,1168,1216,1280,1328,1376,1424,1472,1520,1584,1632,2016,2064,2112,2160,2208,2256,2288,2336,2384]};
 for(const id of ['tp1','ds1','sn1']){
  const m=W.maps[id],cuts=allCuts[id].filter(c=>id!=='ds1'||c>=1912),Y=y=>y+16*cuts.filter(c=>c<=y).length;
  const oldRooms=m.templeRooms.map(r=>[...r]);
  for(const [kind,top,bottom]of oldRooms){
   m.templeFloors=m.templeFloors.map(b=>b[0]===68&&b[1]===top&&b[2]===252&&b[3]===bottom?[70,top+1,250,bottom-1]:b);
   m.templeWalls=m.templeWalls.map(([l,t,r,b])=>t===top-48?[l===68?70:l,t+1,r===252?250:r,b+1]:t===bottom?[l===68?70:l,t-1,r===252?250:r,b-1]:[l,t,r,b]);
   for(const gate of m.templeGates)if(gate.y===top)gate.y++;else if(gate.y===bottom+48)gate.y--;
   for(const actor of m.roomActors)if(!actor.editableWall){if(actor.y===top)actor.y++;else if(actor.y===bottom+48)actor.y--;}
  }
  m.templeRooms=oldRooms.map(([k,t,b])=>[k,Y(t+1),Y(b-1)]);
  for(const key of ['templeFloors','templeWalls','roomBlocks'])m[key]=m[key].map(([l,t,r,b])=>[l,Y(t),r,Y(b)]);
  for(const o of m.roomActors){if(o.editableWall)continue;o.y=Y(o.y);if(o.sy>=0)o.sy=o.y;}
  for(const n of m.npcs){n.y=Y(n.y);if(n.sy>=0)n.sy=n.y;}
  for(const f of m.foes)f.y=(Y(f.y*16+16)-16)/16;
  for(const g of m.templeGates)g.y=Y(g.y);
  for(const h of m.templeTraps){h.rows=h.rows.map(Y);h.leverY=Y(h.leverY);}
  for(const h of m.templeMachines||[])h.y=Y(h.y);
  for(const h of m.templeHazards||[])h.y=Y(h.y);
  for(const d of m.doors){d.y=Y(d.y*16)/16;if(d.triggerRect)d.triggerRect.y=Y(d.triggerRect.y);}
  m.spawn[1]=Y(m.spawn[1]);m.h+=cuts.length;m.terr=terrRLE(Array(m.w*m.h).fill(DIRT));m.base_terr=m.terr;
  for(const o of m.roomActors)if(o.editableWall){const x=o.x,y=o.y-8;o.wallSolid=!m.templeFloors.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3])||m.templeWalls.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]);}
  const entry=W.maps.world.doors.find(d=>d.to===id);if(entry){entry.tx=(m.spawn[0]-8)/16;entry.ty=(m.spawn[1]-16)/16;}
 }
}
const foeVisibleTopCache82=new Map();
function foeVisibleTop82(sp,frame){
 const key=sp[0]+':'+sp[1]+':'+frame;if(foeVisibleTopCache82.has(key))return foeVisibleTopCache82.get(key);
 const c=document.createElement('canvas');c.width=sp[2];c.height=sp[3];const cctx=c.getContext('2d');drawGameImage(cctx,sheetOf(sp),sp[0]+frame*sp[2],sp[1],sp[2],sp[3],0,0,sp[2],sp[3]);const pixels=cctx.getImageData(0,0,c.width,c.height).data;
 let top=0;outer:for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>64){top=y;break outer;}foeVisibleTopCache82.set(key,top);return top;
}
function editedTempleWallCollision(x,y){
 if(!MD?.editableWallOrigins)return null;
 if(MD.roomActors.some(o=>o.editableWall&&!o.editorDeleted&&o.wallSolid&&x>=o.x-8&&x<o.x+8&&y>=o.y-16&&y<o.y))return true;
 if(MD.editableWallOrigins.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]))return false;
 return null;
}
function stepDragonTempleTraps(dt){
 if(!MD.templeDragon)return;
 for(const a of MD.templeHazards){
  const disabled=bossGone[MAPID+':traps:'+a.hall],phase=(MD.templeClock+a.offset)%(a.type==='flame'?3.4:5.6);
  if(a.type==='flame'){
   a.frame=disabled||phase<1.5||phase>=2.3?0:Math.min(8,1+Math.floor((phase-1.5)/.1));a.active=!disabled&&a.frame>=3&&a.frame<=6;
   if(a.active&&Math.abs(P.y-a.y)<9&&P.x>115&&P.x<205)hurtPlayer(1);
  }else{
   a.active=!disabled&&phase>=1.4&&phase<4.2;
   const prev=a.x;a.x=a.active?128+64*Math.sin((phase-1.4)/2.8*Math.PI):128;
   a.frame=a.active?Math.floor(MD.templeClock*12)%6:0;
   if(a.active&&Math.abs(P.y-a.y)<12&&P.x>Math.min(prev,a.x)-11&&P.x<Math.max(prev,a.x)+11)hurtPlayer(1);
  }
 }
}
function drawDragonTempleTraps(){
 if(!MD?.templeDragon)return;
 for(const a of MD.templeHazards){
  if(a.type==='flame'&&a.frame===0)continue;
  const sp=SPR['dragon75_'+(a.type==='saw'?'saw':'flame_'+(a.dir>0?'r':'l'))];
  const x=a.type==='saw'?a.x:(a.dir>0?156:196);
  drawGameImage(ctx,atlasImg,sp[0]+a.frame*sp[2],sp[1],sp[2],sp[3],Math.round(x-sp[2]/2),a.y-16,sp[2],sp[3]);
 }
}
function installCastleCellar(){
 const m=W.maps.royal_cellar={w:20,h:18,title:'Cinderhold — Dragon Larder',royal:true,roomArt:'dragon75_cellar',bg:'#19171c',floorbg:'#615b50',spawn:[160,256],objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],npcs:[],foes:[],roomActors:[],roomBlocks:[[0,0,320,48],[0,48,16,288],[304,48,320,288],[16,272,144,288],[176,272,304,288]],collisionOverrides:{},doors:[{x:9.5,y:17,to:'royal_westhall',tx:17,ty:4.5,dir:'d',explicitDir:true,triggerRect:{x:144,y:272,w:32,h:16}}],cellarCaches:[]};
 m.terr=terrRLE(Array(360).fill(DIRT));m.base_terr=m.terr;
 for(const y of [112,208])for(let i=0;i<4;i++){
  const x=64+i*64,id=m.cellarCaches.length;m.cellarCaches.push({id,x,y,kind:id%2?'fish':'meat',amount:10});
  m.roomActors.push({spr:'dragon75_food'+(i+1),x,y,schoolArt:true});m.roomBlocks.push([x-20,y-20,x+20,y]);
 }
 for(const x of [32,288]){m.roomActors.push({spr:'dragon75_barrels',x,y:260,schoolArt:true});m.roomBlocks.push([x-14,245,x+14,260]);}
 for(const x of [32,160,288])m.roomActors.push({spr:'first_temple_torch',x,y:48,schoolArt:true});
 const hall=W.maps.royal_westhall;
 hall.doors.push({x:16.5,y:3,to:'royal_cellar',tx:9.5,ty:15,dir:'u',explicitDir:true,triggerRect:{x:264,y:48,w:32,h:16}});
 hall.collisionOverrides ||= {};
 hall.roomActors.push({spr:'royal_door',x:280,y:64,schoolArt:true,royalDoor:true});
 for(let y=6;y<=10;y++)for(let x=33;x<37;x++)hall.collisionOverrides[x+','+y]=false;
 const armory=W.maps.royal_armory;
 for(const [spr,x,y]of [['rack1',64,65],['rack2',160,65],['rack3',112,153]]){armory.roomActors.push({spr:'dragon75_'+spr,x,y,schoolArt:true});armory.roomBlocks.push([x-20,y-12,x+20,y]);}
}
function tryCellarSupplies(){
 if(!MD.cellarCaches)return false;
 const a=MD.cellarCaches.find(a=>Math.abs(P.x-a.x)<26&&P.y>=a.y-3&&P.y<a.y+34);if(!a)return false;
 const key='royal_cellar:supply:'+a.id;
 if(bossGone[key]){toast('This shelf has already supplied your dragon.');return true;}
 bossGone[key]=true;if(a.kind==='fish')dragonFish+=a.amount;else boarMeat+=a.amount;
 toast('Collected 10 '+(a.kind==='fish'?'fresh fish':'boar meat')+' — free provisions for your dragon.');saveGame();return true;
}
function stepTempleMachines(dt){
 if(!MD.templeScience)return;
 if(foesHeld){MD.templeShots=[];return;}
 for(const a of MD.templeMachines){
  const disabled=bossGone[MAPID+':traps:'+a.hall],time=MD.templeClock+a.offset,cycle=Math.floor(time/4.8),phase=time%4.8;
  a.frame=disabled||phase>3.4?0:phase<1.5?0:phase<1.9?1:phase<2.2?2:Math.min(9,3+Math.floor((phase-2.2)/.12));
  if(!disabled&&phase>=2.2&&a.lastCycle!==cycle){a.lastCycle=cycle;MD.templeShots.push({hall:a.hall,type:a.type,x:a.x,y:a.y,dir:a.dir,age:0});}
 }
 const live=[];
 for(const shot of MD.templeShots){
  if(bossGone[MAPID+':traps:'+shot.hall])continue;
  const prev=shot.x;shot.x+=shot.dir*(shot.type==='arrow'?110:76)*dt;shot.age+=dt;
  if(Math.abs(P.y-shot.y)<(shot.type==='arrow'?8:10)&&P.x>=Math.min(prev,shot.x)-7&&P.x<=Math.max(prev,shot.x)+7){hurtPlayer(1);continue;}
  if(shot.x>112&&shot.x<208&&shot.age<2)live.push(shot);
 }
 MD.templeShots=live;
}
function drawTempleShots(){
 if(!MD?.templeScience)return;
 for(const shot of MD.templeShots){const sp=SPR['scientist_'+(shot.type==='arrow'?'arrow_'+(shot.dir>0?'r':'l'):'ball')];drawGameImage(ctx,atlasImg,sp[0],sp[1],sp[2],sp[3],Math.round(shot.x-sp[2]/2),Math.round(shot.y-sp[3]/2),sp[2],sp[3]);}
}
function templeRoomOf(f){return f.idx<4?'ghost':'golem';}
function templeRoomCleared(room){return !!bossGone[MAPID+':room:'+room]||!foes.some(f=>templeRoomOf(f)===room&&f.st!=='dead'&&!f.ally);}
function stepTempleGates(dt){
 if(!MD?.templeContinuous)return;
 for(const [room,top,bottom] of (MD.templeRooms||[['ghost',1216,1336],['golem',416,536]])){
  if(P.y>top&&P.y<bottom)MD.templeActive[room]=true;
  if(templeRoomCleared(room))bossGone[MAPID+':room:'+room]=true;
  for(const f of foes)if(templeRoomOf(f)===room&&f.st!=='dead'){f.x=Math.max(84,Math.min(236,f.x));f.y=Math.max(top+32,Math.min(bottom-16,f.y));}
 }
 for(const g of MD.templeGates){const open=foesHeld||(g.room?templeRoomCleared(g.room):!!g.entered);
  g.open=Math.max(0,Math.min(1,g.open+(open?1:-1)*dt*3));}
 if(chestOpen[MD.templeOldChest||'tp4'])chestOpen[MAPID]=true;
 if(!sceneHold()&&fadeDir===0){MD.templeClock+=dt;for(const h of MD.templeTraps){h.leverOpen=Math.min(1,h.leverOpen+(bossGone[MAPID+':traps:'+h.id]?dt*3:0));if(foesHeld||bossGone[MAPID+':traps:'+h.id])continue;for(let i=0;i<h.rows.length;i++)if(templeSpikeFrame(h.id,i)===3&&P.x>112&&P.x<208&&Math.abs(P.y-h.rows[i])<9)hurtPlayer(1);}stepTempleMachines(dt);stepDragonTempleTraps(dt);}

}
function templeSpikeFrame(id,row){
 if(foesHeld||bossGone[MAPID+':traps:'+id])return 0;
 const phase=((MD.templeClock||0)+row*.8)%4.8;
 return phase<2?0:phase<2.45?1:phase<2.65?2:phase<3.85?3:phase<4.1?4:5;
}
function tryTempleLever(){
 if(!MD?.templeContinuous)return false;
 const h=MD.templeTraps.find(h=>Math.hypot(P.x-h.leverX,P.y-h.leverY)<27);
 if(!h)return false;
 const key=MAPID+':traps:'+h.id;
 if(bossGone[key])toast('The traps in this hall are already disabled.');
 else{bossGone[key]=true;toast((MD.templeScience||MD.templeDragon)?'The mechanisms fall silent. This hall is safe now.':'The spikes settle into the floor. This hall is safe now.');}
 return true;
}
function recoverTempleArrival(force=false){
 if(!MD?.templeContinuous)return;
 if(force||!Number.isFinite(P.x)||!Number.isFinite(P.y)||!canStand(P.x,P.y)){
  [P.x,P.y]=MD.spawn;P.dir='u';P.dir8='n';chunks.clear();
 }
}
function blockedByTempleGate(x,y){return !!MD?.templeContinuous&&MD.templeGates.some(g=>g.open<.99&&x>=144&&x<176&&y>=g.y-16&&y<g.y);}

function repairCoralmere(){
  const m=W.maps.world;
  // Imported world collision patch: exact 8-pixel cells cleared by the map editor.
  m.collisionOverrides=m.collisionOverrides||{};
  for(const [x,y0,y1] of [[4108,1016,1028],[4109,1016,1027],[4110,1017,1017],[4092,1015,1027],[4093,1015,1028],[4091,1020,1025],[4090,1020,1025],[4078,1020,1026],[4062,1020,1025],[4063,1020,1025],[4046,1019,1026],[4059,1020,1027],[4035,1020,1025],[4034,1022,1025],[4034,1014,1015],[4035,1014,1015],[4033,1008,1016],[4022,1020,1027],[4030,1041,1048],[4042,1042,1042],[4043,1042,1047],[4029,1052,1053],[4036,1051,1051],[4037,1052,1053]])
    for(let y=y0;y<=y1;y++)m.collisionOverrides[x+','+y]=false;
  // Latest dock boundary patch; applied after the earlier walkable-cell patch.
  for(let y=1038;y<=1055;y++)m.collisionOverrides['4029,'+y]=true;
  for(const [a,b,y] of [[4028,4043,1056],[4052,4079,1056],[4080,4102,1042],[4080,4103,1048]])
    for(let x=a;x<=b;x++)m.collisionOverrides[x+','+y]=true;
  for(const [x,a,b] of [[4078,1049,1055],[4079,1040,1041],[4078,1037,1040]])
    for(let y=a;y<=b;y++)m.collisionOverrides[x+','+y]=true;
  for(const [x,y] of [[4051,1056],[4044,1056],[4104,1046],[4104,1047],[4104,1048],[4105,1046],[4105,1047],[4105,1048],[4046,1014],[4047,1014],[4048,1015],[4047,1015],[4046,1015]])m.collisionOverrides[x+','+y]=false;
  // Latest fine-grained dock walkway clearances (8-pixel cells).
  for(const [y,a,b] of [[1039,4044,4044],[1039,4069,4069],[1039,4071,4071],[1040,4044,4045],[1040,4060,4060],[1040,4063,4066],[1040,4069,4071],[1041,4044,4045],[1041,4053,4053],[1041,4060,4060],[1041,4063,4066],[1041,4069,4071],[1042,4044,4045],[1042,4053,4053],[1042,4060,4060],[1042,4064,4071],[1042,4078,4079],[1043,4044,4045],[1043,4053,4053],[1043,4060,4075],[1043,4078,4079],[1044,4044,4052],[1044,4074,4079],[1044,4092,4101],[1045,4044,4052],[1045,4056,4056],[1045,4061,4061],[1045,4074,4079],[1045,4092,4101],[1046,4044,4045],[1046,4051,4053],[1046,4056,4056],[1046,4061,4061],[1046,4092,4092],[1046,4097,4103],[1047,4034,4042],[1047,4044,4045],[1047,4053,4053],[1047,4056,4056],[1047,4061,4061],[1047,4092,4103],[1048,4034,4035],[1048,4044,4047],[1048,4050,4053],[1048,4056,4056],[1048,4061,4061],[1048,4092,4092],[1048,4103,4103],[1049,4034,4035],[1049,4044,4053],[1049,4056,4062],[1050,4077,4077],[1051,4077,4077],[1052,4044,4045],[1052,4070,4070],[1052,4073,4073],[1052,4077,4077],[1053,4044,4045],[1053,4070,4070],[1053,4073,4077],[1054,4036,4045],[1054,4070,4074],[1055,4036,4045],[1055,4070,4074],[1060,4047,4047],[1061,4047,4047],[1066,4047,4047],[1067,4047,4047],[1068,4047,4047],[1069,4045,4047]])
    for(let x=a;x<=b;x++)m.collisionOverrides[x+','+y]=false;
  // Restore the original dock cargo suppressed by old object-index hide entries.
  m.hidden=(m.hidden||[]).filter(i=>!/^hb_/.test(W.names[m.objs[i*3]]||''));
  // Keep cargo at the working edges, leaving the shop approach and patrol clear.
  const dockMoves={hb_shark:[32398,8393],hb_fishmat:[32594,8348],hb_barrel_crate:[32605,8430],
    hb_sack:[32576,8436],hb_fishbox_ice:[32258,8400],hb_fishbox_grn:[32326,8438],
    hb_icecrate:[32543,8338]};
  for(let i=0;i<m.objs.length;i+=3){
    const name=W.names[m.objs[i]],pos=dockMoves[name];
    if(pos&&m.objs[i+1]>32200&&m.objs[i+1]<33000&&m.objs[i+2]>8300&&m.objs[i+2]<8600){m.objs[i+1]=pos[0];m.objs[i+2]=pos[1];}
  }
  m.objs.push(W.names.indexOf('hb_boy_grn'),32488,8544);
  m.moorings=[
    [32360,8506,32344,8482],[32543,8448,32543,8480],
    [32577,8448,32577,8478],[32779,8384,32766,8424],
    [32407,8530,32422,8557],[32401,8576,32439,8576],
    [32831,8391,32853,8379]
  ];
  const doryn=m.npcs.find(n=>n.n==='Doryn');
  if(doryn){
    const {x,y}=doryn;
    m.roomActors=(m.roomActors||[]).filter(a=>!(a.castSeat&&a.x===x&&[y+5,y+30].includes(a.y)));
    m.roomBlocks=(m.roomBlocks||[]).filter(b=>!(b[0]===x-23&&b[1]===y+1));
    m.npcs=m.npcs.filter(n=>n!==doryn);
    Object.assign(doryn,{x:96,y:131,talkX:62,talkY:140,seatClipY:128,loc:'Coralmere, indoors (house43)',stationary:true,patrol:undefined,sceneReserved:true});
    W.maps.house43.npcs.push(doryn);
    W.maps.house43.roomActors.push({spr:'ichair1',x:96,y:136,sy:130,schoolArt:true,castSeat:true,sceneReserved:true});
  }
  m.npcs=m.npcs.filter(n=>n.n!=='Orrin');
  const maren=m.npcs.find(n=>n.n==='Maren');
  if(maren)Object.assign(maren,{x:32536,y:8376,patrol:true,
    patrolPoints:[[32536,8376],[32584,8376],[32584,8432],[32536,8432]],
    patrolSpeed:25,patrolRest:3500,stationary:false,sceneReserved:true});
  const seller=m.npcs.find(n=>n.n==='Nerissa');
  if(seller){
    const old=seller.counter;
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='stall2'&&m.objs[i+1]===old.x&&m.objs[i+2]===old.y){m.objs[i+1]=32472;m.objs[i+2]=8392;}
    Object.assign(seller,{x:32472,y:8380,talkX:32472,talkY:8406,counter:{x:32472,y:8392},
      seatClipY:8380,seated:false,stationary:true,sceneReserved:true,sy:8370});
  }
}
function npcTalkDistance(n){
  if(n.counter){
    const c=n.counter;
    if(playerFacing4()!=='n'||Math.abs(P.x-c.x)>22||P.y<c.y+2||P.y>c.y+34)return Infinity;
    return Math.hypot(P.x-n.talkX,P.y-n.talkY);
  }
  return Math.min(Math.hypot(n.x-P.x,n.y-P.y),Math.hypot((n.talkX??n.x)-P.x,(n.talkY??n.y)-P.y));
}
function arrangeNpcCast(){
  const seatIds=[1,2,6,8,11,12,13];
  for(const i of seatIds){const s=SPR['pack_pupil_'+i];SPR['seated_body_'+i]=[s[0],s[1],s[2],s[3]-9,s[4]];}
  for(const [name,source]of [['king_seated','kg_idle_d'],['maddock_seated','maddock_smith107_idle_d']]){
    const s=SPR[source];SPR[name]=s.slice();SPR[name][3]=s[3]-7;
  }
  const usePack=(n,p,directions=false,walk=false)=>{
    n.packSpr=p;n.packDirections=directions;n.packWalk=walk;n.lookId=p;
    n.body=undefined;n.sk=undefined;n.school=false;n.desertNative=false;n.idleFrame=undefined;n.sy=undefined;
    n.stationary=!walk;n.patrol=undefined;n.goto=undefined;
  };
  const useSkin=(n,sk)=>{usePack(n,undefined);n.sk=sk;n.lookId='npc_'+sk;n.stationary=false;};
  const world=W.maps.world;
  const packs={Orin:'market_citizen4',Calder:'guild_fighter2',Weft:'market_citizen2',
    Torvald:'pack_smith',Sella:'guild_mage4',Sennet:'guild_elder',Ada:'pack_drinker2',
    Wren:'pack_grandmother',Berta:'pack_mage_red',Chanter:'guild_mage1',Morel:'guild_mage2'};
  const skins={Mella:'chef_chloe',Dorrick:'miner_mike',
    Bevan:'lumberjack_jack',Bregga:'farmer_bob',Ingrid:'villf',Sigrun:'nanf',Orrin:'bartender_bruno'};
  for(const n of world.npcs){
    if(packs[n.n]){const p=packs[n.n],d=!!SPR[p+'_idle_d'],w=['d','u','e','w'].every(k=>!!SPR[p+'_walk_'+k]);usePack(n,p,d,w);}
    if(skins[n.n])useSkin(n,skins[n.n]);
    if(n.n==='Serjeant Bram')usePack(n,'guild_fighter_sword',true,true);
    if(n.n==='Tolan')useSkin(n,'gwil');
    if(n.n==='Merrin'||n.n==='Asta')usePack(n,'pack_pupil_'+(n.n==='Merrin'?8:11)+'_chair');
  }
  // Repeated background actors use only the limited, seated character sheets.
  let seatIndex=0;
  function seat(n,m,id,index){
    const old={x:n.x,y:n.y};n.talkX=undefined;n.talkY=undefined;
    const early=/Millwood|Thornwell|Forgewick/.test(n.loc||'')||/^(school2?|tavern|inn|smithy|house27_bedroom|house02_bedroom)$/.test(id);
    const pool=early?[1,2,11,12,13]:seatIds;
    let pupil=n.n==='Winnie'?1:n.n==='Joss'?2:n.n==='Tam'?11:pool[seatIndex++%pool.length];
    if(pupil===8&&!/Sandspire/.test(n.loc||''))pupil=12;
    if(n.n==='Tam'){
      n.d=['Tam: Come in, Corin. Joss has the press working again, so the whole house smells of apples.',
        'Tam: I have put a bottle aside for Nan. I will take it over when this batch is settled.'];
      n.d2=['Tam: The early apples make sharp cider. I leave the sweeter ones on the tree another week.'];
      n.dd=['Tam: Nan came round yesterday. She tries to sound brave when she asks after you.',
        'Tam: Send word when you can. A mother can imagine a hundred disasters before breakfast.'];
      n.dd2=['Tam: There is always a place at our table, Corin. Even heroes need a proper meal.'];
      n.dv=['Tam: We opened our best cider when the news arrived. Joss nearly broke the tap in his hurry.'];
      n.dv2=['Tam: For the first time in years, I can think about next harvest without wondering what the king will take.'];
      n.dragonNear=['Tam: Keep your dragon away from the drying apples, please. I lost enough to the wasps.'];
      n.dragonRumor=['Tam: I heard about your travelling companion. Does Nan know how much it eats?'];
      n.dragonRumor2=['Tam: If you fly over the orchard, tell me whether the roof needs mending. Joss keeps saying it can wait.'];
      n.bio='A human mother and apple farmer in Millwood, raising her children with Joss.';
    }
    usePack(n,'seated_body_'+pupil);n.seated=true;n.stationary=true;n.f='d';n.flip=false;
    let table=null,chair=null;
    if(n.n==='Tam'&&id==='house27_bedroom'){
      table=m.roomBlocks.find(b=>b[0]===50&&b[1]===133);
      n.x=(table[0]+table[2])/2;n.y=table[1]-3;
      (m.roomActors ||= []).push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});
      m.roomActors.push({roomCrop:[table[0],table[1]-5,table[2]-table[0],table[3]-table[1]+5],x:n.x,y:table[3],sy:table[3],castSeat:true});
      n.talkX=table[0]-12;n.talkY=n.y+2;chair=true;
    }
    if(index===0&&/^house\d\d$/.test(id)){
      const blocks=m.roomBlocks||[];
      table=blocks.find(b=>b[1]>=125&&b[1]<=155&&b[2]-b[0]>=40&&b[2]-b[0]<=65);
      if(table){
        // Round tables have a north chair; rectangular desks have a south chair.
        const round=table[2]-table[0]>=58&&table[3]-table[1]>=24;
        if(round){
          n.x=(table[0]+table[2])/2;n.y=table[1]-12;
          const crop=[table[0],table[1]-14,table[2]-table[0],table[3]-table[1]+14];
          (m.roomActors ||= []).push({roomCrop:crop,x:n.x,y:table[3],sy:table[3],castSeat:true});
          n.talkX=table[0]-12;n.talkY=n.y+2;
          chair=true;
        }else{
          const b=blocks.find(b=>b!==table&&b[2]-b[0]<=15&&b[1]>=table[1]&&b[1]<=table[3]+25&&b[0]>table[0]-22&&b[0]<table[2]+22);
          if(b){n.x=(b[0]+b[2])/2;n.y=b[3]-4;chair=true;}
        }
      }
    }
    if(!chair){
      // A compact wooden chair supports residents in rooms without table seating.
      n.x=old.x;n.y=old.y;
      if(id==='smithy'){n.x=216;n.y=224;}
      if(id==='glasswork'){n.x=112;n.y=148;}
      if(id==='tavern'&&n.n==='Nyra'){n.x=344;n.y=210;}
      (m.roomActors ||= []).push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});
    }
    if(n.talkX===undefined){n.talkX=n.x;n.talkY=n.y+17;}
    if(id==='tavern'&&n.n==='Grusk'){n.talkX=348;n.talkY=238;}
  }
  const exceptions=new Set(['world','house26','tavern','school','school2','inn','witchmoor']);
  for(const [id,m]of Object.entries(W.maps)){
    if(exceptions.has(id))continue;
    // Remove the free-standing stools that belonged to the old character placements.
    m.roomActors=(m.roomActors||[]).filter(a=>a.spr!=='stump_stool');
    for(const [i,n]of (m.npcs||[]).entries()){
      if(n.n==='King Halvard'){
        n.seatSpr='king_seated';
        // The old wooden chair was only a placeholder. Use the approved throne,
        // centered on Halvard's seat and backed against the north end of the hall.
        m.roomActors=(m.roomActors||[]).filter(a=>!(a.castSeat&&/^ichair/.test(a.spr||'')&&Math.abs(a.x-n.x)<10));
        m.roomActors.push({throneRoomAsset:true,x:n.x,y:n.y+9,sy:n.y-2,sceneReserved:true});continue;
      }
      if(n.n==='Elder Maddock'){
        // Maddock stands only when his scripted movement needs his walking sheet.
        n.seatSpr='maddock_seated';
        m.roomActors.push({spr:'ichair0',x:n.x,y:n.y+7,sy:n.y-1,schoolArt:true,castSeat:true});continue;
      }
      if(n.school){
        const remove=n.n==='Dunstan'?'smithy_anim_8':n.n==='Sela'?'glassnew_anim_4':n.n==='Elin'?'glassnew_anim_6':n.lookId;
        m.roomActors=m.roomActors.filter(a=>a.spr!==remove);
      }
      seat(n,m,id,i);
    }
  }
  const apprentice=world.npcs.find(n=>n.n==='Ember');
  if(apprentice){world.roomActors=world.roomActors.filter(a=>a.spr!=='smithout_anim_7');seat(apprentice,world,'world',1);}
  const keepIndoor={};
  const indoorUsed=new Set(world.npcs.filter(n=>!n.seated&&!/pupil/.test(n.packSpr||'')).map(n=>n.lookId||n.packSpr||n.body||'npc_'+n.sk));
  for(const id of ['school','school2','tavern','inn']){
    const m=W.maps[id];if(!m)continue;
    for(const [i,n]of m.npcs.entries()){
      if(n.n==='Sable'){
        m.roomActors=m.roomActors.filter(a=>a.spr!=='school2_anim_5');seat(n,m,id,i);continue;
      }
      if(n.school||/pupil/.test(n.packSpr||''))continue;
      if(keepIndoor[n.n]){
        const p=keepIndoor[n.n];if(p.startsWith('npc:'))useSkin(n,p.slice(4));else usePack(n,p);
        n.stationary=true;
      }else if(id==='inn')usePack(n,'pack_drinker1');
      else if(indoorUsed.has(n.lookId||n.packSpr)||['Bess','Dorr','Nyra','Ser Anwen','Vale'].includes(n.n))seat(n,m,id,i);
      indoorUsed.add(n.lookId||n.packSpr);
    }
  }
  // Outdoor walking sheets get short real patrols, apart from counters and story actors.
  const story=new Set(['Bryn','Hettie','Gwil','Odo','King Halvard','Serjeant Bram','Doran','Tolan','Elder Maddock','Rowan the Hunter','Bramble','Liora']);
  for(const n of world.npcs){
    if(story.has(n.n)||n.counter||n.seated||n.school||n.desertNative)continue;
    const walking=n.packWalk||n.sk&&['d','s','u'].every(d=>SPR['npc_'+n.sk+'_'+d]);
    if(walking){n.stationary=false;n.patrol=[n.x/16-.5,n.y/16-1,n.x/16+1,n.y/16-1];n.patrolRest=4500;}
  }
  world.roomActors=(world.roomActors||[]).filter(a=>a.spr!=='stump_stool');
  // Liora owns the red-haired fishing appearance. The harbour kobold is
  // reserved for the desert; the tavern's distinct table performer stays.
  for(const key of ['objs','scatter','fobjs']){
    const a=world[key];if(!Array.isArray(a))continue;const kept=[];
    for(let i=0;i<a.length;i+=3){
      if(['hb_boy_red','hb_kobold'].includes(W.names[a[i]]))continue;
      kept.push(a[i],a[i+1],a[i+2]);
    }
    world[key]=kept;
  }
  // Keep the early villages human; retain monster sheets for later regions.
  for(const name of ['Doryn','Tessa']){const n=world.npcs.find(n=>n.n===name);if(n)seat(n,world,'world',1);}
  const merrin=world.npcs.find(n=>n.n==='Merrin');if(merrin)usePack(merrin,'pack_pupil_2_chair');
  for(const id of ['school','school2','tavern']){
    const m=W.maps[id];if(!m)continue;
    for(const n of m.npcs||[]){
      const match=/^pack_pupil_([68])_chair$/.exec(n.packSpr||'');
      if(match)usePack(n,'pack_pupil_'+(match[1]==='6'?2:11)+'_chair');
    }
  }
  restoreSchoolCast();
  restoreTavernCast();
  reserveMillwoodCast();
  finishTownCast();
  repairSeating();
}
// Four authored poses: resting, breathing in, half blink and closed blink.
// Long open-eye holds and a brief blink follow the native seated characters.
function villagerIdleFrame(o,t,frames){
  if(o.idleSeed===undefined){
    let seed=2166136261;
    for(const c of (o.n||'')+'|'+o.packSpr)seed=Math.imul(seed^c.charCodeAt(0),16777619);
    o.idleSeed=seed>>>0;
  }
  const cycle=4.8+((o.idleSeed>>>8)%9)*0.1;
  const phase=(o.idleSeed%997)/997*cycle;
  const p=((t+phase)%cycle)/cycle;
  const frame=p<0.20?0:p<0.46?1:p<0.88?0:p<0.895?2:p<0.92?3:p<0.935?2:0;
  return frame%frames;
}
function finishTownCast(){
  const world=W.maps.world;
  // Bryn is retired; Ada now appears only in her own Thornwell home.
  world.npcs=world.npcs.filter(n=>n.n!=='Bryn'&&n.n!=='Ada'&&n.n!=='Ember');
  const townOf=(id,n)=>{
    const match=(n.loc||'').match(/Millwood|Thornwell|Forgewick|Sandspire|Coralmere|Hollybeck|Shroom Pass/);
    if(match)return match[0];
    if(['inn','school','school2','tavern'].includes(id))return 'Thornwell';
    if(['smithy','glasswork','glasshouse','mine'].includes(id))return 'Forgewick';
    if(id==='world')return n.x<2000?'Millwood':n.x<7000?'Thornwell':n.x<18000?'Forgewick':n.x<29000?'Sandspire':n.x<38000?'Coralmere':'Hollybeck';
    return id;
  };
  const regionalCast = {"common":[{"key":"villager_seated_common_a6_0","sex":"female","species":"human"},{"key":"villager_seated_common_a6_1","sex":"female","species":"human"},{"key":"villager_seated_common_a6_2","sex":"female","species":"human"},{"key":"villager_seated_common_a6_3","sex":"male","species":"human"},{"key":"villager_seated_common_a6_4","sex":"male","species":"human"},{"key":"villager_seated_common_a6_5","sex":"male","species":"human"},{"key":"villager_seated_common_b6_0","sex":"female","species":"human"},{"key":"villager_seated_common_b6_1","sex":"female","species":"human"},{"key":"villager_seated_common_b6_2","sex":"female","species":"human"},{"key":"villager_seated_common_b6_3","sex":"male","species":"human"},{"key":"villager_seated_common_b6_4","sex":"male","species":"human"},{"key":"villager_seated_common_b6_5","sex":"male","species":"human"},{"key":"villager_seated_common_c6_0","sex":"female","species":"human"},{"key":"villager_seated_common_c6_1","sex":"female","species":"human"},{"key":"villager_seated_common_c6_2","sex":"male","species":"human"},{"key":"villager_seated_common_c6_3","sex":"male","species":"human"},{"key":"villager_seated_common_c6_4","sex":"male","species":"human"},{"key":"villager_seated_common_c6_5","sex":"male","species":"human"},{"key":"villager_seated_common_d6_0","sex":"female","species":"human"},{"key":"villager_seated_common_d6_1","sex":"male","species":"human"},{"key":"villager_seated_common_d6_2","sex":"male","species":"human"},{"key":"villager_seated_common_d6_3","sex":"male","species":"human"},{"key":"villager_seated_common_d6_4","sex":"male","species":"goblin"},{"key":"villager_seated_common_d6_5","sex":"male","species":"orc"}],"desert":[{"key":"villager_seated_desert_a5_0","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_1","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_2","sex":"female","species":"human"},{"key":"villager_seated_desert_a5_3","sex":"male","species":"human"},{"key":"villager_seated_desert_a5_4","sex":"male","species":"human"},{"key":"villager_seated_desert_b4_0","sex":"female","species":"lizard"},{"key":"villager_seated_desert_b4_1","sex":"female","species":"human"},{"key":"villager_seated_desert_b4_2","sex":"male","species":"lizard"},{"key":"villager_seated_desert_b4_3","sex":"male","species":"human"}],"coast":[{"key":"villager_seated_coast_a4_0","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_1","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_2","sex":"female","species":"human"},{"key":"villager_seated_coast_a4_3","sex":"male","species":"human"},{"key":"villager_seated_coast_b3_0","sex":"female","species":"human"},{"key":"villager_seated_coast_b3_1","sex":"female","species":"human"},{"key":"villager_seated_coast_b3_2","sex":"male","species":"human"}],"snow":[{"key":"villager_seated_snow5_0","sex":"female","species":"human"},{"key":"villager_seated_snow5_1","sex":"female","species":"human"},{"key":"villager_seated_snow5_2","sex":"female","species":"human"},{"key":"villager_seated_snow5_3","sex":"male","species":"human"},{"key":"villager_seated_snow5_4","sex":"male","species":"human"}]};
  const counts=new Map();
  const women=new Set(['Ada','Della','Fara','Hester','Junia','Lysa','Dagna','Gwyneth','Petra','Suri','Una','Vela','Rania','Yara','Coral','Edda','Ilsa','Elin','Maren','Sela','Celia','Zella','Iris','Asta','Tessa','Astrid','Nerissa','Greta']);
  function seatedLook(n,id){
    const town=townOf(id,n),used=counts.get(town)||new Set();counts.set(town,used);
    const region=town==='Sandspire'?'desert':town==='Coralmere'?'coast':town==='Hollybeck'?'snow':'common';
    const pool=regionalCast[region].filter(s=>town!=='Thornwell'||s.species==='human');
    const sex=women.has(n.n)?'female':'male';
    const actor=pool.find(s=>s.sex===sex&&!used.has(s.key));
    if(!actor)throw Error('Regional seated cast exhausted for '+n.n+' in '+town);
    used.add(actor.key);
    Object.assign(n,{packSpr:actor.key,lookId:actor.key,
      packDirections:false,packWalk:false,sk:undefined,body:undefined,school:false,
      seated:true,seatSpr:undefined,stationary:true,patrol:undefined,goto:undefined,f:'d',flip:false,sceneReserved:true});
  }
  for(const [id,m]of Object.entries(W.maps)){
    if(['tavern','school','school2'].includes(id))continue;
    for(const n of m.npcs||[]){
      if(townOf(id,n)==='Millwood')continue;
      if(n.seated||/^pack_pupil_/.test(n.packSpr||'')||id==='inn')seatedLook(n,id);
    }
  }
  // The tavern owns every variant of its performers and patrons.
  // Remove decorative aliases of active, named villagers as well.
  for(const key of ['objs','scatter','fobjs']){
    const a=world[key]||[],out=[];
    for(let i=0;i<a.length;i+=3)if(!['hb_boy_grn','hb_gramma','hb_oldman'].includes(W.names[a[i]]))out.push(a[i],a[i+1],a[i+2]);
    world[key]=out;
  }
  const linna=world.npcs.find(n=>n.n==='Linnet');
  if(linna){linna.n='Linna';for(const k of ['d','d2','dd','dd2','dv','dv2','dragonNear','dragonRumor','dragonRumor2'])if(Array.isArray(linna[k]))linna[k]=linna[k].map(s=>s.replace(/^Linnet:/,'Linna:'));}
  const marek=world.npcs.find(n=>n.n==='Marek');
  if(marek)Object.assign(marek,{packSpr:'pack_boy',lookId:'pack_boy',packDirections:false,packWalk:false,stationary:true,patrol:undefined});
  // Colm's eating sheet is distinct from the tavern patrons. All other
  // seated outdoor residents receive a real table, rather than a road chair.
  world.roomActors=(world.roomActors||[]).filter(a=>!a.castSeat);
  const tableSeat=(m,n,x,y)=>{
    Object.assign(n,{x,y,talkX:x-35,talkY:y+8,sceneReserved:true});
    m.roomActors.push({spr:'ichair1',x,y:y+5,sy:y-1,schoolArt:true,castSeat:true,sceneReserved:true});
    m.roomActors.push({spr:'itable0',x,y:y+30,sy:y+30,schoolArt:true,castSeat:true,sceneReserved:true});
    (m.roomBlocks ||= []).push([x-23,y+1,x+23,y+28]);
  };
  for(const n of world.npcs){
    if(!n.seated||n.counter)continue;
    if(n.n==='Merrin'||n.n==='Asta'){
      const i=n.n==='Merrin'?0:1,rect=i?[216,212,32,28]:[104,183,32,27],src=SPR.ifloor_tavern_patio;
      const spr='patio_table_front_'+i;SPR[spr]=[src[0]+rect[0],src[1]+rect[1],rect[2],rect[3],1];
      n.x=3728+rect[0]+16;n.y=848+rect[1]+3;n.talkX=n.x+(i?34:-34);n.talkY=n.y+14;n.sceneReserved=true;
      world.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      world.roomActors.push({spr,x:n.x,y:848+rect[1]+rect[3],schoolArt:true,castSeat:true,sceneReserved:true});
      (world.roomBlocks ||= []).push([n.x-16,n.y,n.x+16,848+rect[1]+rect[3]]);
    }else tableSeat(world,n,n.x,n.y);
  }
  // Every cropped indoor torso sits at a table's north edge. Reuse the
  // room's furniture artwork so the tabletop correctly masks the cut.
  for(const [id,m]of Object.entries(W.maps)){
    if(['world','tavern','school','school2','house26','cinderhold','witchmoor'].includes(id))continue;
    const residents=(m.npcs||[]).filter(n=>n.seated||n.seatSpr);if(!residents.length)continue;
    m.roomActors=(m.roomActors||[]).filter(a=>!a.castSeat);
    if(id==='glasshouse'||id==='inn'){
      const rect=id==='glasshouse'?[88,100,106,18]:[160,112,80,25];
      residents.forEach((n,i)=>{
        n.x=id==='glasshouse'?112+i*36:200;n.y=rect[1]+3;
        n.talkX=n.x;n.talkY=rect[1]+rect[3]+10;n.sceneReserved=true;
        m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      });
      m.roomActors.push({roomCrop:rect,x:rect[0]+rect[2]/2,y:rect[1]+rect[3],sy:rect[1]+rect[3],castSeat:true,sceneReserved:true});
      continue;
    }
    let table=(m.roomBlocks||[]).find(b=>b[1]>=125&&b[1]<=155&&b[2]-b[0]>=40&&b[2]-b[0]<=65);
    if(table&&m.roomArt){
      const w=table[2]-table[0],h=table[3]-table[1];
      const inset=['house33','house36','house39'].includes(id)?43:w>=58?(h>=24?14:17):h>=24?5:6;
      const top=table[1]-inset,cx=(table[0]+table[2])/2;
      for(const [i,n]of residents.entries()){
        n.x=cx+(residents.length>1?(i-(residents.length-1)/2)*22:0);n.y=top+3;
        n.talkX=i?table[2]+12:table[0]-12;n.talkY=top+12;n.sceneReserved=true;
        m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,castSeat:true,sceneReserved:true});
      }
      m.roomActors.push({roomCrop:[table[0]-2,top,w+4,table[3]-top],x:cx,y:table[3],sy:table[3],castSeat:true,sceneReserved:true});
    }else{
      // Bedrooms/workshops without a dining table get a compact writing table.
      for(const [i,n]of residents.entries()){
        let x=n.x,y=n.y;
        if(/_bedroom/.test(id)){x=136;y=112;}
        if(id==='glasshouse'){x=144+i*72;y=156;}
        if(id==='smithy'){x=216;y=224;}
        if(id==='glasswork'){x=72;y=138;}
        if(id==='inn'){x=120;y=184;}
        tableSeat(m,n,x,y);
      }
    }
  }
  const routes={
    Gwil:[[282,6992],[394,6992],[394,7016],[282,7016]],
    Orin:[[4288,1440],[4440,1440]],
    Mella:[[4096,1760],[4224,1760]],
    Linna:[[4288,1664],[4288,1536]],
    Garrow:[[3816,1696],[3816,1744]]
  };
  for(const [i,n]of world.npcs.entries()){
    if(routes[n.n]){
      n.x=routes[n.n][0][0];n.y=routes[n.n][0][1];n.patrolPoints=routes[n.n];n.patrol=true;
      n.patrolFrom=undefined;n.stationary=false;n.sceneReserved=true;
    }
    if(n.patrol&&!n.desertNative){n.patrolRest=2800+(i*1397)%4200;n.patrolSpeed=30+(i*7)%17;n.routeSeed=i;}
  }
  const bevan=world.npcs.find(n=>n.n==='Bevan');if(bevan){bevan.x=12472;bevan.y=3280;bevan.sceneReserved=true;}
  const gwil=world.npcs.find(n=>n.n==='Gwil');
  if(gwil){
    gwil.loc='Millwood, farm';gwil.bio='A Millwood woodcutter helping tend the village farm.';
    gwil.d=['Gwil: The wood can wait a morning. These beds need tending before the sun gets high.', 'Gwil: Hettie asked me to keep an eye on the farm. I reckon the crows have already noticed the change.'];
    gwil.d2=['Gwil: I mended that fence with oak offcuts. Nothing goes to waste around here.', 'Gwil: Mind the seedlings, Corin. They have only just found their feet.'];
  }
}
let npcCollisionActor=null;
function canNpcStand(x,y,actor){
  const previous=npcCollisionActor;npcCollisionActor=actor;
  try{return ![[-5.5,-7],[5.5,-7],[-5.5,-1],[5.5,-1]].some(([dx,dy])=>isSolid(x+dx,y+dy,true));}
  finally{npcCollisionActor=previous;}
}
function patrolRoute(n){
  const clear=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(1,Math.ceil(d/4));
    for(let i=0;i<=steps;i++)if(!canNpcStand(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps,n))return false;return true;};
  if(n.patrolPoints&&n.patrolPoints.every((p,i,a)=>clear(p,a[(i+1)%a.length])))return n.patrolPoints;
  const origin=[n.x,n.y],points=[origin],dirs=[[1,0],[0,1],[-1,0],[0,-1]],seed=n.routeSeed||0;
  for(let i=0;i<4;i++){
    const d=dirs[(i+seed)%4];let end=origin;
    for(let dist=8;dist<=48+(seed%4)*16;dist+=8){const p=[origin[0]+d[0]*dist,origin[1]+d[1]*dist];if(!clear(origin,p))break;end=p;}
    if(end!==origin){points.push(end,origin);if(points.length>=5)break;}
  }
  return points;
}

function repairSeating(){
  const world=W.maps.world;
  world.npcs=world.npcs.filter(n=>n.n!=='Mella');
  // Remove the old picnic-basket/flute figure from Hollybeck. The sheet is
  // legacy market art and is no longer assigned to any resident.
  world.npcs=world.npcs.filter(n=>n.n!=='Hakon');
  delete NPC_VOICES.Hakon;

  // Rowan stands beside house00. Make its resident his wife and give their
  // cottage and conversation an explicit connection to the hunter quest.
  const rowanHome=W.maps.house00;
  const ada=rowanHome?.npcs?.find(n=>n.n==='Ada');
  if(ada){
    rowanHome.title='Thornwell — Rowan and Ada’s Cottage';
    ada.bio='Rowan the Hunter’s wife. She keeps their Thornwell cottage while he ranges with Bramble.';
    ada.d=[
      'Ada: Rowan leaves before sunrise and still manages to bring half the forest home on his boots.',
      'Corin: Bramble brings the other half.',
      'Ada: That is why I married the hunter and merely tolerate his dog.'
    ];
    ada.d2=[
      'Ada: If you see my husband outside, remind him that a hunt ends when he comes home.',
      'Ada: Bramble remembers. Rowan occasionally needs prompting.'
    ];
  }

  // These sheets have different transparent padding around the character.
  // Per-sprite anchors put each visible body at the centre of the table's
  // straight north edge without changing the authored clipping height.
  for(const [id,name,x]of [
    ['house46','Edda',80],
    ['house47','Fennel',75],
    ['house50','Bjorn',74]
  ]){
    const n=W.maps[id]?.npcs?.find(n=>n.n===name);
    if(n){n.x=x;n.stationary=true;n.sceneReserved=true;}
  }
  const linna=world.npcs.find(n=>n.n==='Linna');
  if(linna)Object.assign(linna,{stationary:true,patrol:undefined,patrolPoints:undefined,goto:undefined,sk:undefined,packWalk:false,idleFrame:0});
  const wren=world.npcs.find(n=>n.n==='Wren');
  if(wren){
    const oldX=wren.x,oldY=1872;
    world.roomActors=(world.roomActors||[]).filter(a=>!(a.x===oldX&&
      ((a.spr==='ichair1'&&a.y===oldY+5)||(a.spr==='itable0'&&a.y===oldY+30))));
    world.roomBlocks=(world.roomBlocks||[]).filter(b=>!(b[0]===oldX-23&&b[1]===oldY+1&&b[2]===oldX+23&&b[3]===oldY+28));

    const bi=world.npcs.findIndex(n=>n.n==='Berta');
    const berta=bi>=0?world.npcs.splice(bi,1)[0]:null;
    const sales=berta?.sells||['potion','salt'];
    Object.assign(wren,{x:4120,y:1786,talkX:4120,talkY:1830,counter:{x:4120,y:1816},
      sells:sales,seated:false,seatClipY:undefined,stationary:true,sceneReserved:true,idleFrame:undefined,
      bio:'Thornwell’s herbalist and merchant, tending the greenhouse market stand.'});

    if(berta){
      delete berta.sells;delete berta.counter;
      Object.assign(berta,{x:88.5,y:132,talkX:47,talkY:141,packSpr:'villager_seated_common_c6_0',
        lookId:'villager_seated_common_c6_0',packDirections:false,packWalk:false,seated:true,
        seatClipY:129,stationary:true,sceneReserved:true,idleFrame:undefined,patrol:undefined,
        bio:'A retired Thornwell market herbalist who still mixes stock for Wren.',
        d:['Berta: Wren has taken over the greenhouse stall. I am discovering how quiet this room can be.',
          'Berta: She knows the herbs, and she has more patience for customers than I ever did.'],
        d2:['Berta: I still mix stock for Wren. Leaving the counter did not mean leaving the work.']});
      const home=W.maps.house02;
      home.title='Thornwell — Berta’s Cottage';
      home.npcs.push(berta);
      home.roomActors.push({spr:'ichair1',x:berta.x,y:berta.y+5,sy:berta.y-1,
        schoolArt:true,castSeat:true,sceneReserved:true});
    }
  }
  for(const[id,m]of Object.entries(W.maps)){
    const crops=(m.roomActors||[]).filter(a=>a.roomCrop);
    for(const n of m.npcs||[]){
      if(!n.seated&&!n.seatSpr)continue;
      const crop=crops.find(a=>n.x>=a.roomCrop[0]-12&&n.x<=a.roomCrop[0]+a.roomCrop[2]+12&&Math.abs(n.y-a.roomCrop[1])<20);
      if(crop)n.seatClipY=crop.roomCrop[1];
    }
    // A room-background rectangle must never redraw over the player.
    m.roomActors=(m.roomActors||[]).filter(a=>!a.roomCrop);
    if(['house23','house25','house27'].includes(id))m.roomActors=m.roomActors.filter(a=>!(a.castSeat&&a.spr==='ichair1'));
  }
  for(const[id,name]of [['house27','Joss'],['house27_bedroom','Tam']]){
    const n=W.maps[id].npcs.find(n=>n.n===name);if(n)n.y-=1;
  }
  // Rania and Latif share the straight north edge of a Sandspire square table.
  const m=W.maps.house41;
  m.roomActors=m.roomActors.filter(a=>!a.castSeat);
  m.roomActors.push({roomBackgroundPatch:{spr:'house33_room',rect:[32,104,120,96]},x:32,y:104,sy:-100,sceneReserved:true});
  m.roomBlocks=m.roomBlocks.filter(b=>!(b[0]===59&&b[1]===150));
  m.roomBlocks.push([65,116,111,172],[46,143,59,162],[117,143,130,162]);
  for(const[i,n]of m.npcs.entries()){
    n.x=77+i*22;n.y=113;n.seatClipY=110;n.talkX=i?143:33;n.talkY=126;n.sceneReserved=true;
    m.roomActors.push({spr:'ichair1',x:n.x,y:n.y+5,sy:n.y-1,schoolArt:true,sceneReserved:true});
  }
}
function drawNpcFrame(o,s,frame,img){
  // Sella's native hooded sheet has one pose per direction; breathe at fixed feet.
  if(o.n==='Sella'&&o.stationary&&s[4]===1){
    const h=s[3]-(Math.sin(performance.now()/1000*1.8)>0.65?1:0);
    drawGameImage(ctx,img,s[0],s[1],s[2],s[3],Math.round(o.x-s[2]/2),Math.round(o.y-h),s[2],h);return;
  }
  const clip=o.seatClipY!==undefined&&!o.goto&&!(o.seatSpr&&(scene||bossScene||hatchExit));
  if(clip){ctx.save();ctx.beginPath();ctx.rect(o.x-s[2]/2-1,o.y-s[3]-2,s[2]+2,Math.max(0,o.seatClipY-(o.y-s[3])+2));ctx.clip();}
  drawGameImage(ctx,img,s[0]+frame*s[2],s[1],s[2],s[3],Math.round(o.x-s[2]/2),Math.round(o.y-s[3]),s[2],s[3]);
  if(clip)ctx.restore();
}

function millwoodSpriteFamily(key){
  if(!key)return '';
  const pupil=/^(?:seated_body_|pack_pupil_)(\d+)/.exec(key);
  if(pupil)return 'pupil_'+pupil[1];
  if(/^hettie96|^market_bread$/.test(key))return 'hettie96';
  if(/^maddock_smith107|^maddock_seated$/.test(key))return 'maddock_smith107';
  if(/^kg(?:_|$)|^king_seated$/.test(key))return 'kg';
  if(/^pack_oldman|^hb_oldman$/.test(key))return 'pack_oldman';
  return key.replace(/_(?:idle|walk)_[duew]$/,'');
}
function reserveMillwoodCast(){
  const owners=new Map();
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]){
    if(!/Millwood/.test(n.loc||''))continue;
    const family=millwoodSpriteFamily(n.packSpr||n.body||(n.sk?'npc_'+n.sk:n.lookId));
    if(family)owners.set(family,n.n);
  }
  let replacement=0;
  for(const [id,m]of Object.entries(W.maps))for(const n of m.npcs||[]){
    const family=millwoodSpriteFamily(n.packSpr||n.body||(n.sk?'npc_'+n.sk:n.lookId));
    const owner=owners.get(family);if(!owner||owner===n.n)continue;
    // Only the remaining seated sheets may repeat outside Millwood.
    // Keep early-town humans and reserve lizards for the desert.
    const later=/Coralmere|Hollybeck|Shroom Pass/.test(n.loc||'');
    const pool=/Sandspire/.test(n.loc||'')?[12,6,8]:later?[12,6]:[12];
    const pupil=pool[replacement++%pool.length];
    const chair=/_chair$/.test(n.packSpr||'');
    n.packSpr=chair?'pack_pupil_'+pupil+'_chair':'seated_body_'+pupil;
    n.lookId=n.packSpr;n.packDirections=false;n.packWalk=false;n.stationary=true;
    n.sk=undefined;n.body=undefined;n.seatSpr=undefined;n.patrol=undefined;n.goto=undefined;
    n.seated=true;n.f='d';n.flip=false;
  }
}
function restoreTavernCast(){
  const m=W.maps.tavern;
  const rows=[
    ['Bess',9,240,128,240,150],['Ronan',6,208,144,224,148],
    ['Venn',7,80,176,64,190],['Hobb',8,160,184,144,168],
    ['Edric',10,120,272,134,266],['Dorr',11,416,240,440,240],
    ['Ser Anwen',12,280,256,260,238],['Grusk',13,388,272,388,230],
    ['Fen',14,184,192,220,190],
    ['Senn',16,304,256,318,236],['Dain',17,360,280,345,278],
    ['Rusk',18,144,176,131,193],['Linnet',19,256,176,256,196],
    ['Pip',20,208,208,220,216],['Vale',21,88,272,66,266],
    ['Cerys',22,320,288,338,288],['Nyra',23,416,280,440,280]
  ];
  m.npcs=m.npcs.filter(n=>n.n!=='Tobin');
  m.roomActors=m.roomActors.filter(a=>!a.castSeat&&!/^tavern_anim_/.test(a.spr));
  for(const [name,i,x,y,talkX,talkY]of rows){
    const spr='tavern_anim_'+i,n=m.npcs.find(n=>n.n===name);if(!n)continue;
    Object.assign(n,{x,y,talkX,talkY,school:true,stationary:true,sceneReserved:true,lookId:spr,
      packSpr:undefined,packDirections:false,packWalk:false,sk:undefined,body:undefined,seated:false,seatSpr:undefined,patrol:undefined,goto:undefined});
    m.roomActors.push({spr,x,y,schoolArt:true,sceneReserved:true,editKey:'tavern:'+spr});
  }
  // User's tavern PATCH v3. The requested removal supersedes Tobin's move.
  for(const [i,x,y]of [[17,374,272],[23,407,273],[12,286,256],
    [20,201,208],[8,162,176],[18,127,177]]){
    const a=m.roomActors.find(a=>a.spr==='tavern_anim_'+i);a.x=x;a.y=y;
  }
  m.roomActors.push({spr:'stump_stool',x:210,y:140,sy:143,schoolArt:true,
    sceneReserved:true,editKey:'tavern:ronan_stool'});
}
function restoreSchoolCast(){
  // Original scene sheets belong exclusively to the reading hall and study.
  const reader=SPR.school_src_Reader1;
  SPR.library_reader_red=[reader[0],reader[1],reader[2],40,reader[4]];
  const layouts={
    school:[
      ['Archivist Elowen','school_src_Librarian_idle',216,112,216,120],
      ['Mira','library_reader_red',258,192,306,202],
      ['Oren','school_anim_5',170,220,132,220],
      ['Tessa','school_anim_6',268,264,308,264]],
    school2:[
      ['Master Iven','school2_anim_3',72,184,54,190],
      ['Bram','school2_anim_6',96,192,118,197],
      ['Nell','school2_anim_4',248,184,281,190],
      ['Sable','school2_anim_5',112,160,112,164],
      ['Pella','school2_anim_7',136,192,168,190]]
  };
  for(const [id,rows]of Object.entries(layouts)){
    const m=W.maps[id];
    m.roomActors=m.roomActors.filter(a=>!a.castSeat&&/^(school_anim_[0-3]|school2_anim_[0-2])$/.test(a.spr));
    for(const [name,spr,x,y,talkX,talkY]of rows){
      const n=m.npcs.find(n=>n.n===name);if(!n)continue;
      Object.assign(n,{x,y,talkX,talkY,school:true,stationary:true,sceneReserved:true,lookId:spr,
        packSpr:undefined,packDirections:false,packWalk:false,sk:undefined,body:undefined,seated:false,seatSpr:undefined,patrol:undefined,goto:undefined});
      m.roomActors.push({spr,x,y,schoolArt:true,sceneReserved:true});
    }
  }
  // User's EMBERFELL PATCH v3: artwork and dialogue proxy have separate anchors.
  const study=W.maps.school2;
  for(const [spr,x,y]of [['school2_anim_3',79,175],['school2_anim_6',96,176],
    ['school2_anim_5',103,165],['school2_anim_4',249,176]]){
    const actor=study.roomActors.find(a=>a.spr===spr);actor.x=x;actor.y=y;
  }
  const iven=study.npcs.find(n=>n.n==='Master Iven');iven.x=71;iven.y=182;
}
function applyWorld(text) {
  W = JSON.parse(text);
  individualizeDialogue();
  const nan=W.maps.house26?.npcs?.find(n=>n.n==='Nan Ferrow');
  if(nan){
    nan.d=[
      'Nan Ferrow: When I was young, I saw a dragon pass over this valley.',
      'Nan Ferrow: I told one person. The King\'s men were here inside a week, asking me to say it again.',
      'Corin: What did you tell them?',
      'Nan Ferrow: That I had been mistaken. It was the safest lie I ever learned.'
    ];
    nan.d2=[
      'Nan Ferrow: They still pass over sometimes. Not often.',
      'Corin: And nobody says anything?',
      'Nan Ferrow: Nobody sensible. Halvard has been hunting the truth for most of my life.'
    ];
    nan.dv=[
      'Nan Ferrow: I learned to deny what I saw. Because of you, our children will not have to.'
    ];
    nan.bio='Corin’s grandmother and an elder of Millwood.';
    nan.dragonRumor=['Nan Ferrow: I hear about my own grandson from travellers now. Imagine that.'];
    nan.dragonRumor2=['Nan Ferrow: I always knew you would find your own path. I did not expect it to have wings.'];
  }
  dressSandspire();
  /* Maddock keeps his four-direction sheet for scripted movement. */
  for (const mid of ["world", "house22"]) {
    const maddock = W.maps[mid]?.npcs?.find(n => n.n === "Elder Maddock");
    if (!maddock) continue;
    maddock.packSpr = "maddock_smith107";
    maddock.lookId = "maddock_smith107";
    maddock.packDirections = true;
    maddock.packWalk = true;
    maddock.idleFps = 3;
  }
  for (const mid in W.maps) {
    const mm = W.maps[mid];
    for (const key of ["scatter", "objs"]) {
      const v = mm[key];
      if (!v || !v.p) continue;
      const bin = atob(v.p);
      if (v.v) {
        const out = [];
        let s = 0, x = 0, y = 0, i = 0, f = 0, acc = 0, sh = 0;
        while (i < bin.length) {
          const b = bin.charCodeAt(i++);
          acc |= (b & 127) << sh;
          if (b & 128) { sh += 7; continue; }
          const d = (acc >>> 1) ^ -(acc & 1);       /* un-zig-zag */
          acc = 0; sh = 0;
          if (f === 0) { s += d; f = 1; }
          else if (f === 1) { x += d; f = 2; }
          else { y += d; f = 0; out.push(s, x, y); }
        }
        mm[key] = out;
      } else {
        const dv = new DataView(new ArrayBuffer(bin.length));
        for (let i = 0; i < bin.length; i++) dv.setUint8(i, bin.charCodeAt(i));
        const out = new Array((bin.length / 12) * 3);
        let s = 0, x = 0, y = 0, o = 0;
        for (let i = 0; i < bin.length; i += 12) {
          s += dv.getInt32(i, true);
          x += dv.getInt32(i + 4, true);
          y += dv.getInt32(i + 8, true);
          out[o++] = s; out[o++] = x; out[o++] = y;
        }
        mm[key] = out;
      }
    }
  }
  installKnightEncounter();
  installFishingVillager();
  installMarketCounters();
  // Working craftspeople keep their original animated workshop scenes.
  const workingScenes=Object.fromEntries(['glasswork','smithy'].map(id=>[id,JSON.parse(JSON.stringify(W.maps[id]))]));
  arrangeNpcCast();
  for(const [id,scene] of Object.entries(workingScenes)){
    W.maps[id]=scene;
    for(const n of scene.npcs){n.sceneReserved=true;n.school=true;n.stationary=true;}
    for(const actor of scene.roomActors||[])actor.sceneReserved=true;
  }

  installRoyalCastle();
  repairCoralmere();
  // User world collision patch: 8-pixel cells, September 20.
  Object.assign(W.maps.world.collisionOverrides ||= {},{"3004,198":false,"3004,199":false,"3005,198":false,"3005,199":false,"3006,198":false,"3006,199":false,"3007,198":false,"3007,199":false,"3008,198":false,"3008,199":false,"3009,198":false,"3009,199":false,"3010,198":false,"3010,199":false,"3011,198":false,"3011,199":false,"3002,183":false,"3003,183":false,"3004,183":false,"3005,183":false,"3006,183":false,"3007,183":false,"3008,183":false,"3009,183":false,"3010,183":false,"3011,183":false,"3012,183":false,"3003,182":false,"3004,182":false,"3005,182":false,"3006,182":false,"3007,182":false,"3008,182":false,"3009,182":false,"3010,182":false,"3011,182":false,"3002,180":true,"3002,181":true,"3002,182":true,"3011,224":false,"3011,225":false,"3011,226":false,"3011,227":false,"3011,228":false,"3010,224":false,"3010,225":false,"3010,226":false,"3010,227":false,"3010,228":false,"3010,229":false,"3015,224":false,"3015,225":false,"3015,226":false,"3015,227":false,"3015,228":false,"3014,224":false,"3014,225":false,"3014,226":false,"3014,227":false,"3014,228":false,"3024,220":false,"3024,221":false,"3024,222":false,"3024,223":false,"3024,224":false,"3024,225":false,"3025,220":false,"3025,221":false,"3025,222":false,"3025,223":false,"3025,224":false,"3028,219":false,"3028,220":false,"3028,221":false,"3028,222":false,"3028,223":false,"3029,220":false,"3029,221":false,"3029,222":false,"3029,223":false,"3029,224":false,"3022,222":false,"3022,223":false,"3022,224":false,"3022,225":false,"3022,226":false,"3022,227":false,"3022,228":false,"3022,229":false,"3022,230":false,"3023,222":false,"3023,223":false,"3023,224":false,"3023,225":false,"3023,226":false,"3023,227":false,"3023,228":false,"3023,229":false,"3023,230":false,"3023,231":false,"3038,222":false,"3038,223":false,"3038,224":false,"3038,225":false,"3038,226":false,"3038,227":false,"3038,228":false,"3038,229":false,"3038,230":false,"3038,231":false,"3039,222":false,"3039,223":false,"3039,224":false,"3039,225":false,"3039,226":false,"3039,227":false,"3039,228":false,"3039,229":false,"3039,230":false,"3039,231":false,"3037,223":false,"3035,231":false,"3035,232":false,"3035,233":false,"3035,234":false,"3036,232":false,"3036,233":false,"3036,234":false,"3036,235":false,"3048,218":false,"3048,219":false,"3048,220":false,"3048,221":false,"3048,222":false,"3048,223":false,"3048,224":false,"3048,225":false,"3049,223":false,"3049,224":false,"3049,225":false,"3049,226":false,"3049,227":false,"3064,218":false,"3064,219":false,"3064,220":false,"3064,221":false,"3064,222":false,"3064,223":false,"3064,224":false,"3064,225":false,"3064,226":false,"3064,227":false,"3065,218":false,"3065,219":false,"3065,220":false,"3065,221":false,"3065,222":false,"3065,223":false,"3065,224":false,"3065,225":false,"3050,218":false,"3050,219":false,"3050,220":false,"3050,221":false,"3050,222":false,"3050,223":false,"3050,224":false,"3050,225":false,"3050,226":false,"3051,218":false,"3051,219":false,"3051,220":false,"3051,221":false,"3051,222":false,"3051,223":false,"3051,224":false,"3051,225":false,"3053,218":false,"3054,218":false,"3055,218":false,"3056,218":false,"3052,224":false,"3052,225":false,"3057,225":false,"3058,225":false,"3059,225":false,"3060,225":false,"3061,225":false,"3062,225":false,"3063,225":false,"3037,233":false,"3037,234":false,"3050,216":false,"3051,216":false,"3052,216":false,"3053,216":false,"3054,216":false,"3055,216":false,"3056,216":false,"3056,217":false,"3053,224":false,"3053,225":false,"3054,224":false,"3054,225":false,"3055,224":false,"3055,225":false,"3056,224":false,"3056,225":false,"3055,223":false,"3056,223":false,"3057,223":false,"3057,224":false,"3058,223":false,"3058,224":false,"3059,223":false,"3059,224":false,"3060,223":false,"3060,224":false,"3061,223":false,"3061,224":false,"3062,223":false,"3062,224":false,"3063,223":false,"3063,224":false,"3049,215":true,"3049,216":true,"3049,217":true,"3049,218":true,"3049,219":true,"3049,220":true,"3049,221":true,"3049,222":true,"3050,215":true,"3051,215":true,"3052,215":true,"3053,215":true,"3054,215":true,"3055,215":true,"3056,215":true,"3057,215":true,"3057,216":true,"3057,217":true,"3057,218":true,"3052,221":true,"3052,222":true,"3052,223":true,"3053,222":true,"3053,223":true,"3054,222":true,"3054,223":true,"3044,148":false,"3044,149":false,"3044,150":false,"3044,151":false,"3044,152":false,"3044,153":false,"3044,154":false,"3044,155":false,"3045,148":false,"3045,149":false,"3045,150":false,"3045,151":false,"3045,152":false,"3045,153":false,"3045,154":false,"3045,155":false,"3043,148":false,"3043,149":false,"3033,152":false,"3033,153":false,"3033,154":false,"3033,155":false,"3033,156":false,"3033,157":false,"3032,152":false,"3032,153":false,"3032,154":false,"3032,155":false,"3032,156":false,"3032,157":false,"3016,152":false,"3016,153":false,"3016,154":false,"3016,155":false,"3016,156":false,"3016,157":false,"3016,158":false,"3016,159":false,"3017,152":false,"3017,153":false,"3017,154":false,"3017,155":false,"3017,156":false,"3017,157":false,"3017,158":false,"3040,160":false,"3040,161":false,"3040,162":false,"3040,163":false,"3040,164":false,"3040,165":false,"3040,166":false,"3040,167":false,"3041,160":false,"3041,161":false,"3041,162":false,"3041,163":false,"3041,164":false,"3041,165":false,"3041,166":false,"3041,167":false,"3039,167":false,"3052,160":false,"3052,161":false,"3052,162":false,"3052,163":false,"3052,164":false,"3052,165":false,"3052,166":false,"3052,167":false,"3052,168":false,"3053,160":false,"3053,161":false,"3053,162":false,"3053,163":false,"3053,164":false,"3053,165":false,"3053,166":false,"3053,167":false,"3053,168":false,"3053,169":false,"3051,166":false,"3051,167":false,"3051,168":false,"3051,169":false,"3051,170":false,"3047,168":false,"3047,169":false,"3047,170":false,"3046,168":false,"3046,169":false,"3046,170":false,"3050,167":false,"3050,168":false,"3050,169":false,"3050,170":false,"3054,166":false,"3054,167":false,"3054,168":false,"3054,169":false,"3054,170":false,"3054,171":false,"3054,172":false,"3054,173":false,"3055,170":false,"3055,171":false,"3055,172":false,"3055,173":false,"3056,166":false,"3056,167":false,"3056,168":false,"3056,169":false,"3056,170":false,"3056,171":false,"3056,172":false,"3056,173":false,"3057,166":false,"3057,167":false,"3057,168":false,"3057,169":false,"3057,170":false,"3057,171":false,"3057,172":false,"3057,173":false,"3059,166":false,"3060,166":false,"3061,166":false,"3055,163":true,"3055,164":true,"3055,165":true,"3055,166":true,"3055,167":true,"3055,168":true,"3055,169":true,"3056,163":true,"3057,163":true,"3058,163":true,"3059,163":true,"3060,163":true,"3061,163":true,"3062,163":true,"3063,163":true,"3063,164":true,"3063,165":true,"3063,166":true,"3041,194":false,"3041,195":false,"3041,196":false,"3041,197":false,"3041,198":false,"3040,194":false,"3040,195":false,"3040,196":false,"3040,197":false,"3042,194":false,"3043,194":false,"3044,194":false,"3044,195":false,"3044,196":false,"3044,197":false,"3045,194":false,"3045,195":false,"3045,196":false,"3045,197":false,"3049,206":false,"3049,207":false,"3050,206":false,"3050,207":false,"3051,206":false,"3051,207":false,"3052,200":false,"3052,201":false,"3052,202":false,"3052,203":false,"3052,204":false,"3052,205":false,"3052,206":false,"3052,207":false,"3053,200":false,"3053,201":false,"3053,202":false,"3053,203":false,"3053,204":false,"3053,205":false,"3053,206":false,"3053,207":false,"3053,208":false,"3053,209":false,"3053,210":false,"3053,211":false,"3055,208":false,"3055,209":false,"3055,210":false,"3055,211":false,"3055,212":false,"3055,213":false,"3054,212":false,"3054,213":false,"3054,214":false,"3057,208":false,"3058,208":false,"3059,208":false,"3060,208":false,"3040,200":false,"3040,201":false,"3040,202":false,"3040,203":false,"3040,204":false,"3040,205":false,"3040,206":false,"3040,207":false,"3041,200":false,"3041,201":false,"3041,202":false,"3041,203":false,"3041,204":false,"3041,205":false,"3041,206":false,"3041,207":false,"3054,204":false,"3055,204":false,"3054,205":true,"3054,206":true,"3054,207":true,"3054,208":true,"3054,209":true,"3054,210":true,"3054,211":true,"3055,205":true,"3056,205":true,"3057,205":true,"3058,205":true,"3059,205":true,"3060,205":true,"3061,205":true,"3061,206":true,"3061,207":true,"3061,208":true,"3065,184":false,"3065,185":false,"3065,186":false,"3065,187":false,"3065,188":false,"3063,184":false,"3064,183":false,"3064,184":false,"3064,185":false,"3064,186":false,"3064,187":false,"3060,184":false,"3060,185":false,"3060,186":false,"3061,184":false,"3061,185":false,"3059,184":false,"3058,171":false,"3058,172":false,"3058,173":false,"3059,171":false,"3059,172":false,"3059,173":false,"3060,171":false,"3060,172":false,"3060,173":false,"3061,171":false,"3061,172":false,"3061,173":false,"3062,171":false,"3062,172":false,"3062,173":false,"3063,171":false,"3063,172":false,"3063,173":false,"3064,171":false,"3064,172":false,"3064,173":false,"3065,171":false,"3065,172":false,"3065,173":false,"3066,171":false,"3066,172":false,"3066,173":false,"3067,171":false,"3067,172":false,"3067,173":false,"3068,171":false,"3068,172":false,"3068,173":false,"3069,171":false,"3069,172":false,"3069,173":false,"3070,171":false,"3070,172":false,"3070,173":false,"3059,174":false,"3069,174":false,"3069,175":false,"3069,176":false,"3070,151":false,"3070,152":false,"3070,153":false,"3070,154":false,"3070,155":false,"3070,156":false,"3070,157":false,"3070,158":false,"3070,159":false,"3070,160":false,"3070,161":false,"3070,162":false,"3070,163":false,"3070,164":false,"3070,165":false,"3070,166":false,"3070,167":false,"3070,168":false,"3070,169":false,"3070,170":false,"3070,174":false,"3070,175":false,"3070,176":false,"3069,152":false,"3069,153":false,"3069,154":false,"3023,168":false,"3023,169":false,"3023,170":false,"3023,171":false,"3023,172":false,"3023,173":false,"3023,174":false,"3023,164":false,"3024,164":false,"3025,164":false,"3022,165":true,"3022,166":true,"3022,167":true,"3022,168":true,"3023,165":true,"3024,165":true,"3025,165":true,"3026,165":true,"3027,165":true,"3028,165":true,"3029,165":true,"3029,166":true,"3029,167":true,"3029,168":true,"3024,167":true,"3024,168":true,"3021,210":false,"3021,211":false,"3021,212":false,"3021,213":false,"3021,214":false,"3020,210":false,"3020,211":false,"3020,212":false,"3020,213":false,"3020,214":false,"3017,210":false,"3017,211":false,"3017,212":false,"3017,213":false,"3017,214":false,"3018,210":false,"3019,210":false,"3016,202":false,"3016,203":false,"3016,204":false,"3016,205":false,"3016,206":false,"3016,207":false,"3016,208":false,"3016,209":false,"3016,210":false,"3016,211":false,"3016,212":false,"3016,213":false,"3016,214":false,"3015,215":false,"3022,208":false,"3022,209":false,"3022,210":false,"3023,208":false,"3023,209":false,"3023,210":false,"3024,208":false,"3024,210":false,"3026,206":false,"3026,207":false,"3026,208":false,"3026,209":false,"3026,210":false,"3026,211":false,"3027,206":false,"3027,207":false,"3027,208":false,"3027,209":false,"3027,210":false,"3027,211":false,"3027,212":false,"3025,202":false,"3025,203":false,"3025,204":false,"3025,205":false,"3025,206":false,"3025,207":false,"3014,210":false,"3014,211":false,"3014,212":false,"3014,213":false,"3014,214":false,"3014,215":false,"3024,201":false,"3024,202":false,"3024,203":false,"3024,204":false,"3024,205":false,"3024,206":false});
  installFirstTemple();
  installSecondTemple();
  installThirdTemple();
  refineSecondTemple();
  finishTempleLayouts77();
  refineTemples78();
  finishTempleLayouts82();
  for(const [index,x,y]of [[56,15330,4099],[57,45024,1313],[58,29552,5051]]){
   const d=W.maps.world.doors[index];if(d)d.triggerRect={x,y,w:16,h:16};
  }
  const snowExit=W.maps.sn1.doors.find(d=>d.to==='world');if(snowExit){snowExit.tx=2814;snowExit.ty=84;}

  installCastleCellar();
  restoreTempleEntrances();
  // Per-record map names from the supplied collision patch.
  for(const [id,cells] of Object.entries({"house26":{"18,22":false,"18,23":false,"18,24":false,"14,19":false,"14,20":false,"14,21":false,"15,19":false,"15,20":false,"16,18":false,"16,19":false,"16,20":false,"16,21":false,"11,19":false,"11,20":false,"11,21":false,"12,19":false,"12,20":false,"10,19":false,"10,20":false,"9,19":false,"9,20":false,"9,21":false},"royal_banquet":{"5,19":false,"6,19":false,"7,19":false,"8,19":false,"9,19":false,"10,19":false,"11,19":false,"12,19":false,"13,19":false,"14,19":false,"15,19":false,"16,19":false,"17,19":false,"18,19":false,"19,19":false,"20,19":false,"21,19":false,"22,19":false,"23,19":false,"4,18":false,"5,18":false,"6,18":false,"7,18":true,"8,18":true,"9,18":true,"10,18":true,"11,18":true,"12,18":true,"13,18":true,"14,18":true,"15,18":true,"16,18":true,"17,18":true,"18,18":true,"19,18":false,"20,18":false,"21,18":false,"22,18":false,"23,18":false,"20,16":false,"20,17":false,"21,16":false,"21,17":false,"22,16":false,"22,17":false,"5,15":false,"5,16":false,"5,17":false,"6,14":true,"7,14":true,"8,14":true,"9,14":true,"10,14":true,"11,14":true,"12,14":true,"13,14":true,"14,14":true,"15,14":true,"16,14":true,"17,14":true,"18,14":true,"19,14":true,"6,13":true,"7,13":true,"8,13":true,"9,13":true,"10,13":true,"11,13":true,"12,13":true,"13,13":true,"14,13":true,"15,13":true,"16,13":true,"17,13":true,"18,13":true,"7,12":true,"8,12":true,"9,12":true,"10,12":true,"11,12":true,"12,12":true,"13,12":true,"14,12":true,"15,12":true,"16,12":true,"17,12":true,"18,12":true,"6,12":false,"22,15":false}}))Object.assign(W.maps[id].collisionOverrides ||= {},cells);

  // User world collision and winter arena patch.
  Object.assign(W.maps.world.collisionOverrides ||= {},{"89,870":false,"90,870":false,"91,870":false,"92,870":false,"93,870":false,"94,870":false,"95,870":false,"96,870":false,"97,870":false,"98,870":false,"99,870":false,"100,870":false,"89,865":false,"90,865":false,"91,865":false,"92,865":false,"93,865":false,"94,865":false,"95,865":false,"96,865":false,"97,865":false,"98,865":false,"99,865":false,"100,865":false,"106,873":false,"106,874":false,"106,875":false,"106,857":false,"106,858":false,"106,859":false,"106,860":false,"107,874":false,"107,875":false,"107,876":false,"107,858":false,"107,859":false,"105,873":false,"105,876":false,"64,818":false,"64,819":false,"64,820":false,"65,818":false,"65,819":false,"65,820":false,"57,818":false,"57,819":false,"57,820":false,"56,818":false,"56,819":false,"56,820":false,"22,837":false,"22,838":false,"22,839":false,"22,840":false,"23,838":false,"23,839":false,"23,840":false,"24,840":false,"35,838":false,"35,839":false,"32,852":false,"32,853":false,"32,854":false,"32,855":false,"32,856":false,"32,857":false,"32,858":false,"32,859":false,"32,860":false,"31,852":false,"31,853":false,"31,854":false,"31,855":false,"31,856":false,"31,857":false,"31,858":false,"31,859":false,"31,860":false,"40,852":false,"40,853":false,"40,854":false,"40,855":false,"40,856":false,"41,851":false,"41,852":false,"41,853":false,"41,854":false,"41,855":false,"41,856":false,"41,857":false,"41,858":false,"41,859":false,"42,852":false,"42,853":false,"42,854":false,"42,855":false,"42,856":false,"42,857":false,"42,858":false,"42,859":false,"66,879":false,"66,880":false,"66,881":false,"66,882":false,"66,883":false,"66,884":false,"71,879":false,"71,880":false,"71,881":false,"71,882":false,"71,883":false,"71,884":false,"24,838":true,"24,839":true,"67,883":false,"68,883":false,"69,883":false,"70,883":false,"497,132":false,"498,132":false,"499,132":false,"500,132":false,"501,132":false,"486,124":false,"486,125":false,"487,124":false,"487,125":false,"488,124":false,"488,125":false,"489,124":false,"489,125":false,"490,124":false,"490,125":false,"491,124":false,"491,125":false,"492,124":false,"492,125":false,"493,124":false,"493,125":false,"493,126":false,"544,120":false,"544,121":false,"544,122":false,"544,123":false,"544,124":false,"544,125":false,"545,120":false,"545,121":false,"545,122":false,"545,123":false,"545,124":false,"545,125":false,"545,126":false,"543,124":false,"543,125":false,"542,124":false,"542,125":false,"542,126":false,"541,124":false,"541,125":false,"541,126":false,"528,119":false,"528,120":false,"528,121":false,"528,122":false,"528,123":false,"528,124":false,"528,125":false,"529,119":false,"529,120":false,"529,121":false,"529,122":false,"529,123":false,"529,124":false,"529,125":false,"530,124":false,"530,125":false,"530,126":false,"531,124":false,"531,125":false,"531,126":false,"532,124":false,"532,125":false,"532,126":false,"573,124":false,"574,123":false,"574,124":false,"574,125":false,"575,123":false,"575,124":false,"575,125":false,"576,123":false,"576,124":false,"576,125":false,"577,123":false,"577,124":false,"577,125":false,"577,126":false,"578,123":false,"578,124":false,"578,125":false,"578,126":false,"579,123":false,"579,124":false,"579,125":false,"580,123":false,"580,125":false,"581,125":false,"587,124":false,"588,124":false,"588,125":false,"588,126":false,"589,123":false,"589,124":false,"589,125":false,"590,123":false,"590,124":false,"590,125":false,"591,123":false,"591,124":false,"591,125":false,"592,123":false,"592,124":false,"592,125":false,"593,123":false,"593,124":false,"593,125":false,"594,123":false,"594,124":false,"594,125":false,"595,123":false,"595,124":false,"595,125":false,"596,123":false,"596,124":false,"596,125":false,"597,123":false,"597,124":false,"597,125":false,"598,123":false,"598,124":false,"598,125":false,"599,123":false,"599,124":false,"599,125":false,"628,210":false,"628,211":false,"628,212":false,"628,213":false,"628,214":false,"628,215":false,"628,216":false,"628,217":false,"628,218":false,"628,219":false,"628,220":false,"628,221":false,"628,222":false,"628,223":false,"628,224":false,"628,225":false,"628,227":false,"628,228":false,"628,229":false,"628,230":false,"628,231":false,"628,232":false,"628,233":false,"628,234":false,"628,235":false,"628,236":false,"628,237":false,"628,238":false,"628,240":false,"628,241":false,"628,242":false,"628,243":false,"628,245":false,"628,247":false,"628,248":false,"628,249":false,"628,250":false,"628,251":false,"628,252":false,"628,254":false,"628,256":false,"628,257":false,"628,258":false,"628,259":false,"628,261":false,"628,262":false,"628,264":false,"628,265":false,"628,266":false,"628,270":false,"628,271":false,"628,272":false,"628,273":false,"628,274":false,"628,279":false,"628,280":false,"628,281":false,"628,282":false,"628,283":false,"627,222":false,"627,223":false,"627,231":false,"627,232":false,"627,239":false,"627,255":false,"627,259":false,"627,263":false,"627,264":false,"627,267":false,"627,272":false,"627,283":false,"629,211":false,"629,212":false,"629,213":false,"629,214":false,"629,216":false,"629,217":false,"629,218":false,"629,220":false,"629,221":false,"629,222":false,"629,223":false,"629,224":false,"629,225":false,"629,226":false,"629,227":false,"629,228":false,"629,229":false,"629,230":false,"629,232":false,"629,233":false,"629,234":false,"629,235":false,"629,236":false,"629,237":false,"629,239":false,"629,240":false,"629,241":false,"629,242":false,"629,243":false,"629,244":false,"629,247":false,"629,248":false,"629,249":false,"629,250":false,"629,255":false,"629,256":false,"629,257":false,"629,258":false,"629,263":false,"629,264":false,"629,265":false,"629,266":false,"629,272":false,"629,273":false,"629,274":false,"629,278":false,"629,279":false,"629,280":false,"629,281":false,"629,282":false,"629,283":false,"630,248":false,"630,249":false,"630,250":false,"630,280":false,"630,281":false,"630,282":false,"452,215":false,"452,216":false,"452,217":false,"452,218":false,"452,219":false,"452,208":false,"452,209":false,"452,210":false,"452,211":false,"452,199":false,"452,200":false,"452,201":false,"452,202":false,"452,203":false,"452,191":false,"452,192":false,"452,193":false,"452,194":false,"452,195":false,"452,183":false,"452,184":false,"452,185":false,"452,186":false,"452,187":false,"452,174":false,"452,175":false,"452,176":false,"452,177":false,"452,178":false,"452,179":false,"452,168":false,"452,169":false,"452,170":false,"452,171":false,"452,159":false,"452,160":false,"452,161":false,"452,162":false,"452,163":false,"452,164":false,"452,150":false,"452,151":false,"452,152":false,"452,153":false,"452,154":false,"452,155":false,"452,143":false,"452,144":false,"452,145":false,"452,146":false,"452,135":false,"452,136":false,"452,137":false,"452,138":false,"452,127":false,"452,128":false,"452,129":false,"452,130":false,"452,131":false,"452,120":false,"452,121":false,"452,122":false,"452,123":false,"452,124":false,"452,111":false,"452,104":false,"452,105":false,"452,106":false,"452,107":false,"452,109":false,"453,216":false,"453,217":false,"453,218":false,"453,219":false,"453,220":false,"453,206":false,"453,208":false,"453,209":false,"453,210":false,"453,211":false,"453,212":false,"453,200":false,"453,201":false,"453,202":false,"453,203":false,"453,204":false,"453,192":false,"453,193":false,"453,194":false,"453,195":false,"453,196":false,"453,182":false,"453,183":false,"453,184":false,"453,185":false,"453,186":false,"453,187":false,"453,175":false,"453,176":false,"453,177":false,"453,178":false,"453,179":false,"453,168":false,"453,169":false,"453,170":false,"453,171":false,"453,160":false,"453,161":false,"453,162":false,"453,163":false,"453,164":false,"453,151":false,"453,152":false,"453,153":false,"453,154":false,"453,155":false,"453,156":false,"453,144":false,"453,145":false,"453,146":false,"453,147":false,"453,148":false,"453,136":false,"453,137":false,"453,138":false,"453,139":false,"453,140":false,"453,128":false,"453,129":false,"453,130":false,"453,131":false,"453,132":false,"453,120":false,"453,121":false,"453,122":false,"453,123":false,"453,112":false,"453,113":false,"453,114":false,"453,115":false,"453,116":false,"453,104":false,"453,105":false,"453,106":false,"453,107":false,"453,108":false,"451,216":false,"451,212":false,"451,168":false,"451,152":false,"451,135":false,"451,127":false,"451,111":false,"451,112":false,"451,113":false,"451,114":false,"451,104":false,"451,105":false,"451,106":false,"451,107":false,"454,176":false,"454,160":false,"454,161":false,"454,162":false,"826,656":true,"827,656":true,"828,656":true,"829,656":true,"830,656":true,"831,656":true,"832,656":true,"833,656":true,"834,656":true,"835,656":true,"836,656":true,"837,656":true,"838,656":true,"839,656":true,"840,656":true,"841,656":true,"826,664":true,"827,664":true,"828,664":true,"829,664":true,"830,664":true,"831,664":true,"832,664":true,"833,664":true,"834,664":true,"835,664":true,"836,664":true,"837,664":true,"838,664":true,"839,664":true,"840,664":true,"841,664":true,"842,664":true,"1616,283":false,"1616,284":false,"1616,285":false,"1616,286":false,"1617,283":false,"1617,284":false,"1617,285":false,"1617,286":false,"1617,287":false,"1612,283":false,"1612,284":false,"1612,285":false,"1612,286":false,"1600,258":false,"1600,259":false,"1600,260":false,"1601,258":false,"1601,259":false,"1604,257":false,"1604,258":false,"1604,259":false,"1605,258":false,"1605,259":false,"1605,260":false,"1622,264":false,"1622,265":false,"1622,266":false,"1622,267":false,"1623,264":false,"1623,265":false,"1623,266":false,"1624,264":false,"1624,265":false,"1624,266":false,"1624,267":false,"1624,268":false,"1625,264":false,"1625,265":false,"1625,266":false,"1625,267":false,"1625,268":false,"1630,271":false,"1630,272":false,"1630,273":false,"1630,274":false,"1407,422":false,"1408,422":false,"1408,423":false,"1408,424":false,"1408,425":false,"1408,426":false,"1408,427":false,"1408,428":false,"1408,429":false,"1408,430":false,"1420,422":false,"1420,423":false,"1420,424":false,"1420,425":false,"1420,426":false,"1420,427":false,"1420,428":false,"1420,429":false,"1420,430":false,"1421,422":false,"1421,423":false,"1421,424":false,"1421,425":false,"1421,426":false,"1421,427":false,"1421,428":false,"1421,429":false,"1421,430":false,"1389,408":false,"1389,409":false,"1389,410":false,"1389,424":false,"1389,425":false,"1390,408":false,"1390,424":false,"1390,425":false,"1388,408":false,"1388,409":false,"1388,410":false,"1388,424":false,"1388,425":false,"1391,424":false,"1391,425":false,"1392,425":false,"2586,508":false,"2586,509":false,"2586,510":false,"2586,511":false,"2588,507":false,"2588,508":false,"2588,509":false,"2587,508":false,"2587,509":false,"2587,510":false,"2587,511":false,"2560,507":false,"2560,508":false,"2560,509":false,"2561,507":false,"2561,508":false,"2561,509":false,"2562,509":false,"2562,496":false,"2562,497":false,"2562,498":false,"2562,499":false,"2562,500":false,"2562,501":false,"2563,509":false,"2563,501":false,"2563,496":false,"2564,508":false,"2564,509":false,"2564,501":false,"2564,502":false,"2564,503":false,"2564,493":false,"2564,494":false,"2564,495":false,"2564,496":false,"2565,503":false,"2565,504":false,"2565,505":false,"2565,506":false,"2565,507":false,"2565,508":false,"2565,509":false,"2565,494":false,"2566,503":false,"2566,492":false,"2566,493":false,"2566,494":false,"2567,503":false,"2567,492":false,"2567,488":false,"2568,503":false,"2568,488":false,"2568,489":false,"2568,490":false,"2568,491":false,"2568,492":false,"2569,503":false,"2569,488":false,"2569,489":false,"2570,503":false,"2570,488":false,"2570,489":false,"2571,503":false,"2571,488":false,"2572,503":false,"2572,488":false,"2573,503":false,"2573,488":false,"2573,489":false,"2573,490":false,"2574,503":false,"2574,490":false,"2575,503":false,"2575,490":false,"2576,503":false,"2576,490":false,"2577,503":false,"2577,490":false,"2577,491":false,"2577,492":false,"2577,493":false,"2577,494":false,"2577,495":false,"2578,496":false,"2578,502":false,"2578,503":false,"2579,496":false,"2579,501":false,"2579,502":false,"2579,503":false,"2580,496":false,"2580,501":false,"2581,496":false,"2581,499":false,"2581,500":false,"2581,501":false,"2582,496":false,"2582,499":false,"2583,496":false,"2583,497":false,"2583,498":false,"2583,499":false,"2556,489":false,"2556,490":false,"2556,491":false,"2556,492":false,"2557,489":false,"2557,490":false,"2557,491":false,"2558,489":false,"2558,490":false,"2558,491":false,"2559,491":false,"2560,489":false,"2560,490":false,"2560,491":false,"2561,489":false,"2561,490":false,"2561,491":false,"2561,492":false,"2562,489":false,"2562,490":false,"2578,483":false,"2578,484":false,"2578,485":false,"2579,483":false,"2579,484":false,"2579,485":false,"2579,486":false,"2577,485":false,"2580,485":false,"2581,485":false,"2581,486":false,"2581,516":false,"2581,517":false,"2582,483":false,"2582,484":false,"2582,485":false,"2582,487":false,"2582,488":false,"2582,489":false,"2583,483":false,"2583,484":false,"2583,485":false,"2583,489":false,"2584,483":false,"2584,484":false,"2584,485":false,"2584,489":false,"2585,489":false,"2586,489":false,"2587,486":false,"2587,487":false,"2587,488":false,"2587,489":false,"2587,490":false,"2588,489":false,"2582,516":false,"2582,517":false,"2583,516":false,"2583,517":false,"2565,516":false,"2566,516":false,"2566,517":false,"2567,516":false,"2567,517":false,"2568,516":false,"2568,517":false,"5400,407":false,"5401,407":false,"5402,407":false,"5403,407":false,"5404,407":false,"5405,407":false,"5406,407":false,"5399,406":false,"5400,406":false,"5401,406":false,"5402,406":false,"5403,406":false,"5404,406":false,"5405,406":false,"5406,406":false,"5407,406":false,"5379,406":false,"5380,406":false,"5381,406":false,"5382,406":false,"5383,406":false,"5384,406":false,"5385,406":false,"5386,406":false,"5387,406":false,"5388,406":false,"5389,406":false,"5379,407":false,"5380,407":false,"5381,407":false,"5382,407":false,"5383,407":false,"5384,407":false,"5385,407":false,"5386,407":false,"5387,407":false,"5388,407":false,"5389,407":false,"5390,407":false,"5434,388":false,"5451,388":false,"5452,388":false,"5453,388":false,"5454,388":false,"5434,389":false,"5435,389":false,"5436,389":false,"5437,389":false,"5438,389":false,"5439,389":false,"5440,389":false,"5441,389":false,"5442,389":false,"5443,389":false,"5444,389":false,"5445,389":false,"5446,389":false,"5447,389":false,"5448,389":false,"5449,389":false,"5450,389":false,"5451,389":false,"5452,389":false,"5453,389":false,"5454,389":false,"5455,389":false,"5433,390":false,"5434,390":false,"5435,390":false,"5436,390":false,"5437,390":false,"5438,390":false,"5439,390":false,"5440,390":false,"5441,390":false,"5442,390":false,"5443,390":false,"5444,390":false,"5445,390":false,"5446,390":false,"5447,390":false,"5448,390":false,"5432,422":false,"5433,422":false,"5434,422":false,"5435,422":false,"5436,422":false,"5437,422":false,"5438,422":false,"5439,422":false,"5440,422":false,"5441,422":false,"5432,423":false,"5433,423":false,"5434,423":false,"5435,423":false,"5436,423":false,"5437,423":false,"5438,423":false,"5439,423":false,"5440,423":false,"5441,423":false,"5432,438":false,"5433,438":false,"5434,438":false,"5435,438":false,"5436,438":false,"5437,438":false,"5438,438":false,"5439,438":false,"5440,438":false,"5431,439":false,"5432,439":false,"5433,439":false,"5434,439":false,"5435,439":false,"5436,439":false,"5437,439":false,"5438,439":false,"5439,439":false,"5440,439":false,"5429,440":false,"5430,440":false,"5432,440":false,"5433,440":false,"5434,440":false,"5435,440":false,"5436,440":false,"5437,440":false,"5417,434":false,"5417,435":false,"5417,436":false,"5417,437":false,"5418,434":false,"5418,435":false,"5418,436":false,"5418,437":false,"5419,434":false,"5419,435":false,"5419,436":false,"5419,437":false,"5420,435":false,"5441,425":false,"5442,425":false,"5443,425":false,"5444,425":false,"5445,425":false,"5440,424":false,"5441,424":false,"5442,424":false,"5443,424":false,"5444,424":false,"5441,432":false,"5442,432":false,"5443,432":false,"5444,432":false,"5441,434":false,"5443,434":false,"5444,434":false,"5445,434":false,"5442,433":false,"5443,433":false,"5444,433":false,"5399,427":false,"5399,428":false,"5399,429":false,"5399,430":false,"5399,431":false,"5399,432":false,"5393,428":false,"5393,432":false,"5394,428":false,"5394,429":false,"5394,430":false,"5394,431":false,"5394,432":false,"5622,186":false,"5622,187":false,"5622,188":false,"5623,186":false,"5623,187":false,"5623,188":false,"5628,185":false,"5628,186":false,"5628,187":false,"5629,186":false,"5629,187":false,"5272,308":false,"5272,309":false,"5272,310":false,"5272,311":false,"5272,312":false,"5272,313":false,"5272,314":false,"5272,315":false,"5272,316":false,"5272,317":false,"5272,318":false,"5272,319":false,"5272,320":false,"5272,321":false,"5272,322":false,"5273,308":false,"5273,309":false,"5273,310":false,"5273,311":false,"5273,312":false,"5273,313":false,"5273,314":false,"5273,315":false,"5273,316":false,"5273,317":false,"5273,318":false,"5273,319":false,"5273,320":false,"5273,321":false,"5256,308":false,"5257,310":false,"5257,311":false,"5257,312":false,"5257,313":false,"5257,314":false,"5257,315":false,"5257,316":false,"5257,317":false,"5257,318":false,"5257,319":false,"5257,320":false});
  {const arena=W.maps.world.features.find(f=>f.kind==='arena'&&f.id===207);if(arena)Object.assign(arena,{x:2634,y:152,r:9.45,style:'winter'});}

  // User actor/object patch; retain object IDs for subsequent editor patches.
  {
    const m=W.maps.world;
    const positions={"actor:14:market_weapons_stall":[12408,3232],"actor:16:market_bakery_stall":[12547,3261],"actor:18:market_drinks_stall":[12516,3395],"actor:17:market_curios_stall":[12395,3335]};
    for(let i=0;i<m.roomActors.length;i++){const o=m.roomActors[i],p=positions[o.editKey||'actor:'+i+':'+o.spr];if(p)shiftActorData(m,o,p[0],p[1],true);}
    const rashida=m.npcs.find(n=>n.n==='Rashida');if(rashida)shiftActorData(m,rashida,24504,1472,false);
    m.objs[6010*3+1]=24488;m.objs[6010*3+2]=1632;
    m.hidden=[...new Set([...(m.hidden||[]),6040,6041,6046,6047,6048,6049,6054,6055])];
  }

  // Chairs added over baked room backgrounds must stop at the tabletop edge.
  for(const map of Object.values(W.maps)){
    for(const chair of map.roomActors||[]){
      if(!/^ichair/.test(chair.spr||''))continue;
      const seated=(map.npcs||[]).filter(n=>(n.seated||n.seatSpr)&&Math.abs(n.x-chair.x)<12&&Math.abs(n.y-chair.y)<18)
        .sort((a,b)=>Math.hypot(a.x-chair.x,a.y-chair.y)-Math.hypot(b.x-chair.x,b.y-chair.y))[0];
      if(!seated)continue;
      chair.sy=(seated.sy??seated.y)-1;
      if(Number.isFinite(seated.seatClipY))chair.chairClipY=seated.seatClipY;
    }
  }
  NAMES = W.names; TS = W.ts; MAPID = W.start;
  NAMES.forEach((n, i) => { NAME2I[n] = i; });
  for (const k in W.defs) DEFS[k | 0] = W.defs[k];
  auditPlacements();
  return W;
}
async function inflateAtlas() {
  if (typeof ATLAS_GZ === "undefined" || !ATLAS_GZ) { buildStyles(); return; }
  const bin = Uint8Array.from(atob(ATLAS_GZ), (c) => c.charCodeAt(0));
  const text = await new Response(
    new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  const A = JSON.parse(text);
  for (const k in A) ATLAS[k] = A[k];
  SPR = new Proxy(ATLAS.sprites, SPR_HANDLER);
  Object.assign(SPR, SM_SPR, DRAGON_SPR, KING_DRAGON_SPR);
  registerKnightStorySprites();
  registerRoyalSprites();
  registerDesertNpcSprites();
  registerDockOriginalSprites();
  TERRT = ATLAS.terrain;
  GROUND_SETS = ATLAS.ground_sets || {};
  GROUND_FRINGE = ATLAS.ground_fringe || {};
  STYLE_TREE = ATLAS.styles.tree;
  if (STYLE_TREE && Array.isArray(STYLE_TREE.swamp))
    STYLE_TREE.swamp_safe = ["sw_tree2_3", "sw_tree3_3", "sw_tree4_3"];
  if (ATLAS.dragon_mouth) MOUTH = ATLAS.dragon_mouth;
  buildStyles();
}


/* === Native household furniture layering (editor) === */
function cropForegroundMask(data,w,h){
  /* Segment background by connectivity from the crop's top/side border. Unlike global
     color-keying, matching colors enclosed inside a bookshelf stay part of the object. */
  const bg=new Uint8Array(w*h),stack=[];
  const seed=(x,y)=>{const k=y*w+x;if(!bg[k]){bg[k]=1;stack.push(k);}};
  for(let x=0;x<w;x++)seed(x,0);
  for(let y=0;y<h-2;y++){seed(0,y);seed(w-1,y);}
  const delta=(a,b)=>Math.abs(data[a]-data[b])+Math.abs(data[a+1]-data[b+1])+Math.abs(data[a+2]-data[b+2]);
  while(stack.length){
    const k=stack.pop(),x=k%w,y=(k/w)|0,pi=k*4;
    for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
      if(nx<0||ny<0||nx>=w||ny>=h)continue;const nk=ny*w+nx;if(bg[nk])continue;
      const ni=nk*4;
      if(delta(pi,ni)<=20){bg[nk]=1;stack.push(nk);}
    }
  }
  const fg=new Uint8Array(w*h);for(let i=0;i<fg.length;i++)fg[i]=bg[i]?0:1;
  return fg;
}
function buildHouseFurnitureLayers(){
  /* Rebuilding can be triggered more than once during boot. Remove previously generated
     furniture actors first so an earlier partial pass cannot leave invisible/duplicate hit targets. */
  for(const m of Object.values(W.maps||{}))if(/^house\d/.test(Object.keys(W.maps).find(k=>W.maps[k]===m)||'')){
    if(m.roomActors)m.roomActors=m.roomActors.filter(a=>!a.interiorFurniture);
    m._layeredFurniture=false;m._roomBaseCanvas=null;
  }
  /* Household props are not consistently named i*.  Build the candidate list from
     every static atlas sprite whose name describes freestanding interior scenery. */
  const furniture=/(?:^|_)(?:bed|chair|stool|bench|table|desk|wardrobe|closet|cabinet|cupboard|dresser|shelf|bookcase|bookshelf|crate|crates|barrel|chest|rug|carpet|plant|pot|lamp|candle|fireplace|hearth|stove|oven|counter|sack|basket)(?:_|\d|$)/i;
  const structural=/(?:wall|floor|roof|door|window|stairs?|ground|terrain|bridge|fence|gate|pillar|column|trim|temple|dragon|npc|player|corin|portrait|anim|walk|idle|attack|damage|death|shadow)/i;
  let names=Object.keys(SPR).filter(n=>{const sp=SPR[n];return furniture.test(n)&&!structural.test(n)&&sp&&sp[2]>=4&&sp[3]>=4&&sp[2]<=128&&sp[3]<=128&&(sp[4]||1)===1;});
  /* The original house set uses compact i* names that do not always contain an
     English furniture word. Keep every static interior i-prop as a candidate,
     excluding architecture/fabric explicitly. */
  for(const n of Object.keys(SPR)){const sp=SPR[n];if((/^(?:i|hb_|gw_|nan_|lodge_)[a-z0-9_]+$/i.test(n)||/(?:shelf|book|case|wardrobe|cabinet|crate|table|chair)/i.test(n))&&!/^i(?:floor|wall|door|window|roof|trim|arch|pillar|stairs?)/i.test(n)&&sp&&sp[2]>=4&&sp[3]>=4&&sp[2]<=128&&sp[3]<=128&&(sp[4]||1)===1&&!names.includes(n))names.push(n);}
  const rugName=n=>/(?:^|_)(?:rug|carpet)(?:_|\d|$)/i.test(n)||/^irug/i.test(n);
  const spriteData=new Map();
  const grab=n=>{if(spriteData.has(n))return spriteData.get(n);const sp=SPR[n];if(!sp)return null;const c=document.createElement('canvas');c.width=sp[2];c.height=sp[3];const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;drawGameImage(g,atlasImg,sp[0],sp[1],sp[2],sp[3],0,0,sp[2],sp[3]);const d=g.getImageData(0,0,c.width,c.height);spriteData.set(n,d);return d;};
  const score=(rd,rw,rh,sd,sw,sh,x0,y0)=>{if(x0<0||y0<0||x0+sw>rw||y0+sh>rh)return 0;let hit=0,ok=0,step=Math.max(1,Math.floor(Math.min(sw,sh)/6));for(let y=0;y<sh;y+=step)for(let x=0;x<sw;x+=step){const si=(y*sw+x)*4;if(sd[si+3]<80)continue;hit++;const ri=((y0+y)*rw+x0+x)*4,d=Math.abs(rd[ri]-sd[si])+Math.abs(rd[ri+1]-sd[si+1])+Math.abs(rd[ri+2]-sd[si+2]);if(d<42)ok++;}return hit>=3?ok/hit:0;};
  /* Remove only opaque prop pixels. Reconstruct underneath from several surrounding
     samples instead of smearing the nearest edge across walls/floors. */
  const heal=(im,rw,rh,sd,sw,sh,x0,y0)=>{
    const src=new Uint8ClampedArray(im.data),out=im.data;
    const sample=(rx,ry)=>{
      const pts=[];
      for(let d=2;d<=Math.max(sw,sh)+8&&pts.length<8;d+=2){
        for(const [xx,yy] of [[rx-d,ry],[rx+d,ry],[rx,ry-d],[rx,ry+d]]){
          if(xx<0||yy<0||xx>=rw||yy>=rh)continue;
          const lx=xx-x0,ly=yy-y0;
          if(lx>=0&&ly>=0&&lx<sw&&ly<sh&&sd[(ly*sw+lx)*4+3]>=80)continue;
          const i=(yy*rw+xx)*4;pts.push([src[i],src[i+1],src[i+2],src[i+3]]);
        }
      }
      if(!pts.length)return null;
      pts.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));
      return pts[Math.floor(pts.length/2)];
    };
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const si=(y*sw+x)*4;
      let opaque=sd[si+3]>=40;
      if(!opaque)for(let yy=Math.max(0,y-1);yy<=Math.min(sh-1,y+1)&&!opaque;yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(sw-1,x+1);xx++)if(sd[(yy*sw+xx)*4+3]>=80){opaque=true;break}
      if(!opaque)continue;
      const rx=x0+x,ry=y0+y;if(rx<1||ry<1||rx>=rw-1||ry>=rh-1)continue;
      /* Do not synthesize wall/floor pixels by sampling around the furniture.
         That produced patchwork panels after an object moved. Use the nearest pixel
         on the same scanline outside the extracted object; for wall-mounted furniture
         this preserves the room's horizontal wall pattern instead of inventing texture. */
      let p=null;
      for(let d=1;d<=Math.max(sw,sh)+8&&!p;d++){
        for(const xx of [x0-1-d,x0+sw+d]){
          if(xx<0||xx>=rw)continue;
          const i=(ry*rw+xx)*4;p=[src[i],src[i+1],src[i+2],src[i+3]];break;
        }
      }
      if(!p)p=sample(rx,ry);if(!p)continue;const oi=(ry*rw+rx)*4;
      out[oi]=p[0];out[oi+1]=p[1];out[oi+2]=p[2];out[oi+3]=p[3];
    }
  };
  /* Rebuild a furniture-free room base from native 16px room tiles. This is a real
     re-lay, not pixel healing: each covered tile is copied 1:1 from an intact tile of
     the same wall/floor band and phase. */
  const relayNativeTiles=(g,rw,rh,cuts)=>{
    if(!cuts?.length)return;
    const src=g.getImageData(0,0,rw,rh),out=g.getImageData(0,0,rw,rh),T=16;
    const covered=(x,y)=>cuts.some(([,cx,cy,cw,ch])=>x>=cx&&x<cx+cw&&y>=cy&&y<cy+ch);
    for(const [,cx,cy,cw,ch] of cuts){
      const tx0=Math.floor(cx/T)*T,ty0=Math.floor(cy/T)*T,tx1=Math.ceil((cx+cw)/T)*T,ty1=Math.ceil((cy+ch)/T)*T;
      for(let ty=ty0;ty<ty1;ty+=T)for(let tx=tx0;tx<tx1;tx+=T){
        let sx=-1;
        /* Find an intact tile in the SAME horizontal band. Prefer nearest left/right. */
        for(let d=T;d<rw&&sx<0;d+=T)for(const q of [tx-d,tx+d]){
          if(q<0||q+T>rw)continue;
          let bad=false;for(let yy=ty;yy<Math.min(ty+T,rh)&&!bad;yy++)for(let xx=q;xx<q+T;xx++)if(covered(xx,yy)){bad=true;break}
          if(!bad){sx=q;break}
        }
        if(sx<0)continue;
        for(let yy=0;yy<T&&ty+yy<rh;yy++)for(let xx=0;xx<T&&tx+xx<rw;xx++){
          const si=((ty+yy)*rw+sx+xx)*4,di=((ty+yy)*rw+tx+xx)*4;
          out.data[di]=src.data[si];out.data[di+1]=src.data[si+1];out.data[di+2]=src.data[si+2];out.data[di+3]=src.data[si+3];
        }
      }
    }
    g.putImageData(out,0,0);
  };
  let total=0;
  for(const [id,m] of Object.entries(W.maps||{})){
    /* House-by-house conversion. For now ONLY the starting house and its bedroom are
       converted; every other house keeps its original baked room art untouched. */
    if(!m.roomArt||!/^house03(?:_bedroom)?$/.test(id))continue;
    const rs=SPR[m.roomArt];if(!rs)continue;const rw=rs[2],rh=rs[3],cv=document.createElement('canvas');cv.width=rw;cv.height=rh;const g=cv.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;drawGameImage(g,atlasImg,rs[0],rs[1],rw,rh,0,0,rw,rh);const room=g.getImageData(0,0,rw,rh),found=[],occupied=[];m.roomActors ||= [];
    /* Hand-cut from the captured ORIGINAL room art. These are exact source rectangles,
       not collision guesses. Add more maps here as we verify their captured art. */
    const EXACT_FURNITURE={
      /* Starting house only. These are literal source-art cuts; each becomes its own
         editor actor. No other house is touched until this one is verified. */
      house03:[
        ['bookshelf_left',20,47,36,35]
      ],
      house03_bedroom:[
        ['wardrobe',79,34,29,43],
        ['bookshelf',113,33,31,47],
        ['bed',14,57,55,29],
        ['crate',132,141,25,36],
        ['table_chair',48,111,24,35]
      ]
    };
    /* Starting house is manual-only: do not guess additional cuts. */
    /* These hand-cut objects are authoritative. Remove any older/static actor whose
       bounds overlap the same source furniture, otherwise MOVE can grab the visible
       legacy copy while the extracted actor sits underneath it. */
    for(const e of EXACT_FURNITURE[id]||[]){
      const [,x,y,w,h]=e,cx=x+w/2,cy=y+h/2;
      m.roomActors=m.roomActors.filter(a=>{
        if(a.interiorFurniture||a.sceneReserved)return true;
        const sp=a.extractedCanvas?[0,0,a.extractedCanvas.width,a.extractedCanvas.height]:SPR[a.spr];
        if(!sp||!Number.isFinite(a.x)||!Number.isFinite(a.y))return true;
        const l=a.x-sp[2]/2,t=a.y-sp[3],r=l+sp[2],b=a.y;
        return !(cx>=l&&cx<=r&&cy>=t&&cy<=b);
      });
    }
    const addExactFurnitureCrop=(label,x,y,w,h)=>{
      const key='furniture:exact:'+id+':'+label;if(m.roomActors.some(a=>a.editKey===key))return;
      const q=document.createElement('canvas');q.width=w;q.height=h;const qg=q.getContext('2d',{willReadFrequently:true});
      drawGameImage(qg,atlasImg,rs[0]+x,rs[1]+y,w,h,0,0,w,h);
      /* Only clear background connected to the four crop corners; the furniture pixels
         themselves are copied unchanged from the original room art. */
      const im=qg.getImageData(0,0,w,h),d=im.data,bg=new Uint8Array(w*h),stack=[];
      const seed=(xx,yy)=>{const k=yy*w+xx;if(!bg[k]){bg[k]=1;stack.push(k);}};
      seed(0,0);seed(w-1,0);seed(0,h-1);seed(w-1,h-1);
      const diff=(a,b)=>Math.abs(d[a]-d[b])+Math.abs(d[a+1]-d[b+1])+Math.abs(d[a+2]-d[b+2]);
      while(stack.length){const k=stack.pop(),xx=k%w,yy=(k/w)|0,pi=k*4;for(const [nx,ny]of[[xx-1,yy],[xx+1,yy],[xx,yy-1],[xx,yy+1]]){if(nx<0||ny<0||nx>=w||ny>=h)continue;const nk=ny*w+nx;if(bg[nk])continue;if(diff(pi,nk*4)<=18){bg[nk]=1;stack.push(nk);}}}
      for(let i=0;i<bg.length;i++)if(bg[i])d[i*4+3]=0;qg.putImageData(im,0,0);
      const sprName='exact_'+id+'_'+label;SPR[sprName]=[0,0,w,h,1];
      let bi=-1,best=1e9;for(let j=0;j<(m.roomBlocks||[]).length;j++){const b=m.roomBlocks[j],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,dd=Math.hypot(cx-(x+w/2),cy-(y+h));if(dd<best){best=dd;bi=j;}}
      m.roomActors.push({spr:sprName,extractedCanvas:q,extractedFurniture:true,exactFurniture:true,editKey:key,x:x+w/2,y:y+h,sy:y+h,schoolArt:true,interiorFurniture:true,moveBlocks:bi>=0&&best<45?[bi]:[]});
      const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++)mask[i]=bg[i]?0:1;
      found.push({crop:true,x,y,w,h,mask});occupied.push([x,y,x+w,y+h]);total++;
    };
    for(const e of EXACT_FURNITURE[id]||[])addExactFurnitureCrop(...e);
    /* Re-lay the room art underneath every explicitly recut object BEFORE the final
       base canvas is captured. The object canvases above retain the original furniture. */
    if(EXACT_FURNITURE[id]?.length)relayNativeTiles(g,rw,rh,EXACT_FURNITURE[id]);
    /* Manual starting-house pass: exact cuts above are the complete movable set for
       this verification step. More cuts will be added only from the actual room art. */
    if(found.length){const clean=g.getImageData(0,0,rw,rh);for(const f of found){if(f.crop){
        if((m._exactBackgroundRepairs||[]).some(r=>f.x===r.x&&f.y===r.y&&f.w===r.w&&f.h===r.h))continue;
        const raw=new Uint8ClampedArray(f.w*f.h*4);
        for(let yy=0;yy<f.h;yy++)for(let xx=0;xx<f.w;xx++){const si=((f.y+yy)*rw+f.x+xx)*4,di=(yy*f.w+xx)*4;raw[di]=clean.data[si];raw[di+1]=clean.data[si+1];raw[di+2]=clean.data[si+2];raw[di+3]=clean.data[si+3];}
        const fg=cropForegroundMask(raw,f.w,f.h),mask=new Uint8ClampedArray(f.w*f.h*4);
        for(let i=0;i<fg.length;i++)if(fg[i])mask[i*4+3]=255;
        heal(clean,rw,rh,mask,f.w,f.h,f.x,f.y);
      }else{const sp=SPR[f.n],sd=grab(f.n).data;heal(clean,rw,rh,sd,sp[2],sp[3],f.x,f.y);}}g.putImageData(clean,0,0);
      m._roomBaseCanvas=cv;m._layeredFurniture=true;}
  }
  /* DEV extraction survey: expose exact room-art/collision geometry so stubborn
     furniture can be cut once at explicit source rectangles instead of guessed forever. */
  window.__interiorExtractionSurvey=Object.fromEntries(Object.entries(W.maps||{}).filter(([id,m])=>/^house\d/.test(id)&&m.roomArt).map(([id,m])=>[id,{roomArt:m.roomArt,size:SPR[m.roomArt]?[SPR[m.roomArt][2],SPR[m.roomArt][3]]:null,blocks:(m.roomBlocks||[]).map((b,i)=>[i,...b])}]));
  /* Expose exact room-art/collision geometry for one-time manual extraction.
     This does not alter rendering; it lets us cut stubborn baked furniture by explicit
     source rectangles instead of guessing from sprite names or collision dimensions. */
  window.__furnitureExtractionMaps=Object.fromEntries(Object.entries(W.maps||{}).filter(([id,m])=>/^house\d/.test(id)&&m.roomArt).map(([id,m])=>[id,{roomArt:m.roomArt,size:(SPR[m.roomArt]||[]).slice(2,4),blocks:(m.roomBlocks||[]).map(b=>b.slice(0,4))}]));
  window.__houseFurnitureCount=total;
  window.__houseFurnitureByMap=Object.fromEntries(Object.entries(W.maps||{}).filter(([id,m])=>/^house\d/.test(id)).map(([id,m])=>[id,(m.roomActors||[]).filter(a=>a.interiorFurniture).length]));
  console.log("HOUSE FURNITURE",total,"candidates",names.length,window.__houseFurnitureByMap);
  window.__houseFurnitureCandidateCount=names.length;
  /* Manual extraction helper for stubborn baked props. DEV: tap MOVE, then COPY after
     positioning. Bounds are exact source rectangles and can be promoted into this table. */
  window.__extractFurnitureRect=(mapId,x,y,w,h,block=null)=>{
    const m=W.maps[mapId],rs=m&&SPR[m.roomArt];if(!m||!rs)return false;
    const q=document.createElement('canvas');q.width=w;q.height=h;const qg=q.getContext('2d');
    drawGameImage(qg,atlasImg,rs[0]+x,rs[1]+y,w,h,0,0,w,h);
    const spr='manual_'+mapId+'_'+x+'_'+y,actor={spr,extractedCanvas:q,extractedFurniture:true,editKey:'manual:'+mapId+':'+x+':'+y,x:x+w/2,y:y+h,sy:y+h,schoolArt:true,interiorFurniture:true,moveBlocks:block==null?[]:[block]};
    SPR[spr]=[0,0,w,h,1];(m.roomActors||=[]).push(actor);return actor;
  };
  window.__houseRoomInfo=Object.fromEntries(Object.entries(W.maps||{}).filter(([id,m])=>/^house\d/.test(id)&&m.roomArt).map(([id,m])=>[id,{roomArt:m.roomArt,size:SPR[m.roomArt]?[SPR[m.roomArt][2],SPR[m.roomArt][3]]:null,blocks:(m.roomBlocks||[]).map((b,i)=>[i,...b])}]));

}
/* === end household furniture layering === */

async function inflateWorld() {
  if (W) return W;                    /* the harness got there first */
  await inflateAtlas();
  const bin = Uint8Array.from(atob(W_GZ), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream("gzip");
  const text = await new Response(
    new Blob([bin]).stream().pipeThrough(ds)).text();
  return applyWorld(text);
}
const ATLAS_PAGES = window.EMBER_ASSETS.ATLAS_PAGES;

/* Full atlas-page replacements for Dunstan's custom 42-frame forge animation.
   They load after the packed pages so transparent pixels also replace the old
   shared Maddock hair/beard layer instead of letting it show through. */
const ATLAS_PATCHES = [
  [0, 41984, 1024, 460, "data:image/webp;base64,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"],
  [1024, 41984, 1024, 484, "data:image/webp;base64,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"]
];
const KNIGHT_STORY_SRC = window.EMBER_ASSETS.KNIGHT_STORY_SRC;
const knightStoryImg = new Image();
knightStoryImg.src = KNIGHT_STORY_SRC;
function registerKnightStorySprites() {
  const dirs = { d:0, e:1, w:2, u:3 };
  const actions = { idle:[0,12], walk:[256,6], atk:[512,7], hurt:[768,5], die:[1024,7], run:[1280,8] };
  for (const [action,[baseY,frames]] of Object.entries(actions))
    for (const [dir,row] of Object.entries(dirs)) {
      const rect = [0, baseY + row * 64, 64, 64, frames, 5];
      SPR["kn_" + action + "_" + dir] = rect;
      SPR["guild_fighter_sword_" + action + "_" + dir] = rect;
    }
}
const SPR_HANDLER = { get(t, k) { return t[k]; }, has(t, k) { return k in t; } };
let SPR = new Proxy(ATLAS.sprites, SPR_HANDLER);
let TERRT = ATLAS.terrain;
// Eight-way facing supplements legacy cardinal door/quest directions.
// Device-local developer geometry; COPY exports exact pixel rectangles.
const geometryEdits=(()=>{try{return JSON.parse(localStorage.getItem('emberfell.geometry.v1')||'{}')}catch(e){return {}}})();
let geometryPan=false;
let doorEdit=false, geometryDrag=null, selectedDoor=-1, collisionPaint='block';
function geometryMap(){return geometryEdits[MAPID]||(geometryEdits[MAPID]={doors:{},collision:{}})}
function saveGeometry(){try{localStorage.setItem('emberfell.geometry.v1',JSON.stringify(geometryEdits))}catch(e){toast('Could not save edits; use COPY before leaving.')}}
function doorRect(d,index=(MD.doors||[]).indexOf(d)){
 const saved=geometryEdits[MAPID]?.doors?.[index];if(saved)return saved;
 if(d.triggerRect)return d.triggerRect;
 return {x:d.x*TS+(d.ox||0)-(d.wide?TS:0),y:d.y*TS+(d.oy||0),w:TS+(d.wide?TS*2:0),h:TS};
}
function collisionOverride(px,py){const key=Math.floor(px/8)+','+Math.floor(py/8);return geometryEdits[MAPID]?.collision?.[key] ?? MD.collisionOverrides?.[key]}
function paintCollision(cx,cy){const w=screenToWorld(cx,cy),x=Math.floor(w.x/8),y=Math.floor(w.y/8);if(x<0||y<0||x>=MW*2||y>=MH*2)return;const m=geometryMap(),key=x+','+y;if(collisionPaint==='reset')delete m.collision[key];else m.collision[key]=collisionPaint==='block';saveGeometry()}
function geometryStart(t){if(geometryPan)return false;const w=screenToWorld(t.clientX,t.clientY);if(collideView){paintCollision(t.clientX,t.clientY);geometryDrag={paint:true};return true}if(!doorEdit)return false;
 selectedDoor=-1;const ds=MD.doors||[];for(let i=ds.length-1;i>=0;i--){const r=doorRect(ds[i],i),margin=12/cam.z;
 if(w.x>=r.x-margin&&w.x<=r.x+r.w+margin&&w.y>=r.y-margin&&w.y<=r.y+r.h+margin){selectedDoor=i;geometryDrag={i,start:w,rect:{...r},resize:Math.hypot(w.x-r.x-r.w,w.y-r.y-r.h)<18/cam.z};break}}
 refreshGeometryLabel();return true;
}
function geometryMove(t){if(!geometryDrag)return;const g=geometryDrag;if(g.paint){paintCollision(t.clientX,t.clientY);return}const w=screenToWorld(t.clientX,t.clientY),dx=Math.round(w.x-g.start.x),dy=Math.round(w.y-g.start.y),r={...g.rect};if(g.resize){r.w=Math.max(4,r.w+dx);r.h=Math.max(4,r.h+dy)}else{r.x=Math.max(0,Math.min(MW*TS-r.w,r.x+dx));r.y=Math.max(0,Math.min(MH*TS-r.h,r.y+dy))}geometryMap().doors[g.i]=r;refreshGeometryLabel()}
function geometryEnd(){if(geometryDrag){geometryDrag=null;saveGeometry()} }
function refreshGeometryLabel(){const el=document.getElementById('geometryLabel');if(!el)return;const r=selectedDoor>=0&&doorRect(MD.doors[selectedDoor],selectedDoor);el.textContent=r?'Door '+selectedDoor+' → '+MD.doors[selectedDoor].to+' · '+r.x+','+r.y+' · '+r.w+'×'+r.h+' px':doorEdit?'Drag a door to move it; drag its bottom-right handle to resize.':geometryPan?'PAN · drag / pinch to zoom':'COLLIDE'}
function setGeometryTool(kind){exitTools();geometryPan=false;document.getElementById('geometryPan').classList.remove('on');setBag(false);setOvl(null);askShut();doorEdit=kind==='door';collideView=kind==='collision';selectedDoor=-1;document.getElementById('geometryBar').style.display=kind?'flex':'none';document.getElementById('collisionBrushes').style.display=collideView?'flex':'none';refreshGeometryLabel()}
function drawDoorTriggers(){if(!doorEdit)return;ctx.save();ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);(MD.doors||[]).forEach((d,i)=>{const r=doorRect(d,i);ctx.fillStyle=i===selectedDoor?'#ffe08066':'#36cfff44';ctx.strokeStyle=i===selectedDoor?'#ffe080':'#36cfff';ctx.lineWidth=2/cam.z;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeRect(r.x,r.y,r.w,r.h);const hs=10/cam.z;ctx.fillRect(r.x+r.w-hs/2,r.y+r.h-hs/2,hs,hs);ctx.font=(12/cam.z)+'px monospace';ctx.fillStyle='#fff';ctx.fillText(i+' → '+d.to,r.x,r.y-4/cam.z)});ctx.restore()}
function geometryPatch(){const out=[];for(const [map,m]of Object.entries(geometryEdits)){for(const [index,r]of Object.entries(m.doors||{}))out.push('DOOR '+JSON.stringify({map,index:Number(index),...r}));for(const [cell,blocked]of Object.entries(m.collision||{}))out.push('COLLISION '+JSON.stringify({map,cell:cell.split(',').map(Number),size:8,blocked}))}return out}
// Illustrated atlas: directional focus moves among labelled destinations.
const ATLAS_LOCATIONS=[["Millwood", 72.79, 279.87, "Corin’s home town. Visit Nan, Hettie and the Elder before taking the eastern road."], ["Elder’s Home", 81.66, 250.44, "Maddock’s house, north of Millwood."], ["Northern Woods", 75.06, 222.63, "Woodland north of Millwood, leading toward the mushroom country."], ["Sporewood", 74.85, 122.73, "The western mushroom woodland."], ["Sporehollow", 99.19, 90.33, "A settlement among the giant mushrooms."], ["Northern Shroom Field", 72.38, 60.09, "Mushroom fields at the northern edge of the woods."], ["Shroom Pass", 74.85, 176.73, "The path between the northern woods and the mushroom country."], ["Route 1", 133.01, 205.89, "The road between Millwood and Thornwell. Two peaceful camps offer a place to rest."], ["Thornwell", 171.38, 101.13, "A woodland town on the journey east."], ["Forgefalls", 232.01, 225.87, "The falls southeast of Thornwell."], ["Route 2", 282.75, 176.19, "The woodland road to Forgewick."], ["Forgewick", 423.0, 158.91, "A town of craftspeople. Find the blacksmith, glassblower and market."], ["Forgewick Temple", 455.18, 194.55, "The temple southeast of Forgewick, reached by the winding southern trail."], ["Route 3", 544.28, 156.75, "The road from Forgewick into the desert."], ["The Oasis", 590.89, 182.4, "A green refuge southwest of Sandspire, beside the desert road."], ["Sandspire", 686.18, 100.05, "The desert city between Forgewick and Coralmere."], ["Sandspire Temple", 821.89, 221.55, "The temple south-east of Sandspire."], ["Route 4", 812.4, 62.79, "The desert route to the coast."], ["Coralmere", 898.2, 329.28, "A coastal town with fishing docks and homes by the water."], ["Route 5", 990.6, 291.21, "The route through the wetlands toward Hollybeck."], ["Witchmoor", 1068.15, 236.67, "Maelis’s home in the marsh. The ferry begins at the mainland dock."], ["Dreadmarsh", 1101.98, 318.75, "The deep marshes south of the road."], ["Hollybeck Graveyard", 1146.53, 130.83, "The graveyard northwest of Hollybeck."], ["Hollybeck", 1175.4, 159.99, "A town at the edge of the snowy highlands."], ["Hollybeck Temple", 1220.78, 93.03, "The temple northeast of Hollybeck. Follow the winding trail east and north."], ["Route 6", 1235.21, 191.31, "The mountain road north to Frostcrag."], ["Frostcrag", 1236.04, 67.65, "A stronghold in the snowy mountains."], ["Ashcrag", 1267.39, 64.95, "East of Frostcrag, beyond the mountain passage, before the volcanic road."], ["Route 7", 1373.81, 178.35, "The final road through the volcanic country."], ["Cinderhold Castle", 1451.78, 211.83, "The king’s fortress at the eastern end of Emberfell."]];
let atlasOpen=false,atlasPick=0,atlasReturn='menu',atlasTimer=0;
function atlasNeighbor(dx,dy){const p=ATLAS_LOCATIONS[atlasPick];let best=-1,score=Infinity;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;ATLAS_LOCATIONS.forEach((q,i)=>{const x=q[1]-p[1],y=q[2]-p[2],d=Math.hypot(x,y),along=x*dx+y*dy;if(i===atlasPick||along<=0)return;const cross=Math.abs(x*dy-y*dx);const cost=d+cross*2.5;if(cost<score){score=cost;best=i}});return best}
function atlasMove(dx,dy){if(!atlasOpen||Date.now()<atlasTimer)return;const i=atlasNeighbor(dx,dy);if(i<0)return;atlasTimer=Date.now()+260;atlasPick=i;renderAtlas()}
function renderAtlas(){const p=ATLAS_LOCATIONS[atlasPick],view=document.getElementById('atlasViewport'),canvas=document.getElementById('atlasSurface');const scale=Math.max(1.35,Math.min(2.6,view.clientHeight/275));canvas.style.transform='translate('+(view.clientWidth/2-p[1]*scale)+'px,'+(view.clientHeight/2-p[2]*scale)+'px) scale('+scale+')';const cursor=document.getElementById('atlasCursor');cursor.style.left=p[1]+'px';cursor.style.top=p[2]+'px';const panel=document.getElementById('atlasDetails');panel.classList.remove('settled');clearTimeout(renderAtlas.timer);renderAtlas.timer=setTimeout(()=>{document.getElementById('atlasName').textContent=p[0];document.getElementById('atlasText').textContent=p[3];panel.classList.add('settled')},360)}
function openAtlas(from='menu'){atlasReturn=from;setOvl(null);setBag(false);atlasOpen=true;padDx=padDy=0;P.moving=false;document.getElementById('worldAtlas').style.display='flex';requestAnimationFrame(renderAtlas)}
function closeAtlas(){atlasOpen=false;document.getElementById('worldAtlas').style.display='none';padDx=padDy=0;for(const k of Object.keys(keys))keys[k]=0;if(atlasReturn==='bag')setBag(true);else setOvl('menu')}
function bindAtlasAndGeometry(){
 tap(document.getElementById('geometryPan'),()=>{geometryEnd();touches.clear();pinchD=0;mDown=false;geometryPan=!geometryPan;document.getElementById('geometryPan').classList.toggle('on',geometryPan);refreshGeometryLabel();});
 tap(document.getElementById('bDoors'),()=>setGeometryTool(doorEdit?null:'door'));
 tap(document.getElementById('geometryDone'),()=>setGeometryTool(null));tap(document.getElementById('geometryCopy'),()=>copyText(buildPatch(),ok=>ok?toast('Changes copied'):showDump(buildPatch())));
 document.querySelectorAll('[data-collision]').forEach(b=>tap(b,()=>{collisionPaint=b.dataset.collision;document.querySelectorAll('[data-collision]').forEach(e=>e.classList.toggle('on',e===b))}));
 tap(document.getElementById('bagMap'),()=>openAtlas('bag'));

 addEventListener('keydown',e=>{if(!atlasOpen)return;const d={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]}[e.key];if(d){e.preventDefault();e.stopImmediatePropagation();atlasMove(...d)}else if(e.key==='Escape'||e.key==='b'){e.stopImmediatePropagation();closeAtlas()}},true);
 addEventListener('resize',()=>{if(atlasOpen)renderAtlas()});
 cv.addEventListener('pointerdown',e=>{if(geometryPan||(!doorEdit&&!collideView))return;e.preventDefault();e.stopImmediatePropagation();cv.setPointerCapture(e.pointerId);geometryStart(e)},true);
 cv.addEventListener('pointermove',e=>{if(!geometryDrag)return;e.preventDefault();e.stopImmediatePropagation();geometryMove(e)},true);
 cv.addEventListener('pointerup',e=>{if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();e.stopImmediatePropagation();geometryEnd()}},true);
 cv.addEventListener('pointercancel',geometryEnd,true);
}

const DIR8 = ['e','se','s','sw','w','nw','n','ne'];
function cardinalDirection(d) {
  return d==='ne'||d==='nw'?'n':d==='se'||d==='sw'?'s':d;
}
function direction4(dx, dy, fallback = 's') {
  if (Math.hypot(dx,dy) < .001) return cardinalDirection(fallback);
  return Math.abs(dx)>Math.abs(dy)?(dx<0?'w':'e'):(dy<0?'n':'s');
}
function directionVector(d) {
  const i = DIR8.indexOf(d), a = (i < 0 ? 2 : i)*Math.PI/4;
  return [Math.abs(Math.cos(a))<1e-8?0:Math.cos(a), Math.abs(Math.sin(a))<1e-8?0:Math.sin(a)];
}
function legacyDirection(d, flip) { return d==='s'?(flip?'w':'e'):d==='u'?'n':'s'; }
function playerFacing4(action = null) {
  const p = action || P;
  return cardinalDirection(p.dir8 || legacyDirection(p.dir,p.flip));
}
function corinDirection(action = null) {
  const d = playerFacing4(action); return d==='n'?'u':d==='s'?'d':d;
}
function kingDragonSprite(f) {
  const d = cardinalDirection(f.dir8 || legacyDirection(f.dir,f.flip));
  /* Death is always a side-on collapse.  This deliberately makes the south
     row unreachable even if an old or malformed facing value slips through. */
  if (f.st === 'dead') return f.flip ? 'kdnew_death_w' : 'kdnew_death_e';
  const st = (f.st === 'swing' || f.st === 'wind') ? 'atk' : 'fly';
  return 'kdnew_' + st + '_' + d;
}
// Layout edits use stable map-local identities and absolute saved positions.
/* Editor layout is session-only. COPY exports it; reload intentionally discards it. */
try{localStorage.removeItem('emberfell.actor-layout.v1')}catch(e){}
const actorLayouts = {};
function editorActorInfo(o) {
  const ni=npcs.indexOf(o);
  if(ni>=0)return {kind:'npc', index:ni, key:'npc:'+o.n, source:MD.npcs[ni]};
  const ai=(MD.roomActors||[]).indexOf(o);
  if(ai>=0)return {kind:'actor', index:ai, key:o.editKey||'actor:'+ai+':'+o.spr, source:o};
  return null;
}
function editorSprite(o) {
  if(o.roomCrop)return [0,0,o.roomCrop[2],o.roomCrop[3],1];
  if(o.extractedCanvas)return [0,0,o.extractedCanvas.width,o.extractedCanvas.height,1];
  if(o.spr)return SPR[o.spr];
  if(o.packSpr)return SPR[o.packSpr]||SPR[o.packSpr+'_idle_d'];
  if(o.body)return SPR[o.body+'_idle_d'];
  if(o.sk)return SPR[o.sk+'_idle_d'];
  return SPR[NAMES[o.s]];
}
function shiftActorData(m, o, x, y, actor) {
  const dx=x-o.x,dy=y-o.y;
  o.x=x;o.y=y;
  if(Number.isFinite(o.sy))o.sy=o.editableWall?-50:o.sy+dy;
  if(Number.isFinite(o.talkX))o.talkX+=dx;
  if(Number.isFinite(o.talkY))o.talkY+=dy;
  if(o.patrol)o.patrol=o.patrol.map((v,i)=>v+(i%2?dy:dx)/TS);
  if(o.goto)o.goto=[o.goto[0]+dx,o.goto[1]+dy];
  if(actor&&o.stairTo&&(dx||dy)){
    const door=m.doors.find(d=>d.stairDown&&d.to===o.stairTo);
    if(door){door.x+=dx/TS;door.y+=dy/TS;door.triggerRect.x+=dx;door.triggerRect.y+=dy;}
    const id=Object.keys(W.maps).find(id=>W.maps[id]===m);
    const back=W.maps[o.stairTo]?.doors.find(d=>d.to===id);
    if(back){back.tx+=dx/TS;back.ty+=dy/TS;}
  }
  if(actor)for(const i of o.moveBlocks||[]){const b=m.roomBlocks?.[i];if(b){b[0]+=dx;b[2]+=dx;b[1]+=dy;b[3]+=dy;}}
}
function applyActorLayout(m, id) {
  const saved=actorLayouts[id]||{};
  for(let i=0;i<(m.roomActors||[]).length;i++){
    const o=m.roomActors[i],key=o.editKey||'actor:'+i+':'+o.spr,v=saved[key];
    if(o.sceneReserved)continue;
    if(o.editableWall||o.interiorFurniture)o.editorDeleted=!!v?.deleted;
    if(o.interiorFurniture&&o.editorDeleted)for(const bi of o.moveBlocks||[]){const b=m.roomBlocks?.[bi];if(b){b._furnitureHome ||= b.slice(0,4);b[0]=b[1]=b[2]=b[3]=-99999;}}
    if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y))shiftActorData(m,o,v.x,v.y,true);
  }
  for(const o of m.npcs||[]){if(o.seated||o.seatSpr||o.sceneReserved)continue;const v=saved['npc:'+o.n];if(v&&Number.isFinite(v.x)&&Number.isFinite(v.y))shiftActorData(m,o,v.x,v.y,false);}
}
function moveEditorActor(o,x,y,save=false) {
  const info=editorActorInfo(o);if(!info)return false;
  x=Math.max(0,Math.min(PXW,x));y=Math.max(0,Math.min(PXH,y));
  // Source position can differ from a patrolling NPC's current position.
  if(info.kind==='npc'){
    shiftActorData(MD,info.source,x,y,false);
    o.x=x;o.y=y;o.px=x;o.py=y;o.goto=null;o.restUntil=Date.now()+5000;
    for(const k of ['talkX','talkY','patrol','sy'])o[k]=info.source[k];
  }else shiftActorData(MD,o,x,y,true);
  if(save){
    (actorLayouts[MAPID] ||= {})[info.key]={x,y};
    /* Deliberately do not persist test moves. COPY is the commit boundary. */
  }
  rebuildSolid();mapDirty=true;return true;
}
function pickEditorActor(wx,wy) {
  /* Exact extracted furniture gets first refusal. Its dedicated canvas is the visual
     object the user is touching, so do not let legacy room props intercept the drag. */
  const exactHits=[];
  for(const o of (MD.roomActors||[]))if(o.interiorFurniture&&o.extractedCanvas&&!o.editorDeleted){
    const w=o.extractedCanvas.width,h=o.extractedCanvas.height,left=o.x-w/2,top=o.y-h;
    if(wx>=left&&wx<=left+w&&wy>=top&&wy<=o.y)exactHits.push({o,area:w*h,dist:(wx-o.x)*(wx-o.x)+(wy-(top+h/2))*(wy-(top+h/2))});
  }
  if(exactHits.length){exactHits.sort((a,b)=>a.area-b.area||a.dist-b.dist);return exactHits[0].o;}
  if(/^house\d/.test(MAPID||"")&&!window.__furnReported){
    window.__furnReported=true;
    const n=(MD.roomActors||[]).filter(a=>a.interiorFurniture&&!a.editorDeleted).length;
    toast("Furniture objects in "+MAPID+": "+n+" (total "+(window.__houseFurnitureCount??"?")+", candidates "+(window.__houseFurnitureCandidateCount??"?")+")");
  }
  const hits=[];
  for(const o of [...(MD.roomActors||[]),...npcs]){
    if(o.editorDeleted)continue;
    if(npcs.includes(o)&&!npcHere(o))continue;
    const sp=editorSprite(o);if(!sp)continue;
    const w=sp[2],h=sp[3],left=o.x-w/2,top=o.y-h;
    if(wx<left||wx>left+w||wy<top||wy>o.y)continue;
    /* Prefer the visible prop nearest the finger.  This makes a lamp/crate sitting on a
       table selectable instead of the table's larger rectangle always swallowing it.
       Rugs deliberately lose to furniture above them unless the rug itself is the only hit. */
    const rug=o.interiorFurniture&&/^(?:irug|.*(?:rug|carpet))/i.test(o.spr||'');
    const dx=(wx-o.x)/Math.max(1,w),dy=(wy-(top+h/2))/Math.max(1,h);
    hits.push({o,rug,area:w*h,dist:dx*dx+dy*dy,depth:o.sy??o.y});
  }
  if(!hits.length)return null;
  hits.sort((a,b)=>(a.rug-b.rug)||(a.area-b.area)||(a.dist-b.dist)||(b.depth-a.depth));
  return hits[0].o;
}
function storyTeleport(id) {
  return id.startsWith("royal_") || /^(mine\d*|passage\d*|tp\d|sn\d|ds\d)$/.test(id)||
    ['house22','house26','smithy','glasshouse','glasswork','school','school2','witchmoor','cinderhold','tavern','inn'].includes(id);
}
const KING_DRAGON_SPR = {
  kdnew_idle_s:[0,0,176,176,1,3], kdnew_idle_n:[0,176,176,176,1,3],
  kdnew_idle_e:[0,352,176,176,1,3], kdnew_idle_w:[0,528,176,176,1,3],
  kdnew_fly_s:[0,704,176,176,7,3], kdnew_fly_n:[0,880,176,176,7,3],
  kdnew_fly_e:[0,1056,176,176,9,3], kdnew_fly_w:[0,1232,176,176,9,3],
  kdnew_atk_s:[0,1408,176,176,9,3], kdnew_atk_n:[0,1584,176,176,7,3],
  kdnew_atk_e:[0,1760,176,176,9,3], kdnew_atk_w:[0,1936,176,176,9,3],
  /* The south collapse is intentionally excluded.  Its last frame must
     never appear in play or during Halvard's grief scene. */
  kdnew_death_e:[0,128,128,128,9,4],
  kdnew_death_n:[0,256,128,128,9,4], kdnew_death_w:[0,384,128,128,9,4]
};
function smDir(dir, flip) {
  return dir === "s" ? (flip ? "w" : "e") : dir;
}
const SM_SPR = {"sm_atk_d":[0,2633,36,35,6,2],"sm_atk_e":[0,2703,36,35,6,2],"sm_atk_u":[0,2668,36,35,6,2],"sm_atk_w":[0,2738,36,35,6,2],"bd_fly":[0,140,32,24,6,2],"bd_sit":[193,140,25,21,4,2],"br_atk_d":[0,165,24,25,5,2],"br_atk_e":[121,165,34,22,5,2],"br_atk_u":[0,191,25,22,5,2],"br_atk_w":[126,191,34,22,5,2],"br_die_d":[0,214,24,25,6,2],"br_die_e":[145,214,34,22,6,2],"br_die_u":[0,240,25,22,6,2],"br_die_w":[0,263,34,22,6,2],"br_hurt_d":[205,263,24,25,4,2],"br_hurt_e":[0,289,34,22,4,2],"br_hurt_u":[137,289,25,22,4,2],"br_hurt_w":[0,312,34,22,4,2],"br_idle_d":[137,312,24,25,4,2],"br_idle_e":[0,338,34,22,4,2],"br_idle_u":[137,338,25,22,4,2],"br_idle_w":[0,361,34,22,4,2],"br_walk_d":[137,361,24,25,6,2],"br_walk_e":[0,387,34,22,6,2],"br_walk_u":[0,410,25,22,6,2],"br_walk_w":[0,433,34,22,6,2],"sm_die_d":[0,2213,36,35,6,2],"sm_die_e":[0,2283,36,35,6,2],"sm_die_u":[0,2248,36,35,6,2],"sm_die_w":[0,2318,36,35,6,2],"fm_die_d":[0,2773,36,35,6,2],"fm_die_e":[0,2843,36,35,6,2],"fm_die_u":[0,2808,36,35,6,2],"fm_die_w":[0,2878,36,35,6,2],"fm_hurt_d":[0,2773,36,35,6,2],"fm_hurt_e":[0,2843,36,35,6,2],"fm_hurt_u":[0,2808,36,35,6,2],"fm_hurt_w":[0,2878,36,35,6,2],"fm_idle_d":[0,2773,36,35,6,2],"fm_idle_e":[0,2843,36,35,6,2],"fm_idle_u":[0,2808,36,35,6,2],"fm_idle_w":[0,2878,36,35,6,2],"fm_run_d":[0,2913,36,35,6,2],"fm_run_e":[0,2983,36,35,6,2],"fm_run_u":[0,2948,36,35,6,2],"fm_run_w":[0,3018,36,35,6,2],"fm_walk_d":[0,2913,36,35,6,2],"fm_walk_e":[0,2983,36,35,6,2],"fm_walk_u":[0,2948,36,35,6,2],"fm_walk_w":[0,3018,36,35,6,2],"sm_hurt_d":[0,2213,36,35,6,2],"sm_hurt_e":[0,2283,36,35,6,2],"sm_hurt_u":[0,2248,36,35,6,2],"sm_hurt_w":[0,2318,36,35,6,2],"sm_idle_d":[0,2213,36,35,6,2],"sm_idle_e":[0,2283,36,35,6,2],"sm_idle_u":[0,2248,36,35,6,2],"sm_idle_w":[0,2318,36,35,6,2],"it_egg":[141,1411,13,14,1,2],"it_paint":[0,1561,60,43,1,2],"it_yard":[61,1561,81,37,1,2],"kg_idle_d":[0,1605,27,27,12,2],"kg_idle_e":[0,1633,25,29,12,2],"kg_idle_u":[0,1663,26,29,4,2],"kg_idle_w":[0,1693,23,29,12,2],"kg_walk_d":[0,1723,27,27,6,2],"kg_walk_e":[163,1723,25,29,6,2],"kg_walk_u":[0,1753,26,29,6,2],"kg_walk_w":[157,1753,23,29,6,2],"sm_run_d":[0,2493,36,35,6,2],"sm_run_e":[0,2563,36,35,6,2],"sm_run_u":[0,2528,36,35,6,2],"sm_run_w":[0,2598,36,35,6,2],"sd_idle_d":[0,1923,26,29,12,2],"sd_idle_e":[0,1953,20,29,12,2],"sd_idle_u":[241,1953,26,30,4,2],"sd_idle_w":[0,1984,21,27,12,2],"sd_walk_d":[0,2012,26,29,6,2],"sd_walk_e":[157,2012,20,29,6,2],"sd_walk_u":[0,2042,26,30,6,2],"sd_walk_w":[157,2042,21,27,6,2],"sm_walk_d":[0,2353,36,35,6,2],"sm_walk_e":[0,2423,36,35,6,2],"sm_walk_u":[0,2388,36,35,6,2],"sm_walk_w":[0,2458,36,35,6,2]};
const FACE_SRC = window.EMBER_ASSETS.FACE_SRC;
const SM_IMG_SRC = window.EMBER_ASSETS.SM_IMG_SRC;
const smImg = new Image();
let smReady = false;
smImg.onload = () => { smReady = true; };
smImg.src = SM_IMG_SRC;
Object.assign(SPR, SM_SPR);
const DRAGON_SPR = {"dr5_up_n":[0,0,111,116,9,1],"ride_up_n":[1000,0,105,114,9,1],"dr5_down_n":[0,117,100,114,9,1],"ride_up_w":[901,117,116,112,9,1],"ride_up_e":[0,232,116,112,9,1],"dr5_up_s":[1045,232,106,107,9,1],"ride_down_n":[0,345,104,105,9,1],"dr5_down_e":[0,451,126,104,9,1],"dr5_down_w":[0,556,126,104,9,1],"ride_up_s":[0,661,104,103,9,1],"ride_down_s":[937,661,98,102,9,1],"dr5_walk_s":[0,765,97,101,9,1],"ride_fly_e":[874,765,116,100,9,1],"drf_s":[0,867,104,100,9,1],"ride_hover_s":[937,867,98,99,9,1],"dr5_down_s":[0,968,102,99,9,1],"dr5_idle_s":[919,968,94,99,9,1],"ride_ffire_s":[0,1068,96,98,9,1],"drf_fire_s":[865,1068,98,98,9,1],"ride_fly_s":[0,1167,101,97,9,1],"ride_fly_n":[910,1167,107,97,9,1],"ride_hover_w":[0,1265,114,97,9,1],"ride_ffire_n":[1027,1265,101,97,9,1],"ride_idle_s":[0,1363,100,96,9,1],"ride_fire_s":[901,1363,95,96,9,1],"ride_hover_n":[0,1460,103,96,9,1],"dr5_fire_s":[928,1460,104,95,9,1],"ride_walk_s":[0,1557,96,94,9,1],"drf_fire_n":[865,1557,105,94,9,1],"ride_ffire_w":[0,1652,113,92,9,1],"ride_fly_w":[0,1745,122,91,9,1],"ride_hover_e":[0,1837,119,91,9,1],"dr5_up_e":[0,1929,125,91,9,1],"dr5_up_w":[0,2021,125,91,9,1],"ride_idle_e":[0,2113,117,90,9,1],"ride_walk_n":[1054,2113,105,90,9,1],"ride_ffire_e":[0,2204,112,90,9,1],"drf_n":[0,2295,112,90,11,1],"ride_fire_e":[0,2386,114,89,9,1],"ride_fire_w":[0,2476,117,89,9,1],"dr5_walk_w":[0,2566,131,89,9,1],"dr5_walk_e":[0,2656,131,89,9,1],"ride_down_w":[0,2746,114,88,9,1],"ride_down_e":[0,2835,114,88,9,1],"ride_idle_n":[1027,2835,107,88,9,1],"ride_walk_e":[0,2924,118,88,9,1],"dr5_fire_n":[1063,2924,108,88,9,1],"ride_pose_south":[0,3013,92,87,1,1],"ride_pose_north_east":[93,3013,98,87,1,1],"ride_pose_north_west":[192,3013,90,87,1,1],"ride_idle_w":[283,3013,121,87,9,1],"ride_fire_n":[0,3101,107,87,9,1],"dr5_idle_n":[964,3101,104,87,9,1],"dr5_walk_n":[0,3189,106,87,9,1],"ride_pose_south_east":[955,3189,84,86,1,1],"ride_pose_south_west":[1040,3189,81,86,1,1],"ride_walk_w":[0,3277,114,86,9,1],"ride_pose_east":[1027,3277,110,85,1,1],"ride_pose_west":[1138,3277,110,85,1,1],"drf_fire_e":[0,3364,123,85,9,1],"drf_fire_w":[0,3450,123,85,9,1],"ride_pose_north":[1108,3450,97,83,1,1],"dr5_pose_south":[1206,3450,92,82,1,1],"dr5_pose_north":[1299,3450,97,81,1,1],"dr5_fire_w":[0,3536,123,80,9,1],"dr5_fire_e":[0,3617,123,80,9,1],"drf_e":[0,3698,122,78,9,1],"drf_w":[0,3777,122,78,9,1],"dr5_pose_north_east":[1099,3777,88,76,1,1],"dr5_pose_north_west":[1188,3777,91,74,1,1],"dr5_idle_e":[0,3856,121,73,9,1],"dr5_idle_w":[0,3930,121,73,9,1],"dr5_pose_south_east":[1090,3930,85,72,1,1],"dr5_pose_south_west":[1176,3930,82,72,1,1],"dr5_pose_east":[1259,3930,114,71,1,1],"dr5_pose_west":[1374,3930,112,71,1,1],"lg_crash":[1487,3930,64,60,4,1],"lg_rise":[1744,3930,73,57,4,1],"lg_fly":[0,4004,71,48,3,1],"lg_fly_e":[214,4004,71,47,3,1],"lg_sit":[428,4004,65,39,3,1]};
const DRAGON_MOUTH = {"n":[0.4956,0.1639],"e":[0.9489,0.5724],"s":[0.5008,0.8071],"w":[0.0623,0.5442]};
const DRAGON_IMG_SRC = window.EMBER_ASSETS.DRAGON_IMG_SRC;
const dragonImg = new Image();
let dragonReady = false;
dragonImg.onload = () => { dragonReady = true; };
dragonImg.src = DRAGON_IMG_SRC;
Object.assign(SPR, DRAGON_SPR);
const KING_DRAGON_IMG_SRC = window.EMBER_ASSETS.KING_DRAGON_IMG_SRC;
const kingDragonImg = new Image();
kingDragonImg.src = KING_DRAGON_IMG_SRC;
const kingDragonDeathImg = new Image();
kingDragonDeathImg.src = window.EMBER_MEDIA.kingDragonDeathSrc;
/* Dedicated high-detail art for the wounded green dragon in the north-field
   egg scene. Rows are normalized below into flight, impact, wounded,
   then its strained takeoff.  It is intentionally separate from Corin's dragon. */
const greenSceneImg = document.createElement("canvas");
const greenSceneSource = new Image();
greenSceneSource.src = window.EMBER_MEDIA.greenSceneSourceSrc;
/* Each supplied pose is cropped and placed on this shared baseline at startup.
   That prevents transparent padding from making the crash slide across tiles. */
const GREEN_SCENE_CEL_W = 128, GREEN_SCENE_CEL_H = 112, GREEN_SCENE_DRAW = 96;
// The supplied sheet has 6 flight, 6 crash, 5 resting and 6 takeoff poses,
// with unequal spacing. Keep explicit source rectangles, not a guessed grid.
const GREEN_SCENE_RECTS = [
  [[0,0,256,225],[280,0,265,225],[566,0,223,225],[789,0,248,225],[1038,0,242,225],[1280,0,256,225]],
  [[0,231,193,220],[196,243,243,246],[439,293,265,240],[704,321,301,215],[1005,370,270,165],[1277,409,259,126]],
  [[0,539,285,178],[290,539,266,178],[558,539,303,178],[866,539,299,178],[1177,539,359,178]],
  [[0,838,283,163],[285,784,269,211],[483,733,352,268],[761,719,282,283],[974,733,299,229],[1286,720,250,226]]
];
// A few takeoff silhouettes interleave horizontally in the source sheet.
// Polygon crop boundaries exclude the neighboring pose without repainting it.
const GREEN_SCENE_MASKS = {
  '3:1': [[285,1000],[285,910],[329,876],[343,825],[381,782],[406,809],[417,882],[450,904],[484,917],[554,939],[554,1000]],
  '3:2': [[483,756],[757,733],[758,840],[767,899],[835,961],[835,1002],[551,1002],[552,938],[523,909],[483,893]],
  '3:3': [[780,719],[1043,719],[1043,748],[977,772],[953,821],[969,893],[993,935],[1043,981],[1043,1005],[827,1005],[827,952],[790,920],[761,877],[768,823]],
  '3:4': [[974,779],[1015,748],[1273,748],[1273,962],[1055,962],[1055,901],[1010,849]],
  '1:4': [[1005,450],[1060,409],[1190,364],[1275,364],[1275,535],[1005,535]]
};
async function prepareGreenScene() {
  await greenSceneSource.decode();
  const source = document.createElement("canvas");
  source.width = greenSceneSource.naturalWidth; source.height = greenSceneSource.naturalHeight;
  const g = source.getContext("2d", { willReadFrequently: true });
  g.drawImage(greenSceneSource, 0, 0);
  const pixels = g.getImageData(0, 0, source.width, source.height), rgba = pixels.data;
  // Runtime white-matte removal keeps the original JPEG embedded and avoids
  // white rectangles in the field. Feather only near-white neutral pixels.
  for (let i = 0; i < rgba.length; i += 4) {
    const lo = Math.min(rgba[i], rgba[i+1], rgba[i+2]);
    const hi = Math.max(rgba[i], rgba[i+1], rgba[i+2]);
    if (lo > 220 && hi - lo < 24) rgba[i+3] = Math.round(255 * Math.max(0, (247-lo)/27));
  }
  g.putImageData(pixels, 0, 0);
  greenSceneImg.width = GREEN_SCENE_CEL_W * 6;
  greenSceneImg.height = GREEN_SCENE_CEL_H * 4;
  const out = greenSceneImg.getContext("2d");
  out.imageSmoothingEnabled = true; out.imageSmoothingQuality = "high";
  for (let row = 0; row < GREEN_SCENE_RECTS.length; row++) {
    for (let frame = 0; frame < 6; frame++) {
      const rects = GREEN_SCENE_RECTS[row];
      const [x,y,w,h] = rects[Math.min(frame, rects.length-1)];
      const scale = .32, dw = w * scale, dh = h * scale;
      const dx = frame * GREEN_SCENE_CEL_W + (GREEN_SCENE_CEL_W-dw)/2;
      const dy = row * GREEN_SCENE_CEL_H + GREEN_SCENE_CEL_H - 6 - dh;
      out.save();
      const mask = GREEN_SCENE_MASKS[row + ':' + frame];
      if (mask) {
        out.beginPath();
        mask.forEach(([px,py], i) => out[i ? 'lineTo' : 'moveTo'](dx+(px-x)*scale,dy+(py-y)*scale));
        out.closePath(); out.clip();
      }
      out.drawImage(source, x,y,w,h, dx,dy,dw,dh);
      out.restore();
    }
  }
}
const faintDragonImg = new Image();
faintDragonImg.src = window.EMBER_MEDIA.faintDragonSrc;
let NAMES = [], TS = 16;   /* filled in once the world inflates */
const NAME2I = {};   /* filled once the world inflates */
const DEFS = {};

let MAPID = null, MD = null;   /* set at boot, after inflating */
let MW = 0, MH = 0, PXW = 0, PXH = 0;
let terr = null, solid = null, objs = [], npcs = [], ORIG = [];
let scat = [], sanm = [], decks = [];
const edits = {};
let SCENE_WALL = null, deckFix = null;
const GRASS = 0, DIRT = 1, COBBLE = 2, FARM = 3, WATER = 4, BRIDGE = 5, WALL = 6, PAVING2 = 8, MARBLE = 9, TERRACE = 10,
      SAND = 11,
      ROADSAND = 12,
      DWATER = 13,
      SEA = 14,
      DECK = 15,
      VROCK = 16, VCRACK = 17, VLAVA = 18, VSTONE = 19;

function refusesTrunk(t) {
  return t === ROADSAND || t === DIRT || t === COBBLE || t === PAVING2 ||
         t === VLAVA || t === VROCK || t === VCRACK || t === VSTONE;
}
const T = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? WALL : terr[y * MW + x];
const cliffAt = (x, y) => !!(rockTiles && rockTiles.has(x + "," + y));
const openTo = (i) => {
  if (!baseTerr) return GRASS;
  if (cliffAt(i % MW, (i / MW) | 0)) return WALL;
  if (baseTerr[i] === SAND) return SAND;
  if (baseTerr[i] === ROADSAND) return ROADSAND;
  const x0 = i % MW, y0 = (i / MW) | 0;
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const a = x0 + dx, b = y0 + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (baseTerr[j] === ROADSAND) return ROADSAND;
      if (baseTerr[j] === SAND) return SAND;
      if (baseTerr[j] === GRASS) return GRASS;
    }
  return GRASS;
};
let nextId = 0, added = [], deleted = new Set();

function decodeRLE(rle, n) {
  const out = new Uint8Array(n);
  let i = 0;
  for (const part of rle.split("|")) {
    const sp = part.split("."), v = +sp[0], c = +sp[1];
    for (let k = 0; k < c; k++) out[i++] = v;
  }
  if (i !== n) throw new Error("RLE length " + i + " != " + n);
  return out;
}

function loadMap(id, fresh) {
  if(W.maps[id]?.templeLegacy)id=typeof W.maps[id].templeLegacy==='string'?W.maps[id].templeLegacy:'tp1';
  fishing = null;
  pendingActorStage = null;
  brambleMap="";
  doorMotion = null;
  if (!W.maps[id]) throw new Error("no such map: " + id);
  if (trial) stopTrial("");
  if (wonAll) lastFight = 0;
  if (MD && !fresh) {
    edits[MAPID] = { objs, added, deleted, nextId, painted, undoStack };
  }
  if (fresh) delete edits[id];
  blockTiles = []; lineTiles = new Set(); rockTiles = new Set();
  MAPID = id; MD = W.maps[id];
  applyActorLayout(MD,id);
  MW = MD.w; MH = MD.h; PXW = MW * TS; PXH = MH * TS;
  if (!camFree && mode === "play") cam.z = playZoom();

  terr = new Uint8Array(MW * MH);
  let i = 0;
  for (const part of MD.terr.split("|")) {
    const sp = part.split("."), v = +sp[0], n = +sp[1];
    for (let k = 0; k < n; k++) terr[i++] = v;
  }
  if (i !== MW * MH) throw new Error("terrain RLE length " + i + " != " + MW * MH);
  SCENE_WALL = null;
  if (MD.scenes) {
    SCENE_WALL = new Set();
    for (const sc of MD.scenes)
      for (let r = 0; r < sc.col.length; r++)
        for (let c = 0; c < sc.col[r].length; c++)
          if (sc.col[r][c] === "#") {
            const sx2 = sc.x0 + c, sy2 = sc.y0 + r;
            if (sx2 >= 0 && sy2 >= 0 && sx2 < MW && sy2 < MH) {
              SCENE_WALL.add(sy2 * MW + sx2);
              terr[sy2 * MW + sx2] = WALL;
            }
          }
  }
  terrOrig = terr.slice();

  ORIG = [];
  for (let k = 0; k < MD.objs.length; k += 3)
    ORIG.push({ s: MD.objs[k], x: MD.objs[k + 1], y: MD.objs[k + 2] });

  const prev = edits[id];
  if (prev) {
    objs = prev.objs; added = prev.added; deleted = prev.deleted; nextId = prev.nextId;
    painted = prev.painted || new Map();
    undoStack = prev.undoStack || [];
    for (const [ti, tv] of painted) terr[ti] = tv;
  } else {
    objs = ORIG.map((o, k) => ({ id: k, s: o.s, x: o.x, y: o.y }));
    added = []; deleted = new Set(); nextId = ORIG.length;
    painted = new Map();
    undoStack = [];
  }
  stroke = null;

  loot = []; spell = null; risings = []; blooms = []; consecrationTrails = []; dustPuff = null; graves = null; flying = []; falling = null;
  seedTreasuryGold();
  if (id !== "cinderhold") lastFight = 0;   /* the hall keeps its own fight */
  npcs = MD.npcs.map((n, k) => ({
    id: "npc" + k, pettable: n.pettable, sy: n.sy, idleFps: n.idleFps, packSpr: n.packSpr, packDirections: n.packDirections, packWalk: n.packWalk, school: n.school, stationary: n.stationary, talkX: n.talkX, talkY: n.talkY, s: n.s, sk: n.sk, x: n.x, y: n.y, n: n.n, d: n.d,
    crown: n.crown, body: n.body, kf: "d", dd: n.dd, dm: n.dm, rod: n.rod,
    charm: n.charm,                 /* what this one hands over, if anything */
    sells: n.sells,                 /* a potion seller */
    gift: n.gift,                   /* a breath, for the ones who carry one */
    d2: n.d2, dd2: n.dd2, dv: n.dv, dv2: n.dv2, dragonNear: n.dragonNear, dragonRumor: n.dragonRumor, dragonRumor2: n.dragonRumor2,
    noTalk: n.noTalk, desertNative: n.desertNative, idleFrame:n.idleFrame, counter:n.counter, seated:n.seated,seatSpr:n.seatSpr,seatClipY:n.seatClipY,
    leaving: 0,
    when: n.when, until: n.until, away: n.away, dm: n.dm, rod: n.rod,
    patrol: n.patrol, patrolFrom: n.patrolFrom, patrolRest: n.patrolRest,
    patrolPoints:n.patrolPoints,patrolSpeed:n.patrolSpeed,routeSeed:n.routeSeed,sceneReserved:n.sceneReserved,
    f: n.f || "d", t: Math.random() * 10
  }));
  /* Halvard is permanently gone once the final encounter has been won.
     Re-entering Cinderhold (for example via the seal chamber) must not
     reconstruct him from the map's original NPC definition. */
  if (wonAll && id === "cinderhold")
    npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  setPaint(false);
  solid = new Uint8Array(MW * MH);
  selected = null;

  baseTerr = Uint8Array.from(MD.base_terr ? decodeRLE(MD.base_terr, MW * MH) : terr);
  features = (MD.features || []).map(f => ({ ...f }));
  featOrig = new Map((MD.features || []).map(f => [f.id, JSON.stringify(f)]));
  buildUndo = []; regionMoves = []; grabRect = null; grabDrag = null;
  decorGone = new Set(); decorDel = []; decorMoved = new Map();
  deckWet = null;                       /* rebuilt for the map being loaded */
  felled = new Set(MD.felled || []);
  for (const run of String(MD.felled_rle || "").split("|")) {
    if (!run) continue;
    const [yy, xs] = run.split(":");
    if (xs.includes("-")) {
      const [a, b] = xs.split("-").map(Number);
      for (let xx = a; xx <= b; xx++) felled.add(xx + "," + yy);
    } else felled.add(xs + "," + yy);
  }
  felledNew = [];
  clearedBoxes = [];
  featSeq = features.reduce((n, f) => Math.max(n, f.id || 0), 0) + 1;
  fobjs = [];
  fsanim = (MD.fsanim || []).slice();
  hidden = new Set(MD.hidden || []);
  scat = (MD.scatter || []).slice();
  sanm = (MD.sanim || []).slice();
  decks = (MD.decks || []).map(d => ({ ...d }));
  deckFix = new Map();
  for (const [fx, fy, kind] of (MD.deckfix || []))
    deckFix.set(fy * MW + fx, kind);

  buildGround();
  if (features.length) {
    const cached = realizedCache.get(MAPID);
    if (cached && cached.stamp === editStamp) {
      terr.set(cached.terr);
      fobjs = cached.fobjs.map(o => ({ ...o }));
      fsanim = cached.fsanim.slice();
      blockTiles = (cached.blockTiles || []).slice();
      lineTiles = cached.lineTiles;
      rockTiles = cached.rockTiles;
      hidden = new Set(cached.hidden);
      reindex();
    } else {
      realizeFeatures();
      realizedCache.set(MAPID, {
        stamp: editStamp, terr: terr.slice(),
        fobjs: fobjs.map(o => ({ ...o })), fsanim: fsanim.slice(),
        blockTiles: blockTiles.slice(), lineTiles, rockTiles, hidden: new Set(hidden)
      });
    }
  } else reindex();
  if (SCENE_WALL) {
    for (const k of SCENE_WALL) terr[k] = WALL;
    rebuildSolid();          /* the collision map was built before these landed */
  }
  if (id === "world" && quest >= Q.KING) {
    const her = npcs.find(n => n.n === "Hettie");
    if (her) { beginHettieWalk(her); her.x = her.home[0]; her.y = her.home[1]; her.goto = null; }
  }
  spawnFoes();
  dragon.placed = null;   /* it will be set at his shoulder next frame */
  refreshSel();
}

let lavaNear = null;
const SPECKLE_REACH = 10, BUBBLE_REACH = 8;
function rebuildLavaNear() {
  if (!terr || !MW || !MH) { lavaNear = null; return; }
  const n = MW * MH;
  if (!lavaNear || lavaNear.length !== n) lavaNear = new Uint8Array(n);
  const CAP = 63;
  for (let y = 0, i = 0; y < MH; y++)
    for (let x = 0; x < MW; x++, i++) {
      if (terr[i] !== VLAVA) { lavaNear[i] = 0; continue; }
      let d = CAP;
      if (y > 0 && lavaNear[i - MW] < d) d = lavaNear[i - MW] + 1;
      if (x > 0 && lavaNear[i - 1] + 1 < d) d = lavaNear[i - 1] + 1;
      lavaNear[i] = d > CAP ? CAP : d;
    }
  for (let y = MH - 1, i = n - 1; y >= 0; y--)
    for (let x = MW - 1; x >= 0; x--, i--) {
      if (!lavaNear[i]) continue;
      let d = lavaNear[i];
      if (y < MH - 1 && lavaNear[i + MW] + 1 < d) d = lavaNear[i + MW] + 1;
      if (x < MW - 1 && lavaNear[i + 1] + 1 < d) d = lavaNear[i + 1] + 1;
      lavaNear[i] = d;
    }
}
function lavaDist(x, y) {
  if (!lavaNear || x < 0 || y < 0 || x >= MW || y >= MH) return 99;
  return lavaNear[y * MW + x];
}
let blockTiles = [];
const BLOCKS = /^(vfence)/;
const CLEARINGS = [ { map: "world", x0: 1079, y0: 258, x1: 1096, y1: 268 } ];
function openClearings() {
  for (const c of CLEARINGS) {
    if (c.map !== MAPID) continue;
    for (let y = c.y0; y <= c.y1; y++)
      for (let x = c.x0; x <= c.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        solid[y * MW + x] = 0;
      }
  }
}
function rebuildSolid() {
  solid.fill(0);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const t = terr[y * MW + x];
  if (t === WATER || t === DWATER || t === SEA || t === WALL
      || t === POOL_T || t === VLAVA) solid[y * MW + x] = 1;
  if (t === DECK || (typeof baseTerr !== "undefined" && baseTerr &&
                     baseTerr[y * MW + x] === DECK)) solid[y * MW + x] = 0;
  else if (typeof baseTerr !== "undefined" && baseTerr && t !== SEA &&
           t !== WATER && t !== DWATER && solid[y * MW + x]) {
    let quay = false;
    for (let dy = -1; dy <= 1 && !quay; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const a = x + dx, b = y + dy;
        if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
        if (terr[b * MW + a] === DECK || baseTerr[b * MW + a] === DECK) { quay = true; break; }
      }
    if (quay) solid[y * MW + x] = 0;
  }
  else if (t === GRASS && typeof baseTerr !== "undefined" && baseTerr &&
           baseTerr[y * MW + x] === VLAVA)
    solid[y * MW + x] = 1;
  }
  for (let i = 0; i < blockTiles.length; i++) solid[blockTiles[i]] = 1;
  for (const d of decks) {
    const vertical = (d.y1 - d.y0) > (d.x1 - d.x0);
    const span = vertical ? (d.x1 - d.x0 + 1) : (d.y1 - d.y0 + 1);
    if (span < 3) continue;
    for (let y = d.y0; y <= d.y1; y++)
      for (let x = d.x0; x <= d.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        const under = terr[y * MW + x];
        if (under !== BRIDGE && under !== WATER) continue;
        const edge = vertical ? (x === d.x0 || x === d.x1)
                              : (y === d.y0 || y === d.y1);
        solid[y * MW + x] = edge ? 1 : 0;
      }
  }
  const stamp = (o) => {
    const d = DEFS[o.s]; if (!d || !d.c) return;
    const cw = d.c[0], ch = d.c[1];
    const x0 = Math.floor((o.x - cw / 2) / TS), x1 = Math.floor((o.x + cw / 2 - 1) / TS);
    const y0 = Math.floor((o.y - ch) / TS), y1 = Math.floor((o.y - 1) / TS);
    for (let y = Math.max(0, y0); y <= Math.min(MH - 1, y1); y++)
      for (let x = Math.max(0, x0); x <= Math.min(MW - 1, x1); x++)
        solid[y * MW + x] = 1;
  };
  for (const o of objs) if (!deleted.has(o.id) && !hidden.has(o.id)) stamp(o);
  for (const o of fobjs) stamp(o);
  openClearings();   /* last word: a clearing beats every rule above */
}
let arenaPass = false;           /* set while testing the dragon's footing */
const stampedBy = (x, y) => {
  const out = [];
  const look = (o) => {
    const d = DEFS[o.s]; if (!d || !d.c) return;
    const cw = d.c[0], ch = d.c[1];
    const x0 = Math.floor((o.x - cw / 2) / TS), x1 = Math.floor((o.x + cw / 2 - 1) / TS);
    const y0 = Math.floor((o.y - ch) / TS), y1 = Math.floor((o.y - 1) / TS);
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1)
      out.push((NAMES[o.s] || ('id' + o.s)) + '@' + Math.round(o.x / TS) + ',' +
               Math.round((o.y - 1) / TS) + ' box ' + cw + 'x' + ch);
  };
  for (const o of objs) if (!deleted.has(o.id) && !hidden.has(o.id)) look(o);
  for (const o of fobjs) look(o);
  return out;
};
const peekTile = (x, y) => ({
  terr: terr[y * MW + x],
  base: baseTerr ? baseTerr[y * MW + x] : null,
  solid: solid[y * MW + x],
  inBlockTiles: blockTiles.indexOf(y * MW + x) >= 0,
  rock: rockTiles ? rockTiles.has(x + "," + y) : null,
});
function blockedByNpcBody(px, py) {
  return npcs.some(n => n!==npcCollisionActor && (typeof npcHere !== "function" || npcHere(n)) && !n.goto && !n.leaving && !n.brambleCompanion &&
    px >= n.x - 7 && px < n.x + 7 && py >= n.y - 8 && py < n.y);
}
function blockedByNpcBuffer(px, py) {
  for (const n of npcs) {
    if (typeof npcHere === "function" && !npcHere(n)) continue;
    if (n.goto || n.leaving) continue;
    // Anchor the half-tile clearance to the NPC's feet, not the next grid row.
    // Otherwise a south-facing NPC can block Corin beyond talking distance.
    if (px >= n.x - TS / 2 && px < n.x + TS / 2 &&
        py >= n.y && py < n.y + TS / 2) return true;
  }
  return false;
}
/* The seal altar occupies Halvard's old place at the north end of the rug. */
const TRIAL_PEDESTAL = { x: 112, y: 104 };
function trialPedestalHere() {
  return MAPID === "royal_seal";
}
function blockedByTrialPedestal(px, py) {
  return trialPedestalHere() &&
    px >= TRIAL_PEDESTAL.x - 13 && px < TRIAL_PEDESTAL.x + 13 &&
    py >= TRIAL_PEDESTAL.y - 36 && py < TRIAL_PEDESTAL.y + 2;
}
const whyBlocked = (px, py) => {
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return "off the map";
  if (solid[y * MW + x] === 1) return "solid[]";
  if (blockedByTrialPedestal(px, py)) return "trial pedestal";
  if (blockedByNpcBuffer(px, py)) return "npc half-tile buffer";
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return "arena fence";
  if (x <= 80) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5)
      return "north gate";
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return "egg gate";
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return "field gate";
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return "fence list";
  if (blockedByGuard(x, y)) return "guard";
  if (odoShuts(x, y)) return "odo";
  if (blockedByItem(x, y)) return "item";
  if (blockedByHerd(x, y)) return "herd";
  return "not blocked";
};
const isSolid = (px, py, ignoreNpcBuffer = false) => {
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return true;
  const override=collisionOverride(px,py);if(override!==undefined)return override;
  if (MAPID === "witchmoor" && wonAll && px >= 184 && px < 213 && py >= 282 && py < 311) return true;
  const wallEdit=editedTempleWallCollision(px,py);if(wallEdit===true)return true;
  if(wallEdit!==false&&MD?.templeContinuous&&(!MD.templeFloors.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3])||MD.templeWalls.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3])))return true;
  if (blockedByTempleGate(px,py)) return true;
  if (blockedByTrialPedestal(px, py)) return true;
  if (solid[y * MW + x] === 1) return true;
  if (blockedByNpcBody(px, py)) return true;
  if (MAPID === "glasshouse" && glassHatchFrame() < 3 && px >= 48 && px < 88 && py >= 104 && py < 118) return true;
  if (MD.roomBlocks && MD.roomBlocks.some(r => px >= r[0] && px < r[2] && py >= r[1] && py < r[3])) return true;
  if (!ignoreNpcBuffer && blockedByNpcBuffer(px, py)) return true;
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return true;
  const inMillwood = x <= 80;
  if (inMillwood) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5)
      return true;
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return true;
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return true;
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return true;
  if (blockedByGuard(x, y)) return true;
  if (odoShuts(x, y)) return true;
  if (blockedByItem(x, y)) return true;
  return blockedByHerd(x, y);
};

const CELL = 256;
let CW = 1, CH = 1, buckets = [], sbuckets = [];
let fenceAt = null;
function rebuildBuckets() {
  CW = Math.ceil(PXW / CELL); CH = Math.ceil(PXH / CELL);
  fenceAt = new Set((MD.fence || []).map(([fx, fy]) => fy * MW + fx));
  buckets = new Array(CW * CH); for (let i = 0; i < buckets.length; i++) buckets[i] = [];
  sbuckets = new Array(CW * CH); for (let i = 0; i < sbuckets.length; i++) sbuckets[i] = [];
  const sa = sanm.concat(fsanim);
  for (let i = 0; i < sa.length; i += 3) {
    if (i < sanm.length && decorGone.has("a" + i)) continue;
    const x = sa[i + 1], y = sa[i + 2];
    if (typeof inWinter === "function") {
      const nm = NAMES[sa[i]] || "";
      if (/(agrass|dtuft|tuft|weed|flower|fern|clover|grass|sw_tuft|swg|bloom|petal)/i.test(nm) &&
          inWinter(Math.floor(x / TS), Math.floor((y - 1) / TS))) continue;
    }
    const cx = Math.min(CW - 1, Math.max(0, Math.floor(x / CELL)));
    const cy = Math.min(CH - 1, Math.max(0, Math.floor(y / CELL)));
    sbuckets[cy * CW + cx].push(sa[i], x, y);
  }
  for (const o of objs.concat(fobjs)) {
    if (deleted.has(o.id) || hidden.has(o.id)) continue;
    const cx = Math.min(CW - 1, Math.max(0, Math.floor(o.x / CELL)));
    const cy = Math.min(CH - 1, Math.max(0, Math.floor(o.y / CELL)));
    buckets[cy * CW + cx].push(o);
  }
}
function reindex() { rebuildBuckets(); rebuildSolid(); rebuildLavaNear();
                     placeBirds(); mapDirty = true; }

const P = { x: 0, y: 0, dir: "d", moving: false, t: 0, flip: false };
const PC_W = 11, PC_H = 7;      // feet collision box
function canStand(x, y) {
  const hw = PC_W / 2;
  /* An NPC can turn after a conversation and place its directional buffer
     around Corin.  If he is already inside it, let him leave; the buffer
     starts blocking again as soon as his feet are clear. */
  const escapingNpcBuffer =
    blockedByNpcBuffer(P.x - hw, P.y - PC_H) ||
    blockedByNpcBuffer(P.x + hw, P.y - PC_H) ||
    blockedByNpcBuffer(P.x - hw, P.y - 1) ||
    blockedByNpcBuffer(P.x + hw, P.y - 1);
  return !(isSolid(x - hw, y - PC_H, escapingNpcBuffer) ||
           isSolid(x + hw, y - PC_H, escapingNpcBuffer) ||
           isSolid(x - hw, y - 1, escapingNpcBuffer) ||
           isSolid(x + hw, y - 1, escapingNpcBuffer));
}
function movePlayer(dx, dy, dt) {
  if (sceneHold()) return;      /* held still while someone is talking */
  const SP = running ? 190 : 118;     /* B is hold-to-run */
  const nx = P.x + dx * SP * dt, ny = P.y + dy * SP * dt;
  // Ordinary temple doors only start opening when a movement crosses their threshold.
  if(MD?.templeContinuous&&dy&&Math.abs(P.x-160)<=10){
    for(const g of MD.templeGates){
      if(g.room||g.entered)continue;
      const north=dy<0&&P.y>=g.y&&ny-PC_H<g.y;
      const south=dy>0&&P.y-1<g.y-16&&ny-1>=g.y-16;
      if(north||south)g.entered=true;
    }
  }

  if (dx && canStand(nx, P.y)) P.x = nx;
  if (dy && canStand(P.x, ny)) P.y = ny;
  P.x = Math.max(8, Math.min(PXW - 8, P.x));
  P.y = Math.max(16, Math.min(PXH - 2, P.y));
}

const cv = document.getElementById("cv"), ctx = cv.getContext("2d", { alpha: false });
let VW = 0, VH = 0, DPR = 1;
// Virtual source coordinates keep every sprite and alternate NPC tone unchanged.
const atlasImg = {width:4096,height:1039360};
// Throne-room asset cut directly from the approved user image.
const throneRoomImg = new Image();
throneRoomImg.src = window.EMBER_MEDIA.throneRoomSrc;
const atlasPages = new Map();
const MOUNTED_KEY_Y = new Set([623616, 624640, 625664, 626688, 627712, 628736, 629760, 630784, 631808, 632832, 633856, 634880, 635904, 636928, 637952, 638976, 640000, 641024, 642048, 643072, 644096, 645120, 646144, 647168, 648192, 649216, 650240, 651264, 652288, 653312, 654336, 655360, 656384, 657408, 658432, 659456, 660480, 661504, 662528, 663552, 664576, 665600, 666624, 667648, 668672, 669696, 670720, 671744, 672768, 673792, 674816, 675840, 676864, 677888]);
// Magenta was the mounted sheets' export matte. Key it during decode so it
// cannot bleed into scaled edges; other atlas art never passes through here.
function decodeMountedMatte(img, w, h) {
  const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const pixels = g.getImageData(0, 0, w, h), p = pixels.data;
  const purple = (i) => p[i] > p[i+1] + 24 && p[i+2] > p[i+1] + 24 &&
    p[i] > p[i+2] * .65 && p[i+2] > p[i] * .55 && Math.max(p[i], p[i+2]) > 65;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i+3] && purple(i) && p[i+1] < Math.max(p[i], p[i+2]) * .5) p[i+3] = 0;
  }
  // Remove residual matte tint only along transparent boundaries. Interior
  // colors and the rider/dragon silhouette retain their original alpha.
  const before = new Uint8ClampedArray(p);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y*w+x)*4;
    if (!p[i+3] || !purple(i)) continue;
    const edge = x===0 || y===0 || x===w-1 || y===h-1 ||
      !before[i-4+3] || !before[i+4+3] || !before[i-w*4+3] || !before[i+w*4+3];
    if (edge) p[i+2] = Math.min(p[i+2], p[i+1]);
  }
  g.putImageData(pixels, 0, 0);
  return canvas;
}
function registerAtlasPage(page) {
  const seatedWidths={547840:27,548864:23,549888:27,550912:26,551936:23,552960:27,553984:27};
  if(seatedWidths[page.y]&&!page.seatedClean){
    // The source frames include terracotta rugs. Remove only background-connected
    // rug pixels, preserving the same colours when enclosed by character outlines.
    const c=document.createElement('canvas');c.width=page.w;c.height=page.h;
    const g=c.getContext('2d');g.drawImage(page.img,0,0);
    const im=g.getImageData(0,0,page.w,page.h),a=im.data,fw=seatedWidths[page.y];
    const rug=new Set([0xa75d44,0x92473f,0xbe6f47,0x843f3b]);
    for(let left=0;left<page.w;left+=fw){
      const width=Math.min(fw,page.w-left),seen=new Uint8Array(width*page.h),stack=[];
      for(let y=0;y<page.h;y++){stack.push(y*width,y*width+width-1);}
      for(let x=0;x<width;x++){stack.push(x,(page.h-1)*width+x);}
      while(stack.length){
        const p=stack.pop();if(seen[p])continue;seen[p]=1;
        const x=p%width,y=Math.floor(p/width),o=(y*page.w+left+x)*4;
        if(a[o+3]&&!rug.has((a[o]<<16)|(a[o+1]<<8)|a[o+2]))continue;
        a[o+3]=0;
        if(x)stack.push(p-1);if(x+1<width)stack.push(p+1);
        if(y)stack.push(p-width);if(y+1<page.h)stack.push(p+width);
      }
    }
    g.putImageData(im,0,0);page={...page,img:c,seatedClean:true};
  }
  const x1 = Math.floor((page.x + page.w - 1) / 1024);
  const y1 = Math.floor((page.y + page.h - 1) / 1024);
  for (let ty = Math.floor(page.y / 1024); ty <= y1; ty++)
    for (let tx = Math.floor(page.x / 1024); tx <= x1; tx++)
      atlasPages.set(ty * 4 + tx, page);
}

function drawGameImage(g, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (img !== atlasImg) {
    /* A missing or not-yet-decoded auxiliary sheet must never take down the
       render loop. */
    if (!img || img.complete === false || img.naturalWidth === 0 || img.naturalHeight === 0) return;
    if (sw === undefined) g.drawImage(img, sx, sy);
    else if (dx === undefined) g.drawImage(img, sx, sy, sw, sh);
    else g.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }
  if (dx === undefined) {
    dx = sx; dy = sy; dw = sw === undefined ? img.width : sw;
    dh = sh === undefined ? img.height : sh;
    sx = sy = 0; sw = img.width; sh = img.height;
  }
  if (!(sw > 0 && sh > 0 && dw > 0 && dh > 0)) return;
  const x0 = Math.floor(sx / 1024), x1 = Math.floor((sx + sw - 0.00001) / 1024);
  const y0 = Math.floor(sy / 1024), y1 = Math.floor((sy + sh - 0.00001) / 1024);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    const page = atlasPages.get(ty * 4 + tx);
    if (!page) continue;
    const x = Math.max(sx, page.x, tx * 1024), y = Math.max(sy, page.y, ty * 1024);
    const right = Math.min(sx + sw, page.x + page.w, (tx + 1) * 1024);
    const bottom = Math.min(sy + sh, page.y + page.h, (ty + 1) * 1024);
    if (right <= x || bottom <= y) continue;
    g.drawImage(page.img, x - page.x, y - page.y, right - x, bottom - y,
      dx + (x - sx) * dw / sw, dy + (y - sy) * dh / sh,
      (right - x) * dw / sw, (bottom - y) * dh / sh);
  }
}
async function loadAtlasPages() {
  // Limit simultaneous decodes to avoid a large startup memory spike.
  let next = 0;
  async function worker() {
    while (next < ATLAS_PAGES.length) {
      const [x, y, w, h, src] = ATLAS_PAGES[next++];
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve; img.onerror = reject; img.src = src;
      });
      registerAtlasPage({ img: MOUNTED_KEY_Y.has(y) ? decodeMountedMatte(img, w, h) : img, x, y, w, h });
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  if (knightStoryImg.decode) await knightStoryImg.decode();
  /* Register patches deterministically after every original page. */
  for (const [x, y, w, h, src] of ATLAS_PATCHES) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve; img.onerror = reject; img.src = src;
    });
    registerAtlasPage({ img, x, y, w, h });
  }
  await prepareGreenScene();
  await loadDesertNpcAssets();
  await loadDockOriginalAssets();
  await loadRoyalAssets();
}


const stageEl = document.getElementById("stage");
function resize() {
  const nextDPR = Math.min(window.devicePixelRatio || 1, 2);
  const r = stageEl.getBoundingClientRect ? stageEl.getBoundingClientRect() : null;
  const nextW = Math.floor((r && r.width) || window.innerWidth);
  const nextH = Math.floor((r && r.height) || window.innerHeight);
  if (VW === nextW && VH === nextH && DPR === nextDPR &&
      cv.width === Math.floor(nextW * nextDPR) && cv.height === Math.floor(nextH * nextDPR)) return;
  DPR = nextDPR; VW = nextW; VH = nextH;
  cv.width = Math.floor(VW * DPR); cv.height = Math.floor(VH * DPR);
  cv.style.width = VW + "px"; cv.style.height = VH + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!cameraOwnsView() && !camFree && mode === "play") { cam.z = playZoom(); clampCam(); }
  if (hatchCamera) hatchCamera.goal = null; // Reframe only for a real viewport change.
  mapDirty = true;
}
function auditPlacements() {
  const seen = new Set();
  for (const md of Object.values(W.maps))
    for (const arr of [md.objs || [], md.scatter || []])
      for (let i = 0; i < arr.length; i += 3)
        if (!SPR[NAMES[arr[i]]]) seen.add(NAMES[arr[i]]);
  if (seen.size) console.warn("placed but not in the atlas:", [...seen].join(", "));
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange",
                        () => setTimeout(resize, 250));
if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(stageEl);

function toggleBig() {
  const root = document.documentElement;
  const on = document.fullscreenElement || document.webkitFullscreenElement;
  const pseudo = document.body.classList.contains("pseudoFullscreen");
  try {
    if (on) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else if (pseudo) {
      document.body.classList.remove("pseudoFullscreen");
    } else {
      /* Try the real browser fullscreen route on iPhone too. The old iOS
         shortcut skipped it entirely, so it could only appear to do nothing.
         The viewport mode is retained solely as a rejected-API fallback. */
      const r = root.requestFullscreen || root.webkitRequestFullscreen;
      if (!r) document.body.classList.add("pseudoFullscreen");
      else {
        const p = r.call(root);
        if (p && p.catch) p.catch(() => document.body.classList.add("pseudoFullscreen"));
        setTimeout(() => {
          if (!(document.fullscreenElement || document.webkitFullscreenElement))
            document.body.classList.add("pseudoFullscreen");
        }, 650);
      }
    }
  } catch (e) { document.body.classList.add("pseudoFullscreen"); }
  setTimeout(resize, 120);
}
document.addEventListener("fullscreenchange", () => setTimeout(resize, 120));
document.addEventListener("webkitfullscreenchange", () => setTimeout(resize, 120));

function sheetOf(s) {
  return s[5] === 5 ? knightStoryImg : s[5] === 4 ? kingDragonDeathImg : s[5] === 3 ? kingDragonImg : s[5] === 2 ? smImg : s[5] === 1 ? dragonImg : atlasImg;
}
function blit(dst, name, frame, dx, dy) {
  const s = SPR[name];
  if (!s) throw new Error("unknown sprite " + name);
  const f = frame % s[4];
  drawGameImage(dst, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
}
const nmask = (x, y, ok) =>
  (ok(x, y - 1) ? 0 : 8) | (ok(x + 1, y) ? 0 : 4) |
  (ok(x, y + 1) ? 0 : 2) | (ok(x - 1, y) ? 0 : 1);

function scatterFits(px, py, name) {
  const t = T(Math.floor(px / TS), Math.floor((py - 1) / TS));
  if (name && ANYWHERE.test(name)) return true;
  if (name && typeof inWinter === "function" &&
      /(agrass|dtuft|tuft|weed|flower|fern|clover|bush_|grass|sw_tuft|swg|bloom|petal)/i.test(name)) {
    const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
    if (inWinter(tx, ty)) return false;
  }
  if (name && WATERPLANT.test(name)) return t === WATER || t === BRIDGE;
  if (name && /^mt[dwe]_/.test(name)) return true;
  if (name && /^(dune_|sand_ripple|drock|bones)/.test(name)) return t === SAND;
  return t === GRASS || t === WALL || t === FARM;
}
const PLACED = "mtn_|mts_|mtv_|vmt_|mtd_|mtw_|mte_|cave|wf_cave|vfall|vfence" +
               "|vtree_|vbush_|vtuft_|vtower|vbridge|rc_|kt_|kp_|shc_|shcap_";
const ANYWHERE = new RegExp("^(" + PLACED + "|waterfall|cliffpool|cliff_|bridge_|sett_)");
const WATERPLANT = /^(cattail|lily_)/;

function lavaLook(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return true;
  const q = T(x, y);
  if (q === VLAVA) return true;
  if (q !== GRASS && !(q === WALL && !cliffAt(x, y))) return false;
  return typeof baseTerr !== "undefined" && baseTerr &&
         baseTerr[y * MW + x] === VLAVA;
}
function lavaShore(g, x, y, px, py) {
  const tt = TERRT.vl;
  if (!tt) return;
  const n = nmask(x, y, lavaLook);
  if (n && SPR[tt.mask[n]]) blit(g, tt.mask[n], 0, px, py);
}
const CHUNK = 256;                 /* px; 16x16 tiles */
const CHUNK_CACHE = 96;            /* ~25 MB ceiling, plenty for any viewport */
let chunks = new Map();            /* key -> {cv, used} */
let chunkClock = 0;
let scatterChunks = null;          /* chunk key -> static scatter entries */

function chunkKey(cx, cy) { return cy * 4096 + cx; }

function indexScatter() {
  scatterChunks = new Map();
  const sc = scat;
  for (let i = 0; i < sc.length; i += 3) {
    if (decorGone.has("s" + i)) continue;      /* deleted this session */
    const cx = Math.floor(sc[i + 1] / CHUNK), cy = Math.floor(sc[i + 2] / CHUNK);
    const sp = SPR[NAMES[sc[i]]];
    const reach = sp ? Math.ceil((sp[2] / 2) / CHUNK) : 1;
    const up = sp ? Math.ceil(sp[3] / CHUNK) : 1;
    for (let dy = 0; dy <= up; dy++) for (let dx = -reach; dx <= reach; dx++) {
      const k = chunkKey(cx + dx, cy - dy);
      let a = scatterChunks.get(k);
      if (!a) scatterChunks.set(k, a = []);
      a.push(sc[i], sc[i + 1], sc[i + 2]);
    }
  }
}

let GROUND_SETS = ATLAS.ground_sets || {};
let GROUND_FRINGE = ATLAS.ground_fringe || {};
const NOISE_CELL = 9;

function _lat(ix, iy) {
  let h = (ix * 374761393 + iy * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000;
}

function _oct(x, y, cell, seed) {
  const fx = x / cell, fy = y / cell;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  let tx = fx - ix, ty = fy - iy;
  tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);   /* smoothstep */
  const a = _lat(ix + seed, iy), b = _lat(ix + 1 + seed, iy);
  const c = _lat(ix + seed, iy + 1), d = _lat(ix + 1 + seed, iy + 1);
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

function blobNoise(x, y) {
  return _oct(x, y, NOISE_CELL, 0) * 0.45
       + _oct(x, y, 6, 977) * 0.33
       + _oct(x, y, 3, 4211) * 0.22;
}

function rawBlue(x, y) {
  const z = MD.shroom;
  if (!z || !GROUND_SETS.blue) return false;
  const d = (z.y1 - y) / (z.y1 - z.y0) * 1.9;
  if (d <= 0) return false;
  if (d >= 1) return true;
  return d > blobNoise(x, y) * 0.85 + 0.08;
}

function isBlue(x, y) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++)
      if (rawBlue(x + dx, y + dy)) n++;
  return n >= 5;
}

const POOL_T = 7;
function isPool(x, y) {
  return x >= 0 && y >= 0 && x < MW && y < MH && terr[y * MW + x] === POOL_T;
}
function poolTile(x, y) {
  if (!isPool(x, y)) return null;
  const m = nmask(x, y, isPool);
  if (m === 0) return SPR["water_mid"] ? "water_mid" : null;
  const C = TERRT.cwa, W0 = TERRT.wa;
  const cn = C && C.mask[m], wn = W0 && W0.mask[m];
  if (cn && SPR[cn]) return cn;
  if (wn && SPR[wn]) return wn;
  return SPR["water_mid"] ? "water_mid" : null;
}
function poolCorners(x, y) {
  const C = TERRT.cwa, W0 = TERRT.wa;
  const R = (C && C.diag) ? C : W0;
  if (!isPool(x, y) || !R || !R.diag) return null;
  if (nmask(x, y, isPool) !== 0) return null;
  const out = [];
  for (let i = 0; i < R.diag.length; i++) {
    const [dx, dy] = R.diag[i];
    if (!isPool(x + dx, y + dy)) {
      const c = R.corner[i];
      out.push(SPR[c] ? c : (W0 && W0.corner[i]));
    }
  }
  return out.filter(Boolean).length ? out.filter(Boolean) : null;
}

function grassHere(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const i = y * MW + x;
  if (terr[i] === GRASS) return true;
  return terr[i] === WALL && baseTerr && baseTerr[i] === GRASS;
}
function sandOrRoad(x, y) {
  const i = y * MW + x;
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  return terr[i] === SAND || terr[i] === DIRT
      || (terr[i] === WALL && baseTerr && baseTerr[i] === SAND);
}
function grassNear(x, y) {
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const a = x + dx, b = y + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (terr[j] === GRASS || (baseTerr && baseTerr[j] === GRASS)) return true;
    }
  return false;
}
function inSwamp(x, y) {
  const F = (typeof features !== "undefined" && features.length) ? features
                                                                 : MD.features;
  if (!F) return false;
  const SR = MD.swamp_regions;
  if (SR) for (const r of SR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  for (const f of F) {
    if (f.kind !== "route" || f.style !== "swamp") continue;
    const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const vx = pb[0] - pa[0], vy = pb[1] - pa[1];
      const len2 = vx * vx + vy * vy;
      let t = len2 ? ((x - pa[0]) * vx + (y - pa[1]) * vy) / len2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const dx = x - (pa[0] + t * vx), dy = y - (pa[1] + t * vy);
      if (dx * dx + dy * dy <= reach * reach) return true;
    }
  }
  return false;
}
let arenaRings = null;
function onArenaFloor(x, y) {
  if (!arenaRings) return false;
  for (const a of arenaRings)
    if ((x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]) <= a[2] * a[2] + 4) return true;
  return false;
}
let blossomBand = null;
let townBoxList = null;
let deckWet = null;
function deckOverWater(x, y) {
  if (!deckWet) {
    deckWet = new Set();
    for (const p of (MD.deck_wet || [])) deckWet.add(p[1] * MW + p[0]);
  }
  return deckWet.has(y * MW + x);
}
function swWater(name) {
  const t = SPR["sw_" + name] ? "sw_" + name : name;
  return t;
}
function winterGroundTile(x, y) {
  const set = GROUND_SETS.snow;
  const v = (((x * 374761393) ^ (y * 668265263)) >>> 0) % set.length;
  return SPR[set[v]] ? set[v] : null;
}
function swampGround(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  if (typeof inWinter === "function" && inWinter(x, y)) return false;
  const t = terr[y * MW + x];
  return (t === GRASS || (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))
         && inSwamp(x, y);
}
function swampSpan(x, y) {
  if (typeof inWinter === "function" && inWinter(x, y)) return false;
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const t = terr[y * MW + x];
  return (t === GRASS || t === WATER || t === DIRT || t === COBBLE ||
          t === PAVING2 || t === ROADSAND || t === BRIDGE || t === DECK ||
          (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))
         && inSwamp(x, y);
}
function swampEdge(x, y) {
  if (!SPR.swp_c || !swampGround(x, y)) return null;
  const m = nmask(x, y, swampSpan);
  if (m === 0) return null;
  const R = TERRT.swp;
  const nm = R && R.mask[m];
  return nm && SPR[nm] ? nm : null;
}
function swampCorners(x, y) {
  const R = TERRT.swp;
  if (!R || !R.corner || !swampGround(x, y)) return null;
  if (nmask(x, y, swampSpan) !== 0) return null;   /* an edge tile handles itself */
  let out = null;
  for (let i = 0; i < R.corner.length; i++) {
    const d = R.diag[i];
    if (swampSpan(x + d[0], y + d[1])) continue;
    const n = R.corner[i];
    if (SPR[n]) (out = out || []).push(n);
  }
  return out;
}
function atCoast(x, y) {
  const c = MD.coast;
  if (!c) return false;
  const FADE = 34;
  const dx = Math.max(c.x0 - x, x - c.x1, 0);
  const dy = Math.max(c.y0 - y, 0);          /* south is open: it runs to sea */
  const d = Math.max(dx, dy);
  if (d > FADE) return false;
  if (d === 0) return true;
  const nz = (a, b, cell) => {
    const gx = a / cell, gy = b / cell;
    const ix = Math.floor(gx), iy = Math.floor(gy);
    const fx = gx - ix, fy = gy - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (px, py) => {
      let h = (px * 1597334677 + py * 2654435761) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) & 0xFFFF) / 65535;
    };
    const a0 = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * sx;
    const b0 = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * sx;
    return a0 + (b0 - a0) * sy;
  };
  const f = nz(x, y, 19) * 0.6 + nz(x + 53, y + 29, 8) * 0.4;
  return f > d / FADE;
}
function atOasis(x, y) {
  const o = MD.oasis;
  return !!o && x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1;
}
function worldWaterAt(x, y) {
  const list = (MD && MD.world_water) || [];
  for (const b of list)
    if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]) return true;
  return false;
}
function inDesert(x, y) {
  for (let dy = -22; dy <= 22; dy += 3)
    for (let dx = -22; dx <= 22; dx += 3) {
      const a = x + dx, b = y + dy;
      if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
      const j = b * MW + a;
      if (terr[j] === SAND || terr[j] === ROADSAND
          || (baseTerr && baseTerr[j] === SAND)) return true;
    }
  return false;
}
function sandHere(x, y) {
  const i = y * MW + x;
  if (terr[i] === SAND || terr[i] === ROADSAND) return true;
  if (terr[i] === WALL || terr[i] === DIRT || terr[i] === COBBLE
      || terr[i] === PAVING2) {
    if (baseTerr && baseTerr[i] === SAND) return true;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const a = x + dx, b = y + dy;
        if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
        const j = b * MW + a;
        if (terr[j] === SAND || (baseTerr && baseTerr[j] === SAND)) return true;
        if (terr[j] === GRASS || (baseTerr && baseTerr[j] === GRASS)) return false;
      }
  }
  return false;
}
function groundTile(x, y, which) {
  const set = GROUND_SETS[which || "green"] || GROUND_SETS.green;
  if (!set) return "grass1";
  const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
  return SPR[set[v]] ? set[v] : "grass1";
}

function blueOverlay(x, y) {
  if (!isBlue(x, y)) return null;
  const m = nmask(x, y, (a, b) => isBlue(a, b));
  if (m === 0) {
    const set = GROUND_SETS.blue;
    const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
    return SPR[set[v]] ? set[v] : null;
  }
  const nm = TERRT.bgr && TERRT.bgr.mask[m];
  return nm && SPR[nm] ? nm : null;
}

function blueCorners(x, y) {
  const R = TERRT.bgr;
  if (!isBlue(x, y) || !R) return null;
  if (nmask(x, y, (a, b) => isBlue(a, b)) !== 0) return null;
  const out = [];
  for (let i = 0; i < R.diag.length; i++) {
    const [dx, dy] = R.diag[i];
    if (!isBlue(x + dx, y + dy)) out.push(R.corner[i]);
  }
  return out.length ? out : null;
}

function fringeTile(x, y, nm) {
  if (atCoast(x, y) && SPR["c" + nm]) return "c" + nm;
  if (!isBlue(x, y)) return nm;
  const alt = GROUND_FRINGE.blue + nm.slice(2);
  return SPR[alt] ? alt : nm;
}

function renderChunk(cx, cy) {
  const cv = document.createElement("canvas");
  cv.width = CHUNK; cv.height = CHUNK;
  const g = cv.getContext("2d");
  g.imageSmoothingEnabled = false;
  if (MAPID === "witchmoor" || MD.roomArt) {
    const sp = SPR[MD.roomArt || "witch_room"];
    g.fillStyle = MD.bg; g.fillRect(0, 0, CHUNK, CHUNK);
    if(MD._roomBaseCanvas) g.drawImage(MD._roomBaseCanvas,-cx*CHUNK,-cy*CHUNK);
    else drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3], -cx * CHUNK, -cy * CHUNK, sp[2], sp[3]);
    return cv;
  }
  const tx0 = (cx * CHUNK) / TS, ty0 = (cy * CHUNK) / TS, n = CHUNK / TS;
  g.translate(-cx * CHUNK, -cy * CHUNK);

  const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
  const isMade = (a, b) => T(a, b) === DIRT || T(a, b) === COBBLE || T(a, b) === PAVING2 || T(a, b) === FARM;
  const notGrass = (a, b) => T(a, b) !== GRASS && T(a, b) !== WALL;

  for (let y = ty0 - 1; y < ty0 + n + 1; y++) for (let x = tx0 - 1; x < tx0 + n + 1; x++) {
    if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
    const t = T(x, y), px = x * TS, py = y * TS;
    if (MD.bg) {
      g.fillStyle = (t === WALL) ? MD.bg : (MD.floorbg || MD.bg);
      g.fillRect(px, py, TS, TS);
    } else if (typeof onLava === "function" && onLava(x, y)) {
      const r = ((x * 31 + y * 17) | 0);
      const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
      if (p > 0.70) {
        const sp = "vl_sp" + (hash2(x, y) % 9);
        blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
      } else blit(g, "vl_flat", 0, px, py);
    } else blit(g, groundTile(x, y,
                  (typeof snowGround === "function" && snowGround(x, y)) ? "snow"
                  : (terr[y * MW + x] === WATER && inWinter(x, y)) ? "snow_ice"
                  : (terr[y * MW + x] === WATER && inSwamp(x, y)) ? "swamp_water"
                  : swampGround(x, y) ? "swamp_grass"
                  : (terr[y * MW + x] === WATER && inDesert(x, y)) ? "dwater"
                  : ((terr[y * MW + x] === GRASS
                      || (terr[y * MW + x] === WALL && baseTerr
                          && baseTerr[y * MW + x] === GRASS))
                     && atOasis(x, y)) ? "dgrass"
                  : ((terr[y * MW + x] === GRASS
                      || (terr[y * MW + x] === WALL && baseTerr
                          && baseTerr[y * MW + x] === GRASS))
                     && atCoast(x, y)) ? "coast"
                  : (terr[y * MW + x] === PAVING2 && inDesert(x, y)
                     && onArenaFloor(x, y)) ? "astone"
                  : (terr[y * MW + x] === PAVING2 && inDesert(x, y)) ? "road_sand"
                  : (terr[y * MW + x] === ROADSAND && inDesert(x, y)) ? "sand"
                  : terr[y * MW + x] === ROADSAND ? "road_sand"
                  : sandHere(x, y)
                    ? ((terr[y * MW + x] === DIRT || terr[y * MW + x] === PAVING2)
                        ? "road_sand" : "sand")
                    : "green"), 0, px, py);
    if (terr[y * MW + x] === SAND && SPR.sand_ripple0) {
      const rh = ((x * 2654435761) ^ (y * 1597334677)) >>> 0;
      if (rh % 100 < 9) blit(g, "sand_ripple" + ((rh >>> 11) % 8), 0, px, py);
    }
    if (terr[y * MW + x] === SAND && SPR.drock0) {
      const dh = ((x * 374761393) ^ (y * 668265263)) >>> 0;
      const wetNear = (() => {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const a2 = x + dx, b2 = y + dy;
          if (a2 < 0 || b2 < 0 || a2 >= MW || b2 >= MH) continue;
          if (terr[b2 * MW + a2] === WATER) return true;
        }
        return false;
      })();
      if (!wetNear && dh % 600 < 10) {
        const set = ["drock0","drock2","drock4","drock6","drock9","drock10","drock12"];
        const nm = set[(dh >>> 13) % set.length];
        if (SPR[nm]) blit(g, nm, 0, px + (dh >>> 5) % 6 - 3, py + (dh >>> 9) % 6 - 3);
      }
    }
    if (swampGround(x, y) && SPR.swt0) {
      const ph = ((x * 2246822519) ^ (y * 3266489917)) >>> 0;
      if (ph % 100 < 46) {
        const set = GROUND_SETS.swamp_tuft;
        const tn = set[(ph >>> 9) % set.length];
        if (SPR[tn]) blit(g, tn, 0, px, py);
      }
    }
    { const se = swampEdge(x, y); if (se) blit(g, se, 0, px, py); }
    { const pw = poolTile(x, y);
      if (pw) {
        blit(g, pw, 0, px, py);
        const pc = poolCorners(x, y);
        if (pc) for (const c of pc) if (SPR[c]) blit(g, c, 0, px, py);
      } }
    { const bo = blueOverlay(x, y); if (bo) blit(g, bo, 0, px, py);
      const bc = blueCorners(x, y);
      if (bc) for (const c of bc) if (SPR[c]) blit(g, c, 0, px, py); }
    if (t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE)
      blit(g, soilAt(x, y), 0, px, py);

    if (t === DIRT && SPR.wp_t && typeof inWinter === "function" && inWinter(x, y)) {
      const off = (a, b) => (a < 0 || b < 0 || a >= MW || b >= MH) ||
                            terr[b * MW + a] !== DIRT || !inWinter(a, b);
      const n2 = off(x, y - 1), s2 = off(x, y + 1);
      const w2 = off(x - 1, y), e2 = off(x + 1, y);
      if (n2 && w2)      blit(g, "wp_tl", 0, px, py);
      else if (n2 && e2) blit(g, "wp_tr", 0, px, py);
      else if (s2 && w2) blit(g, "wp_bl", 0, px, py);
      else if (s2 && e2) blit(g, "wp_br", 0, px, py);
      else {
        if (n2) blit(g, "wp_t", 0, px, py);
        if (s2) blit(g, "wp_b", 0, px, py);
        if (w2) blit(g, "wp_l", 0, px, py);
        if (e2) blit(g, "wp_r", 0, px, py);
      }
    }
    if (t === DIRT && SPR.swd_w && typeof swampGround === "function" && inSwamp(x, y)) {
      const w = swampGround(x - 1, y), e = swampGround(x + 1, y);
      const n2 = swampGround(x, y - 1), s = swampGround(x, y + 1);
      const dg = [];
      if (!w && !e && !n2 && !s) {
        if (swampGround(x + 1, y + 1)) dg.push("swd_cbr");
        if (swampGround(x - 1, y + 1)) dg.push("swd_cbl");
        if (swampGround(x + 1, y - 1)) dg.push("swd_ctr");
        if (swampGround(x - 1, y - 1)) dg.push("swd_ctl");
      }
      let outer = null;
      if (n2 && w) outer = "swd_otl";
      else if (n2 && e) outer = "swd_otr";
      else if (s && w) outer = "swd_obl";
      else if (s && e) outer = "swd_obr";
      if (w || e || n2 || s || dg.length) {
        const eh = ((x * 668265263) ^ (y * 374761393)) >>> 0;
        blit(g, groundTile(x, y, "swamp_grass"), 0, px, py);
        for (const c of dg) if (SPR[c]) blit(g, c, 0, px, py);
        if (outer && SPR[outer]) blit(g, outer, 0, px, py);
        else {
          if (n2) blit(g, (eh & 2) ? "swd_n" : "swd_n2", 0, px, py);
          if (s)  blit(g, (eh & 1) ? "swd_s" : "swd_s2", 0, px, py);
          if (w)  blit(g, (eh & 4) ? "swd_w" : "swd_w2", 0, px, py);
          if (e)  blit(g, (eh & 8) ? "swd_e" : "swd_e2", 0, px, py);
        }
      }
    }
    if (t === DIRT && typeof inSwamp === "function" && inSwamp(x, y)
        && !(typeof inWinter === "function" && inWinter(x, y))) {
      const sh = ((x * 1274126177) ^ (y * 2654435761)) >>> 0;
      if (SPR.swpb0 && sh % 100 < 20) {
        const set = GROUND_SETS.swamp_pebble;
        const pn = set[(sh >>> 5) % set.length];
        const s2 = SPR[pn];
        if (s2) blit(g, pn, 0,
                     px + ((TS - s2[2]) >> 1) + ((sh >>> 11) % 5) - 2,
                     py + ((TS - s2[3]) >> 1) + ((sh >>> 14) % 5) - 2);
      }
    }

    if ((t === GRASS || t === DIRT || t === COBBLE || t === PAVING2 ||
         t === WALL) &&
        typeof inVolcano === "function" && inVolcano(x, y)) {
      const walk = (a, b) => {
        const q = T(a, b);
        return q === DIRT || q === COBBLE || q === PAVING2 ||
               q === VROCK || q === VSTONE || q === TERRACE;
      };
      if (t === GRASS || (t === WALL && !cliffAt(x, y))) {
        const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
        if (p > 0.70) {
          const sp = "vl_sp" + (hash2(x, y) % 9);
          blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
        } else blit(g, "vl_flat", 0, px, py);
        lavaShore(g, x, y, px, py);
        continue;
      }
      const tt = TERRT.vr;
      if (tt) {
        blit(g, "vr_c", 0, px, py);
        blit(g, tt.mask[nmask(x, y, walk)], 0, px, py);
        continue;
      }
    }
if (t === COBBLE) { const _cb = TERRT.cb.mask[nmask(x, y, (a, b) => T(a, b) === COBBLE)];
      const _wcb = (typeof inWinter === "function" && inWinter(x, y) && SPR["w" + _cb])
                   ? "w" + _cb : _cb;
      blit(g, _wcb, 0, px, py); }
    if (t === PAVING2) {
      blit(g, "cb2_c", 0, px, py);
      blit(g, TERRT.cb2.mask[nmask(x, y, (a, b) => T(a, b) === PAVING2)], 0, px, py);
    }
    if (t === VLAVA) {
      const p = lavaDist(x, y) <= SPECKLE_REACH ? lavaPatch(x, y) : 0;
      if (p > 0.70) {
        const sp = "vl_sp" + (hash2(x, y) % 9);
        blit(g, SPR[sp] ? sp : "vl_flat", 0, px, py);
      } else {
        blit(g, "vl_flat", 0, px, py);
      }
      lavaShore(g, x, y, px, py);
      continue;
    }
    if (t === VSTONE) {
      const f = "vs_f" + (hash2(x, y) % 8);
      blit(g, SPR[f] ? f : "vs_c", 0, px, py);
      const tt = TERRT.vs;
      if (tt) blit(g, tt.mask[nmask(x, y, (a, b) => T(a, b) === VSTONE)], 0, px, py);
      continue;
    }
    if (t === VROCK || t === VCRACK ||
        ((t === DIRT || t === COBBLE || t === PAVING2) && terr[y * MW + x] !== undefined &&
         nearLava(x, y))) {
      const key = t === VCRACK ? "vc" : "vr";
      const tt = TERRT[key];
      const land = (a, b) => {
        const q = T(a, b);
        return q !== VLAVA && q !== WATER && q !== SEA && q !== DWATER;
      };
      if (tt) {
        blit(g, key + "_c", 0, px, py);
        blit(g, tt.mask[nmask(x, y, land)], 0, px, py);
        continue;
      }
    }
    if (t === TERRACE) {
      blit(g, "plat_c", 0, px, py);
      blit(g, TERRT.plat.mask[nmask(x, y, (a, b) => T(a, b) === TERRACE)], 0, px, py);
    }
    if (t === MARBLE) {
      blit(g, "cb3_c", 0, px, py);
      blit(g, TERRT.cb3.mask[nmask(x, y, (a, b) => T(a, b) === MARBLE)], 0, px, py);
    }
    if (t === FARM) blit(g, TERRT.fl.mask[nmask(x, y, (a, b) => T(a, b) === FARM)], 0, px, py);
    if (t === WATER || t === BRIDGE || t === DWATER || t === SEA) {
      if (t === SEA && SPR.gnd_sea0) {
        blit(g, groundTile(x, y, "sea"), 0, px, py);
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      } else if (t === DWATER && SPR.gnd_dwater0) {
        blit(g, groundTile(x, y, "dwater"), 0, px, py);
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== WATER && v !== DWATER;
        };
        const wb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (wb) blit(g, "wsx" + (15 & ~wb), 0, px, py);
      } else {
        const m = nmask(x, y, wet);
        const wn = m === 0 ? "water_mid" : TERRT.wa.mask[m];
        const marshHere = (typeof inSwamp === "function") && inSwamp(x, y);
        blit(g, marshHere ? swWater(wn) : wn, 0, px, py);
      }
    }
    const deep = baseTerr && baseTerr[y * MW + x] === SAND
                 && !grassNear(x, y);
    if (t === WATER && inDesert(x, y) && SPR.wsx0 && !worldWaterAt(x, y)) {
      const dry = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== WATER;
      const wb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
               | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
      if (wb) blit(g, "wsx" + (15 & ~wb), 0, px, py);
    }
    if (SPR.cgx0 && atCoast(x, y)
        && (t === GRASS
            || (t === WALL && baseTerr && baseTerr[y * MW + x] === GRASS))) {
      const darkG = (a, b2) => {
        if (a < 0 || b2 < 0 || a >= MW || b2 >= MH) return false;
        if (atCoast(a, b2)) return false;
        const v = terr[b2 * MW + a];
        return v === GRASS
            || (v === WALL && baseTerr && baseTerr[b2 * MW + a] === GRASS);
      };
      const cb2 = (darkG(x, y - 1) ? 8 : 0) | (darkG(x + 1, y) ? 4 : 0)
                | (darkG(x, y + 1) ? 2 : 0) | (darkG(x - 1, y) ? 1 : 0);
      if (cb2) blit(g, "cgx" + cb2, 0, px, py);
    }
    if (t === DECK && SPR.dk_deck0) {
      {
        const marshDeck = (typeof inSwamp === "function") && inSwamp(x, y);
        const overWater = deckOverWater(x, y);
        blit(g, marshDeck ? (overWater ? swWater("water_plain")
                                       : groundTile(x, y, "swamp_grass"))
                          : groundTile(x, y, "sea"), 0, px, py);
      }
      const off = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== DECK;
      const eN = off(x, y - 1) && SPR.dk_far;
      const eS = off(x, y + 1) && SPR.dk_lip;
      const eW = off(x - 1, y) && SPR.dk_wl;
      const eE = off(x + 1, y) && SPR.dk_wr;
      if (!eN && !eS && !eW && !eE)
        blit(g, ((x + y) & 1) ? "dk_deck0" : "dk_deck1", 0, px, py);
      if (eN) blit(g, "dk_far", 0, px, py);
      if (eS) blit(g, "dk_lip", 0, px, py);
      if (eW) blit(g, "dk_wl", 0, px, py);
      if (eE) blit(g, "dk_wr", 0, px, py);
    }
    if (t === DECK && SPR.hb_deck_f0) {
      {
        const marshDeck = (typeof inSwamp === "function") && inSwamp(x, y);
        const overWater = deckOverWater(x, y);
        blit(g, marshDeck ? (overWater ? swWater("water_plain")
                                       : groundTile(x, y, "swamp_grass"))
                          : groundTile(x, y, "sea"), 0, px, py);
      }
      {
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      }
      const on = (a, b) =>
        a >= 0 && b >= 0 && a < MW && b < MH && terr[b * MW + a] === DECK;
      const n = on(x, y - 1), s2 = on(x, y + 1);
      const w2 = on(x - 1, y), e = on(x + 1, y);
      let k = deckFix && deckFix.get(y * MW + x);
      if (k) { /* named by the map */ }
      else if (n && s2 && w2 && e) k = "f" + ((((x * 7 + y * 3) % 6) + 6) % 6);
      else if (!n && !w2) k = "tl";
      else if (!n && !e) k = "tr";
      else if (!s2 && !w2) k = "bl";
      else if (!s2 && !e) k = "br";
      else if (!n) k = "t";
      else if (!s2) k = "b";
      else if (!w2) k = "l";
      else k = "r";
      blit(g, "hb_deck_" + k, 0, px, py);
      {
        const dry = (a, b) => {
          if (a < 0 || b < 0 || a >= MW || b >= MH) return true;
          const v = terr[b * MW + a];
          return v !== SEA && v !== DECK && v !== WATER;
        };
        const cb = (dry(x, y - 1) ? 8 : 0) | (dry(x + 1, y) ? 4 : 0)
                 | (dry(x, y + 1) ? 2 : 0) | (dry(x - 1, y) ? 1 : 0);
        if (cb && SPR.csx0 && !(typeof inSwamp === "function" && inSwamp(x, y)))
          blit(g, "csx" + cb, 0, px, py);   /* the world's bank, not the marsh's */
      }
      if (typeof inSwamp === "function" && inSwamp(x, y)) {
        const pk = deckPlank.get(y * MW + x);
        if (pk && SPR[pk]) blit(g, pk, 0, px, py);
      }
    }
    if (t === ROADSAND && SPR.rsx0) {
      const notRoad = (a, b) =>
        a < 0 || b < 0 || a >= MW || b >= MH || terr[b * MW + a] !== ROADSAND;
      const rb = (notRoad(x, y - 1) ? 8 : 0) | (notRoad(x + 1, y) ? 4 : 0)
               | (notRoad(x, y + 1) ? 2 : 0) | (notRoad(x - 1, y) ? 1 : 0);
      blit(g, "rsx" + rb, 0, px, py);   /* rsx0 is the plain interior */
    }
    if (!deep && (sandHere(x, y) || t === DIRT) && SPR.gsx0
        && !inSwamp(x, y) && !inWinter(x, y)) {
      const b = (grassHere(x, y - 1) ? 8 : 0) | (grassHere(x + 1, y) ? 4 : 0)
              | (grassHere(x, y + 1) ? 2 : 0) | (grassHere(x - 1, y) ? 1 : 0);
      if (b) blit(g, (atOasis(x, y) && SPR.gsd0 ? "gsd" : "gsx") + b,
                  0, px, py);
      else {
        if (grassHere(x - 1, y - 1)) blit(g, (atOasis(x, y) && SPR.dgsd_tl ? "dgsd_tl" : "gsd_tl"), 0, px, py);
        if (grassHere(x + 1, y - 1)) blit(g, (atOasis(x, y) && SPR.dgsd_tr ? "dgsd_tr" : "gsd_tr"), 0, px, py);
        if (grassHere(x - 1, y + 1)) blit(g, (atOasis(x, y) && SPR.dgsd_bl ? "dgsd_bl" : "gsd_bl"), 0, px, py);
        if (grassHere(x + 1, y + 1)) blit(g, (atOasis(x, y) && SPR.dgsd_br ? "dgsd_br" : "gsd_br"), 0, px, py);
      }
    }
    if ((t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === FARM)
        && !inDesert(x, y) && !inSwamp(x, y) && !inWinter(x, y)) {
      const m = nmask(x, y, (a, b2) => notGrass(a, b2) && !sandHere(a, b2));
      if (m && !sandHere(x, y - 1) && !sandHere(x, y + 1)
            && !sandHere(x - 1, y) && !sandHere(x + 1, y))
        blit(g, fringeTile(x, y, TERRT.gr.mask[m]), 0, px, py);
    }
  }

  for (const d of decks) {
    if (d.placed) continue;
    if ((d.x1 + 1) * TS < cx * CHUNK || (d.x0 - 1) * TS > (cx + 1) * CHUNK) continue;
    if ((d.y1 + 1) * TS < cy * CHUNK || d.y0 * TS > (cy + 1) * CHUNK) continue;
    for (let y = d.y0; y <= d.y1; y++) {
      const rn = y === d.y0 ? "t" : y === d.y1 ? "b" : "c";
      const rowName = (y === d.y0 || y === d.y1) ? "brg_m" + rn
                    : (SPR["brg_mf"] ? "brg_mf" : "brg_mc");
      for (let x = d.x0; x <= d.x1; x++) blit(g, rowName, 0, x * TS, y * TS);
      const capOnly = (v) => v === 2;
      if (d.cl && !(capOnly(d.cl) && rn === "c"))
        blit(g, "brg_l" + rn, 0, (d.x0 - 1) * TS, y * TS);
      if (d.cr && !(capOnly(d.cr) && rn === "c"))
        blit(g, "brg_r" + rn, 0, (d.x1 + 1) * TS, y * TS);
    }
  }

  for (const [self, key, same] of [
    [wet, "wa", wet],
    [(a, b) => T(a, b) === COBBLE, "cb", (a, b) => T(a, b) === COBBLE],
    [isMade, "gr", (a, b) => notGrass(a, b) && !sandHere(a, b)]
  ]) {
    const diag = TERRT[key].diag, corner = TERRT[key].corner;
    for (let y = ty0 - 1; y < ty0 + n + 1; y++) for (let x = tx0 - 1; x < tx0 + n + 1; x++) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      if (!self(x, y) || nmask(x, y, same) !== 0) continue;
      if (typeof inSwamp === "function" && inSwamp(x, y)) continue;
      if (typeof inWinter === "function" && inWinter(x, y)) continue;
      for (let i = 0; i < diag.length; i++)
        if (!same(x + diag[i][0], y + diag[i][1])) blit(g, corner[i], 0, x * TS, y * TS);
    }
  }

  const sc = scatterChunks.get(chunkKey(cx, cy));
  if (sc) for (let i = 0; i < sc.length; i += 3) {
    if (!scatterFits(sc[i + 1], sc[i + 2], NAMES[sc[i]])) continue;
    const nm = NAMES[sc[i]], sp = SPR[nm];
    blit(g, nm, 0, sc[i + 1] - (sp[2] >> 1), sc[i + 2] - sp[3]);
  }
  return cv;
}

function getChunk(cx, cy) {
  const k = chunkKey(cx, cy);
  let c = chunks.get(k);
  if (!c) {
    c = { cv: renderChunk(cx, cy), used: ++chunkClock };
    chunks.set(k, c);
    if (chunks.size > CHUNK_CACHE) {
      let oldest = null, ok = -1;
      for (const [kk, cc] of chunks) if (oldest === null || cc.used < oldest) { oldest = cc.used; ok = kk; }
      chunks.delete(ok);
    }
  }
  c.used = ++chunkClock;
  return c.cv;
}

function invalidateTiles(indices) {
  for (const i of indices) {
    const x = i % MW, y = (i / MW) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
      chunks.delete(chunkKey(Math.floor((x + dx) * TS / CHUNK),
                             Math.floor((y + dy) * TS / CHUNK)));
  }
}

let deckPlank = new Map();
let deckCover = new Set();
function underDeck(x, y) { return deckCover.has(y * MW + x); }
function indexDecks() {
  deckPlank = new Map();
  deckCover = new Set();
  for (const d of decks) {
    if (d.placed) {
      for (let y = d.y0; y <= d.y1; y++)
        for (let x = d.x0; x <= d.x1; x++) deckCover.add(y * MW + x);
      continue;
    }
    for (let y = d.y0; y <= d.y1; y++) {
      const rn = y === d.y0 ? "t" : y === d.y1 ? "b"
               : (SPR["brg_mf"] ? "f" : "c");
      for (let x = d.x0; x <= d.x1; x++)
        deckPlank.set(y * MW + x, "brg_m" + rn);
    }
  }
}

function buildGround() { resetChunkWarm(); rebuildLavaNear(); chunks.clear(); indexScatter(); indexDecks(); }

function frameOf(nameIdx, t, seed) {
  const d = DEFS[nameIdx];
  if (!d || !d.f) return 0;
  const rate = d.fj ? d.f * (1 + d.fj * (((seed % 1) + 1) % 1)) : d.f;
  return Math.floor(t * rate + (d.s0 !== undefined ? d.s0 : seed)) | 0;
}

const PLAY_ACROSS = 14;    /* world tiles visible across */
const PLAY_DOWN = 9.5;     /* world tiles visible vertically */
const PLAY_MIN = 2.3, PLAY_MAX = 5.5;
function playZoom() {
  if (!VW || !VH) return 2.5;
  const interior = MAPID !== "world";
  const z = Math.min(VW / ((interior ? 13 : PLAY_ACROSS) * TS), VH / ((interior ? 9 : PLAY_DOWN) * TS));
  return Math.max(interior ? 2.15 : PLAY_MIN, Math.min(PLAY_MAX, z)) * (interior ? 1.03 * 0.99 : 0.9 * 1.02 * 1.02);
}
let cam = { x: 0, y: 0, z: 2.5 };
let mode = "play";
let camFree = false;            // "play" | "map"
let editing = false, selected = null;
let rockTiles = new Set();
let decorGone = new Set(), decorDel = [];
let decorMoved = new Map();
let felled = new Set(), felledNew = [];
let clearedBoxes = [];
let painting = false, paintT = GRASS, brush = 1;
let painted = new Map();      /* tileIndex -> terrain, for the patch export */
let groundDirty = false;
let terrOrig = null;          /* the generated terrain, to diff against */
let stroke = null;            /* tiles touched by the stroke in progress */
let undoStack = [];
const UNDO_LIMIT = 40;
let mapDirty = true;

function drawWorld(t, dt) {
  const z = cam.z;
  const vw = VW / z, vh = VH / z;
  ctx.fillStyle = MD.bg || "#1d2a1b";
  ctx.fillRect(0, 0, VW, VH);
  ctx.save();
  ctx.scale(z, z);
  ctx.translate(-cam.x, -cam.y);

  const k0 = Math.max(0, Math.floor(cam.x / CHUNK)), k1 = Math.floor((cam.x + vw) / CHUNK);
  const l0 = Math.max(0, Math.floor(cam.y / CHUNK)), l1 = Math.floor((cam.y + vh) / CHUNK);
  for (let cy = l0; cy <= l1 && cy * CHUNK < PXH; cy++)
    for (let cx = k0; cx <= k1 && cx * CHUNK < PXW; cx++)
      drawGameImage(ctx, getChunk(cx, cy), cx * CHUNK, cy * CHUNK);

  if (building && (cam.x + vw > PXW || cam.y + vh > PXH)) {
    ctx.save();
    ctx.strokeStyle = "rgba(120,160,110,.18)";
    ctx.lineWidth = 1 / z;
    const g = TS * 8;
    for (let x = Math.max(PXW, Math.floor(cam.x / g) * g); x < cam.x + vw; x += g) {
      ctx.beginPath(); ctx.moveTo(x, cam.y); ctx.lineTo(x, cam.y + vh); ctx.stroke();
    }
    for (let y = Math.floor(cam.y / g) * g; y < cam.y + vh; y += g) {
      if (y < PXH && cam.x + vw <= PXW) continue;
      ctx.beginPath(); ctx.moveTo(Math.max(cam.x, 0), y); ctx.lineTo(cam.x + vw, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(240,192,122,.5)";
    ctx.lineWidth = 2 / z;
    ctx.strokeRect(0, 0, PXW, PXH);      /* the current world edge */
    ctx.restore();
  }

  const LIVE = z >= 0.9;
  if (LIVE) {
    const wf = Math.floor(t * 6);
    const tx0 = Math.max(0, Math.floor(cam.x / TS)), tx1 = Math.min(MW - 1, Math.ceil((cam.x + vw) / TS));
    const ty0 = Math.max(0, Math.floor(cam.y / TS)), ty1 = Math.min(MH - 1, Math.ceil((cam.y + vh) / TS));
    const ws = SPR.water_mid, plain = SPR.water_plain;
    const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
    const wdiag = TERRT.wa.diag, wcorner = TERRT.wa.corner;

    const shoreF = Math.floor(t * 5) % 8;

    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const tv = terr[y * MW + x];
      if (tv !== WATER && tv !== BRIDGE) continue;
      if (underDeck(x, y)) continue;
      if ((y > 0 && terr[(y - 1) * MW + x] === DECK) ||
          (y + 1 < MH && terr[(y + 1) * MW + x] === DECK) ||
          (x > 0 && terr[y * MW + x - 1] === DECK) ||
          (x + 1 < MW && terr[y * MW + x + 1] === DECK)) continue;
      if (tv === DWATER) continue;
      if (inDesert(x, y) && !worldWaterAt(x, y)) continue;
      const px = x * TS, py = y * TS;
      const m = nmask(x, y, wet);
      const marsh = (typeof inSwamp === "function") && inSwamp(x, y);
      if (m !== 0) {
        const sp = SPR[marsh ? swWater(TERRT.wa.mask[m]) : TERRT.wa.mask[m]];
        const sf = shoreF % sp[4];
        drawGameImage(ctx, atlasImg, sp[0] + sf * sp[2], sp[1], sp[2], sp[3], px, py, TS, TS);
        const pk = deckPlank.get(y * MW + x);
        if (pk) { const b = SPR[pk];
                  drawGameImage(ctx, atlasImg, b[0], b[1], b[2], b[3], px, py, TS, TS); }
        continue;
      }
      const pl2 = marsh && SPR.sw_water_plain ? SPR.sw_water_plain : plain;
      drawGameImage(ctx, atlasImg, pl2[0], pl2[1], pl2[2], pl2[3], px, py, TS, TS);
      for (let i = 0; i < wdiag.length; i++) {
        const dx = wdiag[i][0], dy = wdiag[i][1];
        if (!wet(x + dx, y + dy)) {
          const cs = SPR[marsh ? swWater(wcorner[i]) : wcorner[i]];
          const cf = shoreF % cs[4];
          drawGameImage(ctx, atlasImg, cs[0] + cf * cs[2], cs[1], cs[2], cs[3], px, py, TS, TS);
        }
      }
      const hsh = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      if (hsh % 100 < 22) {
        const gs = marsh && SPR.sw_water_mid ? SPR.sw_water_mid : ws;
        const f = (wf + (hsh >>> 7)) % gs[4];
        drawGameImage(ctx, atlasImg, gs[0] + f * gs[2], gs[1], gs[2], gs[3], px, py, TS, TS);
      }
      const pk = deckPlank.get(y * MW + x);
      if (pk) { const b = SPR[pk];
                drawGameImage(ctx, atlasImg, b[0], b[1], b[2], b[3], px, py, TS, TS); }
    }
    const c0b = Math.max(0, Math.floor(cam.x / CELL) - 1);
    const c1b = Math.min(CW - 1, Math.floor((cam.x + vw) / CELL) + 1);
    const r0b = Math.max(0, Math.floor(cam.y / CELL) - 1);
    const r1b = Math.min(CH - 1, Math.floor((cam.y + vh) / CELL) + 1);
    for (let r = r0b; r <= r1b; r++) for (let c = c0b; c <= c1b; c++) {
      const b = sbuckets[r * CW + c];
      for (let i = 0; i < b.length; i += 3) {
        const s = SPR[NAMES[b[i]]], px = b[i + 1], py = b[i + 2];
        if (!s) continue;
        if (px + (s[2] >> 1) < cam.x || px - (s[2] >> 1) > cam.x + vw ||
            py < cam.y || py - s[3] > cam.y + vh) continue;
        if (!scatterFits(px, py, NAMES[b[i]])) continue;
        const d = DEFS[b[i]];
        const f = Math.floor(t * (d && d.f ? d.f : 6) + ((px * 7 + py * 13) % 8)) % s[4];
        const fx = px - (s[2] >> 1), fy = py - s[3];
        if (((px * 31 + py * 17) & 4) !== 0) {
          ctx.save(); ctx.translate(fx + s[2], fy); ctx.scale(-1, 1);
          drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3], 0, 0, s[2], s[3]);
          ctx.restore();
        } else {
          drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3], fx, fy, s[2], s[3]);
        }
      }
    }
  }

  drawBlooms();
  drawGraves();

  const draw = [];
  for (const actor of (MD.roomActors || [])) if(!actor.editorDeleted)draw.push(actor);
  if (trialDemonHere()) draw.push({witchDemon:true,...(MAPID==="witchmoor"?{x:196,y:304}:THRONE_DEMON)});
  if (trialPedestalHere()) draw.push({ trialPedestal: true, x: TRIAL_PEDESTAL.x,
                                      y: TRIAL_PEDESTAL.y, sy: TRIAL_PEDESTAL.y });
  const c0 = Math.max(0, Math.floor(cam.x / CELL) - 1);
  const c1 = Math.min(CW - 1, Math.floor((cam.x + vw) / CELL) + 1);
  const r0 = Math.max(0, Math.floor(cam.y / CELL) - 1);
  const r1 = Math.min(CH - 1, Math.floor((cam.y + vh) / CELL) + 1);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++)
    for (const o of buckets[r * CW + c]) {
      const s = SPR[NAMES[o.s]];
      if (!s) continue;
      const oxw = o.wx || 0, oyw = o.wy || 0;
      if (o.x + oxw + s[2] / 2 < cam.x || o.x + oxw - s[2] / 2 > cam.x + vw) continue;
      if (o.y + oyw < cam.y || o.y + oyw - s[3] > cam.y + vh) continue;
      const wd = DEFS[o.s];
      if (wd && wd.wd && !editing) wanderStep(o, wd, dt);
      draw.push(o);
    }
  for (const n of npcs) {
    if (typeof npcHere === "function" && !npcHere(n)) continue;
    if (n.x < cam.x - 64 || n.x > cam.x + vw + 64) continue;
    if (n.y < cam.y - 64 || n.y > cam.y + vh + 64) continue;
    draw.push(n);
  }
  for(const r of MD.moorings||[]){
    if(Math.max(r[0],r[2])<cam.x-32||Math.min(r[0],r[2])>cam.x+vw+32||Math.max(r[1],r[3])<cam.y-32||Math.min(r[1],r[3])>cam.y+vh+32)continue;
    draw.push({mooring:r,x:r[0],y:r[1],sy:Math.max(r[1],r[3])-4});
  }
  if(stonePreview)draw.push({foe:stonePreview,nm:stonePreview.nm,x:stonePreview.x,y:stonePreview.y});
  if(MD.templeContinuous)drawChest();
  drawTempleShots();
  drawDragonTempleTraps();
  draw.push(P);
  if (dragonHere() && dragon.on && !dragonAirborne() &&
      !(typeof mounted !== "undefined" && mounted))
    draw.push({ dg: true, x: dragon.x, y: dragon.y });
  if (hatchScene && MAPID === "world")
    draw.push({ hatchActor: true,
                x: hatchScene.stage < 7 ? hatchScene.x : hatchScene.dragonX,
                y: hatchScene.stage < 7 ? hatchScene.y : hatchScene.dragonY });
  if (bell) draw.push({ bell: true, x: bell.x, y: bell.y });
  const topOf = (o) => (o.s !== undefined && DEFS[o.s] && DEFS[o.s].t) ? 1 : 0;
  const isFab = (o) => o.s !== undefined && FABRIC.test(NAMES[o.s] || "");
  const sortY = (o) => isFab(o) ? -1e9
                     : (o.sy !== undefined ? o.sy : o.y) + (o.wy || 0)
                     + ((o.s !== undefined && /^rc_sup1_/.test(NAMES[o.s])) ? 40 : 0)
                     + ((o.s !== undefined && DEFS[o.s] && DEFS[o.s].sy) ? DEFS[o.s].sy : 0);
  const underfoot = (o) => o.s !== undefined &&
    /^(hb_stair_[es]$|rc_(ores|cavedec|ladder|floor|rails)|ifloor|iwall_)/.test(NAMES[o.s]);
  for (const f of foes) {
    const P_ = ((FOE_BORROW[f.kind] || {})[
                  f.st === "swing" ? "atk" : (f.st === "dead" || f.st === "down" || f.st === "rise") ? "die"
                : f.hurt > 0 ? "hurt" : ""])
            || FOE_ART[f.kind] || "sk";
    const D_ = foeDir(f.dir, f.flip);
    const recovering = /^(?:(gm|gn|pl|lc|rp|dv|ent|bh|ms|gh|bs)[123]|bg|kn|kn3)$/.test(P_) &&
      f.st === "swing" && f.t >= FOE[f.kind].swingT;
    const drawKey = P_ + "|" + f.st + "|" + D_ + "|" + (f.hurt > 0 ? 1 : 0) + "|" + (recovering ? 1 : 0);
    let nm = f._drawKey === drawKey ? f._drawNm : null;
    if (!nm) {
      const pick = (...c) => c.find(n => SPR[n]) || c[c.length - 1];
      nm = f.hurt > 0 && f.st !== "dead"
                               ? pick(P_ + "_hurt_" + D_, P_ + "_idle_" + D_, P_ + "_idle")
             : (f.st === "dead" || f.st === "down" || f.st === "rise") ? pick(P_ + "_die_" + D_,  P_ + "_die",  P_ + "_idle_d", P_ + "_idle")
             : f.st === "escape" ? pick(P_ + "_run_" + D_, P_ + "_walk_" + D_, P_ + "_idle_d")
             : f.st === "swing" && !recovering ? pick(P_ + "_atk_" + D_,  P_ + "_atk_d", P_ + "_idle_d", P_ + "_idle")
             : f.st === "walk"  ? pick(P_ + "_walk_" + D_, P_ + "_walk", P_ + "_idle_d", P_ + "_idle")
             :                    pick(P_ + "_idle_" + D_, P_ + "_idle", P_ + "_idle_d");
      f._drawKey = drawKey; f._drawNm = nm;
    }
    if(f.reverseRise>0)nm=SPR[P_+"_die_"+D_]?P_+"_die_"+D_:SPR[P_+"_die"]?P_+"_die":nm;
    if (f.kind === "kdragon") nm=kingDragonSprite(f);
    const fs = SPR[nm];
    // Keep remote waves and dead bodies out of the per-frame sort/draw list.
    // Their state still advances, so entering the area behaves exactly as before.
    if (fs && f.x + fs[2] / 2 >= cam.x - 48 && f.x - fs[2] / 2 <= cam.x + vw + 48 &&
              f.y >= cam.y - 48 && f.y - fs[3] <= cam.y + vh + 48)
      draw.push({ foe: f, nm, x: f.x, y: f.y });
  }
  if (arenaLock && arenaT > 0) {
    const fn = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
    if (fn) {
      const rise = Math.min(1, arenaT);
      for (const [tx, ty] of arenaRim(arenaLock)) {
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        const ix = tx * TS + TS / 2, iy = ty * TS + TS;
        if (ix < cam.x - 64 || ix > cam.x + vw + 64 ||
            iy < cam.y - 96 || iy > cam.y + vh + 96) continue;
        draw.push({ fence: fn, rise, x: ix, y: iy,
                    sy: (MAPID === "world") ? iy : 1e9 });
      }
    }
  }
  if (MAPID === "world" && birdsUp < 9)
    for (const b of BIRDS) {
      if (b.x > cam.x - 64 && b.x < cam.x + vw + 64 &&
          b.y > cam.y - 64 && b.y < cam.y + vh + 64)
        draw.push({ bird: b, x: b.x, y: b.y, sy: b.y + 200 });
    }
  if (MAPID === "world" && herdHere())
    for (const [hx, spr] of HERD) {
      const ix = hx * TS + TS / 2, iy = HERD_Y * TS + TS;
      if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
          iy > cam.y - 64 && iy < cam.y + vh + 64)
        draw.push({ item: { spr, anim: true }, x: ix, y: iy, t: hx * 0.7 });
    }
  for (const it of ITEMS) {
    if ((it.map || "world") !== MAPID || !itemHere(it)) continue;
    const ix = it.tx * TS + TS / 2, iy = it.ty * TS + TS;
    if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
        iy > cam.y - 64 && iy < cam.y + vh + 64)
      if (it.map) draw.push({ item: it, x: ix, y: iy, sy: iy });
  }
  if (MAPID === "world")
    for (const it of ITEMS) {
      if (!itemHere(it)) continue;
      let lift = it.dy || 0;
      if (it.onTop && SPR[it.onTop]) {
        const u = SPR[it.onTop];
        const top = (ATLAS.flattop && ATLAS.flattop[it.onTop]) || 2;
        lift = -(u[3] - top);      /* stand it on the surface, not the base */
      }
      const ix = it.tx * TS + TS / 2, iy = it.ty * TS + TS + lift;
      if (ix > cam.x - 64 && ix < cam.x + vw + 64 &&
          iy > cam.y - 64 && iy < cam.y + vh + 64)
        draw.push({ item: it, x: ix, y: iy, sy: it.ty * TS + TS + 1 });
    }
  if (MAPID === GREEN.map && SPR.lg_fly_e && quest === Q.ARMED && greenT >= 0) {
    const g = greenAt();
    if (g.x > cam.x - 96 && g.x < cam.x + vw + 96 &&
        g.y > cam.y - 96 && g.y < cam.y + vh + 96)
      draw.push({ green: true, x: g.x, y: g.y });
  }
  for (const b of bolts) {
    const nm = b.art + "_" + b.dir;
    if (!SPR[nm]) continue;
    if (b.x < cam.x - 64 || b.x > cam.x + vw + 64 ||
        b.y < cam.y - 64 || b.y > cam.y + vh + 64) continue;
    const fr = 1 + (Math.floor(b.t * 12) % 2);
    draw.push({ bolt: b, nm, fr, x: b.x, y: b.y });
  }
  for (const a of anims) {
    const nm = a.prefix + Math.min(a.count - 1, Math.floor(a.t));
    if (SPR[nm] && a.x >= cam.x - 96 && a.x <= cam.x + vw + 96 &&
                   a.y >= cam.y - 96 && a.y <= cam.y + vh + 96)
      draw.push({ anim: a, nm, x: a.x, y: a.y });
  }
  if (glassShieldActive() || glassShieldPulse > 0) draw.push({ glassShieldFx:true, x:P.x, y:P.y, sy:P.y+80 });
  const mouth = (o) => o.s !== undefined &&
    /^(wf_cave|dg_mouth|rc_cave)/.test(NAMES[o.s] || "");
  draw.push({ portalLayer: true, x: 0, y: 0 });
  const groundLayer = o => o.roomBackgroundPatch || underfoot(o) ? 0 : o.portalLayer ? 1 : 2;
  draw.sort((a, b) => (groundLayer(a) - groundLayer(b)) || ((a === P && mouth(b)) ? 1 : (b === P && mouth(a)) ? -1 : 0)
                   || (sortY(a) - sortY(b))
                   || ((underfoot(a) ? 0 : 1) - (underfoot(b) ? 0 : 1))
                   || (topOf(a) - topOf(b)));

  for (const o of draw) {
    if(o.mooring){
      const [x1,y1,x2,y2]=o.mooring;ctx.save();ctx.beginPath();ctx.moveTo(x1,y1);
      ctx.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+5,x2,y2);
      ctx.strokeStyle='#514333';ctx.lineWidth=3;ctx.stroke();
      ctx.strokeStyle='#b6a079';ctx.lineWidth=1;ctx.stroke();ctx.restore();
      // Original pack knot and hanging rope, aligned over the mooring post.
      blit(ctx,'hb_mooring_knot',0,x1-5,y1-5);continue;
    }
    if (o.portalLayer) { drawRise(); drawSaintBuff(); continue; }
    if (o.school) continue; // Native school animation patches draw these seated characters.
    if(o.extractedCanvas){ctx.drawImage(o.extractedCanvas,o.x-o.extractedCanvas.width/2,o.y-o.extractedCanvas.height);continue;}
    if(o.roomBackgroundPatch){
      const {spr,rect:[sx,sy,w,h]}=o.roomBackgroundPatch,s=SPR[spr];
      if(s)drawGameImage(ctx,atlasImg,s[0]+sx,s[1]+sy,w,h,o.x,o.y,w,h);
      continue;
    }
    if(o.roomCrop){
      const [x,y,w,h]=o.roomCrop,s=SPR[MD.roomArt];
      if(s){
        /* Keep only the connected foreground component that touches the furniture's
           collision/base zone. This prevents wallpaper/floor islands travelling with it. */
        o._cropCanvas ||= (()=>{const q=document.createElement('canvas');q.width=w;q.height=h;const cg=q.getContext('2d',{willReadFrequently:true});drawGameImage(cg,atlasImg,s[0]+x,s[1]+y,w,h,0,0,w,h);const im=cg.getImageData(0,0,w,h),fg=cropForegroundMask(im.data,w,h);for(let i=0;i<fg.length;i++)if(!fg[i])im.data[i*4+3]=0;cg.putImageData(im,0,0);return q;})();
        ctx.drawImage(o._cropCanvas,o.x-w/2,o.y-h);
      }
      continue;
    }
    if (o.throneRoomAsset) {
      // Compact RPG-scale throne. Keep the feet/base at actor y so it sorts
      // naturally behind Halvard and against the north wall.
      if (throneRoomImg.complete && throneRoomImg.naturalWidth) {
        const dw=54, dh=Math.round(dw*throneRoomImg.naturalHeight/throneRoomImg.naturalWidth);
        ctx.imageSmoothingEnabled=false;
        ctx.drawImage(throneRoomImg,Math.round(o.x-dw/2),Math.round(o.y-dh),dw,dh);
      }
      continue;
    }
    if (o.schoolArt) {
      const sp = SPR[o.spr];
      let fr = o.stillFrame ?? (o.glassHatch ? glassHatchFrame() : Math.floor(t / 0.15) % sp[4]);
      if (o.royalDoor || o.smithDoor || /^(Doors|Animation_windows_doors)\.png$/.test(o.source || "")) {
        fr = 0;
        if (doorMotion && doorMotion.map === MAPID && !doorMotion.d.stairDown &&
            Math.abs(o.x - (doorMotion.d.triggerRect ? doorMotion.d.triggerRect.x + doorMotion.d.triggerRect.w/2 : doorMotion.d.x * TS + 8)) < 28 &&
            Math.abs(o.y - (doorMotion.d.y * TS + 16)) < 36) {
          const progress = Math.min(1, doorMotion.t / doorMotion.duration);
          fr = sp[4] >= 12 ? Math.min(7, 4 + Math.floor(progress * 4))
                          : Math.min(sp[4] - 1, Math.floor(progress * sp[4]));
        }
      }
      if(Number.isInteger(o.templeMachine))fr=MD.templeMachines[o.templeMachine].type==='cannon'?MD.templeMachines[o.templeMachine].frame:Math.min(2,MD.templeMachines[o.templeMachine].frame);
      if(o.spr==='scientist_skull')fr=Math.floor(t*5)%sp[4];
      if(o.templeSpike)fr=templeSpikeFrame(o.templeSpike,o.trapRow);
      if(o.templeLever){const h=MD.templeTraps.find(h=>h.id===o.templeLever);fr=Math.min(4,Math.floor((h.leverOpen||0)*5));}
      if(Number.isInteger(o.templeGate))fr=Math.min(sp[4]-1,Math.floor(MD.templeGates[o.templeGate].open*sp[4]));
      if(o.templePassDoor){const near=Math.abs(P.x-o.x)<40&&Math.abs(P.y-o.y)<85;o.openT=Math.max(0,Math.min(.3,(o.openT||0)+(near?dt:-dt)));fr=Math.min(sp[4]-1,Math.floor(o.openT/.3*sp[4]));}
      const visibleH=Number.isFinite(o.chairClipY)?Math.max(0,Math.min(sp[3],o.chairClipY-(o.y-sp[3]))):sp[3];
      if(o.statueTint){drawGameImage(ctx,tintFoe(sp,fr,o.statueTint,.65),o.x-sp[2]/2,o.y-sp[3],sp[2],sp[3]);continue;}
      if(visibleH>0)drawGameImage(ctx, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], visibleH,
        o.x - sp[2] / 2, o.y - sp[3], sp[2], visibleH);
      continue;
    }
    if (o.witchDemon) {
      const sp = SPR.witch_demon;
      const fr = Math.floor(t * 6) % sp[4];
      const bob = Math.round(Math.sin(t * 2.4) * 2);
      ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = "#201127";
      ctx.beginPath(); ctx.ellipse(o.x, o.y - 4, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      drawGameImage(ctx, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
        o.x - 40, o.y - 80 - bob, 80, 80);
      continue;
    }
    if (o.trialPedestal) { drawTrialPedestal(); continue; }
    if (o.hatchActor) {
      const hs = hatchScene;
      if (!hs) continue;
      if (hs.stage < 7) {
        const sp = SPR.it_egg;
        if (!sp) continue;
        const strength = hs.stage < 5 ? 0 : hs.stage === 5 ? 1 : 3;
        const ox = strength ? Math.round(Math.sin(hs.t * (hs.stage === 5 ? 16 : 28)) * strength) : 0;
        drawGameImage(ctx, sheetOf(sp), sp[0], sp[1], sp[2], sp[3],
                      Math.round(hs.x - sp[2] / 2) + ox, Math.round(hs.y - sp[3]), sp[2], sp[3]);
      } else {
        const dir = hs.dir || "s";
        const artDir = dir === "w" && !SPR.dr5_idle_w ? "e" : dir;
        const action = hs.walking ? "walk" : "idle";
        const nm = SPR["dr5_" + action + "_" + artDir] ? "dr5_" + action + "_" + artDir : "drf_s";
        const sp = SPR[nm];
        if (!sp) continue;
        const fr = Math.floor((hs.walking ? hs.walkT * 8 : hs.t * 5) * sp[4] / 5) % sp[4];
        const DS = DRAGON_DRAW_SCALE;
        const dw = Math.round(sp[2] * DS), dh = Math.round(sp[3] * DS);
        const px = Math.round(hs.dragonX - dw / 2), py = Math.round(hs.dragonY - dh);
        if (dragonFlip(dir)) {
          ctx.save(); ctx.translate(px + dw, py); ctx.scale(-1, 1);
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, dw, dh);
          ctx.imageSmoothingEnabled = false;
          ctx.restore();
        } else {
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
          drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], px, py, dw, dh);
          ctx.imageSmoothingEnabled = false;
        }
      }
      continue;
    }
    if (o.dg) { drawDragon(); continue; }
    if (o.bell) { drawBell(); continue; }
    if (o.fence) {
      const sp = SPR[o.fence];
      const TALL = 2;                       /* stacked, so it reads as a wall */
      const full = sp[3] * TALL;
      const h = Math.round(full * o.rise);
      const px = Math.round(o.x - sp[2] / 2), py = Math.round(o.y);
      for (let k = 0; k < TALL && h > 0; k++) {
        const top = (TALL - 1 - k) * sp[3];
        const vis = Math.max(0, Math.min(sp[3], h - top));
        if (vis <= 0) continue;
        drawGameImage(ctx, sheetOf(sp), sp[0], sp[1] + (sp[3] - vis), sp[2], vis,
                      px, py - top - vis, sp[2], vis);
      }
      continue;
    }
    if (o.bird) {
      const b = o.bird;
      if (b.nest && !birdsUp && SPR.nest1) {
        const nn = SPR.nest1;
        drawGameImage(ctx, atlasImg, nn[0], nn[1], nn[2], nn[3],
                      Math.round(o.x - nn[2] / 2) + 7,
                      Math.round(o.y - nn[3]) + 6, nn[2], nn[3]);
      }
      const sp = SPR[birdsUp ? "bd_fly" : "bd_sit"];
      if (!sp) continue;
      const fr = Math.floor(t * (birdsUp ? 12 : 4) + b.t) % sp[4];
      const west = b.vx > 0;   /* the art faces west; mirror to go east */
      const dx = Math.round(o.x - sp[2] / 2), dy = Math.round(o.y - sp[3]);
      if (west) {
        ctx.save(); ctx.translate(dx + sp[2], dy); ctx.scale(-1, 1);
        drawGameImage(ctx, smImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                      0, 0, sp[2], sp[3]);
        ctx.restore();
      } else {
        drawGameImage(ctx, smImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                      dx, dy, sp[2], sp[3]);
      }
      continue;
    }
    if (o.item) {
      const s2 = SPR[o.item.spr];
      const fr = (o.item.anim && s2 && s2[4] > 1)
        ? Math.floor(t * 4 + (o.t || 0)) % s2[4] : 0;
      if (s2) drawGameImage(ctx, s2[5] === 2 ? smImg : s2[5] ? dragonImg : atlasImg,
                            s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                            Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]),
                            s2[2], s2[3]);
      continue;
    }
    if (o.green) {
      const row = greenPhase === "crash" ? 1
        : greenPhase === "sit" ? 2
        : greenPhase === "rise" ? 3 : 0;
      /* The art frames vary more than a resting, injured dragon should. Hold
         the anchored pose and use only a one-pixel chest pulse—no skating. */
      const f = greenPhase === "sit" ? 0
        : greenPhase === "crash" ? Math.min(5, Math.floor(greenP * 6))
        : greenPhase === "rise" ? Math.min(5, Math.floor(greenP * 6))
        : Math.floor(performance.now() / 1000 * GREEN.fps) % 6;
      const off = greenOffset() || [0, 0];
      const w2 = GREEN_SCENE_DRAW, h2 = w2 * GREEN_SCENE_CEL_H / GREEN_SCENE_CEL_W;
      const ddx = Math.round(o.x - w2 / 2 + off[0]);
      const ddy = Math.round(o.y - h2 + off[1]);
      const breathe = greenPhase === "sit" && Math.floor(performance.now() / 650) % 2 ? 2 : 0;
      const drawH = h2 - breathe;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (dragonFlip(dragon.dir)) {
        ctx.translate(ddx + w2, ddy); ctx.scale(-1, 1);
        drawGameImage(ctx, greenSceneImg, f * GREEN_SCENE_CEL_W, row * GREEN_SCENE_CEL_H,
                      GREEN_SCENE_CEL_W, GREEN_SCENE_CEL_H, 0, h2 - drawH, w2, drawH);
      } else {
        drawGameImage(ctx, greenSceneImg, f * GREEN_SCENE_CEL_W, row * GREEN_SCENE_CEL_H,
                      GREEN_SCENE_CEL_W, GREEN_SCENE_CEL_H, ddx, ddy + h2 - drawH, w2, drawH);
      }
      ctx.restore();
      continue;
    }
    if (o.foe) {
      const f = o.foe, s2 = SPR[o.nm];
      const k = FOE[f.kind];
      if (f.sceneHidden) continue;
      ctx.globalAlpha = f.sceneAlpha === undefined ? 1 : f.sceneAlpha;
      const fr = f.reverseRise>0 ? Math.min(s2[4]-1,Math.max(0,Math.ceil(f.reverseRise/f.reverseRiseMax*s2[4])-1))
        : f.storyKnight && f.st === "down" ? s2[4] - 1
        : f.storyKnight && f.st === "rise" ? Math.max(0, s2[4] - 1 - Math.floor((f.storyT || 0) / .65 * s2[4]))
        : f.storyKnight && f.st === "escape" ? Math.floor((f.storyT || f.t) * 10) % s2[4]
        : /^(?:(pl|lc|rp|dv|ent|bh|ms|gh|bs)[123]|bg|kn|kn3)_/.test(o.nm) ? golemFrame(f, s2, o.nm, k, 4)
        : /^gn[123]_/.test(o.nm) ? golemFrame(f, s2, o.nm, k, 4)
        : /^gm[123]_/.test(o.nm) ? golemFrame(f, s2, o.nm, k)
        : f.st === "dead"
        ? Math.min(s2[4] - 1, Math.floor(f.t * 8))
        : Math.floor(f.t * (f.st === "swing" ? 3.3 : 6)) % s2[4];
      const dx = Math.round(f.x - s2[2] / 2), dy = Math.round(f.y - s2[3] + ((f.kind === "royalguard" || f.kind === "treasuryknight") ? 20 : 0));
      if (f.hurt > 0 && !SPR[(FOE_ART[f.kind] || "sk") + "_hurt_d"])
        ctx.globalAlpha = 0.45;
      if (false) {
        ctx.save(); ctx.translate(dx + s2[2], dy); ctx.scale(-1, 1);
        drawGameImage(ctx, atlasImg, s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                      0, 0, s2[2], s2[3]);
        ctx.restore();
      } else if (f.emerge !== undefined && f.emerge < 1) {
        const e = f.emerge;
        const h = s2[3];
        const under = Math.round(h * (1 - e));   /* how far down it still is */
        const sh = h - under;                    /* the part above ground */
        if (sh > 0) {
          const src = f.raised ? tintFoe(s2, fr, "#a85ce8", 0.68) : null;
          ctx.save();
          ctx.globalAlpha = (ctx.globalAlpha || 1) * Math.min(1, 0.35 + e * 0.9);
          if (src) drawGameImage(ctx, src, 0, 0, s2[2], sh,
                                 dx, f.y - sh, s2[2], sh);
          else drawGameImage(ctx, atlasImg, s2[0] + fr * s2[2], s2[1],
                             s2[2], sh, dx, f.y - sh, s2[2], sh);
          ctx.restore();
        }
      } else if (f.kind === "kdragon") {
        const ks = /^kdnew_death_/.test(o.nm) ? KING_DRAGON_DEATH_DRAW_SCALE
                 : /^kdnew_/.test(o.nm) ? KING_DRAGON_DRAW_SCALE : 1;
        const kw = Math.round(s2[2] * ks), kh = Math.round(s2[3] * ks);
        const kdx = Math.round(f.x - kw / 2), kdy = Math.round(f.y - kh);
        if (f.hurt > 0) {
          const kick = Math.round(Math.sin(f.hurt * 34) * 4 * f.hurt);
          drawGameImage(ctx, tintFoe(s2, fr, "#ff4028", 0.55 * Math.min(1, f.hurt * 2)),
                        0, 0, s2[2], s2[3], kdx + kick, kdy - Math.round(f.hurt * 3), kw, kh);
        } else {
          drawGameImage(ctx, sheetOf(s2), s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                        kdx, kdy, kw, kh);
        }
        drawKingShield(f);
        /* The open-mouth attack frames now launch a real projectile from
           kingDragonMouth() at their impact beat; no decorative flame overlay. */
        if (f.st !== "dead") drawKingDragonHeadVitals(f, kdx, kdy, kw);
      } else if (f.mad > 0 && !f.ally) {
        drawGameImage(ctx, tintFoe(s2, fr, "#d83232", 0.6), dx, dy);
      } else if (f.kind === "wraith" && /^gh1_/.test(o.nm)) {
        drawGameImage(ctx, darkFoe(s2, fr, "#4a3a6a"), dx, dy);
      } else if (f.raised) {
        ctx.save();
        ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.5;
        const hl = tintFoe(s2, fr, "#c98cff", 1);
        for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1],
                                [-1, -1], [1, -1], [-1, 1], [1, 1]])
          drawGameImage(ctx, hl, dx + ox, dy + oy);
        ctx.restore();
        drawGameImage(ctx, tintFoe(s2, fr, "#a85ce8", 0.68), dx, dy);
      } else {
        drawGameImage(ctx, sheetOf(s2), s2[0] + fr * s2[2], s2[1], s2[2], s2[3],
                      dx, dy, s2[2], s2[3]);
      }
      if (f.kind === "lich") drawKingShield(f);
      if (f.st === "wind") {
        if (f.kind === "kdragon") {
          const ks = /^kdnew_/.test(o.nm) ? KING_DRAGON_DRAW_SCALE : 1;
          drawEnemyAttackTell(f,s2,fr,Math.round(f.x-s2[2]*ks/2),Math.round(f.y-s2[3]*ks),ks);
        } else drawEnemyAttackTell(f,s2,fr,dx,dy,1);
      }
      ctx.globalAlpha = 1;
      ctx.globalAlpha = 1;
      const fMaxHp = enemyMaxHp(f.kind, Number.isFinite(f.hx) ? f.hx : f.x);
      if (f.st !== "dead" && f.kind !== "kdragon" && !(f.storyKnight && f.storyPassive)) {
        const bw = f.kind === "treasuryknight" ? 32 : 18, bh = 3;
        const bx = Math.round(f.x - bw / 2), by = dy + (/^golem[123]$/.test(f.kind) ? foeVisibleTop82(s2,fr)-6 : ((f.kind === "royalguard" || f.kind === "treasuryknight") ? 12 : -5));
        ctx.fillStyle = "#1a1416";
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = "#4a2b2b";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = f.hp > fMaxHp * 0.6 ? "#5fbf4a"
                      : f.hp > 1 ? "#d8a13a" : "#d2443a";
        ctx.fillRect(bx, by, Math.max(1, Math.round(bw * f.hp / fMaxHp)), bh);
      }
      continue;
    }
    if (o.bolt) {
      const s2 = SPR[o.nm];
      const fw = s2[2];
      drawGameImage(ctx, atlasImg, s2[0] + o.fr * fw, s2[1], fw, s2[3],
                    Math.round(o.x - fw / 2), Math.round(o.y - s2[3] / 2), fw, s2[3]);
      continue;
    }
    if (o.glassShieldFx) { drawGlassShield(); continue; }
    if (o.anim) {
      const s2 = SPR[o.nm];
      const frame = /^wm_pot_/.test(o.nm) ? Math.floor(t * 8) % s2[4] : 0;
      drawGameImage(ctx, atlasImg, s2[0] + frame * s2[2], s2[1], s2[2], s2[3],
                    Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]), s2[2], s2[3]);
      continue;
    }
    if (o === P) {
      if (doorMotion && doorMotion.map === MAPID && doorMotion.d.stairDown) {
        const k = Math.min(1, doorMotion.t / doorMotion.duration);
        const sp = SPR[(mounted ? (hasSword() ? "sm_" : "fm_") : corinKit()) + "walk_" + smDir("s", doorMotion.d.dir !== "r")];
        const fr = Math.floor(doorMotion.t * 10) % sp[4];
        ctx.save(); ctx.beginPath(); ctx.rect(P.x - 48, P.y - 80, 96, 78); ctx.clip();
        drawGameImage(ctx, corinSheet(), sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
          Math.round(P.x - sp[2] / 2 + (doorMotion.d.dir === "r" ? 12 : -12) * k), Math.round(P.y - sp[3] + corinFeetOffset() + 20 * k), sp[2], sp[3]);
        ctx.restore(); continue;
      }
      if (P.act && !mounted) {
        const sp = ACT[P.act.kind];
        const base = (mounted ? (hasSword() ? "sm_" : "fm_") : corinKit()) + sp.anim + "_"
                   + corinDirection(P.act);
        const s = SPR[base];
        if (s) {
          const f = Math.min(s[4] - 1, Math.floor(P.act.t / sp.frames * s[4]));
          const dx = Math.round(P.x - s[2] / 2), dy = Math.round(P.y - s[3] + corinFeetOffset());
          drawGameImage(ctx, corinSheet(), s[0] + f * s[2], s[1], s[2], s[3],
                        dx, dy, s[2], s[3]);
          if (P.act.kind === "swing" && hasSword()) {
            const k = P.act.t / ACT.swing.frames;
            if (k > 0.2 && k < 0.8) {
              const d = corinDirection(P.act);
              const tail = (d === "u" ? "u" : d === "d" ? "d" : "s");
              const sl = (P.act.hot && SPR["fslash_" + tail])
                         ? SPR["fslash_" + tail] : SPR["slash_" + tail];
              if (sl) {
                const ax = d === "e" ? 14 : d === "w" ? -14 : 0;
                const ay = d === "u" ? -14 : d === "d" ? 10 : -4;
                const px0 = Math.round(P.x + ax - sl[2] / 2);
                const py0 = Math.round(P.y - 20 + ay - sl[3] / 2);
                ctx.save();
                ctx.globalAlpha = Math.sin((k - 0.2) / 0.6 * Math.PI);
                if (d === "w") {          /* the side arc mirrors for the west */
                  ctx.translate(px0 + sl[2], py0);
                  ctx.scale(-1, 1);
                  drawGameImage(ctx, atlasImg, sl[0], sl[1], sl[2], sl[3], 0, 0, sl[2], sl[3]);
                } else {
                  drawGameImage(ctx, atlasImg, sl[0], sl[1], sl[2], sl[3],
                                px0, py0, sl[2], sl[3]);
                }
                ctx.restore();
              }
            }
          }
          continue;
        }
      }
      if (ride) drawFerry(ctx);
      const kit = mounted ? (hasSword() ? "sm_" : "fm_") : corinKit();
      const nm = kit + (!P.moving ? "idle" : running ? "run" : "walk")
                 + "_" + corinDirection();
      if (typeof mounted !== "undefined" && mounted && dragonHere()) {
        const st = dragon.air ? (P.moving ? "fly" : "hover") : !P.moving ? "idle" : running ? "run" : "walk";
        const rd = playerFacing4(P.act);
        const wantW = rd === "w";
        const tr = dragon.tr && dragon.tr.kind;
        const want = tr === "up" ? "up" : tr === "down" ? "down"
                   : breath ? (dragon.air ? "ffire" : "fire")
                   : (st === "run" ? "walk" : st);
        const mountKit = "corinride_" + (smithUpgrade ? "armor_" : "sword_");
        const mountedAttack = P.act && P.act.kind === "swing";
        const mountAction = mountedAttack ? "atk" : want;
        const hasW = wantW && !!SPR[mountKit + mountAction + "_w"];
        const flip = wantW && !hasW;
        const key = wantW ? (hasW ? "w" : "e") : rd;
        const rs = SPR[mountKit + mountAction + "_" + key]
                || SPR[mountKit + st + "_" + key]
                || SPR[mountKit + "idle_s"];
        if (rs) {
          const side = key === "e" || key === "w";
          const fps = st === "idle" ? 3.5
                    : (st === "fly" || st === "hover") ? (side ? 2.6 : 3.4)
                    : 6;
          const rf = mountedAttack
            ? Math.min(rs[4] - 1, Math.floor(P.act.t / ACT.swing.frames * rs[4]))
            : dragon.tr
            ? Math.min(rs[4] - 1, Math.floor(dragon.tr.t / dragon.tr.n * rs[4]))
            : Math.floor(P.t * fps * rs[4] / 3) % rs[4];
          const RS = 0.448;
          const dw = Math.round(rs[2] * RS), dh = Math.round(rs[3] * RS);
          const RIDEDROP = 14;
          const lift = (dragon.air ? Math.round(Math.sin(P.t * 2.0) * 3) : 0)
                     - RIDEDROP;
          const dx = Math.round(P.x - dw / 2), dy = Math.round(P.y - dh - lift);
          const sm0 = ctx.imageSmoothingEnabled;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          if (flip) {
            ctx.save();
            ctx.translate(dx + dw, dy);
            ctx.scale(-1, 1);
            drawGameImage(ctx, sheetOf(rs), rs[0] + rf * rs[2], rs[1], rs[2], rs[3],
                          0, 0, dw, dh);
            ctx.restore();
          } else {
            drawGameImage(ctx, sheetOf(rs), rs[0] + rf * rs[2], rs[1], rs[2], rs[3],
                          dx, dy, dw, dh);
          }
          ctx.imageSmoothingEnabled = sm0;
          continue;
        }
      }
      const s = SPR[nm];
      const f = Math.floor(P.t * (!P.moving ? 6 : running ? 14 : 9)) % s[4];
      const dx = Math.round(P.x - s[2] / 2), dy = Math.round(P.y - s[3] + corinFeetOffset());
      drawGameImage(ctx, corinSheet(), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
      continue;
    }
    if (!npcHere(o)) continue;
    if(o.seatSpr&&!o.goto&&!scene&&!bossScene&&!hatchExit){
      const s=SPR[o.seatSpr];if(s){drawNpcFrame(o,s,Math.floor(t*3)%s[4],sheetOf(s));continue;}
    }
    if (o.packSpr) {
      let direction = o.stationary ? "d" : o.f === "s" ? (o.flip ? "w" : "e") : (o.f || "d");
      const moved = Math.hypot(o.x - (o.px ?? o.x), o.y - (o.py ?? o.y));
      o.px = o.x; o.py = o.y;
      const action = moved > 0.05 && !o.stationary && o.packWalk ? "walk" : "idle";
      /* Nan's horizontal rows are reversed; north and south are correctly labelled. */
      if (o.n === "Nan Ferrow" && action === "walk")
        direction = ({ e: "w", w: "e" })[direction] || direction;
      const waveHettie = o.n === "Hettie" && action === "idle" &&
        quest < Q.EGGS && sayNpc !== o && !(scene && scene.who === "Hettie");
      const dockActor=o.n==='Odo'||o.n==='Liora';
      const speaking=dockActor&&(sayNpc===o||scene?.who===o.n||(o.n==='Odo'&&scene?.lines?.some(line=>line.startsWith('Odo:'))));
      if(speaking&&!o.dockSpeaking)o.dockReactionStart=t;
      o.dockSpeaking=speaking;
      const reactionAge=t-(o.dockReactionStart??-100);
      const odoGesture=o.n==='Odo'&&(speaking||t%9>=7);
      const sp = odoGesture ? SPR.pack_oldman_gesture : waveHettie ? SPR.market_bread : o.packDirections
        ? (SPR[o.packSpr + "_" + action + "_" + direction] || SPR[o.packSpr + "_idle_" + direction] || SPR[o.packSpr + "_idle_d"])
        : SPR[o.packSpr];
      if (sp) {
        let fr = action==='idle'&&o.idleFrame!==undefined ? Math.min(o.idleFrame,sp[4]-1)
          : Math.floor(t * (action === "walk" ? 8 : (o.idleFps || 5))) % sp[4];
        if(/^villager_seated_/.test(o.packSpr))fr=villagerIdleFrame(o,t,sp[4]);
        if(odoGesture)fr=Math.floor((speaking?reactionAge:t%9-7)*6)%sp[4];
        if(o.n==='Liora'){
          const age=reactionAge<2?reactionAge:t%5;
          fr=age<2?Math.min(sp[4]-1,Math.floor(age*6)):0;
        }
        drawNpcFrame(o,sp,fr,atlasImg);
        if(o.pettable) drawPetHeart(o,t,sp);
        if(waveHettie && quest < Q.EGGS && !scene && !sayNpc) drawHettieCallout(o,sp);
        continue;
      }
    }
    if (o.body && SPR[o.body + "_idle_d"]) {
      const moved = Math.hypot(o.x - (o.px === undefined ? o.x : o.px),
                               o.y - (o.py === undefined ? o.y : o.py));
      o.px = o.x; o.py = o.y;
      const walking = moved > 0.05;
      const s2 = SPR[o.body + "_" + (walking ? "walk" : "idle") + "_" + (o.kf || "d")]
              || SPR[o.body + "_idle_d"];
      const f2 = Math.floor(t * (walking ? 8 : 6) + o.t) % s2[4];
      drawGameImage(ctx, smImg, s2[0] + f2 * s2[2], s2[1], s2[2], s2[3],
                    Math.round(o.x - s2[2] / 2), Math.round(o.y - s2[3]),
                    s2[2], s2[3]);
      continue;
    }
    if (o.sk !== undefined) {
      const mv = Math.hypot(o.x - (o.px === undefined ? o.x : o.px),
                            o.y - (o.py === undefined ? o.y : o.py));
      o.px = o.x; o.py = o.y;
      const still = mv <= 0.05;
      const isuf = o.f === "s" ? "_sidle" : o.f === "u" ? "_uidle" : "_idle";
      const idle = still ? (SPR["npc_" + o.sk + isuf] ||
                            SPR["npc_" + o.sk + "_idle"]) : null;
      const s = idle || SPR["npc_" + o.sk + "_" + o.f];
      const nm = idle ? "npc_" + o.sk + isuf : "npc_" + o.sk + "_" + o.f;
      const f = still && !idle && o.idleFrame!==undefined ? Math.min(o.idleFrame,s[4]-1)
              : idle ? Math.floor(t * 3.2 + o.t) % s[4]
              : still ? (s[4] === 3 ? 1 : Math.floor(t * 5 + o.t) % s[4])
              : Math.floor(t * 5 + o.t) % s[4];
      let bob = 0;
      if (still && !o.desertNative) {
        const rate = idle ? 0.75 : 1.5;
        bob = -Math.round(0.5 + 0.5 * Math.sin(t * rate + (o.t || 0) * 3));
      }
      const px = Math.round(o.x - s[2] / 2), py = Math.round(o.y - s[3]) + bob;
      const tone = (typeof npcSheetFor === "function") ? npcSheetFor(o, s) : null;
      if (o.flip) {
        ctx.save();
        ctx.translate(px + s[2], py);
        ctx.scale(-1, 1);
        drawGameImage(ctx, tone ? tone.img : atlasImg, s[0] + f * s[2],
                      tone ? s[1] - tone.dy : s[1], s[2], s[3],
                      0, 0, s[2], s[3]);
        ctx.restore();
      } else {
        drawGameImage(ctx, tone ? tone.img : atlasImg, s[0] + f * s[2],
                      tone ? s[1] - tone.dy : s[1], s[2], s[3],
                      px, py, s[2], s[3]);
      }
      if (o.rod && SPR.fishing_rod && !hasDragon()) {
        const r = SPR.fishing_rod;
        const k = s[3] / 19;
        drawGameImage(ctx, atlasImg, r[0], r[1], r[2], r[3],
                      Math.round(o.x + (o.f === "s" && !o.flip ? 6 * k : -22 * k)),
                      Math.round(o.y - s[3] + 4 * k),
                      Math.round(r[2] * k), Math.round(r[3] * k));
      }
      if (o.crown) {
        const tops = ATLAS.headtop && ATLAS.headtop[nm];
        const bob = tops ? tops[f % tops.length] : 0;
        const cw = Math.max(9, Math.round(s[2] * 0.62));
        const x0 = Math.round(o.x - cw / 2), y0 = py + bob - 4;
        const px1 = Math.max(1, Math.round(cw / 9));
        const band = Math.max(2, Math.round(cw / 6));
        ctx.fillStyle = "#4a3212";                       /* the rim */
        ctx.fillRect(x0 - 1, y0 - 1, cw + 2, band + 5);
        ctx.fillStyle = "#f2c94c";                       /* the band */
        ctx.fillRect(x0, y0 + 3, cw, band);
        ctx.fillStyle = "#d9a72c";                       /* its shadow */
        ctx.fillRect(x0, y0 + 3 + band - 1, cw, 1);
        for (let i = 0; i < 5; i++) {                    /* five points */
          const px0 = x0 + Math.round(i * (cw - px1) / 4);
          const tall = (i % 2 === 0) ? 3 : 2;
          ctx.fillStyle = "#f2c94c";
          ctx.fillRect(px0, y0 + 3 - tall, px1, tall);
        }
        ctx.fillStyle = "#c0392b";                       /* the stone */
        ctx.fillRect(x0 + Math.round(cw / 2) - px1, y0 + 3, px1 * 2, band);
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(x0 + px1, y0 + 4, px1, 1);
        ctx.fillRect(x0 + cw - px1 * 2, y0 + 4, px1, 1);
      }
      continue;
    }
    const nm = NAMES[o.s], s = SPR[nm], od = DEFS[o.s];
    if (!s) continue; // Old device-local edits may reference art removed by a later build.
    const chim = ATLAS.chimneys && ATLAS.chimneys[nm];
    let f = s[4] > 1 ? frameOf(o.s, t, o.id * 0.37) % s[4] : 0;
    if (nm === "school_building" || nm === "tavern_building") {
      f = 0;
      if (doorMotion && doorMotion.map === "world" && Math.abs(o.x - (doorMotion.d.x * TS + 8)) < 48) {
        const progress = Math.min(1, doorMotion.t / doorMotion.duration);
        f = s[4] >= 12 ? Math.min(7, 4 + Math.floor(progress * 4))
                      : Math.min(s[4] - 1, Math.floor(progress * s[4]));
      }
    }
    const oy = (od && od.o) ? od.o : 0;
    const ox = o.wx || 0, wy = o.wy || 0;
    const dx = Math.round(o.x + ox - s[2] / 2), dy = Math.round(o.y + wy - s[3] + oy);
    if (o.face === -1) {
      ctx.save(); ctx.translate(dx + s[2], dy); ctx.scale(-1, 1);
      drawGameImage(ctx, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], 0, 0, s[2], s[3]);
      ctx.restore();
    } else {
      drawGameImage(ctx, sheetOf(s), s[0] + f * s[2], s[1], s[2], s[3], dx, dy, s[2], s[3]);
    }
    if (chim && SPR.smoke) {
      const sm = SPR.smoke, org = ATLAS.smoke_origin || [sm[2] >> 1, sm[3]];
      const sf = Math.floor(t * 5 + o.id * 0.7) % sm[4];
      drawGameImage(ctx, atlasImg, sm[0] + sf * sm[2], sm[1], sm[2], sm[3],
                    Math.round(o.x + ox + chim[0] - org[0]),
                    Math.round(o.y + wy + chim[1] - org[1]),
                    sm[2], sm[3]);
    }
    if (editing && selected === o) {
      ctx.strokeStyle = "#ffd479"; ctx.lineWidth = 1;
      ctx.strokeRect(dx - .5, dy - .5, s[2] + 1, s[3] + 1);
      ctx.fillStyle = "rgba(255,212,121,.85)";
      ctx.fillRect(o.x + ox - 1.5, o.y + wy - 1.5, 3, 3);
    }
  }
  if (typeof drawDoorMarks === "function") drawDoorMarks(ctx);
  if (building && grabMode && grabRect) {
    const ox = grabDrag ? (grabDrag.dx || 0) * TS : 0;
    const oy = grabDrag ? (grabDrag.dy || 0) * TS : 0;
    ctx.save();
    ctx.globalAlpha = 0.3; ctx.fillStyle = "#8fd0ff";
    ctx.fillRect(grabRect.x0 * TS + ox, grabRect.y0 * TS + oy,
                 (grabRect.x1 - grabRect.x0 + 1) * TS, (grabRect.y1 - grabRect.y0 + 1) * TS);
    ctx.globalAlpha = 1; ctx.strokeStyle = "#ffd479"; ctx.lineWidth = 2 / z;
    ctx.strokeRect(grabRect.x0 * TS + ox, grabRect.y0 * TS + oy,
                   (grabRect.x1 - grabRect.x0 + 1) * TS, (grabRect.y1 - grabRect.y0 + 1) * TS);
    ctx.restore();
  }

  if (building && areaMode) {
    ctx.save();
    ctx.lineWidth = 2 / z;
    for (const f of features) {
      if (!isArea(f)) continue;
      const sel = f === pickedArea;
      const ox = sel && areaDrag ? (areaDrag.dx || 0) * TS : 0;
      const oy = sel && areaDrag ? (areaDrag.dy || 0) * TS : 0;
      ctx.globalAlpha = sel ? 0.35 : 0.18;
      ctx.fillStyle = sel ? "#ffd479" : "#8fd0ff";
      ctx.fillRect(f.x0 * TS + ox, f.y0 * TS + oy,
                   (f.x1 - f.x0 + 1) * TS, (f.y1 - f.y0 + 1) * TS);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = sel ? "#ffd479" : "#8fd0ff";
      ctx.strokeRect(f.x0 * TS + ox, f.y0 * TS + oy,
                     (f.x1 - f.x0 + 1) * TS, (f.y1 - f.y0 + 1) * TS);
    }
    ctx.restore();
  }

  if (building && drawA && drawB) {
    const [ax, ay] = drawA, [bx, by] = drawB;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#e8c48a";
    ctx.strokeStyle = "#2f6b34";
    ctx.lineWidth = 2 / z;
    if (buildTool === "route") {
      const path = (drawPts.length > 1 ? drawPts.concat([[bx, by]])
                                       : [[ax, ay], [bx, by]]).map(p => p.slice());
      for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        if (Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])) b[1] = a[1];
        else b[0] = a[0];
      }
      const half = ROUTE_W >> 1;
      const legBox = (a, b) => {
        const vert = a[0] === b[0];
        const rx = Math.min(a[0], b[0]) - (vert ? half : 0);
        const ry = Math.min(a[1], b[1]) - (vert ? 0 : half);
        const rw = vert ? ROUTE_W : Math.abs(b[0] - a[0]) + 1;
        const rh = vert ? Math.abs(b[1] - a[1]) + 1 : ROUTE_W;
        return [rx, ry, rw, rh];
      };
      for (let i = 1; i < path.length; i++) {
        const [rx, ry, rw, rh] = legBox(path[i - 1], path[i]);
        ctx.fillRect(rx * TS, ry * TS, rw * TS, rh * TS);
      }
      const xs = path.map(p => p[0]), ys = path.map(p => p[1]);
      const bx0 = Math.min.apply(null, xs) - half - ROUTE_BAND - 1;
      const by0 = Math.min.apply(null, ys) - half - ROUTE_BAND - 1;
      const bx1 = Math.max.apply(null, xs) + half + ROUTE_BAND + 1;
      const by1 = Math.max.apply(null, ys) + half + ROUTE_BAND + 1;
      ctx.strokeRect(bx0 * TS, by0 * TS, (bx1 - bx0 + 1) * TS, (by1 - by0 + 1) * TS);
    } else {
      const [x0, y0, x1, y1] = squareOf(ax, ay, bx, by);
      ctx.fillRect(x0 * TS, y0 * TS, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS);
      ctx.strokeRect(x0 * TS, y0 * TS, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS);
      ctx.strokeRect((x0 + TOWN_BAND) * TS, (y0 + TOWN_BAND) * TS,
                     (x1 - x0 + 1 - 2 * TOWN_BAND) * TS, (y1 - y0 + 1 - 2 * TOWN_BAND) * TS);
    }
    ctx.restore();
  }

  drawLavaBubbles();   /* over the cached ground, under everything else */
  drawBreath();
  drawClaw();
  if (dragonAirborne() && !(typeof mounted !== "undefined" && mounted))
    drawDragon();
  drawDragonProjectile();  /* breath effects always clear every combat sprite */
  ctx.restore();
  drawWeather(t);
}

const WEATHER = [
  { map: "world", kind: "snow", x0: 2571, y0: 380, x1: 2880, y1: 599 },
  { map: "world", kind: "snow", x0: 2571, y0: 100, x1: 2880, y1: 380 },
  { map: "world", kind: "sand", road: "Temple Route 2", band: 26,
    notIn: [1499, 72, 1537, 118] },
];
function nearRoad(name, x, y) {
  let best = 1e9;
  for (const f of features) {
    if (f.kind !== "route" || f.road !== name) continue;
    for (const [a, b] of routeLegs(f)) {
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
      let t = l2 ? ((x - a[0]) * dx + (y - a[1]) * dy) / l2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (a[0] + t * dx), ey = y - (a[1] + t * dy);
      const d = ex * ex + ey * ey;
      if (d < best) best = d;
    }
  }
  return Math.sqrt(best);
}
let weatherTileKey = "", weatherTileValue = null;
function weatherHere() {
  if (typeof MAPID !== "undefined" && MAPID !== "world") return null;
  const x = P.x / TS, y = P.y / TS;
  const tileKey = MAPID + ":" + Math.floor(x) + "," + Math.floor(y);
  if (tileKey === weatherTileKey) return weatherTileValue;
  weatherTileKey = tileKey;
  for (const w of WEATHER) {
    if (w.road) {
      if (w.notIn && x >= w.notIn[0] && y >= w.notIn[1]
          && x <= w.notIn[2] && y <= w.notIn[3]) continue;
      if (nearRoad(w.road, x, y) <= w.band) return weatherTileValue = w;
      continue;
    }
    if (x >= w.x0 && x <= w.x1 && y >= w.y0 && y <= w.y1) return weatherTileValue = w;
  }
  return weatherTileValue = null;
}
let weatherFrameCanvas = null, weatherFrameCtx = null;
let weatherFrameKind = "", weatherFrameAt = -1;
function drawWeather(t) {
  const w = weatherHere();
  if (!w) return;
  const W = cv.width, H = cv.height;
  if (!weatherFrameCanvas) {
    weatherFrameCanvas = document.createElement("canvas");
    weatherFrameCtx = weatherFrameCanvas.getContext("2d");
  }
  if (weatherFrameCanvas.width !== W || weatherFrameCanvas.height !== H) {
    weatherFrameCanvas.width = W; weatherFrameCanvas.height = H;
    weatherFrameAt = -1;
  }
  // Weather contains hundreds of tiny marks. Refreshing that overlay at 30 Hz
  // keeps it fluid while removing the work from every other game frame.
  if (weatherFrameKind === w.kind && weatherFrameAt >= 0 && t - weatherFrameAt < 1 / 30) {
    ctx.drawImage(weatherFrameCanvas, 0, 0); return;
  }
  weatherFrameKind = w.kind; weatherFrameAt = t;
  const g = weatherFrameCtx;
  g.clearRect(0, 0, W, H); g.save();
  if (w.kind === "snow") {
    const layers = [[90, 26, 1.6, 0.55], [140, 40, 2.4, 0.75], [60, 62, 3.2, 0.95]];
    for (const [n, speed, size, alpha] of layers) {
      g.fillStyle = "rgba(255,255,255," + alpha + ")";
      for (let i = 0; i < n; i++) {
        const h = ((i * 2654435761) ^ (n * 1597334677)) >>> 0;
        const sx = (h % 1000) / 1000 * W;
        const drift = Math.sin(t * 0.6 + i) * 10;
        const sy = ((h >>> 10) % 1000) / 1000 * H + t * speed;
        g.fillRect(Math.round((sx + drift + W) % W),
                     Math.round(sy % (H + 20)) - 10, size, size);
      }
    }
  }
  if (w.kind === "sand") {
    g.fillStyle = "rgba(122,84,44,.30)";
    g.fillRect(0, 0, W, H);
    const gust = 0.18 + 0.14 * Math.sin(t * 0.5);
    g.fillStyle = "rgba(86,58,30," + gust.toFixed(3) + ")";
    g.fillRect(0, 0, W, H);
    const layers = [[260, 300,  7, 1, 0.30, "92,64,34"],
                    [320, 460, 14, 2, 0.38, "74,50,26"],
                    [220, 700, 26, 2, 0.34, "58,40,22"],
                    [120, 980, 46, 3, 0.28, "44,30,16"]];
    for (const [n, speed, len, thick, alpha, col] of layers) {
      g.fillStyle = "rgba(" + col + "," + alpha + ")";
      for (let i = 0; i < n; i++) {
        const h = ((i * 2654435761) ^ (n * 1597334677)) >>> 0;
        const sy = ((h >>> 10) % 1000) / 1000 * H;
        const sway = Math.sin(t * 1.3 + i * 0.7) * 8;
        const sx = W - (((h % 1000) / 1000 * W + t * speed) % (W + 60)) + 30;
        g.fillRect(Math.round(sx), Math.round(sy + sway), len, thick);
      }
    }
    g.fillStyle = "rgba(226,196,142,.34)";
    for (let i = 0; i < 90; i++) {
      const h = ((i * 40503) ^ 0x9e3779b9) >>> 0;
      const sy = ((h >>> 10) % 1000) / 1000 * H;
      const sx = W - (((h % 1000) / 1000 * W + t * 620) % (W + 60)) + 30;
      g.fillRect(Math.round(sx), Math.round(sy + Math.sin(t * 2 + i) * 5), 10, 1);
    }
  }
  g.restore();
  ctx.drawImage(weatherFrameCanvas, 0, 0);
}

const keys = {};
addEventListener("keydown", e => {
  const k=e.key.toLowerCase();
  if(typeof ask!=='undefined'&&ask&&(k==='arrowup'||k==='arrowdown'||k==='escape')){
    e.preventDefault();if(k==='escape'){if(!e.repeat)askBack();}else askStep(k==='arrowup'?-1:1);return;
  }
  if (fishing && (k==='a'||k==='b'||k==='escape')) {
    e.preventDefault(); if(!e.repeat){if(k==='a') actionButton();else {askShut();endFishing();}} return;
  }
  keys[k] = 1;
  if (k === "b") {
    running = true;
    if (glassShield && inFight() && !e.repeat) { e.preventDefault(); glassShieldHeld = true; glassShieldWindowUntil = tAcc + GLASS_BLOCK_WINDOW; glassShieldPulse = Math.max(glassShieldPulse,.18); tryGlassShieldParry(); }
  }
  if (e.key === " ") {e.preventDefault();if(!e.repeat)actionButton();}
});
addEventListener("keyup", e => {
  const k=e.key.toLowerCase(); keys[k] = 0;
  if(k === "b") { glassShieldHeld = false; running = false; }
});

let padDx = 0, padDy = 0, running = false;
const padHeld = new Map();          /* touch id -> button element */
const padTouchMode = ("ontouchstart" in window) ||
  (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

function clearPadInputs() {
  for (const el of new Set(padHeld.values())) el.classList.remove("hit");
  padHeld.clear();
  document.querySelectorAll("#dpad .hit").forEach(el => el.classList.remove("hit"));
  padAim();
}

function padInputIds(e) {
  if (e && e.pointerId !== undefined) return ["p" + e.pointerId];
  if (e && e.changedTouches)
    return Array.from(e.changedTouches, touch => "t" + touch.identifier);
  return ["m"];
}

function releasePadInputs(e) {
  for (const id of padInputIds(e)) {
    const el = padHeld.get(id);
    if (el) el.classList.remove("hit");
    padHeld.delete(id);
  }
  if (!padHeld.size)
    document.querySelectorAll("#dpad .hit").forEach(el => el.classList.remove("hit"));
  padAim();
}

function padAim() {
  if(fishing){padDx=padDy=0;return;}
  const cameraLocked = cameraOwnsView();
  if (!cameraLocked && !mapGesturesAllowed()) camFree = false;
  let dx = 0, dy = 0;
  for (const el of padHeld.values()) {
    dx += +el.dataset.dx || 0;
    dy += +el.dataset.dy || 0;
  }
  if (!cameraLocked && (dx || dy) && (camFree || (typeof devUnlocked !== "undefined" && devUnlocked))) {
    camFree = false;
    devUnlocked = false;
    if (typeof recentreOnCorin === "function") recentreOnCorin();
  }
  padDx = Math.max(-1, Math.min(1, dx));
  padDy = Math.max(-1, Math.min(1, dy));
}

function padBind() {
  const pad = document.getElementById("dpad");
  const cells = [];
  for (const el of (pad.querySelectorAll ? pad.querySelectorAll("div") : (pad.children || [])))
    if (el.dataset && el.dataset.dx !== undefined) cells.push(el);

  for (const el of cells) {
    const press = (e) => {
      const dy = parseInt(el.dataset.dy, 10) || 0;
      const dx = parseInt(el.dataset.dx, 10) || 0;
      if(atlasOpen){atlasMove(dx,dy);e?.preventDefault();return;}
      if (typeof ask !== "undefined" && ask) {
        if (dx && ask.quantity) changePurchaseQuantity(dx > 0 ? 1 : -1);
        if (dy) askStep(dy > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      if (typeof bagOpen !== "undefined" && bagOpen) {
        if (dy) bagStep(dy > 0 ? 4 : -4);
        else if (dx) bagStep(dx > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      if (typeof ovl !== "undefined" && ovl) {
        if (dy) ovlStep(dy > 0 ? 1 : -1);
        if (e && e.preventDefault) e.preventDefault();
        return;
      }
      for (const id of padInputIds(e)) padHeld.set(id, el);
      el.classList.add("hit");
      padAim();
      if (e && e.preventDefault) e.preventDefault();
    };
    const release = (e) => {
      releasePadInputs(e);
      if (e && e.preventDefault) e.preventDefault();
    };
    if (padTouchMode) {
      el.addEventListener("touchstart", e => {
        // A new finger press is also a hard recovery point for any stale state
        // left by the surrounding iOS browser chrome.
        clearPadInputs();
        press(e);
      }, { passive: false });
      el.addEventListener("touchend", release, { passive: false });
      el.addEventListener("touchcancel", e => {
        clearPadInputs();
        if (e && e.preventDefault) e.preventDefault();
      }, { passive: false });
    } else {
      el.addEventListener("mousedown", press);
      el.addEventListener("mouseup", release);
      el.addEventListener("mouseleave", release);
    }
  }

  // Touch devices get touch handlers only. Registering mouse or pointer handlers
  // for the same iPhone press creates a second held direction in ChatGPT's
  // embedded browser.
  if (padTouchMode) {
    const finishTouch = e => {
      releasePadInputs(e);
      if (!e.touches || e.touches.length === 0) clearPadInputs();
    };
    document.addEventListener("touchend", finishTouch, { capture:true, passive:true });
    window.addEventListener("touchend", finishTouch, { capture:true, passive:true });
    document.addEventListener("touchcancel", clearPadInputs, { capture:true, passive:true });
    window.addEventListener("touchcancel", clearPadInputs, { capture:true, passive:true });
  } else {
    window.addEventListener("mouseup", releasePadInputs);
  }
  window.addEventListener("blur", clearPadInputs);
  window.addEventListener("pagehide", clearPadInputs);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearPadInputs();
  });
}

function bindHold(id, onDown, onUp) {
  const el = document.getElementById(id);
  if (!el) { (window.__boot = (window.__boot || "") +
              "\nbindHold: no element #" + id); return; }
  const down = (e) => {
    el.classList.add("hit"); onDown();
    if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
  };
  const up = (e) => {
    el.classList.remove("hit"); if (onUp) onUp();
    if (e && e.preventDefault) { e.preventDefault(); e.stopPropagation(); }
  };
  el.addEventListener("touchstart", down, { passive: false });
  el.addEventListener("touchend", up, { passive: false });
  el.addEventListener("touchcancel", up, { passive: false });
  el.addEventListener("mousedown", down);
  el.addEventListener("mouseup", up);
}

const SCROLLERS = ["toolbody", "bagLeft", "bagPanel", "bagRows", "bagAsk"];

function scrollerFor(node) {
  for (let el = node; el && el !== document.body; el = el.parentNode) {
    if (el.id && SCROLLERS.includes(el.id)) return el;
    if (el.classList && el.classList.contains("scrolls")) return el;
  }
  return null;
}
const isSideways = () => false;

let lockY = 0, lockX = 0, lockEl = null;
document.addEventListener("touchstart", e => {
  lockEl = scrollerFor(e.target);
  lockY = e.touches[0] ? e.touches[0].clientY : 0;
  lockX = e.touches[0] ? e.touches[0].clientX : 0;
  if (lockEl) {
    if (isSideways(lockEl)) {
      const max = lockEl.scrollWidth - lockEl.clientWidth;
      if (max > 0) {
        if (lockEl.scrollLeft <= 0) lockEl.scrollLeft = 1;
        else if (lockEl.scrollLeft >= max) lockEl.scrollLeft = max - 1;
      }
    } else {
      const max = lockEl.scrollHeight - lockEl.clientHeight;
      if (max > 0) {
        if (lockEl.scrollTop <= 0) lockEl.scrollTop = 1;
        else if (lockEl.scrollTop >= max) lockEl.scrollTop = max - 1;
      }
    }
  }
}, { passive: true });

document.addEventListener("touchmove", e => {
  if (!e.cancelable) return;
  const el = lockEl || scrollerFor(e.target);
  if (!el) { e.preventDefault(); return; }        /* not a scroller: swallow */
  const t0 = e.touches[0];
  if (!lockEl) {            /* the start was swallowed: begin from here */
    lockEl = el;
    lockX = t0 ? t0.clientX : 0;
    lockY = t0 ? t0.clientY : 0;
    return;
  }
  if (isSideways(el)) {
    const dx = (t0 ? t0.clientX : lockX) - lockX;
    const max = el.scrollWidth - el.clientWidth;
    const atL = el.scrollLeft <= 1, atR = el.scrollLeft >= max - 1;
    if (max <= 0 || (atL && dx > 0) || (atR && dx < 0)) e.preventDefault();
    return;
  }
  const dy = (t0 ? t0.clientY : lockY) - lockY;
  const max = el.scrollHeight - el.clientHeight;
  const atTop = el.scrollTop <= 1, atEnd = el.scrollTop >= max - 1;
  if (max <= 0 || (atTop && dy > 0) || (atEnd && dy < 0)) e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => { lockEl = null; }, { passive: true });
cv.addEventListener("touchstart", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  if (collideView && !geometryPan) {
    for (const t of e.changedTouches) collideTap(t.clientX, t.clientY);
    e.preventDefault(); return;
  }
  for (const t of e.changedTouches) mapTouchStart(t);
  e.preventDefault();
}, { passive: false });
cv.addEventListener("mousedown", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  if (collideView && !geometryPan) { collideTap(e.clientX, e.clientY); e.preventDefault(); }
});

cv.addEventListener("touchmove", e => {
  if(!geometryPan&&(doorEdit||collideView)){e.preventDefault();return;}
  for (const t of e.changedTouches) mapTouchMove(t);
  e.preventDefault();
}, { passive: false });

function endTouch(e) {
  for (const t of e.changedTouches) mapTouchEnd(t);
  e.preventDefault();
}
cv.addEventListener("touchend", endTouch, { passive: false });
cv.addEventListener("touchcancel", endTouch, { passive: false });

const touches = new Map();
let dragObj = null, dragMoved = false, pinchD = 0, pinchZ = 0;
function mapGesturesAllowed() {
  if(fishing)return false;
  const on = (v) => (typeof v !== "undefined" && v);
  return on(typeof devUnlocked !== "undefined" && devUnlocked)
      || on(typeof devOpen !== "undefined" && devOpen)
      || on(typeof painting !== "undefined" && painting)
      || on(typeof building !== "undefined" && building)
      || on(typeof editing !== "undefined" && editing)
}
let finePlace = false;
let pinchMx = null, pinchMy = null;

function screenToWorld(cx, cy) {
  /* Touch coordinates are viewport-relative, but the game canvas may not begin at
     the viewport origin (mobile dev/editor chrome can shift it). Convert through
     the canvas rect so MOVE hit-testing lines up with what is actually under the finger. */
  const r=cv.getBoundingClientRect();
  const sx=(cx-r.left)*(VW/Math.max(1,r.width));
  const sy=(cy-r.top)*(VH/Math.max(1,r.height));
  return { x: cam.x + sx / cam.z, y: cam.y + sy / cam.z };
}
const FABRIC = /^(ifloor|iwall_|vc_c|sw_wall3|gw_trim|dg_floor)/;

const BACKDROP = /^(sw_gnd|sw_dirt|mtn_3_|rc_walls|rc_floor|sw_wall)/;
const MOUNTAIN = /^(mtn_|mts_|mtv_|vmt_|mtd_|mtw_|mte_)/;
function pickObject(wx, wy) {
  const actor=pickEditorActor(wx,wy);if(actor)return actor;
  let best = null, bestArea = 1e9;
  const grabbable = nm => nm && !BACKDROP.test(nm);
  let fab = null, fabArea = 1e9;
  for (const o of objs.concat(fobjs)) {
    if (deleted.has(o.id) || hidden.has(o.id)) continue;
    const s = SPR[NAMES[o.s]];
    if (!s) continue;      /* nothing there to stand in the way of */
    if (!grabbable(NAMES[o.s])) continue;
    const x0 = o.x + (o.wx || 0) - s[2] / 2, y0 = o.y + (o.wy || 0) - s[3];
    if (wx < x0 || wx > x0 + s[2] || wy < y0 || wy > y0 + s[3]) continue;
    const a = s[2] * s[3];
    if (FABRIC.test(NAMES[o.s])) {
      if (a < fabArea) { fabArea = a; fab = o; }
    } else if (a < bestArea) { bestArea = a; best = o; }
  }
  const layers = [["s", scat], ["a", sanm]];
  for (const [tag, arr] of layers)
    for (let i = 0; i < arr.length; i += 3) {
      const key = tag + i;
      if (decorGone.has(key)) continue;
      const sp = SPR[NAMES[arr[i]]]; if (!sp) continue;
      if (MOUNTAIN.test(NAMES[arr[i]])) continue;
      if (!grabbable(NAMES[arr[i]])) continue;
      const x0 = arr[i + 1] - sp[2] / 2, y0 = arr[i + 2] - sp[3];
      if (wx < x0 || wx > x0 + sp[2] || wy < y0 || wy > y0 + sp[3]) continue;
      const a = /^(shc_|shcap_|cliff_|sett_|ifloor_|iwall_|cvf|cvrub_)/.test(NAMES[arr[i]])
                ? 1e8 : sp[2] * sp[3];
      const hit = { decor: tag, di: i, s: arr[i], x: arr[i + 1], y: arr[i + 2],
                    id: "decor:" + key };
      if (FABRIC.test(NAMES[arr[i]])) {
        if (a < fabArea) { fabArea = a; fab = hit; }
      } else if (a < bestArea) { bestArea = a; best = hit; }
    }
  return best || fab;
}
function mapTouchStart(t) {
  touches.set(t.identifier, { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY });
  if (touches.size === 2) {
    if (typeof devUnlocked !== "undefined" && !devUnlocked) devUnlocked = true;
    const [a, b] = [...touches.values()];
    pinchD = Math.hypot(a.x - b.x, a.y - b.y); pinchZ = cam.z; dragObj = null;
    pinchMx = (a.x + b.x) / 2; pinchMy = (a.y + b.y) / 2;
    if (grabDrag) { grabDrag = null; }
    if (grabRect && grabRect.anchor && grabRect.x0 === grabRect.x1 &&
        grabRect.y0 === grabRect.y1) grabRect = null;   /* an unstarted box */
    return;
  }
  dragMoved = false;
  if (building && grabMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS);
    if (grabRect && tx >= grabRect.x0 && tx <= grabRect.x1 &&
        ty >= grabRect.y0 && ty <= grabRect.y1) {
      grabDrag = { sx: w.x, sy: w.y, dx: 0, dy: 0 };     /* move it */
    } else {
      grabRect = { x0: tx, y0: ty, x1: tx, y1: ty, anchor: [tx, ty] };
      grabDrag = null;
    }
    return;
  }
  if (building && arenaMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    placeArena(w.x, w.y);
    return;
  }
  if (building && areaMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const f = areaAt(w.x, w.y);
    pickedArea = f || null;
    areaDrag = f ? { sx: w.x, sy: w.y, x0: f.x0, y0: f.y0 } : null;
    refreshBuild();
    return;
  }
  if (building && drawArmed) {
    const w = screenToWorld(t.clientX, t.clientY);
    drawA = [Math.floor(w.x / TS), Math.floor(w.y / TS)];
    drawB = drawA.slice();
    drawPts = [drawA.slice()];
    return;
  }
  if (painting) {
    if (!stroke) stroke = new Map();
    const w = screenToWorld(t.clientX, t.clientY);
    paintAt(w.x, w.y);
    return;
  }
  if (editing) {
    const w = screenToWorld(t.clientX, t.clientY);
    let hit = pickObject(w.x, w.y);
    /* Mobile forgiveness for small/tall furniture: if the exact pixel under the finger
       misses, search a small world-space radius and prefer dedicated furniture. */
    if(!hit&&/^house\d/.test(MAPID||'')){
      let best=null;
      for(const o of (MD.roomActors||[]))if(o.interiorFurniture&&!o.editorDeleted){
        const sp=editorSprite(o);if(!sp)continue;
        const l=o.x-sp[2]/2,t=o.y-sp[3],rx=Math.max(l,Math.min(w.x,l+sp[2])),ry=Math.max(t,Math.min(w.y,o.y));
        const d=Math.hypot(w.x-rx,w.y-ry);if(d<=14&&(!best||d<best.d))best={o,d};
      }
      if(best)hit=best.o;
    }
    if (hit) {
      dragObj = hit;
      selected = hit; refreshSel();
    }
  }
}
function mapTouchMove(t) {
  const p = touches.get(t.identifier); if (!p) return;
  const dx = t.clientX - p.x, dy = t.clientY - p.y;
  p.x = t.clientX; p.y = t.clientY;
  if (Math.hypot(t.clientX - p.sx, t.clientY - p.sy) > 6) dragMoved = true;
  if (touches.size === 2) {
    const [a, b] = [...touches.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    if (pinchMx !== null) { cam.x -= (mx - pinchMx) / cam.z; cam.y -= (my - pinchMy) / cam.z; }
    pinchMx = mx; pinchMy = my;
    if (pinchD > 0 && mapGesturesAllowed()) { setZoom(pinchZ * (d / pinchD), mx, my); camFree = true; }
    clampCam();
    return;
  }
  if (building && grabMode) {
    const w = screenToWorld(t.clientX, t.clientY);
    const tx = Math.floor(w.x / TS), ty = Math.floor(w.y / TS);
    if (grabDrag) {
      grabDrag.dx = Math.round((w.x - grabDrag.sx) / TS);
      grabDrag.dy = Math.round((w.y - grabDrag.sy) / TS);
    } else if (grabRect) {
      const [ax, ay] = grabRect.anchor;
      grabRect.x0 = Math.min(ax, tx); grabRect.x1 = Math.max(ax, tx);
      grabRect.y0 = Math.min(ay, ty); grabRect.y1 = Math.max(ay, ty);
    }
    return;
  }
  if (building && areaMode) {
    if (areaDrag && pickedArea) {
      const w = screenToWorld(t.clientX, t.clientY);
      areaDrag.dx = Math.round((w.x - areaDrag.sx) / TS);
      areaDrag.dy = Math.round((w.y - areaDrag.sy) / TS);
    }
    return;
  }
  if (building && drawArmed) {
    if (drawA) {
      const w = screenToWorld(t.clientX, t.clientY);
      drawB = [Math.floor(w.x / TS), Math.floor(w.y / TS)];
      if (buildTool === "route" && drawPts.length) {
        const last = drawPts[drawPts.length - 1];
        const dx = drawB[0] - last[0], dy = drawB[1] - last[1];
        const along = Math.abs(dx) >= Math.abs(dy);
        const run = along ? Math.abs(dx) : Math.abs(dy);
        const off = along ? Math.abs(dy) : Math.abs(dx);
        if (run >= 10 && off >= 8)
          drawPts.push(along ? [drawB[0], last[1]] : [last[0], drawB[1]]);
      }
    }
    return;
  }
  if (painting) {
    const w = screenToWorld(t.clientX, t.clientY);
    paintAt(w.x, w.y);
    return;
  }
  if (dragObj) {
    /* Drag furniture by absolute finger/world position. This avoids touch-delta scaling
       errors and makes the selected object's movement unambiguous on mobile. */
    if(dragObj.interiorFurniture){
      const w=screenToWorld(t.clientX,t.clientY);
      if(moveEditorActor(dragObj,w.x,w.y))return;
    }
    if(moveEditorActor(dragObj,dragObj.x+dx/cam.z,dragObj.y+dy/cam.z))return;
    if (dragObj.feat) {
      const tx = Math.floor(dragObj.x / TS), ty = Math.floor((dragObj.y - 1) / TS);
      const key = tx + "," + ty;
      if (!felled.has(key)) { felled.add(key); felledNew.push(key); }
      const copy = { id: ORIG.length + added.length, s: dragObj.s,
                     x: dragObj.x, y: dragObj.y };
      objs.push(copy);
      added.push(copy);
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid();
      reindex(); indexScatter(); chunks.clear();
      dragObj = copy; selected = copy; refreshSel();
    }
    dragObj.x += dx / cam.z; dragObj.y += dy / cam.z;
    dragObj.x = Math.max(0, Math.min(PXW, dragObj.x));
    dragObj.y = Math.max(0, Math.min(PXH, dragObj.y));
    if (dragObj.decor) {
      const arr = dragObj.decor === "s" ? scat : sanm;
      const _mk = dragObj.decor + dragObj.di;
      if (!decorMoved.has(_mk))
        decorMoved.set(_mk, { tag: dragObj.decor, di: dragObj.di,
                              s: arr[dragObj.di],
                              x0: arr[dragObj.di + 1], y0: arr[dragObj.di + 2] });
      arr[dragObj.di + 1] = Math.round(dragObj.x);
      arr[dragObj.di + 2] = Math.round(dragObj.y);
      const md = dragObj.decor === "s" ? MD.scatter : MD.sanim;
      if (md) { md[dragObj.di + 1] = arr[dragObj.di + 1];
                md[dragObj.di + 2] = arr[dragObj.di + 2]; }
      indexScatter(); rebuildBuckets(); chunks.clear();
    }
    mapDirty = true;
    return;
  }
  if (!mapGesturesAllowed()) return;
  cam.x -= dx / cam.z; cam.y -= dy / cam.z; camFree = true; clampCam();
}
function mapTouchEnd(t) {
  const p = touches.get(t.identifier);
  touches.delete(t.identifier);
  if (touches.size < 2) { pinchD = 0; pinchMx = null; pinchMy = null; }
  if (building && grabMode) {
    if (touches.size === 0 && grabDrag && grabRect) {
      moveRegion(grabRect, grabDrag.dx || 0, grabDrag.dy || 0);
      grabDrag = null;
    }
    return;
  }
  if (building && areaMode) {
    if (touches.size === 0 && areaDrag && pickedArea &&
        (areaDrag.dx || areaDrag.dy))
      moveArea(pickedArea, areaDrag.dx || 0, areaDrag.dy || 0);
    areaDrag = null;
    return;
  }
  if (building && drawArmed) {
    if (touches.size === 0 && drawA && drawB) commitFeature();
    return;
  }
  if (painting) {
    if (touches.size === 0 && groundDirty) { groundDirty = false; finishPaint(); }
    return;
  }
  if (dragObj) {
    if(editorActorInfo(dragObj)){
      const x=finePlace?Math.round(dragObj.x):Math.round((dragObj.x-TS/2)/TS)*TS+TS/2;
      const y=finePlace?Math.round(dragObj.y):Math.round(dragObj.y/TS)*TS;
      moveEditorActor(dragObj,x,y,true);refreshSel();dragObj=null;return;
    }
    if (!finePlace) {
      dragObj.x = Math.round((dragObj.x - TS / 2) / TS) * TS + TS / 2;
      dragObj.y = Math.round(dragObj.y / TS) * TS;
    } else {
      dragObj.x = Math.round(dragObj.x);
      dragObj.y = Math.round(dragObj.y);
    }
    reindex(); refreshSel(); dragObj = null; return;
  }
}
function fitZoom() { return Math.min(VW / PXW, VH / PXH); }
function overviewZoom() {
  return Math.max(fitZoom(), Math.max(VW / PXW, VH / PXH) * 1.6);
}
function setZoom(z, ax, ay) {
  const minZ = fitZoom();
  const nz = Math.max(minZ, Math.min(6, z));
  const w = screenToWorld(ax, ay);
  cam.z = nz;
  cam.x = w.x - ax / nz; cam.y = w.y - ay / nz;
  clampCam(); mapDirty = true;
}
function clampCam() {
  const vw = VW / cam.z, vh = VH / cam.z;
  const slackX = building ? vw * 0.9 : 0, slackY = building ? vh * 0.9 : 0;
  cam.x = vw >= PXW + slackX ? (PXW - vw) / 2
        : Math.max(-slackX * 0.15, Math.min(PXW + slackX - vw, cam.x));
  cam.y = vh >= PXH + slackY ? (PXH - vh) / 2
        : Math.max(-slackY * 0.15, Math.min(PXH + slackY - vh, cam.y));
}

let mDown = false;
cv.addEventListener("mousedown", e => {
  if(!geometryPan&&(doorEdit||collideView))return;
  mDown = true;
  mapTouchStart({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
cv.addEventListener("mousemove", e => {
  if (mDown) mapTouchMove({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
addEventListener("mouseup", e => {
  if (!mDown) return; mDown = false;
  mapTouchEnd({ identifier: "m", clientX: e.clientX, clientY: e.clientY });
});
cv.addEventListener("wheel", e => {
  setZoom(cam.z * (e.deltaY < 0 ? 1.12 : 0.89), e.clientX, e.clientY);
  e.preventDefault();
}, { passive: false });

const anims = [];
const bolts = [];

function playOnce(prefix, count, x, y, fps, hold) {
  anims.push({ prefix, count, x, y, fps, hold, t: 0 });
}

function burstAt(art, dir, x, y) {
  const nm = art + "_" + dir;
  if (SPR[nm]) playOnce(nm, SPR[nm][4], x, y, 16, false);
}
const GLASS_GIF_FRAMES = window.EMBER_ASSETS.GLASS_GIF_FRAMES;
const glassGifImgs = GLASS_GIF_FRAMES.map(src=>{ const im=new Image(); im.src=src; return im; });
let glassGifStart=-99;
function glassShieldRaised() { return glassShield && glassShieldHeld && inFight() && !mounted && !dying(); }
function glassShieldActive() { return glassShieldRaised() && tAcc <= glassShieldWindowUntil; }
function glassAttackUnblockable(f) { return !!(f && f.unblockableAttack); }
function beginEnemyWindup(f) {
  f.attackSeq = (f.attackSeq || 0) + 1;
  // Every fourth meaningful attack is a heavy, unblockable strike. The red flash is the warning.
  f.unblockableAttack = ((f.attackSeq % 4) === 0 && ((FOE[f.kind]||{}).dmg >= 2));
}
function queueGlassShieldBlock(f) {
  if (!f || f.st !== "wind" || f.st === "dead" || glassAttackUnblockable(f)) return false;
  f.glassParryQueued = true;
  f.glassParryPlayerX = P.x; f.glassParryPlayerY = P.y;
  // Do not play the effect yet. B only arms the block during the orange tell.
  // The GIF begins at the exact attack-impact frame below.
  return true;
}
function glassShieldDeflectFoe(f) {
  // A correctly timed B press reserves the block during wind-up. At the exact
  // frame the attack would deal damage, suppress damage, play the shield GIF,
  // and immediately start the enemy's bounce away from Corin.
  if (!f || !f.glassParryQueued || glassAttackUnblockable(f)) return false;
  f.glassParryQueued = false;
  glassShieldPulse = .42;
  glassGifStart = tAcc;
  f.retreat = Math.max(f.retreat || 0, 1.55);
  f.retreatX = f.glassParryPlayerX === undefined ? P.x : f.glassParryPlayerX;
  f.retreatY = f.glassParryPlayerY === undefined ? P.y : f.glassParryPlayerY;
  f.glassRetreatBoost = 4.25;
  f.cool = Math.max(f.cool || 0, 1.05);
  // The block resolves on the attack's contact frame. Switch straight into
  // retreat movement here so recoil starts NOW instead of waiting for the
  // remainder of the swing state to finish. Damage has already been suppressed.
  f.st = "walk";
  f.t = 0;
  f.hit = 1;
  f.hitDone = 1;
  f.unblockableAttack = false;
  return true;
}
function finishGlassShieldParry(f) {
  // Recoil now begins on the attack's actual hit frame, not at swing-end.
  // Keep this cleanup for attacks that never reached their target.
  if (!f || !f.glassParryQueued) return false;
  f.glassParryQueued = false;
  return false;
}
function tryGlassShieldParry() {
  if (!glassShield || !inFight() || mounted || dying()) return false;
  let caught = false;
  // B during the orange telegraph reserves the block. The enemy is allowed to finish its attack animation.
  for (const f of foes) {
    if (!f || f.st !== "wind" || glassAttackUnblockable(f)) continue;
    const k = FOE[f.kind] || {};
    const d = Math.hypot(P.x - f.x, P.y - f.y);
    const range = Math.max(72, (k.reach || 30) + 54);
    if (d <= range && queueGlassShieldBlock(f)) caught = true;
  }
  return caught;
}
function drawGlassShield() {
  // Only show the large impact-flash portion of the supplied GIF. The smaller
  // lead-in/tail frames made a successful block feel delayed and too long.
  const elapsed=Math.max(0,tAcc-glassGifStart);
  const flashFrames=[3,4,5];
  const flashDuration=.15;
  if (glassShieldPulse <= 0 && elapsed>flashDuration) return;
  if (elapsed>flashDuration) return;
  const idx=flashFrames[Math.min(flashFrames.length-1,Math.floor(elapsed/(flashDuration/flashFrames.length)))];
  const im=glassGifImgs[idx];
  if(!im || !im.complete) return;
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=.96;
  // The supplied GIF's actual frames, centered over Corin. No generated replacement effect.
  const w=90,h=78;
  ctx.drawImage(im,P.x-w/2,P.y-18-h/2,w,h);
  ctx.restore();
}
function drawEnemyAttackTell(f,s2,fr,dx,dy,scale=1){
  if(!f || f.st!=="wind" || f.st==="dead") return;
  const k=FOE[f.kind]||{};
  const wind=GLASS_TELEGRAPH_WINDOW;
  const p=Math.max(0,Math.min(1,f.t/wind));
  const blink=.28+.52*(.5+.5*Math.sin(tAcc*24));
  const col=glassAttackUnblockable(f)?"#ff2424":"#ff9a22";
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.globalAlpha=blink*(.55+.35*p);
  const tint=tintFoe(s2,fr,col,.9);
  drawGameImage(ctx,tint,0,0,s2[2],s2[3],dx,dy,Math.round(s2[2]*scale),Math.round(s2[3]*scale));
  ctx.restore();
}
function stepBolts(dt) {
  if (glassShieldPulse > 0) glassShieldPulse = Math.max(0, glassShieldPulse - dt);
  if (foesHeld) return;
  if (bossScene) return;
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    b.t += dt;
    const step = b.sp * dt;
    const nx = b.x + b.vx * step, ny = b.y + b.vy * step;
    if (isSolid(nx, ny)) { burstAt(b.art, b.dir, b.x, b.y); bolts.splice(i, 1); continue; }
    b.x = nx; b.y = ny;
    if (b.targetDragon && !dragon.down && dragonHere() &&
        Math.hypot(dragon.x - b.x, dragon.y - 8 - b.y) < 18) {
      burstAt(b.art, b.dir, b.x, b.y);
      hurtDragon(b.dmg);
      bolts.splice(i, 1); continue;
    }
    if (!b.targetDragon && Math.hypot(P.x - b.x, (P.y - 8) - b.y) < 11) {
      if (glassShieldActive() && !b.unblockable) {
        glassShieldPulse = .42; burstAt(b.art, b.dir, b.x, b.y);
        const dx=b.x-P.x,dy=b.y-(P.y-8),d=Math.hypot(dx,dy)||1;
        b.vx=dx/d; b.vy=dy/d; b.targetDragon=false; b.t=0; b.x+=b.vx*10; b.y+=b.vy*10;
        continue;
      }
      burstAt(b.art, b.dir, b.x, b.y);
      hurtPlayer(b.dmg);
      bolts.splice(i, 1); continue;
    }
    if (b.t > b.life) bolts.splice(i, 1);
  }
}
function stepAnims(dt) {
  for (let i = anims.length - 1; i >= 0; i--) {
    const a = anims[i];
    a.t += dt * a.fps;
    if (a.t >= a.count) {
      if (a.hold) a.t = a.count - 0.001;   /* rest on the last frame */
      else anims.splice(i, 1);             /* or fade from the world */
    }
  }
}

var dragonFacingLocked = false;
const dragon = { x: 0, y: 0, t: 0, _dir: "s", on: true,
  get dir() { return this._dir; },
  set dir(v) { if (!dragonFacingLocked) this._dir = v; },
  moving: false, fly: 0, air: true, tr: null, gait: 0,
  hp: 20, maxHp: 20, hurt: 0, inv: 0, down: false,
  knockdown: 0, knockdownMax: 1.2 };
const DG_FOOT_W = 9, DG_FOOT_H = 5;      /* its feet, the same idea as his */
function dragonCanStand(x, y) {
  const hw = DG_FOOT_W / 2;
  arenaPass = true;
  const blocked = isSolid(x - hw, y - DG_FOOT_H) || isSolid(x + hw, y - DG_FOOT_H) ||
                  isSolid(x - hw, y - 1) || isSolid(x + hw, y - 1);
  arenaPass = false;
  return !blocked;
}
function dragonAirborne() { return dragon.air && !dragon.tr; }
function dragonStep(dx, dy) {
  if (breath) return;
  if (dragonAirborne()) { dragon.x += dx; dragon.y += dy; return; }
  if (dx && dragonCanStand(dragon.x + dx, dragon.y)) dragon.x += dx;
  if (dy && dragonCanStand(dragon.x, dragon.y + dy)) dragon.y += dy;
}
function dragonHover() { return dragonAirborne() ? 26 : 0; }
function dragonBob() { return dragonAirborne() ? Math.sin(dragon.t * 2.2) * 3 : 0; }
function dragonGround(x, y) {
  if (arenaLock && arenaT > 0.25) {
    const cx = arenaLock.x * TS + TS / 2, cy = arenaLock.y * TS + TS / 2;
    const lim = (arenaLock.r - 1) * TS;
    const ox = x - cx, oy = y - cy, od = Math.hypot(ox, oy);
    if (od > lim) { x = cx + (ox / od) * lim; y = cy + (oy / od) * lim; }
  }
  if (dragonCanStand(x, y)) { dragon.x = x; dragon.y = y; return true; }
  for (let r = 6; r <= 56; r += 6)
    for (let a = 0; a < 12; a++) {
      const t = a * Math.PI / 6;
      const nx = x + Math.cos(t) * r, ny = y + Math.sin(t) * r;
      if (arenaLock && arenaT > 0.25) {
        const cx = arenaLock.x * TS + TS / 2, cy = arenaLock.y * TS + TS / 2;
        if (Math.hypot(nx - cx, ny - cy) > (arenaLock.r - 1) * TS) continue;
      }
      if (dragonCanStand(nx, ny)) { dragon.x = nx; dragon.y = ny; return true; }
    }
  return false;
}
function refreshWingBtn() {
  const b = document.getElementById("btnWing");
  if (!b) return;
  const up = dragon.tr ? dragon.tr.to : dragon.air;
  b.textContent = up ? "FLY" : "WALK";
  b.classList.toggle("ground", !up);
}
function startTransition(kind, to) {
  const sp = SPR["dr5_" + kind + "_" + dragon.dir];
  dragon.tr = { kind, to, t: 0, n: sp ? sp[4] : 1 };
  refreshWingBtn();
}
function stepTransition(dt) {
  const tr = dragon.tr;
  if (!tr) return;
  tr.t += dt * DRAGON_ANIM.tr;
  if (tr.t < tr.n) return;
  dragon.tr = null;
  dragon.air = tr.to;
  refreshWingBtn();
}
function setDragonAir(on) {
  if (dragon.down) { toast("the dragon is too hurt to move"); return; }
  if (dragon.tr || on === dragon.air) return;
  if (!on) {
    if (!dragonGround(dragon.x, dragon.y + 18)) {
      toast("nowhere to set down here");
      return;
    }
    dragon.air = false;
    startTransition("down", false);
    toast("the dragon comes down beside him");
  } else {
    startTransition("up", true);
    toast("the dragon takes to the air");
  }
}
const DRAGON_ANIM = { idle: 3.5, walk: 6, fly: 3, tr: 15,
                      stride: 10, go: 12, hold: 0.18 };
function dragonFlip(dir) {
  return dir === "w" && !SPR["dr5_idle_w"];
}
const DRAGON_DRAW_SCALE = 0.42;
const KING_DRAGON_DRAW_SCALE = DRAGON_DRAW_SCALE * 1.25;
/* Death source frames are 128px rather than the living sheet's 176px cells.
   Normalize them so the collapse does not make the boss visibly shrink. */
const KING_DRAGON_DEATH_DRAW_SCALE = KING_DRAGON_DRAW_SCALE * (176 / 128);
function dragonSprite(dir) {
  dir=cardinalDirection(dir);
  if (dir === "w" && !SPR["dr5_idle_w"]) dir = "e";
  if (!dragonReady) return SPR["dr3_" + dir] || SPR["dr3_s"];
  if (dragon.down) return SPR["dr5_idle_" + dir] || SPR["dr3_" + dir] || SPR["dr3_s"];
  if (dragon.tr) {
    const sp = SPR["dr5_" + dragon.tr.kind + "_" + dir];
    if (sp) return sp;
  }
  const firing = !!breath;
  if (dragon.air && !firing && !dragon.moving && SPR["dr5_hover_"+dir]) return SPR["dr5_hover_"+dir];
  if (dragon.air)
    return (firing && SPR["drf_fire_" + dir]) || SPR["drf_" + dir]
           || SPR["dr3_" + dir] || SPR["dr3_s"];
  if (firing && SPR["dr5_fire_" + dir]) return SPR["dr5_fire_" + dir];
  const kind = !dragon.moving ? "idle"
             : (typeof running !== "undefined" && running && SPR["dr5_run_" + dir])
               ? "run" : "walk";
  return SPR["dr5_" + kind + "_" + dir] || SPR["dr3_" + dir] || SPR["dr3_s"];
}
function dragonFps() {
  if (dragon.tr) return DRAGON_ANIM.tr;
  if (dragon.air)
    return (dragon.dir === "e" || dragon.dir === "w")
      ? DRAGON_ANIM.fly * 0.6 : DRAGON_ANIM.fly;
  return dragon.moving ? DRAGON_ANIM.walk : DRAGON_ANIM.idle;
}
function noteDragonMotion(px, py, dt) {
  const v = Math.hypot(dragon.x - px, dragon.y - py) / Math.max(dt, 1e-4);
  if (v > DRAGON_ANIM.go) dragon.fly = DRAGON_ANIM.hold;
  else if (dragon.fly > 0) dragon.fly -= dt;
  dragon.moving = dragon.fly > 0;
  if (!dragonAirborne()) dragon.gait += Math.hypot(dragon.x - px, dragon.y - py);
}
let hunt = null, dragonCombatPause = 0, dragonRecall = false, dragonRecallT = 0;
let dragonBossClaws = 0, dragonBreak = null;
let kingShield = null;
function moveDragonSafe(dx, dy) {
  const distance = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(distance / 4));
  const sx = dx / steps, sy = dy / steps;
  for (let i = 0; i < steps; i++) {
    const nx = Math.max(8, Math.min(PXW - 8, dragon.x + sx));
    const ny = Math.max(12, Math.min(PXH - 8, dragon.y + sy));
    let moved = false;
    if (dragonCanStand(nx, dragon.y)) { dragon.x = nx; moved = true; }
    if (dragonCanStand(dragon.x, ny)) { dragon.y = ny; moved = true; }
    if (!moved) break;
  }
}
const CLAW_GND = {"n":[0.4915,-0.2154],"e":[1.0715,0.5702],"s":[0.4801,1.3534],"w":[-0.0694,0.4814]};
const CLAW_AIR = {"n":[0.4323,-0.2469],"e":[1.0284,0.5562],"s":[0.4587,1.3284],"w":[-0.0339,0.5755]};
const CLAW_REACH = 92;
const CLAW = { every: 2.20, dmg: 0.5, life: 0.42, back: 0.80 };
let claw = null, clawT = 0, linger = 0;
function stepClaw(dt) {
  if (bossScene) return;
  if (!claw) return;
  claw.t += dt;
  if (claw.t > CLAW.life) claw = null;
}
function kingFight() { return MAPID === "cinderhold"; }
function drawClaw() {
  if (!claw) return;
  const diag = claw.dir.length===2;
  const s2 = SPR["claw_" + (diag ? "e" : claw.dir)];
  if (diag && s2) {
    const [vx,vy]=directionVector(claw.dir),fr=Math.min(s2[4]-1,Math.floor(claw.t/CLAW.life*s2[4]));
    ctx.save();ctx.translate(claw.x+vx*23,claw.y-12+vy*23);ctx.rotate(Math.atan2(vy,vx));
    drawGameImage(ctx,atlasImg,s2[0]+fr*s2[2],s2[1],s2[2],s2[3],0,-s2[3]/2,s2[2],s2[3]);ctx.restore();return;
  }
  if (!s2) return;
  const f = Math.min(s2[4] - 1, Math.floor(claw.t / CLAW.life * s2[4]));
  const cs = dragonSprite(claw.dir) || SPR["dr5_idle_s"];
  const ct = (dragonAirborne() ? CLAW_AIR : CLAW_GND)[claw.dir]
          || CLAW_GND.s;
  const DS = DRAGON_DRAW_SCALE;
  const fx = dragonFlip(claw.dir) ? -1 : 1;
  const cx = (-cs[2] / 2 + cs[2] * ct[0]) * DS * fx;
  const cy = (-cs[3] + cs[3] * ct[1]) * DS;
  const ox = cx + (claw.dir === "e" ? 0 : claw.dir === "w" ? -s2[2] : -s2[2] / 2);
  const oy = cy + (claw.dir === "n" ? -s2[3] : claw.dir === "s" ? 0 : -s2[3] / 2);
  const chue = kingFight() ? BREATH_HUE.kingclaw : null;
  if (!chue) {
    drawGameImage(ctx, atlasImg, s2[0] + f * s2[2], s2[1], s2[2], s2[3],
                  Math.round(claw.x + ox), Math.round(claw.y + oy), s2[2], s2[3]);
  } else {
    if (!drawClaw._cv) drawClaw._cv = document.createElement("canvas");
    const cc = drawClaw._cv;
    if (cc.width !== s2[2] || cc.height !== s2[3]) { cc.width = s2[2]; cc.height = s2[3]; }
    const cg = cc.getContext("2d");
    cg.clearRect(0, 0, s2[2], s2[3]);
    cg.imageSmoothingEnabled = false;
    drawGameImage(cg, atlasImg, s2[0] + f * s2[2], s2[1], s2[2], s2[3], 0, 0, s2[2], s2[3]);
    cg.globalCompositeOperation = "source-atop";
    cg.fillStyle = chue; cg.globalAlpha = 0.72;
    cg.fillRect(0, 0, s2[2], s2[3]);
    cg.globalAlpha = 1; cg.globalCompositeOperation = "source-over";
    drawGameImage(ctx, cc, Math.round(claw.x + ox), Math.round(claw.y + oy));
  }
}
function stepDragon(dt) {
  if (bossScene) return;
  if (dragon.revive > 0) {
    dragon.revive = Math.max(0, dragon.revive - dt);
    if (dragon.revive === 0) { dragon.down = dragon.hp <= 0; dragon.inv = 1.2; }
  }
  if (!(dragonHere() && dragon.on)) return;
  dragon.t += dt;
  if (dragon.hurt > 0) dragon.hurt -= dt;
  if (dragon.inv > 0) dragon.inv -= dt;
  if (dragon.knockdown > 0) {
    dragon.knockdown = Math.max(0, dragon.knockdown - dt);
    dragon.moving = false; dragon.tr = null; breath = null; claw = null;
    return;
  }
  if (dragon.down) {
    dragon.moving = false; dragon.tr = null;
    return;
  }
  if (mounted) {
    dragon.x=P.x; dragon.y=P.y;
    /* Keep the dragon facing its boss target throughout the breath wind-up. */
    if (!(hunt && hunt.kingBreath)) dragon.dir=playerFacing4();
    dragon.moving=P.moving; stepTransition(dt); return;
  }
  stepTransition(dt);
  if (dragon.tr) return;
  if (breath) { dragon.moving = false; return; }
  if (dragon.placed !== MAPID) {
    dragon.placed = MAPID;
    if (dragon.air) { if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; } }
    else if (!dragonGround(P.x - 24, P.y)) {
      dragon.air = true; if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; }
      refreshWingBtn();
    }
  }
  /* During the king-dragon phase, Corin taking off is an explicit recall:
     she breaks from the boss and catches him instead of crowding its claws. */
  const kingFoe = lastFight && MAPID === "cinderhold" &&
    foes.find(f => (f.kind === "kdragon" || f.kind === "lich") && f.st !== "dead");
  /* Use a hysteresis band: retreat starts well away from the king and stays
     active until Corin deliberately comes back. This prevents ping-ponging. */
  if (!kingFoe) {
    dragonRecall = false; dragonRecallT = 0;
    dragonBossClaws = 0; dragonBreak = null;
  }
  else {
    const corinKingD = Math.hypot(P.x - kingFoe.x, P.y - kingFoe.y);
    if (!dragonRecall && corinKingD > 132) { dragonRecall = true; dragonRecallT = 15; }
    if (dragonRecall && dragonRecallT > 0) dragonRecallT = Math.max(0, dragonRecallT - dt);
    else if (dragonRecall && corinKingD < 88) dragonRecall = false;
  }
  if (dragonRecall) {
    hunt = null; linger = 0; claw = null; clawT = 0;
    const dx = P.x - dragon.x, dy = (P.y - dragonHover()) - dragon.y;
    const d = Math.hypot(dx, dy) || 1;
    dragon.dir = direction4(dx, dy, dragon.dir);
    dragonStep((dx / d) * Math.min(210, 72 + (d - 42) * 2.2) * dt,
               (dy / d) * Math.min(210, 72 + (d - 42) * 2.2) * dt);
    return;
  }
  /* The companion should not glue itself to a boss indefinitely.  After a
     short claw string it deliberately disengages, opens a visible gap, then
     returns to the fight. */
  if (dragonBreak) {
    const f = dragonBreak.foe;
    dragonBreak.t = Math.max(0, dragonBreak.t - dt);
    if (!f || f.st === "dead") dragonBreak = null;
    else {
      const dx = dragon.x - f.x, dy = dragon.y - f.y;
      const d = Math.hypot(dx, dy) || 1;
      dragon.dir = direction4(dx, dy, dragon.dir);
      if (d < 112 || dragonBreak.t > .35) {
        const sp = dragonAirborne() ? 150 : 112;
        moveDragonSafe((dx / d) * sp * dt, (dy / d) * sp * dt);
      } else dragon.moving = false;
      if (dragonBreak.t <= 0 && d >= 96) dragonBreak = null;
      if (dragonBreak) return;
    }
  }
  if (hunt) return;      /* it is off hunting; following him can wait */
  let far = null, fd2 = -1;
  if (!foesHeld && !devDragonPassive && dragonCombatPause <= 0) {
    for (const f of foes) {
      if (f.st === "dead" || f.ally || f.storyPassive) continue;
      const dx = f.x - P.x, dy = f.y - P.y, d2 = dx * dx + dy * dy;
      if (d2 < 16900 && d2 > fd2) { fd2 = d2; far = f; }
    }
  }
  if (!far && linger > 0) { linger -= dt; return; }
  if (far) {
    linger = 1.4;              /* it will hang here a moment once they are down */
    const tx = far.x, ty = far.y - 22;
    const dx = tx - dragon.x, dy = ty - dragon.y;
    const d = Math.hypot(dx, dy);
    dragon.dir = direction4(dx,dy,dragon.dir);
    if (d > CLAW_REACH * 0.4) {
      const sp = Math.min(210, 60 + d * 2.2) * (dragonAirborne() ? 1 : 0.72);
      dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    } else {
      if (typeof mounted !== "undefined" && mounted) { clawT = 0; }
      else { clawT -= dt; }
      if (clawT <= 0 && !(typeof mounted !== "undefined" && mounted)) {
        clawT = CLAW.every;
        claw = { dir: dragon.dir, t: 0, x: dragon.x, y: dragon.y - 8 };
        const in_ = Math.hypot(far.x - dragon.x, far.y - dragon.y) || 1;
        dragonStep(((far.x - dragon.x) / in_) * 9, ((far.y - dragon.y) / in_) * 9);
        if ((far.kind === "kdragon" || far.kind === "lich") && far.swordGuard > 0) {
          kingDeflect(far, dragon);
        } else {
          far.hp -= CLAW.dmg;
          far.hurt = 0.25;
          if (far.kind === "kdragon" && ++dragonBossClaws % 2 === 0) {
            dragonBreak = { foe: far, t: 1.35 };
            dragonCombatPause = Math.max(dragonCombatPause, 1.35);
          }
        }
        if (far.hp <= 0) { far.st = "dead"; far.t = 0; if (!far.storyKnight) dropGold(far.x, far.y, far.kind); markBossGone(far); }
      } else if (clawT > CLAW.every - CLAW.back) {
        const away = Math.hypot(dragon.x - far.x, dragon.y - far.y) || 1;
        dragonStep(((dragon.x - far.x) / away) * 44 * dt,
                   ((dragon.y - far.y) / away) * 44 * dt);
      }
    }
    return;
  }
  const want = 34;
  const dx = P.x - dragon.x, dy = (P.y - dragonHover()) - dragon.y;
  const d = Math.hypot(dx, dy);
  if (d > (dragonAirborne() ? 400 : 210)) {
    if (dragonAirborne()) { if (!breath) { dragon.x = P.x - 24; dragon.y = P.y - 26; } }
    else dragonGround(P.x - 24, P.y);
    return;
  }
  if (d > want) {
    const cap = dragonAirborne() ? 190 : (d > 90 ? 190 : 132);
    const sp = dragonAirborne() ? Math.min(cap, 40 + (d - want) * 2.4)
                                : Math.min(cap, 34 + (d - want) * 1.9);
    dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    dragon.dir = direction4(dx,dy,dragon.dir);
  }
}
function dragonHealTint(){return dragon.healPulse>0?Math.sin((1-dragon.healPulse)*Math.PI*3)**2*.72:0;}
function drawDragon() {
  if (!(dragonHere() && dragon.on)) return;
  if (dragon.down || dragon.knockdown > 0) {
    const cellW = 121, cellH = 73;
    const west = dragon.faintDir === "w";
    if (!drawDragon.faintCanvas) drawDragon.faintCanvas = document.createElement("canvas");
    const c = drawDragon.faintCanvas;
    if (c.width !== cellW || c.height !== cellH) { c.width = cellW; c.height = cellH; }
    const g = c.getContext("2d");
    g.clearRect(0, 0, cellW, cellH); g.imageSmoothingEnabled = false;
    drawGameImage(g, faintDragonImg, west ? cellW : 0, 0, cellW, cellH, 0, 0, cellW, cellH);
    if (dragon.down) {
      const recovering = dragon.revive > 0;
      const pulse = 0.18 + (Math.sin(dragon.t * (recovering ? 12 : 6)) + 1) * 0.14;
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = pulse;
      g.fillStyle = recovering ? "#44ef72" : "#ff3038";
      g.fillRect(0, 0, cellW, cellH);
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    }
    if(dragon.healPulse>0){g.globalCompositeOperation='source-atop';g.globalAlpha=dragonHealTint();g.fillStyle='#52ff78';g.fillRect(0,0,cellW,cellH);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    const DS = DRAGON_DRAW_SCALE, w = Math.round(cellW * DS), h = Math.round(cellH * DS);
    const dx = Math.round(dragon.x - w / 2), dy = Math.round(dragon.y - h);
    ctx.globalAlpha = 0.32; ctx.fillStyle = "#000"; ctx.beginPath();
    ctx.ellipse(Math.round(dragon.x), Math.round(dragon.y), 20, 3, 0, 0, 6.284); ctx.fill();
    ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    drawGameImage(ctx, c, dx, dy, w, h);
    ctx.imageSmoothingEnabled = false;
    return;
  }
  const s2 = dragonSprite(dragon.dir);
  if (!s2) return;
  const walking = !dragon.air && !dragon.tr && dragon.moving;
  const f = dragon.tr
    ? Math.min(s2[4] - 1, Math.floor(dragon.tr.t))
    : walking
      ? Math.floor(dragon.gait / DRAGON_ANIM.stride * s2[4] / 5) % s2[4]
      : Math.floor(dragon.t * dragonFps() * s2[4] / 5) % s2[4];
  const bob = dragonBob();
  const DS = DRAGON_DRAW_SCALE;
  const w2d = Math.round(s2[2] * DS), h2d = Math.round(s2[3] * DS);
  const dx = Math.round(dragon.x - w2d / 2), dy = Math.round(dragon.y - h2d + bob);
  ctx.globalAlpha = dragonAirborne() ? 0.22 : 0.34;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(Math.round(dragon.x), Math.round(dragon.y + (dragonAirborne() ? 10 : 1)),
              dragonAirborne() ? Math.max(7, w2d * 0.28) : Math.max(6, w2d * 0.2),
              dragonAirborne() ? 4 : 2.5, 0, 0, 6.284);
  ctx.fill();
  ctx.globalAlpha = 1;
  // Draw from the original sheet in one pass. The old scaled-frame cache caused
  // a second canvas resample that softened the dragon's outlines and details.
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const healing=dragon.healPulse>0;
  const src=healing?tintFoe(s2,f,'#52ff78',dragonHealTint()):sheetOf(s2);
  const sx=healing?0:s2[0]+f*s2[2],sy=healing?0:s2[1];
  if (dragonFlip(dragon.dir)) {
    ctx.translate(dx + w2d, dy); ctx.scale(-1, 1);
    drawGameImage(ctx, src, sx, sy, s2[2], s2[3],
                  0, 0, w2d, h2d);
  } else {
    drawGameImage(ctx, src, sx, sy, s2[2], s2[3],
                  dx, dy, w2d, h2d);
  }
  ctx.restore();
}

const GREEN = { map: "world", tx: 30, ty: 19, fps: 7, scale: 1 };
let greenPhase = "off", greenT = -1, greenP = 0, greenGone = false;
const GREEN_IN = 2.5, GREEN_CRASH = 1.1, GREEN_RISE = 0.9, GREEN_DEPART = 1.3;
function greenFly(dt) {
  if (quest !== Q.ARMED || MAPID !== GREEN.map) {
    greenPhase = "off"; greenT = -1; greenP = 0; greenGone = false; return;
  }
  const g = greenAt();
  const d = Math.hypot(P.x - g.x, P.y - g.y) / TS;
  if (greenPhase === "off" && d < 18) { greenPhase = "in"; greenP = 0; greenT = 0; }
  if (greenPhase === "in") {
    greenP += dt / GREEN_IN;
    greenT = Math.min(1, greenP);
    if (greenP >= 1) { greenPhase = "crash"; greenP = 0; shake = 1; }
  } else if (greenPhase === "crash") {
    greenP += dt / GREEN_CRASH;
    if (greenP >= 1) { greenPhase = "sit"; greenP = 0; }
  } else if (greenPhase === "sit") {
    greenP += dt;
    if (greenGone) { greenPhase = "rise"; greenP = 0; }
  } else if (greenPhase === "rise") {
    greenP += dt / GREEN_RISE;
    /* The dusty lift happens at the stump. Only then switch to the clean
       overhead flight frames, so the dirt never travels with the dragon. */
    if (greenP >= 1) { greenPhase = "depart"; greenP = 0; }
  } else if (greenPhase === "depart") {
    greenP += dt / GREEN_DEPART;
    if (greenP >= 1) { greenPhase = "gone"; greenT = 2; }
  }
}
function greenOffset() {
  if (greenPhase === "off") return null;
  if (greenPhase === "in") {
    const k = 1 - greenT;                        /* 1 far away .. 0 over the spot */
    return [300 * k, -150 * k];
  }
  if (greenPhase === "depart") {
    const k = greenP;
    return [-330 * k, -230 * k * k];             /* normal flying frames leave the field */
  }
  if (greenPhase === "gone") return [-330, -230];
  return [0, 0];
}
function followCam() {
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  if (shake > 0) {
    const k = shake * shake * 26 / cam.z;
    const ring = Math.sin(shake * 46) * 0.8 + (Math.random() * 2 - 1) * 0.4;
    cam.x += ring * k * 0.6;
    cam.y += (Math.cos(shake * 39) * 0.9 + (Math.random() * 2 - 1) * 0.3) * k;
  }
}
function greenInView() {
  const g = greenAt();
  const vw = cv.width / cam.z, vh = cv.height / cam.z;
  const mx = vw * 0.2, my = vh * 0.2;
  return g.x > cam.x + mx && g.x < cam.x + vw - mx &&
         g.y > cam.y + my && g.y < cam.y + vh - my;
}
function greenAt() {
  return { x: GREEN.tx * TS + TS / 2, y: GREEN.ty * TS + TS };
}

const Q = { ABED: 0, ERRAND: 1, EGGS: 2, KING: 3, ELDER: 4, NOISE: 5,
            ARMED: 6, FLED: 7, CARRY: 8, DONE: 9 };
let quest = Q.ABED;
const hasSword = () => quest >= Q.ARMED;
let smithUpgrade = false;
let glassShield = false, glassShieldHeld = false, glassShieldPulse = 0;
const GLASS_BLOCK_WINDOW = .552;
// Universal enemy/boss telegraph duration: every orange/red attack gives the same timing window.
const GLASS_TELEGRAPH_WINDOW = GLASS_BLOCK_WINDOW;
let glassShieldWindowUntil = -1;
const corinKit = () => !hasSword() ? "corin_bare_" : smithUpgrade ? "corin_armor_" : "corin_sword_";
const corinSheet = () => mounted ? smImg : atlasImg;
const corinFeetOffset = () => mounted ? 0 : 64 - 44;

const hasDragon = () => quest >= Q.DONE;
let bridgeCleared = false;
function clearBridge() {
  if (quest < Q.DONE || MAPID !== "world") return;
  const fisher = npcs.find(x => (x.n || "") === "Odo");
  if (!fisher || fisher.odoAtHome) return;
  bridgeCleared = true;
  // No walking sheet: relocate directly beside his fishing-house entrance.
  fisher.x=664;fisher.y=6888;fisher.home=[fisher.x,fisher.y];
  fisher.goto=null;fisher.patrol=null;fisher.stationary=true;fisher.packWalk=false;
  fisher.f='d';fisher.flip=false;fisher.odoAtHome=true;
}
const indoors = () => /^house/.test(MAPID);
const dragonHere = () => !dragonOff && hasDragon() && !indoors();

let scene = null;
let walker = null;
let warnedNorth = false;
const MAD_DOOR = [54 * 16 + 8, 373 * 16 + 8];
const MAD_DOOR_TILE = [54, 373];
const ELDER_WELL = [48, 373];

const ODO_BRIDGE = { x0: 45, x1: 49, y0: 432, y1: 435 };
let odoSaid = 0, odoNearBridge = false;
function odoBlocks() {
  return !hasDragon();
}
function odoShuts(x, y) {
  if (!odoBlocks() || MAPID !== "world") return false;
  const fisher = npcs.find(m => (m.n || "") === "Odo");
  const from = fisher ? Math.floor(fisher.x / TS) : ODO_BRIDGE.x0;
  return x >= from && x <= ODO_BRIDGE.x1 &&
         y >= ODO_BRIDGE.y0 && y <= ODO_BRIDGE.y1;
}

function odoTurnsYouBack() {
  if (!odoBlocks() || MAPID !== "world" || scene) return false;
  const tx = P.x / TS, ty = (P.y - 1) / TS;
  const fisher0 = npcs.find(m => (m.n || "") === "Odo");
  const hx = fisher0 ? fisher0.x / TS : 47;
  const near = tx > hx - 2.2 && tx < ODO_BRIDGE.x1 + 1.6 &&
               ty > ODO_BRIDGE.y0 - 0.5 && ty < ODO_BRIDGE.y1 + 0.5;
  if (!near) return false;
  const fisher = npcs.find(m => (m.n || "") === "Odo");
  if (!fisher) return false;
  if (!odoSaid) {
    odoSaid = 1;
    faceToward(fisher, P.x, P.y);
    playScene([
      "Odo: Not now, lad. I am going to catch a big one.",
    ]);
  }
  return true;
}

const BIRDS = [];
let birdsUp = 0;                 /* 0 sitting, then counts up as they climb */
function placeBirds() {
  BIRDS.length = 0;
  if (quest < Q.ARMED) birdsUp = 0;
  if (MAPID !== "world") return;
  let seed = 20260901;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const perch = (tx, ty, side) => {
    if (tx < 2 || tx >= MW - 2) return;
    if (!isSolid(tx * TS + 8, ty * TS + 8)) return;   /* a tree to sit in */
    BIRDS.push({ x: tx * TS + 8, y: ty * TS + 4,
                 t: rnd() * 10, nest: rnd() < 0.35,
                 vx: (side || 1) * (26 + rnd() * 22), vy: -34 - rnd() * 26 });
  };
  for (const [ptx, pty] of [[26, 373], [26, 372], [25, 374], [26, 376],
                            [34, 370], [33, 370]])
    if (!BIRDS.length) perch(ptx, pty, -1);
  if (BIRDS.length) BIRDS[0].nest = true;

  for (let k = 0; k < 3; k++) {
    const tx = 36 + k * 2, ty = 371;
    if (tx < 2 || tx >= MW - 2) continue;
    if (isSolid(tx * TS + 8, ty * TS + 14)) continue;
    if (isSolid(tx * TS + 8, ty * TS + 24)) continue;
    if (isSolid(tx * TS - 8, ty * TS + 14)) continue;
    if (isSolid(tx * TS + 24, ty * TS + 14)) continue;
    BIRDS.push({ x: tx * TS + 8, y: ty * TS + 14, ground: 1,
                 hx: tx * TS + 8, hy: ty * TS + 14, wob: rnd() * 6.3,
                 t: rnd() * 10, nest: false,
                 vx: (rnd() < 0.5 ? -1 : 1) * (26 + rnd() * 22),
                 vy: -34 - rnd() * 26 });
  }
}
let shake = 0;
function scatterBirds() {
  if (!birdsUp) birdsUp = 0.0001;
  shake = 1;
}
function stepShake(dt) { if (shake > 0) shake = Math.max(0, shake - dt / 1.1); }
function stepBirds(dt) {
  if (MAPID !== "world") return;
  if (!birdsUp) {
    for (const b of BIRDS) {
      if (!b.ground) continue;
      b.wob += dt * 0.7;
      b.x = b.hx + Math.cos(b.wob) * 14;
      b.y = b.hy + Math.sin(b.wob * 0.6) * 7;
      b.vx = Math.cos(b.wob) < 0 ? -Math.abs(b.vx) : Math.abs(b.vx);
    }
    return;
  }
  birdsUp += dt;
  for (const b of BIRDS) { b.x += b.vx * dt; b.y += b.vy * dt; }
}
const HATCH_LINES = [
      "Maddock: You were gone longer than an egg errand ought to take.",
      "Corin: Maddock, I found something in the north field.",
      "Maddock: Let me see it. ...Corin, that is no hen's egg.",
      "Maddock: Put it down. Slowly.",
      "Maddock: That is a dragon's egg. There hasn't been one in Emberfell for fifty years.",
      "The egg moves.",
      "It shakes again -- harder.",
      "The shell splits. A hatchling pushes free.",
      "The hatchling turns to Maddock.",
      "Then it turns to Corin and crosses the space between them.",
      "A smooth stone lies in the broken shell. It glows as Corin lifts it.",
      "Corin: Why did it come to me?",
      "Maddock: Dragonriders didn't choose their dragons. The dragons chose them.",
      "Maddock: Halvard will never let you keep her. If you mean to protect her, you will have to overthrow him.",
      "Corin: Overthrow the king? Maddock, I am a miller's son.",
      "Maddock: And she chose you. Leave Halvard on the throne and he will take her -- or kill you both.",
      "Corin: I don't know if I can do this.",
      "Maddock: You do not need to know yet. You only need to decide whether you will try.",
      "Corin: ...All right. I will.",
      "Maddock: Forgewick is the closest of the old rider temples from before Wingfall. If that stone has answers, I would start there.",
];

let hatchScene = null;
let hatchExit = false;
let hatchCamera = null;
let deflectCamera = null;
function cameraOwnsView() { return !!hatchCamera || !!bossScene || !!deflectCamera || !!fishing; }
function stepDeflectCamera(dt) {
  const c = deflectCamera;
  if (!c) return;
  if (MAPID !== c.map || hatchCamera || bossScene) { deflectCamera = null; return; }
  // Track the shove throughout the fall instead of freezing until P.act ends.
  cam.z = c.zoom;
  const x = P.x - VW / cam.z / 2, y = P.y - VH / cam.z / 2;
  const ease = 1 - Math.exp(-9 * dt);
  cam.x += (x - cam.x) * ease; cam.y += (y - cam.y) * ease;
  const settled = Math.hypot(cam.x - x, cam.y - y) < .05;
  clampCam();
  c.t += dt;
  if ((!P.act || P.act.kind !== "fall") && (settled || c.t > 2)) deflectCamera = null;
}
function lockHatchCamera(c, m, hs) {
  /* Establish one composition for the whole dialogue.  Re-measuring the cast
     every time A advances a line made the camera visibly tug against itself. */
  const pts = [[P.x,P.y],[hs.eggX,hs.eggY],[hs.dragonX,hs.dragonY]];
  if (m) pts.push([m.x,m.y]);
  const left = Math.min(...pts.map(p=>p[0]))-72;
  const right = Math.max(...pts.map(p=>p[0]))+72;
  const top = Math.min(...pts.map(p=>p[1]))-92;
  const bottom = Math.max(...pts.map(p=>p[1]))+42;
  const z = Math.min(c.zoom*.85, VW*.88/(right-left), VH*.65/(bottom-top));
  return { x:(left+right)/2, y:(top+bottom)/2 + VH*.1/z, z };
}
function stepHatchCamera(dt) {
  const c = hatchCamera;
  if (!c) return;
  if (MAPID !== "world") {
    cam.z = c.zoom; camFree = false; hatchCamera = null; return;
  }
  const m = elder();
  let x = P.x, y = P.y, z = c.zoom;
  if (hatchScene) {
    c.goal ||= lockHatchCamera(c, m, hatchScene);
    ({ x, y, z } = c.goal);
  } else if (hatchExit && m && !m.away) {
    x = m.x; y = m.y-16; z = c.zoom*0.85;
  } else {
    c.returnT += dt;
  }
  const ease = 1-Math.exp(-5*dt);
  cam.z += (z-cam.z)*ease;
  cam.x += (x-VW/cam.z/2-cam.x)*ease;
  cam.y += (y-VH/cam.z/2-cam.y)*ease;
  clampCam();
  if (c.returnT >= 1.2) {
    cam.z = c.zoom; camFree = false; hatchCamera = null;
  }
}
function beginHatchScene(m) {
  hatchCamera = { zoom: cam.z, returnT: 0 };
  camFree = true;
  const dx = P.x - m.x, dy = P.y - m.y;
  const sx = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx || 1) * TS : 0;
  const sy = sx ? 0 : Math.sign(dy || 1) * TS;
  if (canStand(P.x + sx, P.y + sy)) { P.x += sx; P.y += sy; }
  const ex = P.x + (m.x - P.x) * 0.3, ey = P.y + (m.y - P.y) * 0.3;
  // Keep the egg's landing spot fixed while Corin backs away one more tile.
  for (let step = 0; step < 4; step++) {
    if (!canStand(P.x + sx / 4, P.y + sy / 4)) break;
    P.x += sx / 4; P.y += sy / 4;
  }
  hatchScene = { x: ex, y: ey - 18, eggX: ex, eggY: ey,
                 stage: 0, t: 0, dragonX: ex, dragonY: ey,
                 dir: "s", spread: false, spreadT: 0, stoneShown: false,
                 approachDone: false, turnStage: -1 };
  faceCorinAt(ex, ey);
  faceToward(m, ex, ey);
  dragon.on = false;
  playScene(HATCH_LINES, { who: "Maddock", hatch: true, stay: true, after: finishHatchScene });
  m.goto = null;
}
function stepHatchScene(dt) {
  if (!hatchScene || !scene || !scene.hatch) return;
  hatchScene.stage = scene.i;
  hatchScene.t = scene.t;
  if (scene.i < 3) {
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = hatchScene.eggY - 18;
  } else if (scene.i === 3) {
    const u0 = Math.max(0, Math.min(1, (scene.t - 0.12) / 0.48));
    const u = u0 * u0 * (3 - 2 * u0);
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = (hatchScene.eggY - 18) + 18 * u;
  } else {
    hatchScene.x = hatchScene.eggX;
    hatchScene.y = hatchScene.eggY;
  }
  const m = elder();
  if (scene.i >= 7 && !hatchScene.spread && m) {
    hatchScene.spread = true;
    hatchScene.spreadT = 0;
    const pdx = P.x - hatchScene.x, pdy = P.y - hatchScene.y;
    const pd = Math.max(1, Math.hypot(pdx, pdy));
    const mdx = m.x - hatchScene.x, mdy = m.y - hatchScene.y;
    const md = Math.max(1, Math.hypot(mdx, mdy));
    hatchScene.p0 = [P.x, P.y]; hatchScene.m0 = [m.x, m.y];
    hatchScene.p1 = standableNear(hatchScene.x + pdx / pd * TS * 2.5,
                                  hatchScene.y + pdy / pd * TS * 2.5);
    hatchScene.m1 = standableNear(hatchScene.x + mdx / md * TS * 2.5,
                                  hatchScene.y + mdy / md * TS * 2.5);
    m.goto = null;
  }
  if (hatchScene.spread && hatchScene.spreadT < 1 && m) {
    hatchScene.spreadT = Math.min(1, hatchScene.spreadT + dt / 0.45);
    const u = hatchScene.spreadT * hatchScene.spreadT * (3 - 2 * hatchScene.spreadT);
    P.x = hatchScene.p0[0] + (hatchScene.p1[0] - hatchScene.p0[0]) * u;
    P.y = hatchScene.p0[1] + (hatchScene.p1[1] - hatchScene.p0[1]) * u;
    m.x = hatchScene.m0[0] + (hatchScene.m1[0] - hatchScene.m0[0]) * u;
    m.y = hatchScene.m0[1] + (hatchScene.m1[1] - hatchScene.m0[1]) * u;
    faceCorinAt(hatchScene.x, hatchScene.y);
    faceToward(m, hatchScene.x, hatchScene.y);
    if (hatchScene.spreadT === 1) rebuildSolid();
  }
  if (scene.i === 10 && !hatchScene.stoneShown) {
    hatchScene.stoneShown = true;
    showReveal(SPR.it_hs_flame ? "it_hs_flame" : "it_egg",
               "Corin obtained a mysterious stone", 3);
  }
  if (scene.i >= 8) {
    const lookAt = scene.i === 8 && m ? m : P;
    const targetDir = Math.abs(lookAt.x - hatchScene.dragonX) > Math.abs(lookAt.y - hatchScene.dragonY)
      ? (lookAt.x > hatchScene.dragonX ? "e" : "w")
      : (lookAt.y > hatchScene.dragonY ? "s" : "n");
    if (scene.i === 8 && hatchScene.turnStage !== 8) {
      hatchScene.turnStage = 8;
      /* Guarantee a visible first turn even when the hatch pose already
         happens to face Maddock. */
      hatchScene.dir = targetDir === "n" || targetDir === "s" ? "e" : "s";
    } else if (scene.i === 9 && hatchScene.turnStage !== 9) {
      hatchScene.turnStage = 9;
    }
    /* Let each new box appear, then make its matching turn a beat later. */
    if (scene.t >= 0.3)
      hatchScene.dir = targetDir;
    hatchScene.walking = false;
    if (scene.i === 9 && !hatchScene.chooseBack) {
      hatchScene.chooseBack = true;
      hatchScene.chooseBackT = 0;
      hatchScene.chooseP0 = [P.x,P.y];
      const dx=P.x-hatchScene.dragonX,dy=P.y-hatchScene.dragonY,d=Math.hypot(dx,dy)||1;
      const tx=P.x+dx/d*TS,ty=P.y+dy/d*TS;
      hatchScene.chooseP1=canStand(tx,ty)?[tx,ty]:[P.x,P.y];
    }
    if(scene.i===9&&hatchScene.chooseBackT<1){
      hatchScene.chooseBackT=Math.min(1,hatchScene.chooseBackT+dt/.42);
      const u=hatchScene.chooseBackT*hatchScene.chooseBackT*(3-2*hatchScene.chooseBackT);
      P.x=hatchScene.chooseP0[0]+(hatchScene.chooseP1[0]-hatchScene.chooseP0[0])*u;
      P.y=hatchScene.chooseP0[1]+(hatchScene.chooseP1[1]-hatchScene.chooseP0[1])*u;
      faceCorinAt(hatchScene.dragonX,hatchScene.dragonY);
    }
    if (scene.i >= 9 && scene.t > 0.75 &&
        (!hatchScene.chooseBack||hatchScene.chooseBackT>=1) && !hatchScene.approachDone) {
      if (!hatchScene.walkTarget) {
        const pdx = P.x - hatchScene.dragonX, pdy = P.y - hatchScene.dragonY;
        const pd = Math.hypot(pdx, pdy) || 1;
        // One tile from the hatchling toward Corin's actual position, from any side.
        hatchScene.walkTarget = [hatchScene.dragonX + pdx / pd * TS,
                                 hatchScene.dragonY + pdy / pd * TS];
        hatchScene.walkT = 0;
      }
      const [tx, ty] = hatchScene.walkTarget;
      const vx = tx - hatchScene.dragonX, vy = ty - hatchScene.dragonY;
      const vd = Math.hypot(vx, vy);
      const step = Math.min(vd, 20 * dt);
      hatchScene.walking = vd > 0;
      hatchScene.walkT += dt;
      if (vd <= step) {
        hatchScene.dragonX = tx; hatchScene.dragonY = ty;
        hatchScene.approachDone = true;
        hatchScene.walking = false;
      } else {
        hatchScene.dragonX += vx / vd * step;
        hatchScene.dragonY += vy / vd * step;
      }
    }
  }
}
function finishHatchScene() {
  quest = Q.DONE;
  dragon.on = true;
  dragon.x = hatchScene ? hatchScene.dragonX : P.x - 24;
  dragon.y = hatchScene ? hatchScene.dragonY : P.y - 26;
  hatchScene = null;
  toast("The dragon follows you now");
  hatchExit = !!elder();
  goBackIn(true);
}
function standableNear(x, y) {
  if (canStand(x, y)) return [x, y];
  for (let r = 1; r <= 12; r++)
    for (let a = 0; a < 16; a++) {
      const th = a * Math.PI / 8;
      const nx = x + Math.cos(th) * r * TS, ny = y + Math.sin(th) * r * TS;
      if (canStand(nx, ny)) return [nx, ny];
    }
  return [x, y];
}
function blockedRun(ax, ay, bx, by) {
  const steps = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / TS));
  let bad = 0;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (!canStand(ax + (bx - ax) * t, ay + (by - ay) * t)) bad++;
  }
  return bad / steps;
}

function doorRoute() {
  const d = Math.hypot(MAD_DOOR[0] - P.x, MAD_DOOR[1] - P.y) / TS;
  if (d > 12) return null;
  if (MAD_DOOR[0] < P.x) return null;      /* his door is east; never fetch him from the west */
  if (blockedRun(MAD_DOOR[0], MAD_DOOR[1], P.x, P.y) > 0.5) return null;
  return [MAD_DOOR[0], MAD_DOOR[1]];
}

function offStage() {
  const door = doorRoute();
  if (door) return door;
  const east = standableNear(cam.x + VW / cam.z + 30, P.y);
  if (east[0] > P.x + TS) return east;
  return standableNear(P.x + 14 * TS, P.y);
}
function offStageUnused() {
  return standableNear(cam.x + VW / cam.z + 40, P.y);
}
function elderOffScreen() {
  const e = elder();
  if (!e) return true;
  const vw = VW / cam.z, vh = VH / cam.z;
  return e.x < cam.x - 30 || e.x > cam.x + vw + 30 ||
         e.y < cam.y - 30 || e.y > cam.y + vh + 30;
}
function elder() { return npcs.find(x => (x.n || "") === "Elder Maddock"); }
let goingIn = false;
function comeOut(toX, toY) {
  const e = elder();
  if (!e) return null;
  const off = offStage();
  e.away = 0;
  e.x = off[0]; e.y = off[1];
  e.home = [MAD_DOOR[0], MAD_DOOR[1]];
  e.goto = [toX, toY];
  e.hurry = 1;
  goingIn = false;
  return e;
}
function elderArrived() {
  const e = elder();
  return !!e && !e.away && !e.goto;
}
function goBackIn(useHouseDoor) {
  const e = elder();
  if (!e) return;
  e.goto = useHouseDoor ? [MAD_DOOR[0], MAD_DOOR[1]] : (doorRoute() || offStage());
  e.hurry = 1;
  goingIn = true;
}
function stepElder() {
  if (!goingIn) return;
  const e = elder();
  if (!e) { goingIn = false; hatchExit = false; return; }
  if (e.goto) faceToward(e, e.goto[0], e.goto[1]);
  const atDoor = Math.hypot(e.x - MAD_DOOR[0], e.y - MAD_DOOR[1]) < (hatchExit ? 5 : TS);
  if (hatchExit && !atDoor) return;    /* follow him all the way to the doorway */
  if (e.goto && !elderOffScreen() && !atDoor) return;    /* still in shot */
  e.goto = null;
  e.x = MAD_DOOR[0]; e.y = MAD_DOOR[1];
  e.away = 1;
  goingIn = false;
  hatchExit = false;
}
function northShut() { return quest <= Q.ELDER && warnedNorth; }
let sayIsNarr = false;      /* which of the two boxes is on screen */
function speakerNamed(who) {
  if (!who) return null;
  return npcs.find(m => (m.n || "").toLowerCase().includes(who.toLowerCase()));
}
function faceToward(m, x, y) {
  if (m.stationary && !(m.desertNative && !m.packSpr)) { m.f = "d"; m.kf = "d"; m.flip = false; return; }
  const dx = x - m.x, dy = y - m.y;
  const sideways = Math.abs(dx) > Math.abs(dy);
  m.f = sideways ? "s" : (dy > 0 ? "d" : "u");
  m.flip = sideways && dx < 0;
  m.kf = sideways ? (dx > 0 ? "e" : "w") : m.f;
}
function npcHere(m) {
  if (wonAll && /King Halvard/.test(m.n || "")) return false;
  if (m.away) return false;
  if (m.when !== undefined && quest < m.when) return false;
  if (m.until !== undefined && quest >= m.until) return false;
  return true;
}

function beginHettieWalk(her) {
  if (her.hettieDeparted) return;
  her.hettieDeparted = true;
  her.stationary = false;
  her.home = [26 * TS + 8, 416 * TS + 16];
  her.goto = her.home.slice();
  her.patrol = [24, 415, 26, 416];
  her.patrolFrom = Q.KING;
  her.patrolRest = 7000;
  her.arrived = true;
}
function stepHettie() {
  if (MAPID !== "world" || quest < Q.KING || scene) return;
  const her = npcs.find(n => n.n === "Hettie");
  if (her) beginHettieWalk(her);
}

function stepWalkers(dt) {
  if(editing)return;
  if(scene && scene.who === "Hettie") { const her=npcs.find(n=>n.n==="Hettie"); if(her) faceToward(her,P.x,P.y); }
  stepHettie();
  stepThornwellWelcome(dt);
  for (const m of npcs) {
    if (m.stationary) {
      if (m.goto) {
        const visible = m.x > cam.x - 32 && m.x < cam.x + VW / cam.z + 32 &&
          m.y > cam.y - 48 && m.y < cam.y + VH / cam.z + 48;
        if (!visible) { m.x = m.goto[0]; m.y = m.goto[1]; m.goto = null; }
        else if (m.n === "Elder Maddock" && !fadeDir && !doorMotion && !pendingActorStage) {
          const target = m.goto.slice();
          pendingActorStage = () => { m.x = target[0]; m.y = target[1]; m.goto = null; };
          fadeDir = 1;
        }
      }
      continue;
    }
    if (bossScene && m === bossScene.k) continue;
    if (!m.goto) continue;
    const dx = m.goto[0] - m.x, dy = m.goto[1] - m.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) {
      m.x = m.goto[0]; m.y = m.goto[1]; m.goto = null;
      continue;
    }
    const onScreen = m.x > cam.x && m.x < cam.x + VW / cam.z &&
                     m.y > cam.y && m.y < cam.y + VH / cam.z;
    const sp = (m.hurry ? (onScreen ? 78 : 260) : (m.patrolSpeed || 44)) * dt;
    const guard = /^(King Halvard|Serjeant Bram|Doran|Tolan)$/
                    .test(m.n || "");
    const straight = [dx / d * Math.min(sp, d), dy / d * Math.min(sp, d)];
    if (!m.patrol && !canNpcStand(m.x, m.y,m)) {
      m.x += straight[0]; m.y += straight[1];
      faceToward(m, m.goto[0], m.goto[1]);
      continue;
    }
    const clear = (ax, ay) => !guard ||
      Math.hypot(m.x + ax - P.x, m.y + ay - P.y) > 11;
    const tryStep = (ax, ay) =>
      (canNpcStand(m.x + ax, m.y + ay,m) && clear(ax, ay)) ? [ax, ay] : null;
    const step = tryStep(straight[0], straight[1])
              || tryStep(0, straight[1])
              || tryStep(straight[0], 0)
              || tryStep(0, Math.sign(dy) * sp)
              || tryStep(Math.sign(dx) * sp, 0)
              || [0, 0];
    const wasX = m.x, wasY = m.y;
    m.x += step[0];
    m.y += step[1];
    if (Math.hypot(m.x - wasX, m.y - wasY) < 0.05) {
      m.stuck = (m.stuck || 0) + dt;
      if (m.stuck > 1.5 && !guard) {
        if (m.patrol) { m.goto = null; m.stuck = 0; }
        else {
          m.x = m.goto[0]; m.y = m.goto[1];
          m.goto = null; m.stuck = 0;
        }
        continue;
      }
    } else m.stuck = 0;
    // NPC collision reads these live coordinates; no static-grid rebuild is needed.
    faceToward(m, m.goto[0], m.goto[1]);
    continue;
    m.x += dx / d * Math.min(sp, d);
    m.y += dy / d * Math.min(sp, d);
    faceToward(m, m.goto[0], m.goto[1]);
  }
  if (walker && scene) faceToward(walker, P.x, P.y);
}

function faceCorinAt(x, y) {
  const dx = x - P.x, dy = y - P.y;
  P.dir8 = direction4(dx,dy,playerFacing4());
  if (Math.abs(dx) > Math.abs(dy)) { P.dir = "s"; P.flip = dx < 0; }
  else P.dir = dy > 0 ? "d" : "u";
}

function playScene(lines, opts) {
  scene = { lines, i: 0, t: 0, ...(opts || {}) };
  P.moving = false;
  if (!scene.hold) showScene();
  walker = speakerNamed(scene.who);
  if (walker) {
    faceCorinAt(walker.x, walker.y);
    const dx = walker.x - P.x, dy = walker.y - P.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    if (d > 46 && !walker.goto && !walker.stationary) {
      if (!walker.home) walker.home = [walker.x, walker.y];
      const px = -dy / d, py = dx / d;      /* perpendicular, unit length */
      const side = (walker.x >= P.x) ? 1 : -1;
      walker.goto = [P.x + dx / d * 20 + px * 22 * side,
                     P.y + dy / d * 20 + py * 22 * side];
    }
  }
}
function sendWalkerHome(stay) {
  if (walker && !walker.home) { walker = null; return; }
  if (walker && walker.home && !stay)
    walker.goto = [walker.home[0], walker.home[1]];
  if (walker) walker.goto = stay ? null : walker.goto;
  walker = null;
}
function sceneHold() { return !!scene || revealing || hatchExit || !!bossScene; }
function advanceScene() {
  if (revealing) { hideReveal(); return; }
  if (!scene) return;
  if (scene.hold) return;          /* it has not begun */
  if (!typeDone()) { typeAll(); return; }
  if (scene.t < 0.2) return;      /* no skipping on a stray tap */
  /* The hatchling's two turns are staged beats, not skippable text taps. */
  if (scene.hatch && scene.i === 8 && scene.t < 1.1) return;
  if (scene.hatch && scene.i === 9 &&
      (scene.t < 1.1 || !hatchScene || !hatchScene.approachDone)) return;
  scene.i++;
  scene.t = 0;
  if (scene.i < scene.lines.length) { showScene(); return; }
  if (scene.until && !scene.until()) { scene.waiting = true; showScene(); return; }
  const done = scene.after, scene0 = scene;
  scene = null;
  const stay = scene0 && scene0.stay;
  showScene();
  sendWalkerHome(stay);
  if (done) done();
}
const HERD_Y = 414;
let gateRow = 370, eggGate = -1, fieldGate = -1;
let eggWarned = false;
const NORTH_GATE = 370;
const KING_GATE_Y = 384;
const KNIGHT_LINE = 386;
const ROAD_MID = 30;
function inRoadBand() {
  return true;
}
function blockedByItem(x, y) {
  if (MAPID !== "world") return false;
  for (const it of ITEMS) {
    if (!it.solid || !itemHere(it)) continue;
    if (x === it.tx && y === it.ty) return true;
  }
  return false;
}

let guardsAside = false;
function blockedByGuard(x, y) {
  if (quest > Q.KING || MAPID !== "world" || guardsAside) return false;
  const g = guards();
  if (leavingNow) return false;                        /* on their way out */
  if (!g.length || g.some(m => m.goto)) return false;   /* standing aside */
  const my = Math.floor((g[0].y - 1) / TS);
  return y === my && x <= 120;
}
const GATE_X0 = 26, GATE_X1 = 33;
const HERD = [[28, "cow_graze"], [30, "cow"], [32, "cow_graze"]];
const herdHere = () => quest < Q.KING;
function blockedByHerd(x, y) {
  if (x > 120) return false;
  if (!herdHere() || MAPID !== "world" || y !== HERD_Y) return false;
  return true;
}

const ITEMS = [
  { key: "eggs",  spr: "nest2", tx: 11, ty: 430, at: Q.EGGS, gone: Q.KING,
    took: "Corin gathers the eggs" },
  { key: "paint", spr: "it_paint", map: "house22", tx: 7, ty: 3,
    at: Q.ABED, gone: 99 },
  { key: "stump", spr: "mw_stump", tx: 30, ty: 20, at: Q.ABED, gone: 99,
    solid: 1 },
  { key: "egg",   spr: "it_egg", tx: 30, ty: 20, at: Q.FLED, gone: Q.CARRY,
    onTop: "mw_stump", took: "Corin takes the egg" },
];
const itemHere = (it) => {
  if (it.key === "egg" && quest < it.gone &&
      (greenPhase === "rise" || greenPhase === "depart" || greenPhase === "gone")) return true;
  return quest >= it.at && quest < it.gone;
};
function itemAt(px, py) {
  for (const it of ITEMS) {
    if ((it.map || "world") !== MAPID) continue;
    if (!itemHere(it) || !it.took) continue;
    if (Math.hypot(px / TS - it.tx, (py - 1) / TS - it.ty) < 2.2) return it;
  }
  return null;
}

const SPOT = {
  door:  [14, 421],      /* Corin's own front door, in Millwood */
  herd:  [30, 417],      /* the lane between the two cottages, where she waits */
  coop:  [10, 430],      /* the hen house behind the mill */
  king:  [31, 382],      /* the road north, before the woods */
  elder: [44, 375],      /* Maddock, out at the edge of his land by the road */
  north: [30, 20],       /* on the dragon itself: he walks up to it */
  path:  [30, 375],      /* the north road, west of the elder's land */
};
const near = (spot, r) => Math.hypot(P.x / TS - spot[0], (P.y - 1) / TS - spot[1]) <= (r || 3);

let kingWalk = 0;
const ROAD_GUARDS=new Set(['Serjeant Bram','Doran','Tolan']);
function kingsMen() {
  return npcs.filter(m => m.n==='King Halvard'||ROAD_GUARDS.has(m.n));
}

function takeItem(it) {
  if (it.key === "eggs") {
    quest = Q.KING;
    playScene(["You gather six brown eggs into the nest-basket.",
               "The hens complain. One of them means it.",
               "Hettie: Right -- on, you great sods. On!",
               "The road north is clear."],
              { who: "Hettie", after: () => {
                const her = npcs.find(m => /Hettie/.test(m.n || ""));
                if (her) beginHettieWalk(her);
              } });
  } else if (it.key === "egg") {
    quest = Q.CARRY;
    playScene(["The egg is warm, and heavier than it looks.",
               "Whatever is inside it moves once, and then is still.",
               "Maddock needs to see this."]);
  }
  if (it.took) toast(it.took);
}

function guards() {
  return npcs.filter(m => ROAD_GUARDS.has(m.n));
}
function kingNow() { return npcs.find(m => (m.n || "") === "King Halvard"); }
function dismissRoadGuards() {
  if(walker&&ROAD_GUARDS.has(walker.n))walker=null;
  npcs=npcs.filter(n=>!ROAD_GUARDS.has(n.n));
  MD.npcs=(MD.npcs||[]).filter(n=>!ROAD_GUARDS.has(n.n));
  guardsAside=true;
}

function royalBlackout(line,swap,after){
 pendingActorStage=()=>{swap();playScene([line],{stay:true,after:()=>{fadeDir=-1;if(after)after();}});return true;};
 fadeDir=1;
}
function questTalk() {
  if (quest <= Q.KING && MAPID === "world") {
    const near = guards().find(m => Math.hypot(m.x - P.x, m.y - P.y) < 40);
    if (near) {
      leavingNow = false;
      guardsAside = false;
      const k = kingNow();
      playScene([
        near.n.split(" ").pop() + ": HALT.",
        near.n.split(" ").pop() + ": Close enough. The King is on this road.",
        "Corin: I am only going up to the field.",
        near.n.split(" ").pop() + ": Then you can wait a minute to do it.",
      ], { after: () => {
        royalBlackout('Make way for King Halvard!',()=>{dismissRoadGuards();if(k)k.goto=null;},()=>{
          if(k){k.goto=standableNear(P.x+4,P.y-30)||[P.x+4,P.y-30];k.hurry=1;}
        // Opening forest encounter: use Halvard's villain theme while he speaks.
        if(window.EmberKingMusic) window.EmberKingMusic.start();
        playScene([
          "Halvard: Hold. You are out early for a boy with a basket.",
          "Halvard: There have been reports of wild dragons in this valley. "
            + "Have you seen anything?",
          "Corin: ...No, sire. Only the hens.",
          "Halvard: No. Of course you have not.",
          "Halvard: Go on, then. Mind the pass.",
        ], { who: "Halvard",
             stay:true,
             hold: () => {
               if(fade>0)return false;
               const kk = kingNow();
               return !kk || !kk.goto ||
                      Math.hypot(kk.x - P.x, kk.y - P.y) < 46;
             },
             after: () => {
               royalBlackout('out of my way, boy!',()=>{
                 leavingNow=false;banishKingsMen();
                 if(quest===Q.KING)quest=Q.ELDER;
               },()=>{
                 // Once Halvard has left the opening scene, restore the area's music.
                 if(window.EmberKingMusic) window.EmberKingMusic.stop();
               });
             } });
        });
      } });
      return true;
    }
  }
  if (MAPID !== "world" && MAPID !== "house22") return false;
  const nearNpc = (name, r) => {
    const m = npcs.find(x => (x.n || "").includes(name) && npcHere(x));
    return m && Math.hypot(m.x - P.x, m.y - P.y) < (r || 34) ? m : null;
  };
  if (quest === Q.ERRAND && nearNpc("Hettie")) {
    quest = Q.EGGS;
    playScene([
      "Hettie: Morning, Corin. No, you are not getting past, look at them.",
      "Hettie: Elder Maddock sent word at first light -- he wants eggs, today.",
      "Hettie: Go grab them from the coop behind the mill and I will have this "
        + "lot shifted by the time you are back.",
    ], { who: "Hettie" });
    return true;
  }
  if (quest === Q.CARRY && MAPID === "world" && nearNpc("Maddock")) {
    beginHatchScene(nearNpc("Maddock"));
    return true;
  }
  if (false && MAPID === "house22" && nearNpc("Maddock")) {
    playScene(HATCH_LINES, { who: "Maddock", after: () => {
      quest = Q.DONE;
      dragon.on = true;
      dragon.x = P.x - 24; dragon.y = P.y - 26;
      showReveal("drf_s", "THE DRAGON CHOOSES HIM");
      toast("The dragon follows you now");
    } });
    return true;
  }
  if (quest === Q.ELDER && MAPID === "house22" && nearNpc("Maddock")) {
    playScene([
      "Maddock: -- AH. Corin. God's teeth, boy, announce yourself.",
      "Maddock: ...The eggs. Yes. Good lad. Put them on the table.",
      "Corin: What is that painting? I have been in this room a hundred times "
        + "and never looked at it.",
      "Maddock: Fifty years ago seven Dragonriders kept the peace in Emberfell.",
      "Maddock: Halvard was one of them. He turned on the other six and took the throne. We call it Wingfall.",
      "Maddock: He won, and no dragon has been seen openly here since.",
      "Corin: Then what is in the north wood?",
      "Maddock: I do not know. But what Halvard did left the roads full of dead things. That is why nobody travels.",
    ], { who: "Maddock", after: () => { quest = Q.NOISE; } });
    return true;
  }
  return false;
}

let gateNagged = 0, eggNagged = 0;
function nagNorth() {
  if (!northShut() || scene) return;
  if (Math.abs(P.y / TS - NORTH_GATE) > 2) return;
  if (P.x / TS < GATE_X0 - 2 || P.x / TS > GATE_X1 + 2) return;
  if (performance.now() - gateNagged < 6000) return;
  gateNagged = performance.now();
  toast("Not north. Maddock's house first.");
}

function stepQuest(dt) {
  nagNorth();
  clearBridge();
  if (scene || fadeDir || doorMotion || pendingDoor || pendingActorStage) return;
  if (MAPID !== "world") return;

  if (false) {
    playScene([
      "Hettie: Morning, Corin. No, you are not getting past, look at them.",
      "Hettie: Elder Maddock sent word at first light -- he wants eggs, today.",
      "Hettie: Go grab them from the coop behind the mill and I will have this "
        + "lot shifted by the time you are back.",
    ], { who: "Hettie" });
    return;
  }
  if (quest === Q.ELDER && !warnedNorth &&
      P.y < (SPOT.elder[1] - 3) * TS && P.y > (SPOT.elder[1] - 20) * TS &&
      inRoadBand()) {
    playScene(["Maddock: Hey!"], {
      until: () => elderArrived(),
      after: () => { playScene([
        "Maddock: Hoy. Those are mine, I think.",
        "Maddock: My house is the other way, Corin. Bring them down.",
      ], { who: "Maddock", until: () => {
        goBackIn();
        return !!(elder() && elder().away);
      }, after: () => {
        warnedNorth = true;
        gateRow = Math.floor((P.y - 1) / TS) - 1;
      } });
    } });
    comeOut(P.x + 14, P.y + 26);
    return;
  }
  if (quest === Q.NOISE && MAPID === "world" && near(SPOT.path, 5)) {
    scatterBirds();
    playScene([
      "Something comes down in the north wood.",
      "Not thunder. Lower than thunder, and it does not roll away.",
      "The birds go up off the whole ridge at once.",
    ], { after: () => {
      comeOut(P.x + 22, P.y + 2);
      playScene([
        "Maddock: ...No. Not that way. Not unarmed.",
        "Maddock: Take this. It was my father's and it is older than that.",
        "Maddock: Shroom Pass has the dead walking in it now. Do not go quietly.",
        "Corin: What was it?",
        "Maddock: I have no more idea than you do, and I have lived here "
          + "sixty years. Go carefully. Come back.",
      ], { who: "Maddock", until: () => elderArrived(), after: () => {
        quest = Q.ARMED;
        goBackIn();
        potions += 5;
        showReveal("corin_sword_idle_d", "Corin obtained the Sword!", 5, true);
        setTimeout(() => showReveal((SPR.it_potion && "it_potion") || "corin_sword_idle_d",
                                    "Maddock packs five potions with it."), 1500);
      } });
    } });
    return;
  }
  if (quest === Q.FLED && MAPID === "world" &&
      P.y > (SPOT.north[1] + 5) * TS && P.y < (SPOT.north[1] + 30) * TS) {
    fieldGate = SPOT.north[1] + 6;
    if (!eggNagged || performance.now() - eggNagged > 6000) {
      eggNagged = performance.now();
      toast("Not without the egg.");
    }
    return;
  }
  if (quest < Q.ARMED && quest !== Q.FLED && MAPID === "world" &&
      near(SPOT.north, 2.5)) {
    quest = Q.ARMED;
  }
  if (quest === Q.ARMED && near(SPOT.north, 2.5)) {
    playScene([
      "Something comes over the treeline, low and wrong.",
    ], {
      until: () => greenPhase === "sit",
      after: () => playScene([
        "It comes down in the top of the field and does not get up.",
        "A dragon. Green, and torn about the wings, and breathing hard.",
        "It sees you before you have taken three steps.",
      ], {
        until: () => greenP > 1.6,
        after: () => playScene([
          "It drags itself up out of the grass, and there is something "
            + "on the stump where it was lying.",
        ], {
          until: () => { greenGone = true; return greenPhase === "gone"; },
          after: () => playScene([
            "The wings go out -- enormous, ragged -- and it is gone.",
            "There was an egg under it.",
          ], { after: () => { quest = Q.FLED; } }),
        }),
      }),
    });
    return;
  }
  if (quest === Q.CARRY && MAPID === "world" && elder() && elder().away) {
    const e = elder();
    e.away = 0;
    e.x = ELDER_WELL[0] * TS + TS / 2;
    e.y = ELDER_WELL[1] * TS + TS;
    e.goto = null;
    e.home = [e.x, e.y];
  }

  if (quest === Q.CARRY && MAPID === "world" &&
      P.y > (ELDER_WELL[1] + 4) * TS && !eggWarned &&
      Math.abs(P.x / TS - SPOT.elder[0]) < 16) {
    {
      const e = elder();
      if (e) {
        e.away = 0;
        e.hurry = 1;
        e.goto = standableNear(P.x + 20, P.y - 20);
        if (Math.hypot(e.x - P.x, e.y - P.y) > 6 * TS) {
          const up = offStage();
          e.away = 0;
          e.x = up[0]; e.y = up[1];
          e.home = [MAD_DOOR[0], MAD_DOOR[1]];
          e.goto = standableNear(P.x + 10, P.y - 22);
          e.hurry = 1;
          goingIn = false;
        }
      }
    }
    playScene(["Maddock: Corin! Not one more step."], {
      until: () => elderArrived(),
      after: () => playScene([
        "Maddock: What is that under your arm.",
        "Maddock: ...Bring it here. Before anyone on that road sees it.",
      ], { who: "Maddock", after: () => {
        eggGate = Math.floor((P.y - 1) / TS) + 1;
        eggWarned = true;
        const e = elder();
        if (e) { e.goto = [ELDER_WELL[0] * TS + TS / 2,
                           ELDER_WELL[1] * TS + TS]; }
      } }),
    });
    return;
  }

}

function offScreen(m) {
  const vw = cv.width / cam.z, vh = cv.height / cam.z;
  return m.x < cam.x - 40 || m.x > cam.x + vw + 40 ||
         m.y < cam.y - 40 || m.y > cam.y + vh + 40;
}
let leavingNow = false;
function stepKingsMen(dt) {
  /* This procession belongs only to Halvard's early roadside scene.
     Castle actors share the same names and must never inherit it. */
  if (!leavingNow || MAPID !== "world") return;
  kingWalk += dt;
  for (const m of kingsMen()) {
    m.leaving = 1;
    const want = 120 * dt;
    const side = (Math.abs(m.y - P.y) < 40 && Math.abs(m.x - P.x) < 34)
      ? (m.x >= P.x ? 120 : -120) * dt : 0;
    const gapNow = Math.hypot(m.x - P.x, m.y - P.y);
    const onBoy = (nx, ny) =>
      gapNow >= 14 && Math.hypot(nx - P.x, ny - P.y) < 14;
    if (canStand(m.x + side, m.y + want) && !onBoy(m.x + side, m.y + want)) {
      m.x += side; m.y += want;
    }
    else if (canStand(m.x, m.y + want) && !onBoy(m.x, m.y + want)) m.y += want;
    else if (onBoy(m.x, m.y + want) &&
             canStand(m.x + (m.x >= P.x ? TS : -TS), m.y)) {
      m.x += (m.x >= P.x ? want : -want) * 2;
    }
    else {
      const road = ROAD_MID * TS + TS / 2;
      const dir = Math.sign(road - m.x) || 1;
      if (canStand(m.x + dir * TS, m.y)) m.x += dir * want;
      else if (onBoy(m.x, m.y + want) &&
               canStand(m.x + (m.x >= P.x ? TS : -TS), m.y)) {
        m.x += (m.x >= P.x ? want : -want) * 2;   /* round the boy */
      }
      else m.y += want;               /* nothing works: leave rather than stick */
    }
    faceToward(m, m.x, m.y + 64);
  }
  if (walker && kingsMen().includes(walker)) walker = null;
}
function banishKingsMen() {
  if(!kingsMen().length)return;
  npcs = npcs.filter(m => m.n!=='King Halvard'&&!ROAD_GUARDS.has(m.n));
  MD.npcs = (MD.npcs || []).filter(m => m.n!=='King Halvard'&&!ROAD_GUARDS.has(m.n));
}

function stepScene(dt) {
  if (!scene) return;
  if (scene.hold) {
    if (!scene.hold()) { sayOff(); showFace(null); return; }
    scene.hold = null;
    showScene();
  }
  scene.t += dt;
  stepHatchScene(dt);
  if (scene.waiting && scene.until && scene.until()) {
    const done = scene.after, scene0 = scene;
    scene = null;
    const stay = scene0 && scene0.stay;
    showScene();
    sendWalkerHome(stay);
    if (done) done();
  }
}
const revEl = document.getElementById("reveal");
const revArt = document.getElementById("revealArt");
const revCap = document.getElementById("revealCap");
let revealing = false;
let revAnimTimer = null;
let revealQueue = [];
let revealAfter = null;
const REVEAL_BIG = { "drf_s": "drf_s", "dr5_idle_s": "dr5_idle_s" };
const KEY_ITEM_GET_AUDIO = "data:audio/mp4;base64,";
const keyItemGetSfx = new Audio(KEY_ITEM_GET_AUDIO);
keyItemGetSfx.preload = "auto";
keyItemGetSfx.volume = 0.72;
function isKeyItemReveal(caption) {
  const c = String(caption || "");
  return /^Corin (?:obtained|received)\b/i.test(c) || /mysterious stone/i.test(c);
}
function playKeyItemGet() {
  try {
    keyItemGetSfx.pause();
    keyItemGetSfx.currentTime = 0;
    const p = keyItemGetSfx.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function showReveal(sprName, caption, maxScale, still, after) {
  if (revealing) { revealQueue.push([sprName, caption, maxScale, still, after]); return; }
  if (REVEAL_BIG[sprName] && SPR[REVEAL_BIG[sprName]]) sprName = REVEAL_BIG[sprName];
  const sp = SPR[sprName];
  if (!sp) { if (after) after(); return; }
  revealAfter = after || null;
  if (isKeyItemReveal(caption)) playKeyItemGet();
  if (revAnimTimer) { clearInterval(revAnimTimer); revAnimTimer = null; }
  const scale = Math.max(3, Math.min(maxScale || 5,
    Math.floor(Math.min(cv.width * 0.5 / sp[2], cv.height * 0.4 / sp[3]))));
  const img = sheetOf(sp);
  let sx = sp[0], sy = sp[1], sw = sp[2], sh = sp[3];
  try {
    const m = document.createElement("canvas");
    m.width = sp[2]; m.height = sp[3];
    const mg = m.getContext("2d", { willReadFrequently: true });
    drawGameImage(mg, img, sp[0], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
    const px = mg.getImageData(0, 0, sp[2], sp[3]).data;
    let l = sp[2], r = -1, t = sp[3], b = -1;
    for (let yy = 0; yy < sp[3]; yy++)
      for (let xx = 0; xx < sp[2]; xx++)
        if (px[(yy * sp[2] + xx) * 4 + 3] > 8) {
          if (xx < l) l = xx; if (xx > r) r = xx;
          if (yy < t) t = yy; if (yy > b) b = yy;
        }
    if (r >= l && b >= t) { sx = sp[0] + l; sy = sp[1] + t; sw = r - l + 1; sh = b - t + 1; }
  } catch (e) {}
  revArt.width = sw * scale;
  revArt.height = sh * scale;
  const g = revArt.getContext("2d");
  g.imageSmoothingEnabled = false;
  const drawFrame = (frame) => {
    g.clearRect(0, 0, revArt.width, revArt.height);
    drawGameImage(g, img, sx + frame * sp[2], sy, sw, sh, 0, 0, revArt.width, revArt.height);
  };
  drawFrame(0);
  const frames = sp[4] || 1;
  if (frames > 1 && !still) {
    let frame = 0;
    revAnimTimer = setInterval(() => {
      frame = (frame + 1) % frames;
      drawFrame(frame);
    }, 90);
  }
  revCap.textContent = caption;
  revEl.classList.add("on");
  revealing = true;
}
function hideReveal() {
  if (revTimer) { clearTimeout(revTimer); revTimer = null; }
  if (revAnimTimer) { clearInterval(revAnimTimer); revAnimTimer = null; }
  const after = revealAfter; revealAfter = null;
  revEl.classList.remove("on"); revealing = false;
  if (after) after();
  if (!revealing && revealQueue.length) {
    const [n, c, s, still, next] = revealQueue.shift();
    showReveal(n, c, s, still, next);
  }
}
let revTimer = null;
function flashReveal(sprName, caption, ms) {
  showReveal(sprName, caption);
  if (!revealing) return;
  if (revTimer) clearTimeout(revTimer);
  revTimer = setTimeout(() => { revTimer = null; hideReveal(); }, ms || 900);
}

const TYPE_CPS = 45;
let typed = 0, typeFull = "", typeWho = "";
function typeStart(who, text) {
  typeWho = who; typeFull = text; typed = 0;
}
function typeDone() { return typed >= typeFull.length; }
function typeAll() { typed = typeFull.length; typePaint(); }
function typePaint() {
  sayEl.innerHTML = esc(typeFull.slice(0, Math.floor(typed)));
  nameEl.textContent = typeWho || "";
  const faceLeft = (faceEl.className || "left").indexOf("right") < 0;
  nameEl.className = (typeWho ? "on " : "") + (faceLeft ? "right" : "left");
}
function stepType(dt) {
  if (typed >= typeFull.length) return;
  typed = Math.min(typeFull.length, typed + TYPE_CPS * dt);
  typePaint();
}

function showScene() {
  if (!scene) { sayOff(); showFace(null); return; }
  const line = scene.waiting ? "..." :
    scene.lines[Math.min(scene.i, scene.lines.length - 1)];
  const colon = line.indexOf(": ");
  const who = colon > 0 && colon < 22 ? line.slice(0, colon) : "";
  const text = who ? line.slice(colon + 2) : line;
  typeStart(who, text);
  typePaint();
  showFace(who);
  sayEl.classList.toggle("narr", !who);
  sayIsNarr = !who;
  sayOn();
}

const BREATH = { reach: 152, wide: 34, life: 0.8, standoff: 46,
                 bite: 10, minLen: 30, grow: 0.12 };
const BREATHS = ["fire", "slash", "lightning", "shadow", "ice"];
/* He hatches breathing fire, and already knows how to slash. Lightning,
   shadow, and ice arrive with their heartstones -- the bag entries already
   read their unlock straight off this table. */
const breathHas = { fire: true, slash: true, lightning: false, shadow: false, ice: false };
let breathPick = "fire";
const DRAGON_HP_BASE = 20, DRAGON_HP_PER_BREATH = 10;
const DRAGON_BREATH = {
  fire:   { damage: 8,  cool: 12, name: "Fire" },
  bolt:   { damage: 12, cool: 18, name: "Lightning" },
  shadow: { damage: 16, cool: 24, name: "Shadow" },
  ice:    { damage: 20, cool: 30, name: "Ice" },
};
const breathCooldown = { fire: 0, bolt: 0, shadow: 0, ice: 0 };
function dragonMaxHp() {
  return DRAGON_HP_BASE + ((breathHas.lightning ? 1 : 0) +
    (breathHas.shadow ? 1 : 0) + (breathHas.ice ? 1 : 0)) * DRAGON_HP_PER_BREATH;
}
function syncDragonVitality(fillGain = true) {
  const oldMax = dragon.maxHp || DRAGON_HP_BASE;
  const nextMax = dragonMaxHp();
  if (fillGain && nextMax > oldMax) dragon.hp = Math.min(nextMax, (dragon.hp ?? oldMax) + nextMax - oldMax);
  dragon.maxHp = nextMax;
  dragon.hp = Math.max(0, Math.min(nextMax, dragon.hp ?? nextMax));
  dragon.down = dragon.hp <= 0 || dragon.revive > 0;
}
function unlockDragonBreath(kind) {
  if (breathHas[kind]) return false;
  breathHas[kind] = true;
  syncDragonVitality(true);
  return true;
}
function recoverStrandedDragon() {
  if(!hasDragon() || boarMeat>0 || dragonFish>0 || !(dragon.down || dragon.hp<=0))return false;
  dragon.maxHp=dragonMaxHp();dragon.hp=dragon.maxHp;
  dragon.down=false;dragon.revive=0;dragon.knockdown=0;dragon.hurt=0;dragon.inv=1.2;
  dragon.tr=null;dragon.air=false;dragon.moving=false;
  refreshWingBtn();toast("the danger has passed; your dragon regains its strength");return true;
}
function breathElementKey(kind = dragonEl) {
  return kind === "lightning" ? "bolt" : kind;
}
function breathWait(kind = dragonEl) {
  return Math.max(0, breathCooldown[breathElementKey(kind)] || 0);
}
function hurtDragon(n) {
  if (foesHeld) return false;
  if (!dragonHere() || dragon.down || dragon.inv > 0 || devSafe) return false;
  dragon.hp = Math.max(0, dragon.hp - Math.max(1, n));
  dragon.hurt = 0.42; dragon.inv = 0.55;
  if (dragon.hp <= 0) {
    dragon.down = true; dragon.moving = false; dragon.air = false; dragon.tr = null;
    dragon.faintDir = cardinalDirection(dragon.dir) === "w" ? "w" : "e";
    dragon.revive = 0;
    hunt = null; breath = null; claw = null;
    if (mounted) setMounted(false, true);
    refreshWingBtn();
    toast("the dragon is hurt and cannot fight -- feed it to get it back up");
  }
  return true;
}
const BREATH_HUE = { fire: null, slash: "#e8e4d8", lightning: "#9fd8ff",
                     shadow: "#5a3f7a", ice: "#a8e8ff",
                     kingfire: "#7ef08a", kingclaw: "#b06ee8" };
const TEMPLE_GIFT = { tp: "lightning", sn: "shadow", ds: "ice" };
const HS_ICON = { lightning: "it_hs_light", shadow: "it_hs_shadow", ice: "it_hs_ice" };
function breathNext() {
  const had = BREATHS.filter(k => breathHas[k]);
  const i = had.indexOf(breathPick);
  breathPick = had[(i + 1) % had.length];
  toast("breath: " + breathPick);
}
const CHESTS = [
  { map: "tp1", x: 9.5, y: 7, gift: "lightning" },
  { map: "sn1", x: 9.5, y: 25, gift: "shadow" },
  { map: "ds1", x: 9.5, y: 20.5, gift: "ice" },
];
const chestOpen = {};              /* map id -> true once taken */
let chestAnim = null;              /* { map, t, phase } while it plays */
function chestHere() {
  return CHESTS.find(c => c.map === MAPID);
}
function tryChest() {
  const c = chestHere();
  if (!c || chestOpen[c.map] || chestAnim) return false;
  if (Math.hypot(P.x / TS - c.x, (P.y - 1) / TS - c.y) > 2.2) return false;
  chestAnim = { c, t: 0, phase: "lid" };
  return true;
}
function checkGravePrize() {
  if (charm.wake || MAPID !== "world" || !arenaLock) return;
  const w = arenaLock.waves || (arenaLock.wave2 ? [1] : []);
  if (arenaLock.id !== 207 || (arenaLock._wave || 0) < w.length) return;
  if (arenaFoesLeft(arenaLock)) return;
  charm.wake = true;
  showReveal((SPR.it_wake && "it_wake") || "it_stone", CHARM_NOTE.wake);
}
function checkDeepPrize() {
  checkGravePrize();
  if (charm.flame || MAPID !== "mine5") return;
  if (!foes.length) return;
  for (const f of foes) if (f.st !== "dead") return;
  charm.flame = true;
  showReveal((SPR.it_twinflame && "it_twinflame") || "fire_s", CHARM_NOTE.flame);
}
let darkKick = 0;
function stepDark(dt) {
  if (!MD || !MD.dark || charm.lamp) { darkKick = 0; return; }
  if (sceneHold() || fadeDir !== 0) return;
  darkKick += dt;
  if (darkKick < 0.9) return;                 /* a moment to see nothing */
  darkKick = 0;
  const back = (MD.doors || []).find(d => /^mine/.test(d.to || ""));
  if (!back) return;
  playScene(["It is too dark to see a hand in front of him."], {
    after: () => { pendingDoor = back; fadeDir = 1; }
  });
}
function stepChest(dt) {
  stepDark(dt);
  checkDeepPrize();
  if (!chestAnim) return;
  chestAnim.t += dt;
  const a = chestAnim;
  if (a.phase === "lid" && a.t > 0.9) { a.phase = "ghost"; a.t = 0; }
  else if (a.phase === "ghost" && a.t > 1.2) {
    chestOpen[a.c.map] = true;
    unlockDragonBreath(a.c.gift);
    chestAnim = null;
    const giftName = a.c.gift[0].toUpperCase() + a.c.gift.slice(1);
    const giftIcon = HS_ICON[a.c.gift];
    showReveal(SPR[giftIcon] ? giftIcon : "chest",
               "Corin obtained a Heartstone! The " + giftName + " breath is unlocked.", 3);
  }
}
function drawChest() {
  const c = chestHere();
  if (!c) return;
  const sp = MD?.templeContinuous ? SPR.temple71_chest : SPR.chest;
  if (!sp) return;
  const px = c.x * TS + TS / 2 - sp[2] / 2, py = c.y * TS + TS - sp[3];
  let f = 0;
  if (chestOpen[c.map]) f = sp[4] - 1;
  else if (chestAnim && chestAnim.phase !== "lid") f = sp[4] - 1;
  else if (chestAnim) f = Math.min(sp[4] - 1, Math.floor(chestAnim.t / 0.9 * sp[4]));
  drawGameImage(ctx, atlasImg, sp[0] + f * sp[2], sp[1], sp[2], sp[3],
                Math.round(px), Math.round(py), sp[2], sp[3]);
  if (chestAnim && chestAnim.phase === "ghost" && SPR.ghost_rise) {
    const g = SPR.ghost_rise;
    const gf = Math.min(g[4] - 1, Math.floor(chestAnim.t / 1.2 * g[4]));
    const rise = chestAnim.t / 1.2 * 22;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - chestAnim.t / 1.2 * 0.5);
    drawGameImage(ctx, atlasImg, g[0] + gf * g[2], g[1], g[2], g[3],
                  Math.round(c.x * TS + TS / 2 - g[2] / 2),
                  Math.round(c.y * TS - g[3] - rise), g[2], g[3]);
    ctx.restore();
  }
}
let breathT = 0, breath = null;
function dragonCombatHere() {
  /* Cinderhold is an enclosed map, but its hall is the mounted dragon arena. */
  return dragonHere() || (MAPID === "cinderhold" && dragon.on &&
    (mounted || lastFight || trial || foes.some(f => f.st !== "dead")));
}
function canBreathe() { return !devDragonPassive && !fishing && breathWait() <= 0 && dragonCombatHere() && dragon.on && !dragon.down && dragon.knockdown <= 0; }

let MOUTH = ATLAS.dragon_mouth ||
  {"n":[0.3889,0.1712],"e":[0.831,0.5322],"s":[0.3889,0.6124],"w":[0.1528,0.5347]};
const MOUTH_GND = DRAGON_MOUTH || MOUTH;
function mouthOf(dir) {
  const s2 = dragonSprite(dir);
  const tbl = dragonAirborne() ? MOUTH : MOUTH_GND;
  const diagonal = {ne:[.76,.32],nw:[.24,.32],se:[.77,.69],sw:[.23,.69]};
  const m = diagonal[dir] || tbl[dir] || tbl.s;
  const bob = dragonBob();
  const DS = DRAGON_DRAW_SCALE;
  const fx = dragonFlip(dir) ? -1 : 1;     /* west is east, mirrored */
  const x = dragon.x + (-s2[2] / 2 + s2[2] * m[0]) * DS * fx;
  const y = dragon.y + bob + (-s2[3] + s2[3] * m[1]) * DS;
  const [vx, vy] = directionVector(dir);
  /* The refreshed dragon art already places the anchor at the snout. */
  return [x - vx * 3, y - vy * 3];
}

let dragonEl = "fire";        /* which breath the L-menu last chose */
function breatheFire() {
  if(devDragonPassive){toast("dragon attacks are disabled in dev tools");return;}
  if (!canBreathe()) {
    if (dragon.down) toast("the dragon is hurt -- feed it first");
    else if (!dragonCombatHere()) toast("the dragon is not here");
    else if (breathWait() > 0) toast((DRAGON_BREATH[breathElementKey()]?.name || "breath") + " ready in " + breathWait().toFixed(1) + "s");
    return;
  }
  /* A commanded breath is a priority order, not something claws can defer.
     Keep an already-visible breath intact, but cancel a prior wind-up, claw
     recovery and retreat so the dragon immediately makes room to cast. */
  if (breath) { toast("the dragon is already breathing"); return; }
  hunt = null;
  claw = null;
  clawT = 0;
  linger = 0;
  dragonCombatPause = 0;
  dragonRecall = false;
  dragonRecallT = 0;
  let best = null, bd = 1e9;
  for (const f of foes) {
    if (f.st === "dead" || f.ally || f.storyPassive) continue;
    const d = Math.hypot(f.x - dragon.x, f.y - dragon.y);
    /* The king dragon may be across the arena: approach its firing distance
       instead of wasting the player command as a blind shot. */
    if ((f.kind === "kdragon" || f.kind === "lich" || d < 320) && d < bd) { bd = d; best = f; }
  }
  if (best) {
    /* King breaths have a deliberate wind-up and keep a clear standoff. */
    if (best.kind === "kdragon" || best.kind === "lich") {
      hunt = { foe: best, t: 0, kingBreath: true }; return;
    }
    hunt = { foe: best, t: 0 }; return;
  }
  const d = playerFacing4();
  dragon.dir = d;
  fireNow(d);
}
const DRAGON_PROJECTILE = { fire: 10, ice: 13, bolt: 17, shadow: 17 };
function kingDragonMouth(f, dir) {
  /* Anchor the cast to the displayed attack cell, not the boss's old
     full-size collision art.  That keeps every bolt inside the open-mouth
     frame even when the king dragon's draw scale changes. */
  const d = cardinalDirection(dir);
  const sp = SPR["kdnew_atk_" + d] || SPR.kdnew_atk_s;
  const w = (sp ? sp[2] : 176) * KING_DRAGON_DRAW_SCALE;
  const h = (sp ? sp[3] : 176) * KING_DRAGON_DRAW_SCALE;
  const anchors = { n:[.50,.18], s:[.50,.38], e:[.75,.34], w:[.25,.34] };
  const at = anchors[d] || anchors.s;
  return { x: f.x - w / 2 + w * at[0], y: f.y - h + h * at[1] };
}
function fireNow(dir, target = null) {
  if(fishing)return;
  if (breath) return;
  dragon._dir = dir;
  dragonFacingLocked = true;
  const el = DRAGON_PROJECTILE[dragonEl] ? dragonEl : "fire";
  breathCooldown[el] = DRAGON_BREATH[el].cool;
  breathT = breathCooldown[el];
  /* Let the breath land and its recovery read before claws can resume. */
  dragonCombatPause = Math.max(dragonCombatPause, 2.30);
  if (target && (target.kind === "kdragon" || target.kind === "lich"))
    target.cool = Math.max(target.cool || 0, 0.55);
  // Select the firing sprite before measuring its mouth anchor.
  breath = { dir, el, t: 0 };
  const m = mouthOf(dir);
  let [dx,dy] = directionVector(dir);
  if (target) {
    const body = foeBodyProfile(target);
    dx = body.x - m[0]; dy = body.y - m[1];
  }
  const d = Math.hypot(dx, dy) || 1;
  Object.assign(breath, { x: m[0], y: m[1], vx: dx / d, vy: dy / d,
    distance: 0, hit: 0, impactT: 0, speed: el === "bolt" ? 300 : 200 });
}
function stepHunt(dt) {
  if (!hunt) return;
  hunt.t += dt;
  const f = hunt.foe;
  if (f.st === "dead" || hunt.t > 4) { hunt = null; return; }
  if (hunt.kingBreath) {
    const body = foeBodyProfile(f);
    const dx = body.x - dragon.x, dy = body.y - dragon.y;
    const d = Math.hypot(dx, dy) || 1;
    const aim = direction4(dx, dy, dragon.dir);
    dragon.dir = aim;
    /* Move radially, never toward a fixed side tile that could be a wall. */
    const stand = 112, gap = d - stand;
    if (!(typeof mounted !== "undefined" && mounted) && Math.abs(gap) > 12 && hunt.t < 0.72) {
      const pace = Math.min(130, 58 + Math.abs(gap) * 2);
      dragon.moving = true;
      dragonStep((dx / d) * pace * dt * Math.sign(gap),
                 (dy / d) * pace * dt * Math.sign(gap));
      return;
    }
    dragon.moving = false;
    /* A visible wind-up remains even if a wall prevents the ideal standoff. */
    if (hunt.t < 1.05) return;
    fireNow(aim, f); hunt = null; return;
  }
  const ax = dragon.x - f.x, ay = dragon.y - f.y;
  let side;
  if (Math.abs(ax) > Math.abs(ay)) side = ax > 0 ? "e" : "w";
  else side = ay > 0 ? "s" : "n";
  const sx = side === "e" ? 88 : side === "w" ? -88 : 0;
  const sy = side === "s" ? 88 : side === "n" ? -88 : 0;
  const tx = f.x + sx, ty = f.y + sy + 10;
  const dx = tx - dragon.x, dy = ty - dragon.y;
  const d = Math.hypot(dx, dy);
  const aim = side === "e" ? "w" : side === "w" ? "e" : side === "s" ? "n" : "s";
  dragon.dir = aim;
  if (d > 7) {
    const sp = Math.min(260, 90 + d * 3) * (dragonAirborne() ? 1 : 0.72);
    dragonStep((dx / d) * sp * dt, (dy / d) * sp * dt);
    return;
  }
  fireNow(aim, f);
  hunt = null;
}
function beamLength() {
  const [dx,dy] = directionVector(breath.dir);
  let stop = BREATH.reach;
  for (const f of foes) {
    if (f.st === "dead" || f.storyPassive) continue;
    const rx = f.x - breath.x, ry = f.y - breath.y;
    const along = rx * dx + ry * dy;
    const across = Math.abs(rx * dy - ry * dx);
    if (across > BREATH.wide || along <= 0) continue;
    stop = Math.min(stop, along + BREATH.bite);
  }
  const open = BREATH.grow > 0 ? Math.min(1, breath.t / BREATH.grow) : 1;
  return Math.max(BREATH.minLen, Math.min(BREATH.reach, stop)) * open;
}
function foeBodyProfile(f) {
  /* Foes are foot-anchored. The king dragon's new art is much wider and
     taller than the original sprite, so its hurt area must match the body. */
  if (f.kind === "kdragon") {
    const [dx,dy] = directionVector(f.dir8 || legacyDirection(f.dir,f.flip));
    return { x: f.x - dx * 6, y: f.y - 38 - dy * 6, r: 36 };
  }
  return { x: f.x, y: f.y - 16, r: 24 };
}
function stepBreath(dt) {
  if (foesHeld) return;
  if (bossScene) return;
  if (dragonCombatPause > 0) dragonCombatPause = Math.max(0, dragonCombatPause - dt);
  for (const k in breathCooldown) if (breathCooldown[k] > 0)
    breathCooldown[k] = Math.max(0, breathCooldown[k] - dt);
  breathT = breathWait();
  stepHunt(dt);
  dragonFacingLocked = !!breath;
  if (!breath) return;
  const b = breath, previous = b.t;
  b.t += dt;
  if (b.hit) {
    b.impactT += dt;
    if (b.impactT >= 0.2) breath = null;
  } else {
    // A short cast, followed by small collision steps so fast bolts cannot tunnel.
    let travel = Math.min(BREATH.reach - b.distance,
      (Math.max(0, b.t - 0.15) - Math.max(0, previous - 0.15)) * b.speed);
    while (travel > 0 && !b.hit && breath === b) {
      const step = Math.min(4, travel);
      const nx = b.x + b.vx * step, ny = b.y + b.vy * step;
      if (isSolid(nx, ny)) { b.hit = 1; break; }
      b.x = nx; b.y = ny; b.distance += step; travel -= step;
      const f = foes.find(f => {
        if (f.st === "dead" || f.ally || f.storyPassive) return false;
        const body = foeBodyProfile(f);
        return Math.hypot(body.x - b.x, body.y - b.y) < body.r;
      });
      if (f) {
        b.hit = 1;
        const power = DRAGON_BREATH[b.el]?.damage || DRAGON_BREATH.fire.damage;
        const fullHp = (FOE[f.kind] || {}).hp || f.hp;
        /* A fresh enemy always survives the first blast; later blasts or
           Corin's attacks can finish it. */
        const damage = f.hp >= fullHp ? Math.min(power, Math.max(1, f.hp - 1)) : power;
        f.hp = Math.max(0, f.hp - damage); f.hurt = 0.35;
        if (f.hp <= 0) {
          f.st = "dead"; f.t = 0;
          if (!f.storyKnight) dropGold(f.x, f.y, f.kind);
          markBossGone(f);
        }
      }
    }
    if (b.distance >= BREATH.reach && !b.hit) breath = null;
  }
  dragonFacingLocked = !!breath;
}
function drawLavaBubbles() {
  const s = SPR.vl_bub;
  if (!s) return;
  const x0 = Math.floor(cam.x / TS) - 1, y0 = Math.floor(cam.y / TS) - 1;
  const x1 = x0 + Math.ceil(VW / cam.z / TS) + 2;
  const y1 = y0 + Math.ceil(VH / cam.z / TS) + 2;
  if (x1 - x0 > 200) return;                 /* zoomed too far out to matter */
  const now = performance.now() / 1000;
  for (let y = Math.max(0, y0); y < Math.min(MH, y1); y++) {
    for (let x = Math.max(0, x0); x < Math.min(MW, x1); x++) {
      if (terr[y * MW + x] !== VLAVA) continue;
      const ld = lavaDist(x, y);
      if (ld < 2 || ld > BUBBLE_REACH) continue;
      if (typeof cliffAt === "function" && cliffAt(x, y)) continue;
      const seed = (x * 73856093 ^ y * 19349663) >>> 0;
      if (seed % (ld <= 3 ? 5 : 11)) continue;
      const period = 2.6 + (seed % 40) / 10;
      const phase = (now + (seed % 100) / 10) % period;
      if (phase > 0.9) continue;             /* mostly still, a brief pop */
      const f = Math.min(s[4] - 1, Math.floor(phase / 0.9 * s[4]));
      drawGameImage(ctx, atlasImg, s[0] + f * s[2], s[1], s[2], s[3],
                    Math.round(x * TS), Math.round(y * TS), s[2], s[3]);
    }
  }
}
function drawDark() {
  if (!MD || !MD.dark) return;
  if (charm.lamp) return;         /* carrying the lantern lights the gallery */
  const r = 26 * cam.z;
  const px = (P.x - cam.x) * cam.z, py = (P.y - 10 - cam.y) * cam.z;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(px, py, r * 0.35, px, py, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.7, "rgba(0,0,0,0.55)");
  g.addColorStop(1, "rgba(0,0,0,0.97)");
  ctx.fillStyle = "rgba(0,0,0,0.97)";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawKingDragon() {
  if (lastFight) return;
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  if (!k || (typeof npcHere === "function" && !npcHere(k))) return;
  const dir = k.f === "w" ? "w" : k.f === "e" ? "e" : "s";
  const sp = SPR["kdnew_fly_" + dir] || SPR.kdnew_fly_s;
  if (!sp) return;
  const side = (dir === "w") ? -1 : 1;
  const dw = Math.round(sp[2] * KING_DRAGON_DRAW_SCALE);
  const dh = Math.round(sp[3] * KING_DRAGON_DRAW_SCALE);
  const px = k.x + side * 46 - dw / 2;
  const py = k.y + 8 - dh;
  const fr = Math.floor(tAcc * 3) % (sp[4] || 1);
  drawGameImage(ctx, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
                Math.round(px), Math.round(py), dw, dh);
}
function drawDying() {
  if (!P.act || P.act.kind !== "die") return;
  const k = ACT.die;
  const p = Math.min(1, P.act.t / (k.frames / k.fps));
  const w2 = VW / cam.z, h2 = VH / cam.z;
  ctx.save();
  ctx.globalCompositeOperation = "saturation";
  ctx.globalAlpha = p * 0.92;
  ctx.fillStyle = "hsl(0,0%,50%)";
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = p * 0.55;
  ctx.fillStyle = "#07060a";
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalAlpha = p * 0.8;
  const g = ctx.createRadialGradient(P.x, P.y - 10, w2 * (0.5 - p * 0.34),
                                     P.x, P.y - 10, w2 * 0.78);
  g.addColorStop(0, "rgba(7,6,10,0)");
  g.addColorStop(1, "rgba(7,6,10,0.95)");
  ctx.fillStyle = g;
  ctx.fillRect(cam.x, cam.y, w2, h2);
  ctx.globalAlpha = 1;
  ctx.restore();
}
function drawBreath() {
  drawFall();
  drawLoot();
  drawFly();
  drawDust();
  drawDying();
  drawSaintBuff(true);
  drawHeal();
  drawSpell();
  drawKingDragon();
  if(!MD?.templeContinuous)drawChest();
}
function drawDragonProjectile() {
  if (!breath || breath.t < 0.15) return;
  const b = breath, count = DRAGON_PROJECTILE[b.el];
  const frame = Math.floor(Math.max(0, b.t - 0.15) * 24) % count;
  const sp = SPR["fx_attack_" + b.el + "_" + frame];
  if (!sp) return;
  const size = (b.el === "fire" ? 54 : 46) * (b.hit ? 1 + b.impactT * 2 : 1);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(b.vy, b.vx));
  ctx.globalAlpha = b.hit ? Math.max(0, 1 - b.impactT / 0.2) : 1;
  drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], -size / 2, -size / 2, size, size);
  ctx.restore();
}

let foes = [];
const ROAD_NET = {
  "Route 1":        { from: "Millwood",  to: "Thornwell",         legs: [12, 13] },
  "Route 2":        { from: "Thornwell", to: "Forgewick",         legs: [19, 193] },
  "Temple Route 1": { from: "Forgewick", to: "Forgewick Temple",  legs: [24, 25, 26] },
  "Route 3":        { from: "Forgewick", to: "Sandspire",         legs: [31, 32, 33] },
  "Temple Route 2": { from: "Sandspire", to: "Sandspire Temple",  legs: [37, 38, 39, 40] },
  "Route 4":        { from: "Sandspire", to: "Coralmere",         legs: [44, 45, 46, 51, 57] },
  "Route 5":        { from: "Coralmere", to: "Hollybeck",         legs: [58, 61, 62, 63, 64, 66, 67, 70, 71, 72] },
  "Temple Route 3": { from: "Hollybeck", to: "Hollybeck Temple",  legs: [74, 75, 78] },
  "Route 6":        { from: "Hollybeck", to: "Frostcrag",         legs: [84, 85, 86, 87] },
  "Route 7":        { from: "Ashcrag",   to: "Cinderhold Castle", legs: [88, 91, 92, 93, 94, 95] },
  "Oasis spur":     { from: "Route 3",   to: "The Oasis",              legs: [42] },
  "Graveyard spur": { from: "Hollybeck", to: "Hollybeck Graveyard",    legs: [80] },
  "Shroom Pass":    { from: "Millwood",  to: "Shroom Pass",            legs: [3] },
  "Northern Woods": { from: "Millwood",  to: "Northern Woods",         legs: [5] },
};
function roadOf(id) {
  for (const [nm, r] of Object.entries(ROAD_NET))
    if (r.legs.includes(id)) return nm;
  return null;
}
function roadLegs(nm) {
  const r = ROAD_NET[nm];
  return r ? features.filter(f => f.kind === "route" && r.legs.includes(f.id)) : [];
}

const FOE = {
  treasuryknight: {hp:24,speed:44,sight:300,reach:31,ring:42,dmg:2,swingT:.95,hitAt:.58,rest:.8,groupRest:1.2,wind:.32},
  royalguard: { hp:8,speed:39,sight:240,reach:29,ring:44,dmg:2,swingT:1.08,hitAt:.58,rest:1.1,groupRest:1.5,wind:.38 },
  knight:  { hp: 9, speed: 42, sight: 240, reach: 29, ring: 48, dmg: 2,
             swingT: 1.08, hitAt: 0.58, rest: 0.85, groupRest: 1.35, wind: 0.30 },
  reptile: { hp: 7, speed: 34, sight: 160, reach: 26, ring: 52, dmg: 2,
             swingT: 1.0, hitAt: 0.55, rest: 0.9, groupRest: 1.5, wind: 0.4 },
  skeleton: { hp: 3, speed: 26, sight: 110, reach: 20, ring: 52, dmg: 1,
          swingT: 1.2, hitAt: 0.6, rest: 2.0, groupRest: 4.8, wind: 0.7 },
  golem2:   { hp: 6, speed: 18, sight: 130, reach: 26, ring: 60, dmg: 2,
          swingT: 1.6, hitAt: 0.9, rest: 1.69, groupRest: 3.35, wind: 0.78 },
  golem3:   { hp: 8, speed: 20, sight: 140, reach: 28, ring: 64, dmg: 2,
          swingT: 1.5, hitAt: 0.85, rest: 1.56, groupRest: 3.1, wind: 0.74 },
  ent:      { hp: 7, speed: 16, sight: 120, reach: 30, ring: 62, dmg: 2,
          swingT: 1.7, hitAt: 0.95, rest: 1.82, groupRest: 3.47, wind: 0.86 },
  shroomBrown:  { hp: 4, speed: 24, sight: 120, reach: 22, ring: 50, dmg: 1,
                  swingT: 1.1, hitAt: 0.55, rest: 1.5, groupRest: 2.9, wind: 0.6 },
  shroomRed:    { hp: 6, speed: 26, sight: 130, reach: 24, ring: 52, dmg: 2,
                  swingT: 1.1, hitAt: 0.55, rest: 1.3, groupRest: 2.5, wind: 0.55 },
  shroomPurple: { hp: 9, speed: 22, sight: 140, reach: 26, ring: 56, dmg: 2,
                  swingT: 1.2, hitAt: 0.6, rest: 1.4, groupRest: 2.6, wind: 0.62 },
  plant1:   { hp: 3, speed: 22, sight: 100, reach: 20, ring: 46, dmg: 1,
          swingT: 1.1, hitAt: 0.55, rest: 1.8, groupRest: 3.6, wind: 0.6 },
  plant2:   { hp: 5, speed: 20, sight: 105, reach: 22, ring: 48, dmg: 1,
          swingT: 1.2, hitAt: 0.6, rest: 2.0, groupRest: 3.8, wind: 0.7 },
  gnoll2:   { hp: 6, speed: 28, sight: 140, reach: 24, ring: 52, dmg: 2,
          swingT: 1.1, hitAt: 0.55, rest: 1.17, groupRest: 2.23, wind: 0.51 },
  golem1:   { hp: 7, speed: 20, sight: 130, reach: 26, ring: 56, dmg: 2,
          swingT: 1.3, hitAt: 0.7, rest: 1.43, groupRest: 2.73, wind: 0.7 },
  kdragon:  { hp: 34, speed: 46, sight:999, reach: 175, ring: 64, dmg: 4,
              swingT: 1.9, hitAt: 1.0, rest: 2.6, groupRest: 3.2, wind: 1.08,
              cast: "lcfire", boltSp: 220 },
  devil:    { hp: 20, speed: 24, sight: 170, reach: 38, ring: 78, dmg: 3,
          swingT: 1.5, hitAt: 0.8, rest: 1.43, groupRest: 2.73, wind: 0.86 },
  lich:     { hp: 16, speed: 18, sight: 190, reach: 150, ring: 110, dmg: 3,
          swingT: 1.6, hitAt: 0.85, rest: 1.56, groupRest: 2.98, wind: 0.94,
          cast: "lcfire", boltSp: 150, standoff: 120 },
  eyeRed:   { hp: 5, speed: 14, sight: 170, reach: 34, ring: 70, dmg: 2,
          swingT: 1.4, hitAt: 0.8, rest: 1.43, groupRest: 2.73, wind: 0.7 },
  eyePurple:{ hp: 8, speed: 12, sight: 180, reach: 36, ring: 74, dmg: 2,
          swingT: 1.6, hitAt: 0.9, rest: 1.69, groupRest: 3.1, wind: 0.82 },
  boneguard:{ hp: 7, speed: 34, sight: 160, reach: 26, ring: 52, dmg: 2,
              swingT: 1.0, hitAt: 0.55, rest: 0.9, groupRest: 1.5, wind: 0.4 },
  wraith:   { hp: 8, speed: 42, sight: 999, reach: 26, ring: 46, dmg: 2,
              swingT: 0.96, hitAt: 0.53, rest: 0.85, groupRest: 1.49, wind: 0.43 },
  ghost:    { hp: 6, speed: 26, sight: 150, reach: 30, ring: 64, dmg: 2,
          swingT: 1.1, hitAt: 0.6, rest: 1.04, groupRest: 1.98, wind: 0.55 },
};
Object.assign(FOE, {
  devil1: { ...FOE.devil, hp: 18, speed: 30 },
  devil3: { ...FOE.devil, hp: 24, dmg: 4 },
  skeleton1: { ...FOE.skeleton, hp: 5 },
  skeleton3: { ...FOE.boneguard, hp: 10 },
  mage1: { ...FOE.lich, hp: 9, dmg: 2 },
  mage2: { ...FOE.lich, hp: 12, dmg: 2 },
  ghost3: { ...FOE.ghost },
  eye2: { ...FOE.eyeRed },
  ent1: { ...FOE.ent }, ent2: { ...FOE.ent },
  gnoll1: { ...FOE.gnoll2 }, gnoll3: { ...FOE.gnoll2 },
  plant3: { ...FOE.plant2 },
  reptile2: { ...FOE.reptile }, reptile3: { ...FOE.reptile }
});
const ROUTE_2_HP_START_X = 320 * TS;
const POST_ROUTE_2_COMBAT_MAPS = new Set([
  "mine2", "mine3", "mine4", "mine5",
  "tp1", "tp2", "tp3", "tp4",
  "ds1", "ds2", "ds3", "ds4",
  "sn1", "sn2", "sn3", "sn4",
  "passage", "passage2", "passage3", "cinderhold"
]);
function enemyMaxHp(kind, x, mapId = MAPID) {
  const base = (FOE[kind] || FOE.skeleton).hp;
  const late = mapId === "world"
    ? x >= ROUTE_2_HP_START_X
    : POST_ROUTE_2_COMBAT_MAPS.has(mapId);
  return base * (late || mapId.startsWith("royal_") ? 2 : 1);
}
const FOE_ART = { treasuryknight:"kn3", royalguard:"kn", knight: "kn", devil1: "dv1", devil3: "dv3", skeleton1: "bs1", skeleton3: "bs3", mage1: "lc1", mage2: "lc2", shroomBrown: "ms1", eye2: "bh2", ent1: "ent1", ent2: "ent2", gnoll1: "gn1", gnoll3: "gn3", plant3: "pl3", reptile2: "rp2", reptile3: "rp3", reptile: "rp1", kdragon: "kd92", shroomRed: "ms2", shroomPurple: "ms3",
                  golem2: "gm2", golem3: "gm3", ent: "ent3",
                  plant1: "pl1", plant2: "pl2", gnoll2: "gn2",
                  eyeRed: "bh1", eyePurple: "bh3", golem1: "gm1", lich: "lc3", devil: "dv2",
                  ghost: "gh1", ghost3: "gh3", wraith: "gh2", boneguard: "bg" };
const FOE_BORROW = { wraith: {},
                     kdragon:{} };
const seenFoe = {};
let seenCount = 0;
let knightEncounterDone = false;
let knightEncounterPhase = "waiting";
let knightEncounter = null;
function bookOrder() {
  const met = BESTIARY.filter(e => seenFoe[e.k]).sort((a, b) => seenFoe[a.k] - seenFoe[b.k]);
  const not = BESTIARY.filter(e => !seenFoe[e.k]);
  return met.concat(not);
}
const BESTIARY = [
  {"k": "devil1", "n": "Cinder Bailiff", "w": "the demon's Cinderhold trials", "t": "Before the Wingfall, riders sealed bargains with burned handprints. The Cinder Bailiffs still collect those debts. Maelis has persuaded one that a fair contest counts as payment."},
  {"k": "devil3", "n": "Crownless Fiend", "w": "the demon's Cinderhold trials", "t": "Halvard promised this fiend a kingdom beneath his own. With the crown broken, it has come to claim the empty hall. The summoner permits it only a few minutes at a time."},
  {"k": "skeleton1", "n": "Oathbone Swordsman", "w": "the demon's Cinderhold trials", "t": "These were the temple guards who refused to leave their posts when the wings fell. Their shields have rotted away. Their orders have not."},
  {"k": "skeleton3", "n": "Sepulchral Marshal", "w": "the demon's Cinderhold trials", "t": "The old rider tombs had no locks. Each had a marshal sworn to know every person entitled to enter. Centuries have thinned the list to no one."},
  {"k": "mage1", "n": "Ashscript Adept", "w": "the demon's Cinderhold trials", "t": "An apprentice once copied the names of fallen riders into a book of ash. The names burned through the pages and into his bones. He recites them whenever he raises his staff."},
  {"k": "mage2", "n": "Hollow Cantor", "w": "the demon's Cinderhold trials", "t": "The last choir beneath Forgewick sang until the temple doors were sealed. This cantor remembers the melody, though every word has become a curse."},

  {"k": "ghost3", "n": "Rimecrown Spirit", "w": "Hollybeck Temple and the last graveyard wave", "t": "Hollybeck once crowned its winter dead with woven rowan, hoping the old riders would know them at the temple gates. These spirits still wear the shape of that welcome. They emerge last from the graves, as though waiting for every other soul to be accounted for."},
  {"k": "shroomBrown", "n": "Timbercap Shroom", "w": "the first Shroom Pass arenas", "t": "Millwood's woodcutters once left rotten stumps standing so these small brown caps would feed on them instead of the timber stacks. With fewer axes in the northern woods, the Timbercaps have spread onto the paths. They still gather wherever the last tree was felled."},
  {"k": "reptile", "n": "Duneblade", "w": "the first desert crossings", "t": "The oldest caravan maps mark these crossings with a blade instead of a well. Duneblades once accepted a bowl of water as passage money. Since the roads emptied, they have kept collecting the bowls. Travellers are no longer allowed to leave them."},
  {"k": "reptile2", "n": "Cistern Fang", "w": "the deeper desert roads", "t": "Sandspire's abandoned cisterns still bear claw marks around their rims. The Cistern Fangs remember which stones cover water, and guard those secrets more fiercely than coin. Their road bands patrol the paths between wells that no human has opened in fifty years."},
  {"k": "reptile3", "n": "Sunscar Sentinel", "w": "the far desert crossings", "t": "Their elders inherit a stretch of road and the names of everyone who died defending it. A Sunscar Sentinel is the last keeper of that memory. Caravan folk say it faces the setting sun after battle, counting a company that is no longer there."},
  {"k": "boneguard", "n": "Boneguard", "w": "the final battle at Cinderhold", "t": "The king's last levy needs neither wages nor graves. Each blade is bound into its owner's hand, each rib marked with the same command. A Boneguard does not remember the oath it swore in life. Something beneath Cinderhold remembers for it."},
  {"k": "plant1", "n": "Hedgebite Vinemaw", "w": "the first blossom roads", "t": "Thornwell gardeners once planted these along orchard walls to keep the deer out. After Wingfall, the orchards went untended. The roots crossed the walls, and the mouths learned that a footstep could mean something larger than a deer."},
  {"k": "plant2", "n": "Pilgrim Vinemaw", "w": "the middle blossom roads", "t": "These grew where travellers left flowers at roadside shrines. Their seeds travelled in the hems of pilgrims' coats, linking one shrine to the next. The pilgrims are gone, but the plants still lean towards the road whenever they hear someone coming."},
  {"k": "plant3", "n": "Widowbloom Vinemaw", "w": "the far blossom roads", "t": "Village custom was to plant one at the gate when a rider failed to return. After Wingfall, entire lanes flowered. The oldest blooms have swallowed their gates and the paths beyond; people still leave offerings, though nobody now agrees whom they are feeding."},
  {"k": "gnoll1", "n": "Tollfang Gnoll", "w": "the first snow arenas and roads", "t": "Tollfang bands occupy the shelters where winter roadkeepers once collected passage money. They have copied the custom without understanding the receipt. A strip of old uniform is enough to make one a collector; anyone without it is expected to pay."},
  {"k": "gnoll2", "n": "Rimepick Gnoll", "w": "the deeper snow roads and mine galleries", "t": "Rimepicks learned to follow ore carts rather than caravans. When Forgewick's deeper workings fell silent, they carried stolen tools into the mountain roads. Each band keeps a broken miner's lamp, passed from hand to hand as a claim to everything found underground."},
  {"k": "gnoll3", "n": "Cairnkeeper Gnoll", "w": "the last snow arenas", "t": "The largest clans leave their dead beneath heaps of travellers' stones. A Cairnkeeper carries the names of those cairns in a knotted cord. It raids the road for iron and cloth, then takes the spoils home to people who can no longer use them."},
  {"k": "eyeRed", "n": "Cinder Watcher", "w": "the first volcanic roads and Cinderhold approach", "t": "Quarrymen once judged safe footing by where the red eyes gathered: warm rock, but not yet molten. That knowledge died with the last road crews. The Watchers still gather at the crossings, patiently examining every living thing that mistakes them for distant lamps."},
  {"k": "eye2", "n": "Kiln Watcher", "w": "the middle volcanic roads", "t": "The shuttered kilns beyond Ashcrag have no windows, yet their keepers used to complain of being watched. When the doors were broken open, these creatures drifted out. Some still circle an empty patch of road as though tending a furnace only they can see."},
  {"k": "eyePurple", "n": "Vesper Watcher", "w": "the far volcanic roads and Cinderhold approach", "t": "The violet eyes appear in drawings older than Halvard's reign, always above an empty throne. Scholars called them witnesses, not servants. Those near Cinderhold have watched the same king for fifty years. No one knows what would finally satisfy them enough to look away."},
  {"k": "ent1", "n": "Orchard Longroot", "w": "the first wooded roads beyond Coralmere", "t": "Fruit growers once tied bells to these trees to frighten birds from their branches. After the farms emptied, the trees followed the sound of carts towards Coralmere. The bells are gone. The habit of waiting beside a road has outlived both the farmers and the fruit."},
  {"k": "ent2", "n": "Boundary Longroot", "w": "the middle wooded roads beyond Coralmere", "t": "Before Wingfall, disputes over woodland ended at trees marked by a rider's seal. These were those trees. Fifty years without anyone to renew the marks has left them wandering the old boundaries, treating every traveller as someone moving a fence in the night."},
  {"k": "ent", "n": "Oathroot Longroot", "w": "the far wooded roads beyond Coralmere", "t": "Riders once planted a tree when they swore to protect a settlement. The oldest Longroots grew from those promises. Woodcutters say they began walking when the riders fell, searching for whoever should inherit the oath. They have not accepted anyone yet."},
  {"k": "shroomRed", "n": "Lanterncap Shroom", "w": "the upper and middle mine galleries", "t": "Children in Millwood were taught to count the red caps beside the pass: if the number changed, go home. Adults called it a nursery warning until the mine paths began moving overnight. A Lanterncap can stand still longer than most people can stay afraid."},
  {"k": "shroomPurple", "n": "Deepveil Shroom", "w": "the deepest mine galleries", "t": "Miners found the violet caps growing through the felt of abandoned helmets. They thrive below the last timber supports, where even the roots from above cannot reach. Old pit hands left an empty helmet at each descent, hoping the growth would settle for that."},
  {"k": "ghost", "n": "Gravewake Spirit", "w": "Hollybeck graveyard and the temple undercrofts", "t": "Hollybeck's oldest graves face the road so the dead may see their families return. Few families make that journey now. The restless rise to meet footsteps at the gate; beneath the temples, other spirits wait with the same terrible patience."},
  {"k": "wraith", "n": "Bound Wraith", "w": "the summons of the Book of the Dead", "t": "The Book of the Dead records obligations rather than names. Read a debt aloud and something hooded arrives to discharge it. It will fight beside the bearer without complaint. The missing pages may explain what the bearer owes in return."},
  {"k": "golem1", "n": "Stone Golem", "w": "the desert temple depths and the mine", "t": "The chisel marks beneath its feet belong to the masons who built the old rider halls. Stone Golems hauled the blocks, then stood watch when the work was done. Their makers carved the command to wake. No surviving wall records the command to rest."},
  {"k": "golem2", "n": "Iron Golem", "w": "the Forgewick temple depths", "t": "Forgewick smiths once repaired these wardens a plate at a time, stamping each replacement with a family mark. Several generations can be read across one body. The last stamps date to Wingfall. The wardens have kept their posts without a smith ever since."},
  {"k": "golem3", "n": "Ember Golem", "w": "the Hollybeck temple depths", "t": "An ember carried from a rider's hearth was sealed inside each of these guardians to keep the high halls warm. The hearths went cold after Wingfall; the embers did not. Beneath Hollybeck's snow, they still tend a household of empty rooms."},
  {"k": "lich", "n": "Lich", "w": "the final battle at Cinderhold", "t": "The old rider rites joined one life to another through trust. A lich makes a cruel imitation: it binds what should have been released, then calls that binding survival. Its bones endure, but every command to the dead is another confession that it fears joining them."},
  {"k": "devil", "n": "Ashfiend", "w": "the passage beneath Ashcrag", "t": "The first miners to break into the hot caverns found claw marks on their side of the rock. Whatever made them had been trying to get deeper. The Ashfiend now guards the passage above those workings. Even it seems unwilling to return to whatever lies below."}
];
function facing(f, tgt) {
  const dx = tgt.x - f.x, dy = tgt.y - f.y;
  const d = foeDir(f.dir, f.flip);
  if (d === "e") return dx > -6;
  if (d === "w") return dx < 6;
  if (d === "u") return dy < 6;
  return dy > -6;
}
// Full enemy sequences retain the existing combat and movement timing.
function golemFrame(f, sp, name, stats, impactFrame = 5) {
  const n = sp[4];
  if (f.st === "dead") return Math.min(n - 1, Math.floor(f.t / 0.5 * n));
  if (name.includes("_hurt_"))
    return Math.min(n - 1, Math.floor(Math.max(0, 0.25 - f.hurt) / 0.25 * n));
  if (name.includes("_atk_")) {
    // Align each sprite pack’s impact pose with the damage event.
    const impact = Math.min(impactFrame, n - 1);
    const frame = f.t < stats.hitAt ? f.t / stats.hitAt * impact
      : impact + (f.t - stats.hitAt) / (stats.swingT - stats.hitAt) * (n - impact);
    return Math.max(0, Math.min(n - 1, Math.floor(frame)));
  }
  const t = f.st === "swing" ? Math.max(0, f.t - stats.swingT) : f.t;
  return Math.floor(t * 6 * n / 4) % n;
}
function foeDir(dir, flip) {
  return dir === "s" ? (flip ? "w" : "e") : dir;
}
function spawnFoes() {
  foes = []; turnHolder = null; turnT = 0; foeCool = 0;
  (MD.foes || []).forEach((f, idx) => {
    const kind = FOE[f.k] ? f.k : "skeleton";
    if(kind==="treasuryknight" && royalDefeated["treasuryCaptain"])return;
    if(kind==="royalguard" && (wonAll || royalDefeated[MAPID+":"+idx]))return;
    if (kind === "knight" && knightEncounterDone) return;
    if (NO_RESPAWN.test(kind) && bossGone[MAPID + ":" + idx]) return;
    const k = FOE[kind];
    if(MD.templeContinuous&&(bossGone[MAPID+':room:'+(idx<4?'ghost':'golem')]||(idx>=4&&bossGone[(MD.templeOldGolem||'tp3')+':'+(idx-4)])))return;
    const x = f.x * TS + 8, y = f.y * TS + 16;
    foes.push({ kind, x, y, hx: x, hy: y,
                hp: enemyMaxHp(kind, x), st: "idle", t: 0, dir: "d", flip: false, hurt: 0, idx,
                storyKnight: kind === "knight", storyPassive: kind === "knight" });
  });
  /* A death or map reload restarts the story duel from its approach trigger. */
  if (MAPID === "world" && !knightEncounterDone && foes.some(f => f.storyKnight)) {
    knightEncounterPhase = "waiting";
    knightEncounter = null;
  }
}
function swordOverlaps(f) {
  const body = foeBodyProfile(f);
  return Math.abs(body.x-P.x)<=PC_W/2+body.r && Math.abs(body.y-P.y)<=PC_H+body.r;
}
function deflectClearance(actor, angle, distance, isDragon) {
  let x = actor.x, y = actor.y, moved = 0;
  const stand = isDragon ? dragonCanStand : canStand;
  for (let left = distance; left > .1; left -= 3) {
    const step = Math.min(3, left);
    const nx = x + Math.cos(angle) * step, ny = y + Math.sin(angle) * step;
    if (!stand(nx, ny)) break;
    x = nx; y = ny; moved += step;
  }
  return { x, y, moved };
}
function knockFromKing(actor, f, distance, isDragon = false) {
  let dx = actor.x - f.x, dy = actor.y - f.y;
  if (Math.hypot(dx, dy) < 1) { dx = actor === P ? -1 : 1; dy = .25; }
  const base = Math.atan2(dy, dx);
  /* Fan away from a blocked radial path so a wall cannot cancel the shove. */
  const turns = [0, -.35, .35, -.70, .70, -1.05, 1.05, -1.57, 1.57];
  let best = deflectClearance(actor, base, distance, isDragon);
  for (let i = 1; i < turns.length; i++) {
    const test = deflectClearance(actor, base + turns[i], distance, isDragon);
    if (test.moved > best.moved + 1) best = test;
  }
  actor.x = best.x; actor.y = best.y;
}
function drawKingShield(f) {
  if (!kingShield || kingShield.foe !== f) return;
  const p = Math.max(0, 1 - kingShield.t / kingShield.life);
  const flare = Math.sin(Math.PI * p);
  ctx.save();
  ctx.translate(f.x, f.y - 36);
  ctx.rotate(kingShield.angle);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const lich = f.kind === "lich";
  ctx.strokeStyle = lich
    ? `rgba(122,45,190,${.28 + flare * .72})`
    : `rgba(184,225,255,${.22 + flare * .72})`;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 43 + p * 5, -1.0, 1.0); ctx.stroke();
  ctx.strokeStyle = lich
    ? `rgba(8,3,13,${.55 + flare * .4})`
    : `rgba(143,112,255,${.15 + flare * .55})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 36 + p * 8, -1.08, 1.08); ctx.stroke();
  ctx.fillStyle = lich
    ? `rgba(48,8,71,${.35 + flare * .65})`
    : `rgba(225,244,255,${flare * .8})`;
  for (let a = -.78; a <= .79; a += .39) {
    ctx.beginPath(); ctx.arc(Math.cos(a) * 45, Math.sin(a) * 45, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function stepKingShield(dt) {
  if (!kingShield) return;
  kingShield.t += dt;
  if (kingShield.t >= kingShield.life || !kingShield.foe || kingShield.foe.st === "dead") kingShield = null;
}
function kingDeflect(f, attacker) {
  const source = attacker || P;
  kingShield = { foe: f, t: 0, life: .42,
    angle: Math.atan2(source.y - (f.y - 36), source.x - f.x) };
  if (mounted) {
    dragon.x = P.x; dragon.y = P.y; dragon.air = false; dragon.tr = null;
    setMounted(false, true);
  }
  if (Math.hypot(P.x - f.x, P.y - f.y) < 130) {
    if (!camFree && !hatchCamera && !bossScene)
      deflectCamera ||= { map: MAPID, zoom: cam.z, t: 0 };
    if (deflectCamera) deflectCamera.t = 0;
    knockFromKing(P, f, 52, false);
    P.moving = false;
    P.act = { kind: "fall", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() };
  }
  if (dragonHere() && dragon.on && !dragon.down &&
             Math.hypot(dragon.x - f.x, dragon.y - f.y) < 150) {
    knockFromKing(dragon, f, 72, true);
    dragon.knockdown = dragon.knockdownMax;
    dragon.faintDir = cardinalDirection(dragon.dir) === "w" ? "w" : "e";
    dragon.moving = false; dragon.air = false; dragon.tr = null;
  }
  hunt = null; claw = null; linger = 0;
  clawT = Math.max(clawT, 1.1);
  dragonBreak = { foe: f, t: .75 };
  dragonCombatPause = Math.max(dragonCombatPause, .75);
  if (!f.guardToastAt || tAcc - f.guardToastAt > .7) {
    f.guardToastAt = tAcc;
    toast(f.kind === "lich" ? "the lich's ward throws them back" : "the king dragon turns them aside");
  }
}
function regularFoe(f) { return !f.ally && !f.trial && !BOSS_KIND.test(f.kind || "") && f.kind !== "kdragon"; }
function makeFoeRetreat(f, sourceX, sourceY, seconds = .68) {
  if (f.ally || f.trial) return;
  const boss = BOSS_KIND.test(f.kind || "") || f.kind === "kdragon";
  if (boss) {
    /* Bosses stand their ground initially, then step away if Corin keeps
       locking them in a sword loop. */
    f.pressureHits = (!f.pressureAt || tAcc - f.pressureAt > 1.25)
      ? 1 : (f.pressureHits || 0) + 1;
    f.pressureAt = tAcc;
    if (f.pressureHits < 3) return;
    f.pressureHits = 0;
    seconds = f.kind === "kdragon" ? .85 : .50;
    if (f.kind === "kdragon" || f.kind === "lich") {
      /* Breaking a three-hit sword string begins a retaliation, not another
         identical loop.  Its scales turn follow-up slashes until the
         retreat has flowed into a committed counterattack on Corin. */
      f.swordGuard = Math.max(f.swordGuard || 0, 3.05);
      f.pressureCounter = true;
      f.cool = 0;
    }
  } else {
    // Ordinary enemies commit to attacks. A single hit no longer turns them
    // around; two quick hits can buy a short step back, at most once per 2s.
    if (f.st === "wind" || f.st === "swing" || tAcc < (f.retreatReadyAt || 0)) return;
    f.pressureHits = f.pressureAt === undefined || tAcc - f.pressureAt > 1.5
      ? 1 : (f.pressureHits || 0) + 1;
    f.pressureAt = tAcc;
    if (f.pressureHits < 2) return;
    f.pressureHits = 0;
    f.retreatReadyAt = tAcc + 2;
    seconds = Math.min(seconds, .28);
  }
  f.retreat = Math.max(f.retreat || 0, seconds);
  f.retreatX = sourceX; f.retreatY = sourceY;
  f.st = "walk"; f.t = 0; f.hit = 0;
}
function swingHits() {
  const a = P.act;
  if (!a || a.kind !== "swing" || a.hit) return;
  if (a.t < 3 || a.t > 6) return;              /* the middle of the swing */
  a.hit = 1;
  const [dx,dy] = directionVector(playerFacing4(a));
  const tx = P.x + dx * 16, ty = P.y + dy * 16;
  for (const f of foes) {
    if (f.st === "dead" || f.ally) continue;      /* his own dead are not targets */
    const body = foeBodyProfile(f);
    if (!swordOverlaps(f) && Math.hypot(body.x - tx, body.y - ty) > 20 + body.r) continue;
    // Each variant has its own page and encounter order.
    if (!seenFoe[f.kind]) seenFoe[f.kind] = ++seenCount;
    if ((f.kind === "kdragon" || f.kind === "lich") && f.swordGuard > 0) {
      kingDeflect(f, P);
      continue;
    }
    let dmg = smithUpgrade ? 2 : 1;
    if (a.hot) dmg += 1;              /* the brand's third swing */
    if (worn.edge) {
      edgeCarry += 0.2;
      if (edgeCarry >= 1) { dmg += 1; edgeCarry -= 1; }
    }
    f.hp -= dmg; f.hurt = 0.25;
    if (f.hp > 0) makeFoeRetreat(f, P.x, P.y);
    if (f.hp <= 0) {
      f.st = "dead"; f.t = 0;
      if (!f.ally && !f.storyKnight) dropGold(f.x, f.y, f.kind);
      markBossGone(f);
      if (worn.spore && pHp < pMax) pHp = Math.min(pMax, pHp + 1);
      if (worn.flame && worn.twin && twinSpent && ++twinKills >= 4) {
        twinSpent = false; twinKills = 0;
        toast("the twin heart beats again");
      }
    }
  }
}
let edgeCarry = 0;
const charm = { spore: false, ward: false, edge: false, brand: false, twin: false,
                lamp: false, flame: false, wake: false };
const worn  = { spore: false, ward: false, edge: false, brand: false, twin: false,
                lamp: false, flame: false, wake: false };
let wakeSpent = false;
let gold = 50, potions = 0, elixirs = 0, bombs = 0, dust = 0;
let boarMeat = 0, dragonFish = 0;
let bells = 0, marks = 0, dropped = null;
let breaths = 0, stones = 0, salts = 0;
const BELL_COST = 40, MARK_COST = 20;
const BREATH_COST = 80, STONE_COST = 60, SALT_COST = 70;
const DUST_COST = 50;
const BOMB_COST = 100;
const POTION_COST = 20;
const ELIXIR_COST = 60;
const BOAR_MEAT_COST = 20, DRAGON_FISH_COST = 20;
const BOAR_MEAT_HEAL = 30, DRAGON_FISH_HEAL = 35;
const treasuryTaken = new Set();
const TREASURY_CHESTS = [{id:'chest0',x:184,y:88,n:600},{id:'chest2',x:184,y:176,n:600}];
function seedTreasuryGold(){
 if(MAPID!=='royal_treasury')return;
 let i=0;
 for(const y of [88,184])for(const x of [32,64]){
  const id='pile'+([88,112,160,184].indexOf(y)*6+[32,64,96,128,160,192].indexOf(x));i++;
  if(!treasuryTaken.has(id))loot.push({x,y,n:50,art:i%3?'gold_p2':'gold_p3',t:0,treasuryId:id});
 }
}
function treasuryGuarding(){return MAPID==="royal_treasury"&&!foesHeld&&foes.some(f=>f.kind==="treasuryknight"&&f.st!=="dead")}
function tryTreasuryChest(){
 if(MAPID!=='royal_treasury')return false;
 const c=TREASURY_CHESTS.find(c=>!treasuryTaken.has(c.id)&&Math.hypot(P.x-c.x,P.y-c.y)<34);
 if(!c)return false;
 if(treasuryGuarding()){toast("Defeat the Treasury Captain to claim the treasure.");return true;}
 treasuryTaken.add(c.id);gold+=c.n;flyGold(c.x,c.y,c.n);
 showReveal('it_coin','Corin found '+c.n+' gold!',3,true);
 return true;
}
function drawTreasuryChests(){
 if(MAPID!=='royal_treasury')return;
 const sp=SPR.chest;
 for(const c of TREASURY_CHESTS){
  const f=treasuryTaken.has(c.id)?sp[4]-1:0;
  drawGameImage(ctx,atlasImg,sp[0]+f*sp[2],sp[1],sp[2],sp[3],c.x-sp[2]/2,c.y-sp[3],sp[2],sp[3]);
 }
}

let loot = [];
const WORTH = {
  plant1: 3, plant2: 4, shroomBrown: 4, shroomRed: 5, shroomPurple: 6,
  gnoll1: 7, gnoll2: 7, gnoll3: 7, plant3: 4, reptile2: 8, reptile3: 8, reptile: 8, boneguard: 8, eyeRed: 8, eye2: 8, eyePurple: 11,
  royalguard: 18, knight: 0, ghost: 9, ghost3: 9, ent1: 12, ent2: 12, ent: 12, wraith: 0,
  golem1: 26, golem2: 34, golem3: 38, lich: 44, devil: 50,
};
const GOLD_DROP_MULTIPLIER = 1.8;
function dropGold(x, y, kind) {
  const base = WORTH[kind] !== undefined ? WORTH[kind]
             : BOSS_KIND.test(kind || "") ? 30 : 5;
  if (!base) return 0;                      /* his own dead pay nothing */
  const richer = Math.ceil(base * GOLD_DROP_MULTIPLIER);
  const n = Math.max(1, richer + Math.floor(Math.random() * Math.max(2, richer * 0.4)) - 1);
  const art = n >= 26 ? "gold_p4" : n >= 12 ? "gold_p3"
            : n >= 6  ? "gold_p2" : "gold_p1";
  loot.push({ x, y, n, art, t: 0 });
  if (graves && arenaLock === graves.ring) graves.earned += n;
  return n;
}
function takeGold() {          /* kept for anything that still calls it */
  return dropGold(P.x, P.y, null);
}
let flying = [];
function flyGold(x, y, n) {
  const many = Math.min(9, 3 + Math.floor(n / 6));
  for (let i = 0; i < many; i++)
    flying.push({ x, y, t: -i * 0.045, life: 0.62,
                  sx: x + (Math.random() - 0.5) * 22,
                  sy: y - 4 - Math.random() * 14,
                  lift: 26 + Math.random() * 26 });
}
function stepFly(dt) {
  if (!flying.length) return;
  for (const f of flying) f.t += dt;
  flying = flying.filter(f => f.t < f.life);
}
function drawFly() {
  if (!flying.length) return;
  const sp = SPR.it_coin || SPR.gold_p1;
  if (!sp) return;
  const tx = cam.x + 40 / cam.z, ty = cam.y + 22 / cam.z;
  ctx.save();
  for (const f of flying) {
    if (f.t < 0) continue;
    const p = Math.min(1, f.t / f.life);
    const e = p * p;                       /* slow away, fast home */
    const x = f.sx + (tx - f.sx) * e;
    const y = f.sy + (ty - f.sy) * e - Math.sin(p * 3.14159) * f.lift;
    const k = 0.5 * (1 - p * 0.45);
    ctx.globalAlpha = 1 - p * p * 0.5;
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(x - sp[2] * k / 2), Math.round(y - sp[3] * k / 2),
                  sp[2] * k, sp[3] * k);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
function grabGold() {
  let got = 0, kept = [];
  for (const g of loot) {
    if(g.treasuryId&&treasuryGuarding()){kept.push(g);continue;}
    if (Math.hypot(g.x - P.x, g.y - P.y) < 26) { got += g.n; if(g.treasuryId)treasuryTaken.add(g.treasuryId); flyGold(g.x, g.y, g.n); }
    else kept.push(g);
  }
  if (!got) return false;
  loot = kept;
  gold += got;
  toast("Corin got " + got + " gold!");
  return true;
}
function drawLoot() {
  drawTreasuryChests();
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const g of loot) {
    if (g.x < cam.x - 32 || g.x > cam.x + vw + 32 ||
        g.y < cam.y - 32 || g.y > cam.y + vh + 32) continue;
    const sp = SPR[g.art] || SPR.gold_p2;
    if (!sp) continue;
    const b = Math.round(Math.sin(g.t * 3) * 1.5);
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(g.x - sp[2] / 2), Math.round(g.y - sp[3] + b),
                  sp[2], sp[3]);
  }
}
function stepLoot(dt) {
 for(const g of loot)g.t+=dt;
 if(MAPID==='royal_treasury'&&mode==='play'&&!ovl&&!sayNpc&&loot.some(g=>g.treasuryId&&Math.hypot(g.x-P.x,g.y-P.y)<14))grabGold();
}
let devItemTest = false;
function drinkPotion() {
  if (potions <= 0 && !devSafe) { toast("no potions"); return false; }
  if (pHp >= pMax && !devSafe && !devItemTest) { toast("he is not hurt"); return false; }
  potions--;
  pHp = Math.min(pMax, pHp + 2);
  showHeal("potion");
  toast("two hearts back -- " + potions + " left");
  return true;
}
function feedDragon(kind) {
  if (!hasDragon()) { toast("Corin does not have the dragon yet"); return false; }
  // A stale recovery flag from an earlier save must never block feeding.
  if (!dragon.down) dragon.revive = 0;
  const fish = kind === "fish";
  if ((fish ? dragonFish : boarMeat) <= 0 && !devSafe) {
    toast(fish ? "no fish" : "no boar meat"); return false;
  }
  syncDragonVitality(false);
  if (dragon.hp >= dragon.maxHp && !devSafe && !devItemTest) {
    toast("the dragon is already full"); return false;
  }
  const wasDown = dragon.down;
  if (fish) dragonFish--; else boarMeat--;
  dragon.hp = Math.min(dragon.maxHp, dragon.hp + (fish ? DRAGON_FISH_HEAL : BOAR_MEAT_HEAL));
  dragon.down = wasDown ? true : dragon.hp <= 0;
  dragon.revive = wasDown && dragon.hp > 0 ? Math.min(dragon.revive || 1.2, 1.2) : 0;
  dragon.hurt = 0; dragon.inv = 1.2;
  if (dragonHere()) showHeal("dragon", dragon.x, dragon.y - 18);
  toast((fish ? "fish" : "boar meat") + " restores the dragon");
  return true;
}
let saintT = 0;
function useSaint() {
  if (breaths <= 0 && !devSafe) { toast("no saint's breath"); return false; }
  breaths--; saintT = 16;
  toast("nothing can touch him");
  return true;
}
function useStone() {
  if (stones <= 0 && !devSafe) { toast("no stones"); return false; }
  let best = null, bd = 260;
  for (const f of foes) {
    if (f.st !== "dead" || f.ally || f.raised) continue;
    const d = Math.hypot(f.x - P.x, f.y - P.y);
    if (d < bd) { bd = d; best = f; }
  }
  if (!best && devItemTest) {
    const kind=foes.find(f=>FOE[f.kind]&&!BOSS_KIND.test(f.kind))?.kind||'skeleton1';
    const prefix=FOE_ART[kind]||'sk';
    const nm=[prefix+'_die_d',prefix+'_die'].find(k=>SPR[k]);
    if(!nm){toast('No death animation available here.');return false;}
    stonePreview={kind,x:P.x+28,y:P.y,st:'idle',t:0,hp:1,raised:1,ally:1,emerge:1,reverseRise:1.2,reverseRiseMax:1.2,nm};return true;
  }
  if (!best && !devSafe) { toast("nothing dead near enough"); return false; }
  if (!best) { stones--; toast("nothing dead near enough -- spent anyway"); return true; }
  stones--;
  best.reverseRise = 1.2; best.reverseRiseMax = 1.2;
  const k = FOE[best.kind] || {};
  best.st = "idle"; best.t = 0; best.ally = 1; best.raised = 1;
  best.hold = 0; best.holdMax = 0; best.emerge = 1;   /* it climbs out */
  best.hp = Math.max(1, Math.round((k.hp || 4) / 2));
  best.hurt = 0; best.mad = 0;
  best.slot = foes.indexOf(best);
  rebuildBuckets();
  toast("it gets up, and it is his now");
  return true;
}
function useSalt() {
  if (salts <= 0 && !devSafe) { toast("no salt"); return false; }
  let ring = null;
  for (const f of features) {
    if (f.kind !== "arena") continue;
    if (Math.hypot(P.x / TS - f.x, P.y / TS - f.y) <= (f.r || 6)) { ring = f; break; }
  }
  if (devItemTest && (!ring || bossRing(ring) || arenaFoesLeft(ring) || (arenaLock===ring&&!arenaGoing))) {
    plantRing(ring || {x:P.x/TS,y:P.y/TS,r:3});return true;
  }
  if (!ring && !devSafe) { toast("he is not standing in a ring"); return false; }
  if (!ring) { salts--; toast("no ring here -- spent anyway"); return true; }
  if (bossRing(ring)) { toast("that one was never coming back"); return false; }
  if (arenaLock === ring && !arenaGoing) { toast("not while it is still fighting"); return false; }
  if (arenaFoesLeft(ring) && !devSafe) { toast("clear it first"); return false; }
  salts--;
  holy.add(ringKey(ring));
  plantRing(ring);            /* and the ground shows it */
  cooling.delete(ringKey(ring));
  toast("the ground is at peace. Nothing will rise here again.");
  return true;
}
let bell = null;
function useBell() {
  if (bells <= 0 && !devSafe) { toast("no bell stakes"); return false; }
  bells--;
  let bx, by;
  if (P.dir === "d") { bx = P.x; by = P.y + 30; }
  else if (P.dir === "u") { bx = P.x + (P.flip ? -30 : 30); by = P.y + 12; }
  else { bx = P.x + (P.flip ? -32 : 32); by = P.y + 12; }
  bell = { x: bx, y: by, t: 12, age: 0 };
  toast("the bell goes in, and it will not stop");
  return true;
}
function stepBell(dt) {
  if (!bell) return;
  bell.t -= dt;
  bell.age = (bell.age || 0) + dt;
  if (bell.t <= 0) { bell = null; toast("the bell falls quiet"); }
}
function drawBell() {
  if (!bell) return;
  const age = bell.age || 0;
  const drop = Math.min(1, age / 0.28);          /* it falls the last few feet */
  const fall = (1 - drop) * (1 - drop) * 26;
  const hit = Math.max(0, 1 - Math.max(0, age - 0.28) / 0.5);
  const shake = Math.sin(age * 46) * (0.6 + 2.6 * hit);
  const sp = SPR.it_bell_w || SPR.it_bell;
  const x = Math.round(bell.x + shake), y = Math.round(bell.y - fall);
  ctx.save();
  const PERIOD = 0.34;
  for (let k = 0; k < 4; k++) {
    const a = age - k * PERIOD;
    if (a < 0) continue;
    const ph = (a % (PERIOD * 4)) / (PERIOD * 4);
    if (ph > 1) continue;
    const rr = 18 + ph * 120;
    ctx.globalAlpha = (1 - ph) * 0.5;
    ctx.strokeStyle = "#f0e2b4";
    ctx.lineWidth = Math.max(1, 3 * (1 - ph));
    ctx.beginPath();
    ctx.ellipse(bell.x, bell.y - 4, rr, rr * 0.42, 0, 0, 6.283);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (sp) {
    /* it_bell_w is stored at its drawn size; the old 0.7 was for the
       31x38 sprite this replaced and would tower over the map now */
    const k = SPR.it_bell_w ? 1 : 0.7;
    const w = Math.round(sp[2] * k), h = Math.round(sp[3] * k);
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  x - (w >> 1), y - h, w, h);
  }
  ctx.restore();
}
function drawTrialPedestal() {
  const x = TRIAL_PEDESTAL.x, y = TRIAL_PEDESTAL.y;
  const active = trialSealPlaced;
  const dx = x - 16, dy = y - 36;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#101522";
  ctx.beginPath(); ctx.ellipse(x, y - 1, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  /* This is the pale stone altar from the Witchmoor room. The room artwork is
     a single bitmap, so clip its pedestal silhouette away from the floor. */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx + 11, dy + 4); ctx.lineTo(dx + 21, dy + 4);
  ctx.lineTo(dx + 21, dy + 5); ctx.lineTo(dx + 26, dy + 5);
  ctx.lineTo(dx + 26, dy + 23); ctx.lineTo(dx + 28, dy + 23);
  ctx.lineTo(dx + 28, dy + 26); ctx.lineTo(dx + 24, dy + 26);
  ctx.lineTo(dx + 24, dy + 34); ctx.lineTo(dx + 21, dy + 34);
  ctx.lineTo(dx + 21, dy + 36); ctx.lineTo(dx + 11, dy + 36);
  ctx.lineTo(dx + 11, dy + 34); ctx.lineTo(dx + 9, dy + 34);
  ctx.lineTo(dx + 9, dy + 26); ctx.lineTo(dx + 5, dy + 26);
  ctx.lineTo(dx + 5, dy + 23); ctx.lineTo(dx + 6, dy + 23);
  ctx.lineTo(dx + 6, dy + 5); ctx.lineTo(dx + 11, dy + 5);
  ctx.closePath(); ctx.clip();
  drawGameImage(ctx, atlasImg, 207, 16711, 32, 42, dx, dy, 32, 42);
  ctx.restore();

  /* Replace the Witchmoor book with the Cinderhold Seal's recessed socket. */
  ctx.fillStyle = "#63758f"; ctx.fillRect(x - 6, y - 31, 12, 2);
  ctx.fillStyle = "#30394c"; ctx.fillRect(x - 7, y - 29, 14, 12);
  ctx.fillStyle = active ? "#5e2778" : "#171b28";
  ctx.fillRect(x - 5, y - 28, 10, 9);
  ctx.fillStyle = active ? "#c36be8" : "#252c3d";
  ctx.fillRect(x - 3, y - 27, 6, 1);
  if (active) {
    const pulse = 0.42 + Math.sin(tAcc * 5) * 0.16;
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#d678ff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y - 24, 13, 7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    const seal = SPR.it_cinderseal;
    if (seal) drawGameImage(ctx, sheetOf(seal), seal[0], seal[1], seal[2], seal[3],
      Math.round(x - seal[2] / 2), Math.round(y - 18 - seal[3]), seal[2], seal[3]);
  }
  ctx.restore();
}
let graves = null;
let lastFight = 0, wonAll = 0;

let trialSealPlaced = false;
const THRONE_DEMON={x:176,y:136};
function trialDemonHere(){return wonAll&&((MAPID==="witchmoor"&&!trialSealPlaced)||(MAPID==="cinderhold"&&trialSealPlaced));}
let cinderSeal = false, trialWins = 0, trial = null;
const TRIAL_STRONG = new Set(["golem1", "golem2", "golem3", "devil", "devil1", "devil3",
  "lich", "kdragon", "boneguard", "gnoll3", "plant3", "reptile3", "ent", "eyePurple",
  "shroomPurple", "ghost3", "skeleton3", "mage2"]);
function trialRoster() {
  return BESTIARY.filter(e => e.k !== "wraith" && FOE[e.k]).map(e => ({
    kind: e.k, name: e.n, count: TRIAL_STRONG.has(e.k) ? 1 : 2
  })).sort((a, b) => FOE[a.kind].hp - FOE[b.kind].hp);
}
function trialAsk() {
  if (!wonAll || !cinderSeal || trial) return;
  ask = { opts: [
    { n: "PLACE THE CINDERHOLD SEAL", go: () => { if(trialSealPlaced)return; royalBlackout("a sound came from the throne room",()=>{trialSealPlaced=true;saveGame();}); } },
    { n: "NOT YET", go: null }
  ] }; askPick = 0; askDraw();
}
function interactTrialPedestal() {
  if (!trialPedestalHere() || trial ||
      Math.hypot(P.x - TRIAL_PEDESTAL.x, P.y - TRIAL_PEDESTAL.y) > 48) return false;
  faceCorinAt(TRIAL_PEDESTAL.x, TRIAL_PEDESTAL.y);
  if (!wonAll) {playScene(["The seal chamber is silent. The Crown still holds the throne."]);return true;}
  if (!cinderSeal) {
    playScene(["A pale stone pedestal stands against the north wall, at the end of the rug.",
      "A seal-shaped hollow has been cut into its crown."], { hold: false });
  } else if(trialSealPlaced)playScene(["The seal rests in its socket. The demon awaits you in the throne room."]);
  else trialAsk();
  return true;
}
function talkTrialDemon() {
  if (!wonAll || trial) return;
  if(trialSealPlaced&&MAPID==='cinderhold'){
    playScene(["Demon: I will summon waves of creatures for you to face. Two of the lesser kinds, one of the greater.",
      "Demon: Defeat them all to complete the trial. You may return and try again whenever you wish.",
      "Demon: Are you ready?"],{hold:false,after:()=>{
      ask={quick:1,opts:[{n:'YES',go:startTrial},{n:'NO',go:null}]};askPick=0;askDraw();
    }});return;
  }
  playScene(cinderSeal ? ["Demon: Place your seal in the chamber adjoining the throne room. I will meet you in the hall."] : [
    "Maelis: With the King gone, a keeper of old trials has answered my circle.",
    "Demon: I offer a contest against summoned creatures. I will oversee it, not fight you.",
    "Demon: Take this seal to the chamber adjoining Cinderhold's throne room. Set it in the pedestal to call me there."
  ],{hold:false,after:()=>{const first=!cinderSeal;cinderSeal=true;saveGame();if(first)showReveal('it_cinderseal','Corin obtained the Cinderhold Seal!',3);}});
}
function clearTrialCombat() {
  foes = []; bolts.length = 0; breath = null; hunt = null; claw = null;
  spell = null; risings = []; turnHolder = null; turnT = 0; foeCool = 0;
  lastFight = 0; bossScene = null; grief = null; risePend = null;
  arenaLock = null; arenaT = 0; arenaGoing = false;
  twinSpent = false; twinKills = 0;
}
function stopTrial(message = "The trial ends. Speak to the demon in the throne room to try again.") {
  if (!trial) return;
  trial = null; clearTrialCombat(); rebuildBuckets();
  if (message) toast(message);
}
function startTrial() {
  if (!wonAll || !cinderSeal || MAPID !== "cinderhold" || !trialSealPlaced || trial) return;
  setOvl(null);
  clearTrialCombat();
  P.x = 176; P.y = 160; P.dir = "u"; P.act = null; pInv = 2;
  cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2; clampCam();
  trial = { waves: trialRoster(), index: -1, wait: 0, spawning: false };
  arenaLock = { id: "demon-trial", kind: "arena", x: 11, y: 18, r: 25.2 };
  arenaT = 1; arenaGoing = false;
  const run = trial;
  playScene(["Demon: Then let the trial begin.",
    "Shapes begin to gather across the throne room."],
    { hold: false, after: () => {
      if (trial === run && MAPID === "cinderhold") nextTrialWave();
    } });
}
function nextTrialWave() {
  if (!trial) return;
  const run = trial;
  run.index++;
  if (run.index >= run.waves.length) {
    trialWins++; stopTrial(""); saveGame();
    playScene(["The last shape breaks apart. Cinderhold falls quiet.",
      "Demon: Every creature, and still you stand. Come again when the silence bores you.",
      "Cinderhold trial complete! Victories: " + trialWins], { hold: false });
    return;
  }
  const wave = run.waves[run.index];
  /* Recenter before choosing positions, then keep every enemy comfortably
     inside the current view. This also works after Corin moves between waves. */
  cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2; clampCam();
  const left = cam.x + 24, right = cam.x + VW / cam.z - 24;
  const top = cam.y + 28, bottom = cam.y + VH / cam.z - 24;
  const spots = [];
  const offsets = [[-76,32],[76,32],[-72,-32],[72,-32],[0,64],[-48,56],[48,56],[0,-64]];
  for (const [ox, oy] of offsets) {
    const x = Math.round((P.x + ox) / 8) * 8, y = Math.round((P.y + oy) / 8) * 8;
    if (x < left || x > right || y < top || y > bottom) continue;
    if (Math.hypot(x - P.x, y - P.y) < 68) continue;
    if ([[-18,-18],[18,-18],[-18,0],[18,0]].some(([dx,dy]) => isSolid(x+dx,y+dy))) continue;
    if (spots.some(p => Math.hypot(p.x-x,p.y-y) < 56)) continue;
    spots.push({x,y});
  }
  /* A visible grid supplies alternatives if Corin ended the previous wave
     beside a wall or piece of furniture. */
  for (let y = Math.ceil(top / 16) * 16; y <= bottom; y += 24) {
    for (let x = Math.ceil(left / 16) * 16; x <= right; x += 24) {
      if (Math.hypot(x - P.x, y - P.y) < 68) continue;
      if ([[-18,-18],[18,-18],[-18,0],[18,0]].some(([dx,dy]) => isSolid(x+dx,y+dy))) continue;
      if (spots.some(p => Math.hypot(p.x-x,p.y-y) < 56)) continue;
      spots.push({x,y});
    }
  }
  if (spots.length < wave.count) { stopTrial("The summoning floor is blocked. Clear the hall and try again."); return; }
  run.spawning = true;
  playScene(["Cinderhold trial — Wave " + (run.index + 1) + "/" + run.waves.length + ": " + wave.name + " ×" + wave.count],
    { hold: false, after: () => {
      if (trial !== run || MAPID !== "cinderhold") return;
      foes = foes.filter(f => f.ally && f.st !== "dead");
      bolts.length = 0; run.spawning = false; run.wait = 0;
      for (const pos of spots.slice(0, wave.count)) {
        foes.push({ kind: wave.kind, x: pos.x, y: pos.y, hx: pos.x, hy: pos.y,
          hp: enemyMaxHp(wave.kind, pos.x), st: "idle", t: 0, dir: "d", flip: false,
          hurt: 0, ring: 0, trial: true, hold: 0, holdMax: 0, emerge: 1 });
        /* Trial foes must exist visibly as soon as their health bars do.
           Keep the summoning flash, but do not bury the sprite behind the
           normal 2.6s resurrection/emergence state. */
        showRise(pos.x, pos.y, [168,92,232]);
      }
      rebuildBuckets();
    }});
}
function stepTrial(dt) {
  if (!trial) return;
  if (MAPID !== "cinderhold") { stopTrial(""); return; }
  if (pHp <= 0) { stopTrial("The trial is lost. Speak to the demon in the throne room to try again."); return; }
  if (trial.spawning || scene || sayNpc || ask || ovl) return;
  if (foes.some(f => !f.ally && f.st !== "dead")) { trial.wait = 0; return; }
  trial.wait += dt;
  if (trial.wait >= 2) nextTrialWave();
}

function startLastFight() {
  if (wonAll || lastFight || MAPID !== "cinderhold") return;
  lastFight = 1;
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  const kx = k ? k.x : P.x, ky = k ? k.y : P.y - 60;
  foes.push({ kind: "kdragon", x: kx + 40, y: ky + 16, hx: kx + 40, hy: ky + 16,
              st: "idle", t: 0, hp: enemyMaxHp("kdragon", kx + 40), dir: "d", flip: false,
              hurt: 0, ring: 0, chaseDelay: 0.75 });
  rebuildBuckets();
  toast("It comes down off the steps and lifts both heads.");
}
let grief = null;
let bossScene = null;
function bossWalk(actor, x, y, dt, player) {
  const dx = x - actor.x, dy = y - actor.y, d = Math.hypot(dx, dy);
  const step = Math.min(d, 78 * dt);
  if (player) { faceCorinAt(x, y); actor.moving = d > 1; actor.t += dt; }
  else { faceToward(actor, x, y); actor.goto = d > 1 ? [x, y] : null; }
  if (d > 0) { actor.x += dx / d * step; actor.y += dy / d * step; }
  return d <= step;
}
/* Reserve the corpse's full sprite rectangle plus room for a person's feet. */
function bossBodyBounds(dead) {
  const rawDir = foeDir(dead.dir, dead.flip);
  const dir = rawDir === "s" ? (dead.flip ? "w" : "e") : rawDir;
  const sp = SPR["kdnew_death_" + dir] || SPR.kdnew_death_e || SPR.kdnew_death_w || SPR.kd_idle_d || SPR.kd_idle;
  const deathScale = sp && sp[5] === 4 ? 176 / 128 : 1;
  const w = sp ? sp[2] * deathScale : 120, h = sp ? sp[3] * deathScale : 100;
  return { l: dead.x - w/2 - 10, r: dead.x + w/2 + 10,
           t: dead.y - h - 8, b: dead.y + 12 };
}
function bossBodyDepth(x, y, body) {
  return Math.max(0, Math.min(x-body.l, body.r-x, y-body.t, body.b-y));
}
let bossRouteOrigin = null;
function bossRouteEdge(ax, ay, bx, by, body) {
  let depth = bossBodyDepth(ax, ay, body);
  const count = Math.max(1, Math.ceil(Math.hypot(bx-ax, by-ay)/2));
  for (let i = 1; i <= count; i++) {
    const x = ax + (bx-ax)*i/count, y = ay + (by-ay)*i/count;
    const next = bossBodyDepth(x, y, body);
    // Someone already overlapping when the dragon dies may step out, never farther in.
    if (next > depth + 0.001 || (depth === 0 && next > 0)) return false;
    if (!canStand(x, y)) {
      // A rider may finish over a blocked tile. Permit leaving only those
      // original tiles; never permit entering another wall along the route.
      const start=bossRouteOrigin;
      if(!start || !start.blocked || Math.floor(x/TS)!==start.tx || Math.floor(y/TS)!==start.ty)return false;
    }
    depth = next;
  }
  return true;
}
function bossRoute(x, y, actor, body) {
  const start = Math.floor(actor.y / TS) * MW + Math.floor(actor.x / TS);
  const end = Math.floor(y / TS) * MW + Math.floor(x / TS);
  if (!canStand(x, y) || bossBodyDepth(x,y,body) > 0) return null;
  const queue = [start], prev = new Map([[start, null]]);
  const point = v => v === start ? [actor.x, actor.y] : [(v%MW)*TS+TS/2, Math.floor(v/MW)*TS+TS/2];
  for (let i = 0; i < queue.length && !prev.has(end); i++) {
    const v = queue[i], vx = v % MW, vy = Math.floor(v / MW);
    const [ax,ay] = point(v);
    for (const [nx, ny] of [[vx+1,vy],[vx-1,vy],[vx,vy+1],[vx,vy-1]]) {
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
      const key = ny * MW + nx;
      if (prev.has(key) || !bossRouteEdge(ax,ay,nx*TS+TS/2,ny*TS+TS/2,body)) continue;
      prev.set(key, v); queue.push(key);
    }
  }
  if (!prev.has(end)) return null;
  const [ex,ey] = point(end);
  if (!bossRouteEdge(ex,ey,x,y,body)) return null;
  const route = [[x,y]];
  for (let v = end; v !== start; v = prev.get(v)) route.unshift(point(v));
  return route;
}
function bossChooseRoute(actor, body, occupied) {
  bossRouteOrigin={tx:Math.floor(actor.x/TS),ty:Math.floor(actor.y/TS),blocked:!canStand(actor.x,actor.y)};
  // Search every reachable half-tile, not just six destinations that may be blocked.
  const grid = TS/2, width = MW*2, height = MH*2;
  const start = Math.floor(actor.y/grid)*width + Math.floor(actor.x/grid);
  const point = v => v === start ? [actor.x,actor.y] : [(v%width)*grid+grid/2,Math.floor(v/width)*grid+grid/2];
  const queue=[start], prev=new Map([[start,null]]);
  const cx=(body.l+body.r)/2, cy=body.b+30;
  let best=null, score=Infinity;
  for (let i=0;i<queue.length;i++) {
    const v=queue[i], [x,y]=point(v);
    if (bossBodyDepth(x,y,body)===0 && canStand(x,y) &&
        (!occupied || Math.hypot(x-occupied[0],y-occupied[1])>=48)) {
      const cost=Math.hypot(x-cx,y-cy);
      if(cost<score){score=cost;best=v;}
    }
    const vx=v%width,vy=Math.floor(v/width);
    for(const [nx,ny] of [[vx+1,vy],[vx-1,vy],[vx,vy+1],[vx,vy-1]]) {
      if(nx<0||ny<0||nx>=width||ny>=height)continue;
      const key=ny*width+nx;
      if(prev.has(key)||!bossRouteEdge(x,y,nx*grid+grid/2,ny*grid+grid/2,body))continue;
      prev.set(key,v);queue.push(key);
    }
  }
  bossRouteOrigin=null;
  if(best===null)return null;
  const route=[];
  for(let v=best;v!==start;v=prev.get(v))route.unshift(point(v));
  if(!route.length)route.push([actor.x,actor.y]);
  return route;
}
function bossParkDragon(b) {
  // During the grief scene he stays close to Corin instead of selecting a
  // distant empty tile.  Try a few natural "watching" positions in order.
  const poses=["n","e","s","w"].map(dir=>dragonSprite(dir)).filter(Boolean);
  const hw=Math.max(28,...poses.map(sp=>sp[2]/4));
  const hh=Math.max(44,...poses.map(sp=>sp[3]/2));
  for (const [ox, oy] of [[48,28],[-48,28],[44,-28],[-44,-28],[0,50],[0,-48]]) {
    const x=Math.max(hw+8,Math.min(PXW-hw-8,P.x+ox));
    const y=Math.max(hh+8,Math.min(PXH-8,P.y+oy));
    if (!canStand(x,y)) continue;
    if (x+hw>b.body.l && x-hw<b.body.r && y+20>b.body.t && y-hh<b.body.b) continue;
    return [x,y];
  }
  return null;
}
function bossStageSpot(x, y, used = []) {
  /* Cinderhold's floor is fixed, but test the exact feet position once so a
     staged portal can never be planted into a wall or another actor. */
  for (let r = 0; r <= 144; r += 8) for (let oy = -r; oy <= r; oy += 8)
    for (let ox = -r; ox <= r; ox += 8) {
      if (r && Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
      const px = Math.max(12, Math.min(PXW - 12, x + ox));
      const py = Math.max(16, Math.min(PXH - 8, y + oy));
      if (!canStand(px, py) || used.some(p => Math.hypot(px-p[0], py-p[1]) < 42)) continue;
      return [px, py];
    }
  return [x, y];
}
function stageBossBlackout(b) {
  /* The blackout is an intentional, fixed reset.  From here onward the
     grief scene and every portal use these same clean arena coordinates. */
  const cx = Math.round(PXW / 2), cy = Math.round(PXH / 2);
  const dead = bossStageSpot(cx, cy - 4);
  /* Keep both mourners just below the corpse, inside the scene camera and
     outside the large displayed body.  The companion stays at Corin's side. */
  const king = bossStageSpot(cx + 66, cy + 52, [dead]);
  const corin = bossStageSpot(cx - 66, cy + 52, [dead, king]);
  /* Put the companion on Corin's inward side so its full sprite remains in
     the fixed scene camera instead of clipping past the left edge. */
  const pet = bossStageSpot(corin[0] + 38, corin[1] + 24, [dead, king, corin]);
  const guardL = bossStageSpot(king[0] - 52, king[1] + 56, [dead, king, corin, pet]);
  const guardR = bossStageSpot(king[0] + 52, king[1] + 56, [dead, king, corin, pet, guardL]);
  b.layout = { dead, king, corin, pet, guards:[guardL, guardR] };
  b.dead.x = dead[0]; b.dead.y = dead[1];
  P.x = corin[0]; P.y = corin[1]; P.act = null; P.moving = false; faceCorinAt(dead[0], dead[1]);
  if (b.k) { b.k.x = king[0]; b.k.y = king[1]; b.k.goto = null; faceToward(b.k, dead[0], dead[1]); }
  if (dragonHere() && dragon.on) {
    dragon.x = pet[0]; dragon.y = pet[1]; dragon.air = false; dragon.tr = null; dragon.moving = false;
    dragon.dir = direction4(dead[0] - pet[0], dead[1] - pet[1], dragon.dir);
  }
  b.kx = king[0]; b.ky = king[1]; b.body = bossBodyBounds(b.dead);
  b.cx = cx; b.cy = cy; b.route = []; b.kingRoute = []; b.dragonPark = pet;
  rebuildSolid();
}
function stepBossScene(dt) {
  const b = bossScene;
  if (!b) return;
  if (MAPID !== "cinderhold") { bossScene = null; grief = null; risePend = null; return; }
  b.t += dt;
  b.dead.t += dt;
  /* Player movement is paused during this scene, so advance Corin's clock
     here to keep his standing/breathing animation alive. */
  if (!P.act && !P.moving) P.t += dt;
  /* Normal dragon AI is paused by bossScene, so advance the companion's
     animation clock here.  A parked dragon must still breathe and idle. */
  if (dragonHere() && dragon.on) dragon.t += dt;
  const zoom = b.phase === "return" ? b.zoom : Math.max(b.zoom * 0.85, Math.min(b.zoom, VW/260, VH/240));
  cam.z += (zoom - cam.z) * (1 - Math.exp(-5 * dt));
  // Keep Corin visible while he approaches, even after a distant killing blow.
  const followPlayer = b.phase === "return" || b.phase === "walk" && b.route.length > 0;
  const cx = followPlayer ? P.x : b.cx;
  const cy = followPlayer ? P.y : b.cy;
  const ease = 1 - Math.exp(-5 * dt);
  cam.x += (cx - VW/cam.z/2 - cam.x) * ease;
  cam.y += (cy - VH/cam.z/2 - cam.y) * ease;
  clampCam();
  if (b.phase === "blackoutIn") {
    b.black = Math.min(1, (b.black || 0) + dt / .34);
    if (b.black < 1) return;
    stageBossBlackout(b); b.phase = "blackoutLine"; b.t = 0;
    playScene(["Halvard: No!"], { after: () => { b.phase = "blackoutOut"; b.t = 0; } });
    return;
  }
  if (b.phase === "blackoutLine") return;
  if (b.phase === "blackoutOut") {
    b.black = Math.max(0, (b.black || 0) - dt / .42);
    if (b.black > 0) return;
    b.phase = "settle"; b.t = 0;
    return;
  }
  if (b.phase === "park") {
    const target=b.dragonPark = bossParkDragon(b);
    if(target && dragonHere() && dragon.on){
      const dx=target[0]-dragon.x,dy=target[1]-dragon.y,d=Math.hypot(dx,dy),step=Math.min(d,110*dt);
      dragon.air=false; dragon.tr=null; dragon.t+=dt;
      dragon.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?"e":"w"):(dy>0?"s":"n");
      if(d>0){dragon.x+=dx/d*step;dragon.y+=dy/d*step;}
      if(d>step)return;
    }
    b.phase="pan";b.t=0;
  }
  if (b.phase === "pan" && b.t >= 1.2) { b.phase = "walk"; b.t = 0; }
  if (b.phase === "walk") {
    const pt = b.route[0];
    if (pt && bossWalk(P, pt[0], pt[1], dt, true)) b.route.shift();
    const kp = b.kingRoute[0];
    if (b.k && kp && bossWalk(b.k, kp[0], kp[1], dt, false)) b.kingRoute.shift();
    const arrived = !b.kingRoute.length;
    if (!b.route.length && arrived) {
      P.moving = false; faceCorinAt(b.kx, b.ky);
      if (b.k) { b.k.goto = null; faceToward(b.k, b.dead.x, b.dead.y); }
      rebuildSolid(); b.phase = "settle"; b.t = 0;
    }
    // Corin is still walking; keep his dragon just beside him rather than
    // letting it resume free combat movement at the edge of the map.
    const target = b.dragonPark = bossParkDragon(b);
    if (target && dragonHere() && dragon.on) {
      const dx=target[0]-dragon.x,dy=target[1]-dragon.y,d=Math.hypot(dx,dy)||1,step=Math.min(d,110*dt);
      dragon.air=false; dragon.tr=null; dragon.moving=d>step;
      dragon.dir=direction4(dx,dy,dragon.dir);
      dragon.x+=dx/d*step; dragon.y+=dy/d*step;
    }
  } else if (b.phase === "settle" && b.t >= 1.2) {
      b.phase="dialogue";
      playScene([
        "Halvard: ...",
        "Halvard: Forty years I fed that thing out of my own hand.",
        "Halvard: You will not have understood what you have taken.",
        "Halvard: I stopped being a man some time ago. Watch.",
      ], { after: () => { b.phase = "fade"; b.t = 0; } });
  } else if (b.phase === "fade") {
    b.dead.sceneAlpha = Math.max(0, 1 - b.t / 1.2);
    if (b.t >= 1.2) { b.dead.sceneHidden = true; b.phase = "rise"; b.t = 0; risePhase(); }
  } else if (b.phase === "rise") {
    stepLichTransition(dt);
    for (const f of foes) if ((f.kind === "lich" || f.kind === "boneguard") && f.hold > 0) {
      f.hold = Math.max(0, f.hold - dt);
      f.emerge = Math.max(0, Math.min(1, (1 - f.hold/f.holdMax - 0.25)/0.7));
      f.t += dt;
    }
    if (!risePend && foes.some(f => f.kind === "lich") &&
        foes.filter(f => f.kind === "lich" || f.kind === "boneguard").every(f => f.hold <= 0)) {
      b.phase = "return"; b.t = 0;
    }
  } else if (b.phase === "return" && b.t >= 1.2) {
    cam.z = b.zoom; camFree = false; P.moving = false; bossScene = null; rebuildSolid();
  }
}

function secondPhase() {
  if (lastFight !== 1) return;
  lastFight = 2;
  const dead = foes.find(f => f.kind === "kdragon");
  const kk = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  if (dead) {
    bossScene = { phase: "blackoutIn", t: 0, dead, body:bossBodyBounds(dead), k:kk,
      zoom:cam.z, kx:dead.x, ky:dead.y, cx:dead.x, cy:dead.y, black:0 };
    if (kk) kk.goto = null;
    if (mounted) setMounted(false);
    camFree = true; P.act = null; P.moving = false;
    breath = null; claw = null; spell = null; bolts.length = 0;
    dragon.moving = false;
    return;
  }
  risePhase();
}

function stepGrief(dt) {
  if (!grief) return;
  grief.t += dt;
  const m = grief.k;
  const dx = grief.tx - m.x, dy = grief.ty - m.y;
  const d = Math.hypot(dx, dy) || 1;
  if (d > 6) {
    const sp = 52 * dt;
    m.x += (dx / d) * sp; m.y += (dy / d) * sp;
    m.f = Math.abs(dx) > Math.abs(dy) ? "s" : (dy > 0 ? "d" : "u");
    m.flip = Math.abs(dx) > Math.abs(dy) && dx < 0;
  }
}
let risePend = null;
function stepLichTransition(dt) {
  if (!risePend) return;
  risePend.t += dt;
  // Keep Halvard visible until the portal has fully opened beneath him.
  if (risePend.k && risePend.t >= 1.2 && !risePend.hidden) {
    risePend.k.away = 1; risePend.k.d = null;
    risePend.hidden = true;
    rebuildSolid();
  }
  if (risePend.t < risePend.wait) return;
  const { kx, ky, guards } = risePend;
  risePend = null;
  riseNow(kx, ky, guards);
}
function risePhase() {
  const k = npcs && npcs.find(n => /Halvard/.test(n.n || ""));
  const staged = bossScene && bossScene.layout;
  /* The transformation and both guards now rise from the exact patch of
     floor occupied by the fallen dragon, after its body fades away. */
  const kx = staged ? staged.dead[0] : k ? k.x : P.x;
  const ky = staged ? staged.dead[1] : k ? k.y : P.y - 60;
  const guards = staged ? (() => {
    const occupied = [staged.corin, staged.pet, staged.king, [kx, ky + 18]];
    const left = bossStageSpot(kx - 48, ky + 4, occupied);
    const right = bossStageSpot(kx + 48, ky + 4, [...occupied, left]);
    return [left, right];
  })() : null;
  showRise(kx, ky, [168, 92, 232]);
  risePend = { kx, ky, k, guards, hidden: false, t: 0, wait: 1.6 };
  toast("the floor opens under him");
}
function riseNow(kx, ky, guardSpots = null) {
  foes.push({ kind: "lich", x: kx, y: ky + 18, hx: kx, hy: ky + 18,
              st: "idle", t: 0, hp: enemyMaxHp("lich", kx), ring: 0,
              dir: "d", flip: false, hurt: 0, hold: 2.6, holdMax: 2.6, emerge: 0 });
  showRise(kx, ky + 18, [168, 92, 232]);
  const guards = guardSpots || [[kx - 44, ky + 26], [kx + 44, ky + 26]];
  for (const [gx, gy] of guards) {
    foes.push({ kind: "boneguard", x: gx, y: gy, hx: gx, hy: gy,
                st: "idle", t: 0, hp: enemyMaxHp("boneguard", gx), ring: 0,
                dir: "d", flip: false, hurt: 0, hold: 2.6, holdMax: 2.6, emerge: 0 });
    showRise(gx, gy, [168, 92, 232]);
  }
  rebuildBuckets();
  toast("what reaches the floor is not the King");
}
function lastFightHold() {
  if (!lastFight || wonAll) return;
  if (lastFight === 1) {
    const dg = foes.filter(f => f.kind === "kdragon");
    /* Let the supplied full collapse play once before Halvard starts moving. */
    if (dg.length && dg.every(f => f.st === "dead" && f.t >= 1.1)) secondPhase();
    return;
  }
  const pack = foes.filter(f => f.kind === "lich" || f.kind === "boneguard");
  const up = pack.filter(f => f.st !== "dead");
  if (pack.length && !up.length) winGame();
}
function winGame() {
  if (wonAll) return;
  wonAll = 1;
  if (window.EmberKingMusic) window.EmberKingMusic.stop();
  /* The King is a persistent story removal, not a room-local actor state. */
  if (MAPID === "cinderhold") npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  rebuildSolid();
  saveGame();
  playScene([
    "The King goes down in his own hall.",
    "The two heads come to rest, one across the other.",
    "Corin: It is done, then.",
    "Corin: Come on. There is a long road home and nothing chasing us down it.",
    "-- EMBERFELL --",
  ], { hold: false });
}
function plantGraves() {
  const ring = arenaLock;
  let cx, cy;
  if (P.dir === "d") { cx = P.x; cy = P.y + 42; }
  else if (P.dir === "u") { cx = P.x + (P.flip ? -54 : 54); cy = P.y + 16; }
  else { cx = P.x + (P.flip ? -58 : 58); cy = P.y + 16; }
  const gy = cy;                          /* the line they stand on */
  const spots = [
    { x: cx - 26, y: gy, s: "wf_grave1" },
    { x: cx,      y: gy, s: "wf_grave2" },
    { x: cx + 26, y: gy, s: "wf_grave3" },
  ];
  const bits = [
    { x: cx - 46, y: gy + 4,  s: "bones3", flip: 0 },
    { x: cx - 38, y: gy + 10, s: "bones4", flip: 0 },
    { x: cx + 46, y: gy + 4,  s: "bones5", flip: 1 },
    { x: cx + 38, y: gy + 10, s: "bones6", flip: 1 },
    { x: cx,      y: gy + 20, s: "bones10", flip: 0 },
  ];
  graves = { ring, spots, bits, held: 0, earned: 0, fell: 0, t: 0 };
}
function stepGraves(dt) {
  if (!graves) return;
  graves.t += dt;
  if (arenaLock !== graves.ring && graves.t > 1.5) {
    if (graves.held) toast("the stones keep what was under them");
    graves = null;
  }
}
function drawGraves() {
  if (!graves) return;
  const glow = graves.held > 0;
  for (const b of graves.bits) {
    const sp = SPR[b.s]; if (!sp) continue;
    const bx = Math.round(b.x - sp[2] / 2), by = Math.round(b.y - sp[3]);
    if (b.flip) {
      ctx.save();
      ctx.translate(bx + sp[2], by);
      ctx.scale(-1, 1);
      drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
      ctx.restore();
    } else {
      drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3], bx, by, sp[2], sp[3]);
    }
  }
  for (const g of graves.spots) {
    const sp = SPR[g.s]; if (!sp) continue;
    if (glow) drawSmoke("ghost", g.x, g.y - 20, (graves.t % 2.0) / 2.0,
      {width:24, height:38, color:"#efd497", alpha:0.6});
    drawSmoke("fall", g.x, g.y - 2, graves.t / 0.8, {width:44, height:18});
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(g.x - sp[2] / 2), Math.round(g.y - sp[3]), sp[2], sp[3]);
  }
}
function settleGraves() {
  if (!graves || arenaLock !== graves.ring) return;
  if (graves.held > 0) {
    gold += graves.held;
    toast("he takes " + graves.held + " gold back up out of the ground");
  } else if (!graves.fell && graves.earned > 0) {
    gold += graves.earned;
    toast("the stones pay double -- " + graves.earned + " more");
  } else {
    toast("the stones had nothing to give");
  }
  graves = null;
}
function useMark() {
  if (marks <= 0 && !devSafe) { toast("no markers"); return false; }
  if (graves) { toast("his stones are already in the ground"); return false; }
  if (!arenaLock && !devSafe && !devItemTest) { toast("there is no fight to wager on"); return false; }
  marks--;
  plantGraves();
  toast("three stones go in. Finish it and they pay.");
  return true;
}
const MAD_FOR = 14;
function useDust() {
  if (dust <= 0 && !devSafe) { toast("no dust"); return false; }
  const near = foes.filter(f => !f.ally && f.st !== "dead" &&
                                Math.hypot(f.x - P.x, f.y - P.y) < 300);
  if (near.length < 2 && !devSafe && !devItemTest) { toast("nothing enough to set against itself"); return false; }
  dust--;
  showDust(P.x, P.y);
  for (const f of near) f.mad = MAD_FOR;
  toast("the dust goes up -- they cannot tell one another from him");
  return true;
}
const BOSS_KIND = /^(golem1|golem2|golem3|devil|lich|ghost|ghost3|knight|treasuryknight)$/;
/* golems, the Ashfiend and the Lich stay dead once felled outside an arena;
   arena foes are meant to refill (see refillRing), these are not */
const NO_RESPAWN = /^(golem1|golem2|golem3|devil|lich|knight)$/;
const bossGone = {};                /* mapid+":"+idx -> true once one falls for good */
function markBossGone(f) {
  if(f.kind==="treasuryknight"){royalDefeated.treasuryCaptain=true;recoverStrandedDragon();toast("Treasury Captain defeated — the treasure is yours!");}
  if(f.kind==="royalguard" && f.idx!==undefined){royalDefeated[MAPID+":"+f.idx]=true;if(!foes.some(q=>q!==f&&q.kind==="royalguard"&&q.st!=="dead"))recoverStrandedDragon();}
  if (!f.ally && !f.storyKnight && f.idx !== undefined && NO_RESPAWN.test(f.kind))
    bossGone[MAPID + ":" + f.idx] = true;   /* stays down for good, however it died */
}
function bossRing(a) {
  if (!a) return false;
  if (MAPID === "cinderhold") return true;           /* the King's own floor */
  return foes.some(f => f.st !== "dead" && !f.ally && BOSS_KIND.test(f.kind) &&
                        Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= (a.r || 6) + 5);
}
// Supplied Smoke pack frames; no generated smoke shapes or particles.
const SMOKE_FRAMES = {circle:10,curl:24,cycle:6,long:6,fall:16,trail:12,rise:14,ghost:18,ring1:7,ring2:7,ring3:7,skull:20};
// Reuse recolored smoke frames; bound retained canvases to 2 MiB.
const smokeTintCache = new Map();
let smokeTintPixels = 0;
function smokeTint(name, frame, sp, color) {
  const key = name + ":" + frame + ":" + color;
  const cached = smokeTintCache.get(key);
  if (cached) {
    smokeTintCache.delete(key); smokeTintCache.set(key, cached);
    return cached;
  }
  const pixels = sp[2] * sp[3];
  if (pixels > 524288) return tintFoe(sp, 0, color, 0.72);
  while (smokeTintPixels + pixels > 524288 || smokeTintCache.size >= 64) {
    const oldest = smokeTintCache.keys().next().value;
    const cv = smokeTintCache.get(oldest);
    smokeTintPixels -= cv.width * cv.height;
    smokeTintCache.delete(oldest);
    cv.width = cv.height = 0;
  }
  const cv = document.createElement("canvas");
  cv.width = sp[2]; cv.height = sp[3];
  drawGameImage(cv.getContext("2d"), tintFoe(sp, 0, color, 0.72), 0, 0);
  smokeTintCache.set(key, cv); smokeTintPixels += pixels;
  return cv;
}
function drawSmoke(name, x, y, progress, options = {}) {
  if (progress < 0 || progress >= 1) return;
  const count = SMOKE_FRAMES[name];
  if (!count) return;
  const frame = Math.min(count - 1, Math.floor(progress * count));
  const sp = SPR["fx_smoke_" + name + "_" + frame];
  if (!sp) return;
  const width = options.width || sp[2];
  const height = options.height || width * sp[3] / sp[2];
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha *= options.alpha === undefined ? 1 : options.alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (options.angle) ctx.rotate(options.angle);
  if (options.color) {
    const tinted = smokeTint(name, frame, sp, options.color);
    drawGameImage(ctx, tinted, Math.round(-width / 2), Math.round(-height / 2), width, height);
  } else {
    drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
      Math.round(-width / 2), Math.round(-height / 2), width, height);
  }
  ctx.restore();
}
function drawBuff(name, progress, width, alpha = 1, color = null, cx = P.x, cy = P.y, bubblesOnly = false) {
  if (progress < 0 || progress >= 1) return;
  const count = 12;
  const sp = SPR["fx_buff_" + name + "_" + Math.min(count - 1, Math.floor(progress * count))];
  if (!sp) return;
  const height = width * sp[3] / sp[2];
  const x = Math.round(cx - width / 2), y = Math.round(cy - height * 0.80);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  const sh = bubblesOnly ? Math.floor(sp[3] * 0.45) : sp[3];
  const dh = height * sh / sp[3];
  if (color) drawGameImage(ctx, tintFoe(sp, 0, color, 0.65), 0, 0, sp[2], sh, x, y, width, dh);
  else drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sh, x, y, width, dh);
  ctx.restore();
}
function drawSaintBuff(front = false) {
  if (saintT <= 0) return;
  const age = 16 - saintT;
  if(front){
    // Isolate the five upright blades; the circular floor sigil stays below Corin.
    const sp=SPR.fx_buff_saint_0;if(!sp)return;
    const w=64,h=w*sp[3]/sp[2],x=P.x-w/2,y=P.y-h*.8;
    ctx.save();ctx.beginPath();
    for(const [cx,top,bottom] of [[.18,.35,.77],[.32,.18,.66],[.5,.36,.90],[.67,.2,.66],[.81,.34,.77]])
      ctx.rect(x+w*(cx-.025),y+h*top,w*.05,h*(bottom-top));
    ctx.clip();
  }
  drawBuff("saint", (age % 1.2) / 1.2, 64, Math.min(1, saintT / 0.8));
  if(front)ctx.restore();
}

let spell = null;
function castSkull(x, y, hue, then) {
  spell = { kind: "skull", x, y, t: 0, life: 1.9, hue: hue || "#9fd8c8", then, done: 0 };
}
function stepSpell(dt) {
  if (!spell) return;
  spell.t += dt;
  if (!spell.done && spell.t > 0.95) { spell.done = 1; if (spell.then) spell.then(); }
  if (spell.t >= spell.life) spell = null;
}

let stonePreview = null;
let heal = null;
let risings = [];
const HOLY_FLOWERS = ["aflower1_0", "aflower3_0", "aflower1_2", "aflower3_1",
                      "aflower1_4", "aflower3_4", "aflower1_8", "aflower3_6",
                      "aflower1_w", "aflower3_w", "aflower2_2", "aflower3_9"];
let blooms = [];
let consecrationTrails = [];
const CONSECRATION_LAP = 2.2, CONSECRATION_LAPS = 1, CONSECRATION_TAIL = 0.45;
const CONSECRATION_DURATION = CONSECRATION_LAP * CONSECRATION_LAPS;
function plantRing(ring) {
  const n = Math.max(12, Math.round((ring.r || 6) * 3.2));
  const t0 = CONSECRATION_DURATION + CONSECRATION_TAIL + 0.05;
  if (blooms.length + n > 160) blooms.splice(0, blooms.length + n - 160);
  consecrationTrails.push({x:ring.x * TS, y:ring.y * TS,
    radius:((ring.r || 6) - 0.6) * TS, t:0});
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283;
    const rr = ((ring.r || 6) - 0.6) * TS;
    blooms.push({
      x: ring.x * TS + Math.cos(a) * rr,
      y: ring.y * TS + Math.sin(a) * rr * 0.92,
      s: HOLY_FLOWERS[i % HOLY_FLOWERS.length],
      wait: t0 + i * 0.045,          /* they open round the circle in turn */
      t: 0,
    });
  }
}
function stepBlooms(dt) {
  for (const b of blooms) b.t += dt;
  for (const trail of consecrationTrails) trail.t += dt;
  consecrationTrails = consecrationTrails.filter(trail =>
    trail.t < CONSECRATION_DURATION + CONSECRATION_TAIL);
}
function drawConsecrationTrail() {
  for (const trail of consecrationTrails) {
    // Draw the older smoke first so the bright leading plume stays visible.
    for (let i = 9; i >= 0; i--) {
      const age = trail.t - i * 0.05;
      if (age < 0 || age >= CONSECRATION_DURATION) continue;
      const angle = age / CONSECRATION_LAP * Math.PI * 2;
      const x = trail.x + Math.cos(angle) * trail.radius;
      const y = trail.y + Math.sin(angle) * trail.radius * 0.92;
      drawSmoke("long", x, y - 3, (age * 1.25 + i * 0.07) % 1,
        {width:9, height:38, color:"#ffb4dc", alpha:(1 - i * 0.09) * 0.85,
         angle:Math.atan2(Math.cos(angle) * 0.92, -Math.sin(angle)) - Math.PI / 2});
    }
  }
}
function drawBlooms() {
  drawConsecrationTrail();
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const b of blooms) {
    if (b.x < cam.x - 48 || b.x > cam.x + vw + 48 ||
        b.y < cam.y - 48 || b.y > cam.y + vh + 48) continue;
    const a = b.t - b.wait;
    if (a < 0) continue;
    const sp = SPR[b.s];
    if (!sp) continue;
    drawSmoke("ring3", b.x, b.y - 2, a / 0.8, {width:22, color:"#ff8fcc", alpha:0.75});
    const up = Math.min(1, a / 0.35);
    const ease = 1 - (1 - up) * (1 - up);
    const h = Math.round(sp[3] * ease);
    if (h < 1) continue;
    drawGameImage(ctx, atlasImg, sp[0], sp[1] + (sp[3] - h), sp[2], h,
                  Math.round(b.x - sp[2] / 2), Math.round(b.y - h),
                  sp[2], h);
  }
}
function showRise(x, y, col) {
  risings.push({ x, y, t: 0, life: 2.6, col: col || [168, 92, 232] });
}
function stepRise(dt) {
  if (!risings.length) return;
  for (const r of risings) r.t += dt;
  risings = risings.filter(r => r.t < r.life);
}
function drawRise() {
  const vw = VW / cam.z, vh = VH / cam.z;
  for (const r of risings) {
    if (r.x < cam.x - 80 || r.x > cam.x + vw + 80 ||
        r.y < cam.y - 100 || r.y > cam.y + vh + 80) continue;
    const p = r.t / r.life;
    const open = Math.min(1, p / 0.45);        /* the seam pulls apart */
    const fade = p < 0.70 ? 1 : 1 - (p - 0.70) / 0.30;
    ctx.save();
    const C = r.col.join(",");
    const Cm = r.col.map(v => Math.round(v * 0.42)).join(",");
    const spin = r.t * 2.4;
    const W = 26 * open, Hh = W * 0.42;   /* a touch smaller */
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.scale(1, 0.42);                     /* everything below is a circle */
    const RAD = W;
    ctx.globalAlpha = fade;
    const well = ctx.createRadialGradient(0, 0, 0, 0, 0, RAD);
    well.addColorStop(0, "rgba(2,0,6,0.99)");
    well.addColorStop(0.42, "rgba(8,2,16,0.92)");
    well.addColorStop(0.74, "rgba(" + Cm + ",0.7)");
    well.addColorStop(0.93, "rgba(" + C + ",0.85)");
    well.addColorStop(1, "rgba(" + C + ",0)");
    ctx.fillStyle = well;
    ctx.beginPath(); ctx.arc(0, 0, RAD, 0, 6.283); ctx.fill();
    ctx.lineCap = "round";
    for (let k = 0; k < 5; k++) {
      const base = spin + (k / 5) * 6.283;
      ctx.globalAlpha = fade * 0.75;
      ctx.strokeStyle = "rgba(" + C + ",0.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let q = 0; q <= 12; q++) {
        const u = q / 12;
        const rr = RAD * (1 - u * 0.86);
        const a = base + u * 2.3;           /* it winds in as it goes */
        const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
        if (q === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = fade * 0.9;
    ctx.strokeStyle = "rgba(232,190,255,0.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, RAD * 0.98, 0, 6.283); ctx.stroke();
    ctx.globalAlpha = fade * 0.5;
    ctx.strokeStyle = "rgba(" + C + ",0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, RAD * 1.04, 0, 6.283); ctx.stroke();
    ctx.restore();
    drawSmoke("ghost", r.x, r.y - 26, p,
      {width:48, height:62, color:"rgb(" + C + ")", alpha:fade});
    ctx.restore();
  }
}

function showHeal(kind, x = P.x, y = P.y - 22) {
  if(kind==="dragon"){dragon.healPulse=1;return;}
  heal = { t: 0, life: kind === "elixir" ? 1.4 : 1.1, kind, x, y };
}
function stepHeal(dt) {
  if(dragon.healPulse>0)dragon.healPulse=Math.max(0,dragon.healPulse-dt);
  if(stonePreview){stonePreview.reverseRise-=dt;if(stonePreview.reverseRise<=0)stonePreview=null;}
  if (!heal) return;
  heal.t += dt;
  if (heal.t >= heal.life) heal = null;
}
function drawHeal() {
  if (!heal) return;
  const elixir = heal.kind === "elixir";
  const dragonHeal = heal.kind === "dragon";
  drawBuff("heal", heal.t / heal.life, elixir ? 62 : dragonHeal ? 72 : 50,
    Math.min(1, (heal.life - heal.t) / 0.2),
    elixir ? "#ffdc80" : dragonHeal ? "#e88958" : null, heal.x, heal.y + 22 + (dragonHeal ? 0 : (elixir ? 62 : 50) * 100 / 80 * 0.4), !dragonHeal);
}
let tintCv = null, tintCtx = null;
function tintFoe(sp, fr, col, amt) {
  if (!tintCv) { tintCv = document.createElement("canvas"); tintCtx = tintCv.getContext("2d"); }
  if (tintCv.width !== sp[2] || tintCv.height !== sp[3]) {
    tintCv.width = sp[2]; tintCv.height = sp[3];
  }
  const g = tintCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, sheetOf(sp), sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-atop";
  g.globalAlpha = amt;
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  return tintCv;
}
let dustPuff = null;
function showDust(x, y) {
  dustPuff = { x, y, t: 0, life: 2.8 };
}
function stepDust(dt) {
  if (!dustPuff) return;
  dustPuff.t += dt;
  if (dustPuff.t >= dustPuff.life) dustPuff = null;
}
function drawDust() {
  for (const f of foes) {
    if (!(f.mad > 0) || f.st === "dead") continue;
    const target = f._hunt;
    if (!target || target.st === "dead") continue;
    const dx = target.x - f.x, dy = target.y - f.y;
    drawSmoke("trail", (f.x + target.x) / 2, (f.y + target.y) / 2 - 12,
      (foeClock % 1.2) / 1.2, {width:Math.min(110, Math.hypot(dx, dy)),
        height:20, angle:Math.atan2(dy, dx), color:"#b67be4", alpha:0.55 * Math.min(1, f.mad / 2)});
  }
  if (!dustPuff) return;
  const p = dustPuff.t / dustPuff.life;
  drawSmoke("curl", dustPuff.x, dustPuff.y - 12, p,
    {width:Math.max(230,VW/cam.z*.85), height:Math.max(120,VH/cam.z*.55), color:"#b67be4"});
  for (let i = 0; i < 7; i++) {
    const age = dustPuff.t - i * 0.12;
    drawSmoke("trail", dustPuff.x + (i - 3) * Math.max(40,VW/cam.z/8), dustPuff.y - 10 + (i%3-1)*36,
      age / 2.2, {width:110, color:"#b67be4", alpha:0.7, angle:(i - 1) * 0.5});
  }
}
let fireCv = null, fireCtx = null;
function tintFire(sp, fr, col) {
  if (!fireCv) { fireCv = document.createElement("canvas"); fireCtx = fireCv.getContext("2d"); }
  if (fireCv.width !== sp[2] || fireCv.height !== sp[3]) {
    fireCv.width = sp[2]; fireCv.height = sp[3];
  }
  const g = fireCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "destination-in";
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  return fireCv;
}
let darkCv = null, darkCtx = null;
function darkFoe(sp, fr, col) {
  if (!darkCv) { darkCv = document.createElement("canvas"); darkCtx = darkCv.getContext("2d"); }
  if (darkCv.width !== sp[2] || darkCv.height !== sp[3]) {
    darkCv.width = sp[2]; darkCv.height = sp[3];
  }
  const g = darkCtx;
  g.clearRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "multiply";
  g.fillStyle = col;
  g.fillRect(0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "destination-in";
  drawGameImage(g, atlasImg, sp[0] + fr * sp[2], sp[1], sp[2], sp[3], 0, 0, sp[2], sp[3]);
  g.globalCompositeOperation = "source-over";
  return darkCv;
}

function drawSpell() {
  if (!spell || spell.kind !== "skull") return;
  drawSmoke("skull", spell.x, spell.y - 8, spell.t / spell.life,
    {width:150, color:spell.hue});
}
function useBomb() {
  if (bombs <= 0 && !devSafe) { toast("he has no curse to spend"); return false; }
  if (!arenaLock && !devSafe && !devItemTest) { toast("nothing to walk out of"); return false; }
  if (!arenaLock) {
    bombs--;
    castSkull(P.x, P.y, "#a8c8bc", () => toast("nothing here to curse"));
    return true;
  }
  bombs--;
  if (bossRing(arenaLock)) {
    castSkull(P.x, P.y, "#a8c8bc", () => {
      toast("he says the word. It does not even look up.");
    });
    return true;
  }
  const ring = arenaLock;
  castSkull(ring.x * TS, ring.y * TS, "#a8c8bc", () => {
    let n = 0;
    for (const f of foes) {
      if (f.ally || f.st === "dead") continue;
      if (Math.hypot(f.x / TS - ring.x, f.y / TS - ring.y) > (ring.r || 6) + 5) continue;
      f.st = "dead"; f.t = 0; f.hp = 0; f.mad = 0;
      n++;
    }
    ring._wave = 99;
    cooling.set(ringKey(ring), ARENA_REST);
    releaseArena();
    rebuildBuckets();
    toast(n ? "the word lands, and nothing in the ring is left standing"
            : "the word goes out over an empty ring");
  });
  return true;
}
function drinkElixir() {
  if (elixirs <= 0 && !devSafe) { toast("no elixirs"); return false; }
  if (pHp >= pMax && !devSafe && !devItemTest) { toast("he is not hurt"); return false; }
  elixirs--;
  pHp = pMax;
  showHeal("elixir");
  toast("full again -- " + elixirs + " elixir" + (elixirs === 1 ? "" : "s") + " left");
  return true;
}
const STOCK = {
  potion: { n: "POTION",  cost: () => POTION_COST, go: buyPotion },
  elixir: { n: "ELIXIR",  cost: () => ELIXIR_COST, go: buyElixir },
  boarMeat: { n: "BOAR MEAT", cost: () => BOAR_MEAT_COST, go: buyBoarMeat },
  dragonFish: { n: "FRESH FISH", cost: () => DRAGON_FISH_COST, go: buyDragonFish },
  bomb:   { n: "MAELIS'S CURSE", cost: () => BOMB_COST, go: buyBomb },
  dust:   { n: "MADNESS DUST", cost: () => DUST_COST, go: buyDust },
  bell:   { n: "BELL STAKE",   cost: () => BELL_COST, go: buyBell },
  mark:   { n: "GRAVE MARKER", cost: () => MARK_COST, go: buyMark },
  saint:  { n: "SAINT'S BREATH", cost: () => BREATH_COST, go: buyBreath },
  stone:  { n: "RESURRECTION STONE", cost: () => STONE_COST, go: buyStone },
  salt:   { n: "CONSECRATION", cost: () => SALT_COST, go: buySalt },
};
function merchantAsk(giver) {
  ask = { quick:1, opts:[
    {n:"TALK",go:()=>beginNpcTalk(giver)},
    {n:"PURCHASE",go:()=>sellerAsk(giver)},
    {n:"LEAVE",go:null}
  ]};askPick=0;askDraw();
}
function purchaseQuantity(giver,key,amount=1) {
  const item=STOCK[key];if(!item)return;
  if(gold<item.cost()){toast('Not enough gold for '+item.n.toLowerCase()+'.');sellerAsk(giver);return;}
  const max=Math.max(1,Math.min(99,Math.floor(gold/item.cost())));
  const qty=Math.max(1,Math.min(max,Math.trunc(amount)||1));
  ask={quick:1,quantity:{giver,key,qty,max},back:()=>sellerAsk(giver),opts:[
    {n:"CONTINUE  (A)",go:()=>confirmPurchase(giver,key,qty)},
    {n:"BACK",go:()=>sellerAsk(giver)}
  ]};askPick=0;askDraw();
}
function confirmPurchase(giver,key,qty){
  const item=STOCK[key];if(!item)return;
  ask={quick:1,confirmation:{key,qty},back:()=>purchaseQuantity(giver,key,qty),opts:[
    {n:'Buy '+qty+' × '+item.n+' for '+qty*item.cost()+' gold?',head:true},
    {n:'YES, BUY  (A)',go:()=>{
      if(buyStockQuantity(key,qty))sellerAsk(giver);
      else purchaseQuantity(giver,key,qty);
    }},
    {n:'BACK',go:()=>purchaseQuantity(giver,key,qty)}
  ]};askPick=1;askDraw();
}
function changePurchaseQuantity(delta) {
  if(!ask?.quantity)return;
  const {giver,key,qty}=ask.quantity;purchaseQuantity(giver,key,qty+delta);
}
function buyStockQuantity(key,qty) {
  const item=STOCK[key];
  if(!item||!Number.isInteger(qty)||qty<1||qty>99)return false;
  const total=item.cost()*qty;
  if(gold<total){toast("not enough gold — "+total+" needed");return false;}
  switch(key){
    case "potion":potions+=qty;break;case "elixir":elixirs+=qty;break;
    case "boarMeat":boarMeat+=qty;break;case "dragonFish":dragonFish+=qty;break;
    case "bomb":bombs+=qty;break;case "dust":dust+=qty;break;
    case "bell":bells+=qty;break;case "mark":marks+=qty;break;
    case "saint":breaths+=qty;break;case "stone":stones+=qty;break;
    case "salt":salts+=qty;break;default:return false;
  }
  gold-=total;toast(qty+" × "+item.n+" bought — "+gold+" gold left");return true;
}
function sellerAsk(giver) {
  const list = [].concat(giver.sells);
  if (!/Maelis|witch/i.test(giver.n || ""))
    list.push(giver.n === "Nerissa" ? "dragonFish" : "boarMeat");
  const stock = [...new Set(list)].filter(k => STOCK[k]);
  if (!stock.length) return;
  const opts = stock.map(k => ({
    n: STOCK[k].n + " -- " + STOCK[k].cost() + "g",
    go: () => purchaseQuantity(giver,k),
  }));
  opts.push({ n: "BACK", go: () => merchantAsk(giver) });
  ask = { opts, quick:1 }; askPick = 0;
  askDraw();
}
function buyBreath() {
  if (gold < BREATH_COST) { toast("not enough gold -- " + gold + "/" + BREATH_COST); return false; }
  gold -= BREATH_COST; breaths++; toast("saint's breath bought -- " + gold + " gold left"); return true;
}
function buyStone() {
  if (gold < STONE_COST) { toast("not enough gold -- " + gold + "/" + STONE_COST); return false; }
  gold -= STONE_COST; stones++; toast("a resurrection stone bought -- " + gold + " gold left"); return true;
}
function buySalt() {
  if (gold < SALT_COST) { toast("not enough gold -- " + gold + "/" + SALT_COST); return false; }
  gold -= SALT_COST; salts++; toast("consecration bought -- " + gold + " gold left"); return true;
}
function buyBell() {
  if (gold < BELL_COST) { toast("not enough gold -- " + gold + "/" + BELL_COST); return false; }
  gold -= BELL_COST; bells++;
  toast("a bell stake bought -- " + gold + " gold left");
  return true;
}
function buyMark() {
  if (gold < MARK_COST) { toast("not enough gold -- " + gold + "/" + MARK_COST); return false; }
  gold -= MARK_COST; marks++;
  toast("a grave marker bought -- " + gold + " gold left");
  return true;
}
function buyDust() {
  if (gold < DUST_COST) { toast("not enough gold -- " + gold + "/" + DUST_COST); return false; }
  gold -= DUST_COST; dust++;
  toast("madness dust bought -- " + gold + " gold left");
  return true;
}
function buyBomb() {
  if (gold < BOMB_COST) { toast("not enough gold -- " + gold + "/" + BOMB_COST); return false; }
  gold -= BOMB_COST; bombs++;
  toast("she gives him the word -- " + gold + " gold left");
  return true;
}
function buyElixir() {
  if (gold < ELIXIR_COST) { toast("not enough gold -- " + gold + "/" + ELIXIR_COST); return false; }
  gold -= ELIXIR_COST; elixirs++;
  toast("an elixir bought -- " + gold + " gold left");
  return true;
}
function buyPotion() {
  if (gold < POTION_COST) { toast("not enough gold -- " + gold + "/" + POTION_COST); return false; }
  gold -= POTION_COST; potions++;
  toast("a potion bought -- " + gold + " gold left");
  return true;
}
function buyBoarMeat() {
  if (gold < BOAR_MEAT_COST) { toast("not enough gold -- " + gold + "/" + BOAR_MEAT_COST); return false; }
  gold -= BOAR_MEAT_COST; boarMeat++;
  toast("boar meat bought for the dragon -- " + gold + " gold left");
  return true;
}
function buyDragonFish() {
  if (gold < DRAGON_FISH_COST) { toast("not enough gold -- " + gold + "/" + DRAGON_FISH_COST); return false; }
  gold -= DRAGON_FISH_COST; dragonFish++;
  toast("fresh fish bought for the dragon -- " + gold + " gold left");
  return true;
}
let twinKills = 0;
const CHARM_ART = { spore: "it_spore", ward: "it_ward", edge: "it_edge",
                    brand: "it_brand", twin: "it_twin", lamp: "it_lamp",
                    flame: "it_twinflame", wake: "it_wake" };
let twinSpent = false;
const WORN_MAX = 3;
function wornCount() {
  let n = 0;
  for (const k in worn) if (worn[k]) n++;
  return n;
}
let brandCount = 0, brandHot = false;
const CHARM_ICON = { spore: "ms3_idle_d", ward: "it_stone", edge: "sm_atk_d",
                     brand: "fslash_d", twin: "dr5_idle_e",
                     lamp: "wt_torch1", flame: "fire_s", wake: "it_stone" };
const CHARM_NOTE = {
  brand: "Corin obtained the Fire Slash!",
  twin:  "Corin obtained the Twin Heart!",
  lamp:  "Corin obtained the Hollybeck Lantern!",
  flame: "Corin obtained the Twin Flame!",
  wake:  "Corin obtained the Book of the Dead!",
  spore: "Corin obtained the Deep Ring Spore!",
  ward:  "Corin obtained the Witch's Ward!",
  edge:  "Corin obtained Dunstan's Whetstone!",
};
function giveCharm(which, line) {
  if (charm[which]) return false;
  charm[which] = true;
  playScene([line]);
  return true;
}
let turnHolder = null, turnT = 0, foeCool = 0;
function targetFor(f) {
  if (f.ally || f.mad > 0) {
    let best = null, bd = 220;
    const fresh = f._huntT !== undefined && f._huntT > foeClock - 0.25;
    const kept = f._hunt;
    if (fresh && (!kept || (kept.st !== "dead" &&
                            Math.hypot(kept.x - f.x, kept.y - f.y) < 300))) {
      if (kept) return { x: kept.x, y: kept.y,
                         d: Math.hypot(kept.x - f.x, kept.y - f.y),
                         isPlayer: false, foe: kept };
      best = null;                       /* a remembered miss: fall through */
    } else {
      f._huntT = foeClock;
      for (const q of foes) {
      if (q === f || q.st === "dead") continue;
      if (f.ally && q.ally) continue;
      if (!f.ally && q.ally) continue;   /* a maddened foe leaves his side alone */
      const d = Math.hypot(q.x - f.x, q.y - f.y);
      if (d < bd) { bd = d; best = q; }
    }
      f._hunt = best;
    }
    if (best) return { x: best.x, y: best.y, d: bd, isPlayer: false, foe: best };
    const side = (f.slot % 2) ? -1 : 1;
    const back = (P.dir === "u") ? -1 : 1;
    const tx2 = P.x + side * 22;
    const ty2 = P.y + back * 52;
    return { x: tx2, y: ty2, d: Math.hypot(tx2 - f.x, ty2 - f.y),
             isPlayer: false, follow: 1 };
  }
  if (bell && !f.ally) {
    const bd = Math.hypot(bell.x - f.x, bell.y - f.y);
    if (bd < 420) return { x: bell.x, y: bell.y, d: bd, isPlayer: false, toBell: 1 };
  }
  const dp = Math.hypot(P.x - f.x, P.y - f.y);
  if (!(dragonHere() && dragon.on) || dragon.down) return { x: P.x, y: P.y, d: dp, isPlayer: true };
  const dd = Math.hypot(dragon.x - f.x, (dragon.y + 8) - f.y);
  if (dd < dp * 0.8) return { x: dragon.x, y: dragon.y + 8, d: dd, isPlayer: false, isDragon: true };
  return { x: P.x, y: P.y, d: dp, isPlayer: true };
}
const WAKE_COOL = 24;              /* seconds between callings */
let wakeCool = 0;
function wakeReady() { return charm.wake && wakeCool <= 0 && !dying(); }
function wakeCount() {
  return foes.filter(f => f.ally && f.kind === "wraith" && f.st !== "dead").length;
}
function wakeTheDead() {
  if (!wakeReady()) return false;
  const room = 2 - wakeCount();
  if (room <= 0) { toast("two is all that will come"); return false; }
  wakeCool = WAKE_COOL;
  for (let i = 0; i < room; i++) {
    const ang = i * Math.PI + 0.7854;       /* one either side of him */
    showRise(P.x + Math.cos(ang) * 34, P.y + Math.sin(ang) * 26);   /* violet */
    foes.push({ kind: "wraith", ally: 1, slot: i,
                x: P.x + Math.cos(ang) * 34,
                y: P.y + Math.sin(ang) * 26,
                hx: P.x, hy: P.y,
                st: "idle", t: 0, hold: 2.6, holdMax: 2.6, emerge: 0,
                hp: (FOE.wraith || {}).hp || 8,
                dir: "d", flip: false, hurt: 0 });
  }
  rebuildBuckets();
  toast("two of the Hollybeck dead get up");
  return true;
}
let foeClock = 0;     /* seconds, for anything that need not look every frame */
const FOE_THINK = 640;
const thinks = (f) => {
  if(MD?.templeContinuous&&!MD.templeActive[templeRoomOf(f)])return false;
  if (f.storyPassive) return false;
  if (f.trial || f.ally || f.mad > 0 || BOSS_KIND.test(f.kind || "") || f.kind === "kdragon") return true;
  const dx = f.x - P.x, dy = f.y - P.y;
  return dx * dx + dy * dy < FOE_THINK * FOE_THINK;
};
let live = [];
function kingDragonTarget(f) {
  const playerD = Math.hypot(P.x - f.x, P.y - f.y);
  /* A companion lingering near the throne must not permanently pin the boss
     there. Once Corin retreats across the hall, the king dragon commits to
     chasing him rather than idling beside its original target. */
  if (playerD > 128) return { x: P.x, y: P.y, d: playerD, dragon: false, pursuingCorin: true };
  if (dragonCombatHere() && dragon.on && !dragon.down) {
    const bodyY = dragon.y - 14;
    const dragonD = Math.hypot(dragon.x - f.x, bodyY - f.y);
    if ((typeof mounted !== "undefined" && mounted) || dragonD <= playerD * 1.15)
      return { x: dragon.x, y: bodyY, d: dragonD, dragon: true };
  }
  return { x: P.x, y: P.y, d: playerD, dragon: false };
}
function stepFoes(dt) {
  foeClock += dt;
  if (wakeCool > 0) wakeCool -= dt;
  live.length = 0;
  for (const f of foes) {
    f._thinking = f.st !== "dead" && thinks(f);
    if (f._thinking) live.push(f);
  }
  // Regular battle music begins when a hostile enemy/boss is actively engaged.
  // King music has priority and the battle track resumes only if combat remains afterward.
  const musicCombat = live.some(f => !f.ally && f.st !== "dead");
  /* Battle music intentionally disabled for now. Area music continues during combat. */
  turnT -= dt;
  if (foeCool > 0) foeCool -= dt;
  if (!turnHolder || turnHolder.st === "dead" || turnT <= 0) {
    let best = null, bd = 1e9;
    for (const f of live) {
      const t = targetFor(f);
      if (t.d < bd) { bd = t.d; best = f; }
    }
    turnHolder = best;
    turnT = 1.6;
  }
  if (lastFight && MAPID === "cinderhold") {
    for (const f of foes) {
      if (!(f.kind === "kdragon" || f.kind === "lich" || f.kind === "boneguard"))
        continue;
      const k2 = FOE[f.kind] || {};
      f.t += dt;
      if (f.hurt > 0) f.hurt -= dt;
      if (f.st === "dead") continue;
      if (f.hold > 0) {
        f.hold = Math.max(0, f.hold - dt); f.st = "idle";
        f.emerge = Math.max(0, Math.min(1, (1 - f.hold/(f.holdMax || 2.6) - 0.25)/0.7));
        continue;
      }
      if (f.emerge !== undefined && f.emerge < 1) f.emerge = 1;
      f.cool = (f.cool || 0) - dt;
      if (f.swordGuard > 0) f.swordGuard = Math.max(0, f.swordGuard - dt);
      if (f.kind === "kdragon" && f.chaseDelay > 0) {
        f.chaseDelay = Math.max(0, f.chaseDelay - dt); f.st = "idle";
        continue;
      }
      if (f.retreat > 0) {
        f.retreat = Math.max(0, f.retreat - dt);
        const rx=f.x-(f.retreatX === undefined ? P.x : f.retreatX);
        const ry=f.y-(f.retreatY === undefined ? P.y : f.retreatY);
        const rd=Math.hypot(rx,ry)||1, sp=Math.max(k2.speed||30,f.kind==="kdragon"?118:64)*dt*(f.glassRetreatBoost||1);
        const nx=f.x+rx/rd*sp, ny=f.y+ry/rd*sp;
        if(f.kind==="kdragon"){
          const clear=(x,y)=>!isSolid(x,y)&&!isSolid(x-30,y)&&!isSolid(x+30,y)&&!isSolid(x,y-34);
          const mx=clear(nx,f.y), my=clear(f.x,ny);
          if(mx)f.x=nx; if(my)f.y=ny;
          if(!mx&&!my)f.retreat=0;       /* never force the dragon through a wall */
          f.dir8=direction4(rx,ry,f.dir8);
        }
        else { if(!isSolid(nx,f.y))f.x=nx; if(!isSolid(f.x,ny))f.y=ny; }
        f.st="walk"; f.cool=Math.max(f.cool||0,.28);
        if (f.retreat <= 0) f.glassRetreatBoost = 1;
        if (f.retreat <= 0 && f.pressureCounter) {
          f.st="wind"; f.t=0; f.hitDone=0; f.cool=0; beginEnemyWindup(f);
        }
        continue;
      }
      const target = f.pressureCounter
        ? { x:P.x, y:P.y, d:Math.hypot(P.x-f.x,P.y-f.y), dragon:false, counter:true }
        : (f.kind === "kdragon" || f.kind === "lich") ? kingDragonTarget(f)
        : { x: P.x, y: P.y, d: Math.hypot(P.x - f.x, P.y - f.y), dragon: false };
      const dx = target.x - f.x, dy = target.y - f.y;
      const d = target.d || 1;
      f.onDragon = !!target.dragon;
      if(f.kind==="kdragon") f.dir8=direction4(dx,dy,f.dir8);
      if (Math.abs(dx) > Math.abs(dy)) {
        f.dir = "s";
        const TURN = 42;                 /* how far past it you must get */
        if (f.flip === undefined) f.flip = dx < 0;
        if (dx < -TURN) f.flip = true;
        else if (dx > TURN) f.flip = false;
      } else {
        f.dir = dy > 0 ? "d" : "u";
      }
      if (f.st === "wind" || f.st === "swing") {
        const sw = k2.swingT || 1.2;
        if (f.st === "wind" && f.t >= GLASS_TELEGRAPH_WINDOW) { f.st = "swing"; f.t = 0; f.hitDone = 0; }
        if (f.st === "swing") {
          if (!f.hitDone && f.t >= (k2.hitAt || 0.5)) {
            f.hitDone = 1;
            if ((f.kind === "kdragon" || f.kind === "lich") && k2.cast && d <= (k2.reach || 30) + 28) {
              const fd = f.dir8 || direction4(dx, dy, "s");
              const mouth = f.kind === "kdragon" ? kingDragonMouth(f, fd) : { x: f.x, y: f.y - 22 };
              const ax = target.x - mouth.x, ay = target.y - mouth.y;
              const ad = Math.hypot(ax, ay) || 1;
              bolts.push({ x: mouth.x, y: mouth.y, vx: ax / ad, vy: ay / ad,
                dir: fd === "n" ? "u" : fd === "s" ? "d" : fd, art: k2.cast, dmg: k2.dmg,
                sp: k2.boltSp || 220, life: 1.6, t: 0, targetDragon: !!target.dragon, unblockable: !!f.unblockableAttack });
              if (f.kind === "kdragon") f.chaseDelay = 0.35;
            } else if (d <= (k2.reach || 30) + 10) {
              if (target.dragon) {
                hurtDragon(k2.dmg || 2);
                dragonCombatPause = Math.max(dragonCombatPause, 0.42);
              }
              else if(!glassShieldDeflectFoe(f)) hurtPlayer(k2.dmg || 2);
            }
            if (f.kind === "kdragon" && f.pressureCounter) f.pressureCounter = false;
          }
          if (f.t >= sw) { finishGlassShieldParry(f); f.st = "idle"; f.t = 0; f.unblockableAttack = false; f.cool = Math.max(f.cool || 0,(k2.rest || 1) * .72); }
        }
        continue;
      }
      /* Reach is how far an attack can travel.  The king dragon must still
         cross the hall before it plants itself to attack. */
      const chaseRange = f.kind === "kdragon" ? 86 : (k2.reach || 30) * 0.8;
      if (d <= chaseRange && f.cool <= 0) {
        f.st = "wind"; f.t = 0; f.hitDone = 0; beginEnemyWindup(f);
        continue;
      }
      /* Projectile reach is not the king dragon's resting distance: it fires
         while closing, then keeps flying down the hall until it is nearby. */
      if (d > chaseRange) {
        const sp = (k2.speed || 30) * 1.10 * dt;
        const nx = f.x + (dx / d) * sp, ny = f.y + (dy / d) * sp;
        if (f.kind === "kdragon") { f.x = nx; f.y = ny; }
        else {
          if (!isSolid(nx, f.y)) f.x = nx;
          if (!isSolid(f.x, ny)) f.y = ny;
        }
        f.st = "walk";
      } else if (f.st !== "walk") f.st = "idle";
    }
  }
  for (const f of foes) {
    const k = FOE[f.kind];
    if (lastFight && MAPID === "cinderhold" &&
        (f.kind === "kdragon" || f.kind === "lich" || f.kind === "boneguard")) continue;
    f.t += dt;
    if(f.reverseRise>0){f.reverseRise=Math.max(0,f.reverseRise-dt);f.emerge=1;continue;}
    if (f.hold > 0) {
      f.hold -= dt;
      f.st = "idle";
      const total = f.holdMax || 2.6;
      const done = 1 - f.hold / total;
      f.emerge = Math.max(0, Math.min(1, (done - 0.34) / 0.60));
      continue;
    }
    if (f.emerge !== undefined && f.emerge < 1) f.emerge = 1;
    if (f.st !== "dead" && !f._thinking) continue;
    if (f.hurt > 0) f.hurt -= dt;
    if (f.mad > 0) f.mad -= dt;
    if (f.st === "dead") continue;
    if (f.kind === "kdragon" || (lastFight === 2 &&
        (f.kind === "lich" || f.kind === "boneguard"))) {
      f.hx = P.x; f.hy = P.y; f.ring = 0;
    }
    if (f.trial) { f.hx = P.x; f.hy = P.y; f.ring = 0; }
    if (f.ally) {
      f.hx = P.x; f.hy = P.y; f.ring = 0;
      const gap = Math.hypot(f.x - P.x, f.y - P.y);
      if (gap > 420) {
        const side = (f.slot % 2) ? -1 : 1;
        for (const [ox, oy] of [[side * 22, 52], [side * 26, 40],
                                [-side * 22, 52], [0, 58], [0, -58]]) {
          if (!isSolid(P.x + ox, P.y + oy)) {
            f.x = P.x + ox; f.y = P.y + oy;
            f.st = "walk"; f.going = false;
            break;
          }
        }
      }
    }
    const hx = f.hx === undefined ? f.x : f.hx;
    const hy = f.hy === undefined ? f.y : f.hy;
    if (f.ring === undefined) {
      f.ring = 0;
      for (const a of features) {
        if (a.kind !== "arena") continue;
        if (Math.hypot(hx / TS - a.x, hy / TS - a.y) <= a.r + 2) {
          f.ring = (a.r - 1) * TS;
          f.cx = a.x * TS + TS / 2; f.cy = a.y * TS + TS / 2;
          break;
        }
      }
    }
    const LEASH = f.ally ? 170 : (f.ring ? f.ring : 88);
    const away = Math.hypot(f.x - hx, f.y - hy);
    if (f.ally) f.going = false;
    else if (bell) f.going = false;       /* the bell is worth leaving home for */
    else if (away > LEASH) f.going = true;
    else if (away < LEASH * 0.35) f.going = false;
    if (f.retreat > 0) f.retreat = Math.max(0, f.retreat - dt);
    else if (f.glassRetreatBoost) f.glassRetreatBoost = 0;
    const retreating = !f.ally && f.retreat > 0;
    const rdx = f.x - (f.retreatX === undefined ? P.x : f.retreatX);
    const rdy = f.y - (f.retreatY === undefined ? P.y : f.retreatY);
    const rd = Math.hypot(rdx, rdy) || 1;
    const retreatTgt = { x:f.x + rdx / rd * 68, y:f.y + rdy / rd * 68,
      d:68, isPlayer:false, retreat:true };
    const tgt = retreating ? retreatTgt
      : f.going ? { x: hx, y: hy, d: away, isPlayer: true, home: 1 }
      : targetFor(f);
    f.onDragon = !tgt.isPlayer;
    const dx = tgt.x - f.x, dy = tgt.y - f.y, d = tgt.d;
    if(f.kind==="kdragon") f.dir8=direction4(dx,dy,f.dir8);
    const faceX = retreating && regularFoe(f) ? -dx : dx;
    const faceY = retreating && regularFoe(f) ? -dy : dy;
    if (Math.abs(faceX) > Math.abs(faceY)) { f.dir = "s"; f.flip = faceX < 0; }
    else f.dir = faceY > 0 ? "d" : "u";
    const myTurn = (f === turnHolder);
    const want = k.standoff ? k.standoff : (myTurn ? k.reach - 4 : k.ring);
    f.slot = (f.slot === undefined) ? foes.indexOf(f) : f.slot;
    const nLive = live.length || 1;
    const ang = (f.slot / nLive) * 6.2832 + f.t * 0.2;
    const orbit = !(f.ally && tgt.follow) && !(f.mad > 0 && tgt.foe) && !tgt.toBell;
    const sx = (myTurn || !orbit) ? 0 : Math.cos(ang) * want;
    const sy = (myTurn || !orbit) ? 0 : Math.sin(ang) * want;
    if (f.st === "idle") {
      if (f.ally || f.mad > 0 || tgt.toBell || d < k.sight) { f.st = "walk"; f.t = 0; }
    } else if (f.st === "walk") {
      if (!f.ally && !(f.mad > 0) && !tgt.toBell && d > k.sight * 1.5) { f.st = "idle"; f.t = 0; }
      else if (!tgt.retreat && !f.going && !tgt.toBell && d < k.reach &&
               (!P.act || (regularFoe(f) && P.act.kind === "swing")) &&
               ((f.ally || f.mad > 0) ? !tgt.follow : (myTurn && foeCool <= 0)) &&
               facing(f, tgt)) {
        f.st = "wind"; f.t = 0; beginEnemyWindup(f);
      }
      else {
        let tx = tgt.x + sx, ty = tgt.y + sy;
        let rx = tx - f.x, ry = ty - f.y, rd = Math.hypot(rx, ry);
        let stop = myTurn ? want : 6;
        if (f.mad > 0 && tgt.foe) stop = Math.max(6, k.reach - 6);
        if (tgt.toBell) stop = 14;          /* they crowd round it */
        if (f.ally && tgt.follow) stop = 34;     /* they hold well off him */
        if (k.standoff && d < k.standoff - 12) {
          rx = f.x - tgt.x; ry = f.y - tgt.y;
          rd = Math.hypot(rx, ry) || 1; stop = 0;
        }
        if (rd > stop) {
          let sp = k.speed * ((myTurn || (f.ally && tgt.foe) || (f.mad > 0 && tgt.foe)) ? 1 : 0.90);
          if (tgt.retreat) sp *= (regularFoe(f) ? 1.1 : 1.65) * (f.glassRetreatBoost || 1);
          if (f.ally) sp = Math.max(sp, 150 + Math.min(120, rd * 1.2));
          const nx = f.x + (rx / rd) * sp * dt, ny = f.y + (ry / rd) * sp * dt;
          if (f.halfW === undefined) {
            const a = SPR[(FOE_ART[f.kind] || "sk") + "_idle_d"];
            f.halfW = a ? Math.max(6, Math.min(15, Math.round(a[2] * 0.22))) : 7;
          }
          const halfW = f.halfW;
          if (f.buf === undefined) {
            const a = SPR[(FOE_ART[f.kind] || "sk") + "_idle_d"];
            f.buf = a ? Math.min(2, Math.max(1, Math.round(a[3] / TS / 2))) : 1;
          }
          const legal = (X, Y, b) => {
            if (isSolid(X - halfW, Y) || isSolid(X, Y) || isSolid(X + halfW, Y)) return false;
            for (let t = 1; t <= b; t++)
              if (isSolid(X - halfW, Y - t * TS) || isSolid(X, Y - t * TS) ||
                  isSolid(X + halfW, Y - t * TS)) return false;
            return true;
          };
          let freeX = true, freeY = true;
          if (!f.ally) {
            // Full footprint checks are the costliest part of a crowded fight.
            // Stagger them across alternate frames; the cheap centre check on
            // the in-between frame still prevents crossing a new wall.
            const fullNav = ((Math.floor(foeClock * 60) + (f.slot || 0)) & 1) === 0 ||
                            f._navFreeX === undefined;
            if (fullNav) {
              const stuck = !legal(f.x, f.y, f.buf);
              const clear = (X, Y) => stuck ? !isSolid(X, Y) : legal(X, Y, f.buf);
              f._navFreeX = clear(nx, f.y);
              f._navFreeY = clear(f.x, ny);
            }
            freeX = f._navFreeX && !isSolid(nx, f.y);
            freeY = f._navFreeY && !isSolid(f.x, ny);
          }
          if (freeX) f.x = nx;
          if (freeY) f.y = ny;
          if (f.ally) {
            for (const q of foes) {
              if (q === f || !q.ally || q.st === "dead") continue;
              const ox2 = f.x - q.x, oy2 = f.y - q.y;
              const od2 = Math.hypot(ox2, oy2);
              if (od2 > 0.01 && od2 < 22) {
                const push = (22 - od2) * 0.5;
                const px2 = f.x + (ox2 / od2) * push;
                const py2 = f.y + (oy2 / od2) * push;
                if (!isSolid(px2, py2)) { f.x = px2; f.y = py2; }
              }
            }
          }
          if (f.ring) {
            const cx = f.cx === undefined ? hx : f.cx;
            const cy = f.cy === undefined ? hy : f.cy;
            const ox = f.x - cx, oy = f.y - cy, od = Math.hypot(ox, oy);
            if (od > f.ring) {
              const bx = cx + (ox / od) * f.ring, by = cy + (oy / od) * f.ring;
              if (!isSolid(bx, by)) { f.x = bx; f.y = by; }
            }
          }
        }
      }
    } else if (f.st === "wind") {
      if (f.t > k.wind) { f.st = "swing"; f.t = 0; f.hit = 0; }
    } else if (f.st === "swing") {
      if (!f.hit && f.t > k.hitAt) {
        f.hit = 1;
        foeCool = k.groupRest * .72;
        if (!facing(f, tgt)) { /* the moment is lost */ }
        else if (k.cast) {
          const ax = tgt.x - f.x, ay = (tgt.y - 6) - (f.y - 22);
          const ad = Math.hypot(ax, ay) || 1;
          const dd = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? "w" : "e")
                                                 : (ay < 0 ? "u" : "d");
          bolts.push({ x: f.x, y: f.y - 22, vx: ax / ad, vy: ay / ad,
                       dir: dd, art: k.cast, dmg: k.dmg,
                       sp: k.boltSp || 150, life: 2.6, t: 0,
                       targetDragon: !!tgt.isDragon, unblockable: !!f.unblockableAttack });
        } else if (d < k.reach + 8 && tgt.isPlayer) { if(!glassShieldDeflectFoe(f)) hurtPlayer(k.dmg); }
        else if (d < k.reach + 8 && tgt.isDragon) hurtDragon(k.dmg);
        else if (d < k.reach + 8 && (f.ally || f.mad > 0) && tgt.foe && tgt.foe.st !== "dead") {
          tgt.foe.hp -= k.dmg * (f.mad > 0 ? 2 : 1); tgt.foe.hurt = 0.25;
          if (tgt.foe.hp <= 0) { tgt.foe.st = "dead"; tgt.foe.t = 0; markBossGone(tgt.foe); }
        }
      }
      if (f.t > k.swingT + (f.mad > 0 ? k.rest * 0.25 : k.rest * .80)) {
        finishGlassShieldParry(f);
        f.st = "walk"; f.t = 0; f.unblockableAttack = false;
        if (myTurn) turnT = 0;
      }
    }
  }
}
let pHp = 6, pMax = 6, pInv = 0;
function inFight() { return foes.some(f => f.st !== "dead" && Math.hypot(f.x - P.x, f.y - P.y) < 200); }
let devSafe = false;
let dragonOff = false;
let devDragonPassive = false;
function hurtPlayer(n) {
  if (foesHeld) return;
  if (devSafe) return;        /* invincible while the dev panel is open */
  if (saintT > 0) return;     /* Saint's Breath: nothing lands at all */
  if (mounted && dragonHere() && !dragon.down) {
    hurtDragon(n);
    return;
  }
  if (pInv > 0) return;
  if (worn.twin && !twinSpent && arenaLock && dragonHere() && !dragon.down) {
    twinSpent = true;
    pInv = 1.1;
    hurtDragon(1);
    toast("the dragon takes it");
    return;
  }
  if (smithUpgrade && !mounted) n = Math.max(1, n - 1);
  if (worn.ward) {
    wardCarry += n * 0.25;
    while (wardCarry >= 1 && n > 0) { n -= 1; wardCarry -= 1; }
  }
  if (n <= 0) { pInv = 1.1; return; }
  pHp = Math.max(0, pHp - n);
  pInv = 1.1;
  if (pHp <= 0) { P.act = { kind: "die", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() }; return; }
  P.act = { kind: "hurt", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4() };
}
let wardCarry = 0;
function dying() { return !!(P.act && P.act.kind === "die"); }
let safeSpot = null, deadShown = false;
function markSafe() {
  if (dying() || arenaLock || scene || fadeDir !== 0) return;
  if (foes.some(f => !f.ally && f.st !== "dead" &&
                     Math.hypot(f.x - P.x, f.y - P.y) < 180)) return;
  safeSpot = { map: MAPID, x: P.x, y: P.y };
}
function showDeath() {
  if (deadShown) return;
  deadShown = true;
  const lost = Math.floor(gold * 0.3);
  const el = document.getElementById("dead");
  const why = document.getElementById("deadWhy");
  if (why) why.textContent = lost > 0 ? "He loses " + lost + " gold." : "";
  if (!el) return;
  el.style.display = "flex";
  el.style.opacity = "0";
  requestAnimationFrame(() => { el.style.opacity = "1"; });
}
function getUp() {
  const el = document.getElementById("dead");
  standUp();
  if (!el) return;
  el.style.opacity = "0";
  setTimeout(() => { el.style.display = "none"; }, 760);
}
let standing = false;
function standUp() {
  if (trial) stopTrial("");
  if (standing) return;        /* one press is enough, even during the fade */
  standing = true;
  setTimeout(() => { standing = false; }, 900);
  deadShown = false;
  const lost = Math.floor(gold * 0.3);
  gold = Math.max(0, gold - lost);
  if (lost > 0) dropped = { gold: lost };   /* a marker can fetch it back */
  pHp = pMax;
  recoverStrandedDragon();
  pInv = 2.2;
  P.act = null;
  try { releaseArena(); } catch (e) { /* no ring open */ }
  foes = foes.filter(f => f.ally);
  const to = safeSpot || { map: "world", x: P.x, y: P.y };
  if (to.map !== MAPID) { loadMap(to.map, true); buildGround(); }
  P.x = to.x; P.y = to.y;
  recoverTempleArrival(!!W.maps[to.map]?.templeLegacy);
  spawnFoes();
  rebuildBuckets();
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  clampCam();
  toast("he gets up");
}
function blockReason(px, py) {
  if(px<0||py<0||px>=MW*TS||py>=MH*TS)return "edge";
  const override=collisionOverride(px,py);if(override!==undefined)return override?"custom":null;
  if(blockedByNpcBody(px,py)||blockedByNpcBuffer(px,py))return "npc";
  if(MD.roomBlocks?.some(r=>px>=r[0]&&px<r[2]&&py>=r[1]&&py<r[3]))return "furniture";
  if(MAPID==="glasshouse"&&glassHatchFrame()<3&&px>=48&&px<88&&py>=104&&py<118)return "counter";
  if(MAPID==="witchmoor"&&wonAll&&px>=184&&px<213&&py>=282&&py<311)return "story";
  if(blockedByTrialPedestal(px,py))return "story";
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= MW || y >= MH) return "edge";
  if (solid[y * MW + x] === 1) {
    if (terr[y * MW + x] === WALL) return "terr";
    if (typeof baseTerr !== "undefined" && baseTerr && baseTerr[y * MW + x] === WALL) return "base";
    return "solid";     /* set by rebuildSolid from something else */
  }
  if (!arenaPass && arenaLock && arenaT > 0.25 &&
      Math.hypot(x - arenaLock.x, y - arenaLock.y) > arenaLock.r + 0.5) return "arena";
  if (x <= 80) {
    if (northShut() && MAPID === "world" && y <= gateRow && y >= gateRow - 5) return "gate";
    if (eggGate >= 0 && quest === Q.CARRY && MAPID === "world" &&
        y >= eggGate && y <= eggGate + 5) return "gate";
    if (quest === Q.FLED && MAPID === "world" && fieldGate >= 0 &&
        y >= fieldGate && y <= fieldGate + 5) return "gate";
  }
  if (fenceAt && fenceAt.has(y * MW + x)) return "fence";
  if (blockedByGuard(x, y)) return "guard";
  if (odoShuts(x, y)) return "odo";
  if (blockedByItem(x, y)) return "item";
  if (blockedByHerd(x, y)) return "herd";
  return null;
}
const REASON_COLOUR = {
  custom:"rgba(240,70,30,0.45)",npc:"rgba(255,230,0,0.4)",furniture:"rgba(255,0,180,0.4)",counter:"rgba(30,210,255,0.4)",story:"rgba(170,70,240,0.4)",
  terr:  "rgba(200,30,30,0.34)",    base: "rgba(230,90,20,0.34)",
  solid: "rgba(255,0,140,0.34)",    arena:"rgba(255,160,0,0.34)",
  gate:  "rgba(120,0,255,0.34)",    fence:"rgba(0,180,255,0.34)",
  guard: "rgba(255,255,0,0.34)",    odo:  "rgba(255,255,0,0.34)",
  item:  "rgba(255,120,255,0.34)",  herd: "rgba(0,255,200,0.34)",
  edge:  "rgba(90,90,90,0.34)"
};

const HT = 8;
function drawCollide() {
  if (!collideView || !solid) return;
  const vw = VW / cam.z, vh = VH / cam.z;
  ctx.save();
  ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
  const hx0 = Math.max(0, Math.floor(cam.x / HT)), hx1 = Math.floor((cam.x + vw) / HT);
  const hy0 = Math.max(0, Math.floor(cam.y / HT)), hy1 = Math.floor((cam.y + vh) / HT);
  for (let hy = hy0; hy <= hy1; hy++) for (let hx = hx0; hx <= hx1; hx++) {
    const px = hx * HT + HT / 2, py = hy * HT + HT / 2;
    if (px >= MW * TS || py >= MH * TS) continue;
    const why = blockReason(px, py);
    const marked = badTiles[hx + "," + hy];
    ctx.fillStyle = marked ? "rgba(255,255,255,0.75)"
                  : why ? (REASON_COLOUR[why] || "rgba(200,30,30,0.34)")
                        : "rgba(40,220,90,0.13)";
    ctx.fillRect(hx * HT, hy * HT, HT - 1, HT - 1);
  }
  // Exact outlines retain narrow blockers that a half-tile sample can miss.
  ctx.lineWidth=1/cam.z;ctx.strokeStyle='#ff58cc';
  for(const r of MD.roomBlocks||[])ctx.strokeRect(r[0],r[1],r[2]-r[0],r[3]-r[1]);
  ctx.strokeStyle='#ffe85c';
  for(const n of npcs){if(!npcHere(n)||n.goto||n.leaving)continue;ctx.strokeRect(n.x-7,n.y-8,14,8);ctx.strokeRect(n.x-TS/2,n.y,TS,TS/2);}
  ctx.restore();

}

function collideTap(clientX,clientY){if(!collideView||geometryPan)return false;paintCollision(clientX,clientY);return true;}

const dragonVitalGradients = new Map();
function drawDragonVitals(x, y, width) {
  syncDragonVitality(false);
  const h = 44, pad = 5, fw = 34, fh = 34;
  const meterX = x + pad + fw + 7, meterY = y + 20;
  const meterW = Math.max(92, width - (pad + fw + 7) - pad), meterH = 10;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = "#0b0e15";
  const r = 6;
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+width-r,y);
  ctx.quadraticCurveTo(x+width,y,x+width,y+r); ctx.lineTo(x+width,y+h-r);
  ctx.quadraticCurveTo(x+width,y+h,x+width-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.fill();
  ctx.globalAlpha = 0.85; ctx.strokeStyle = dragon.down ? "#8d5d5d" : "#5a6377"; ctx.stroke();
  const face = SPR["dr5_idle_s"];
  if (face) {
    ctx.globalAlpha = dragon.down ? 0.55 : 1;
    ctx.save(); ctx.beginPath(); ctx.arc(x+pad+fw/2,y+pad+fh/2,fw/2,0,Math.PI*2); ctx.clip();
    const cropW = Math.min(face[2], 34), cropH = Math.min(face[3], 34);
    const sx = face[0] + Math.floor((face[2]-cropW)/2);
    const sy = face[1] + Math.max(0, Math.floor(face[3]*0.18));
    const k = Math.max(fw/cropW, fh/cropH);
    drawGameImage(ctx, sheetOf(face), sx, sy, cropW, cropH,
      x+pad+(fw-cropW*k)/2, y+pad+(fh-cropH*k)/2, cropW*k, cropH*k);
    ctx.restore();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = dragon.down ? "#9d6868" : "#8a93a8";
    ctx.beginPath(); ctx.arc(x+pad+fw/2,y+pad+fh/2,fw/2,0,Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.font = "bold 9px monospace"; ctx.textBaseline = "middle";
  ctx.fillStyle = dragon.down ? "#d88b83" : "#d9e3d2";
  ctx.fillText(dragon.down ? "DRAGON — HURT" : "DRAGON", meterX, y + 12);
  ctx.fillStyle = "#25191a"; ctx.fillRect(meterX, meterY, meterW, meterH);
  const ratio = dragon.maxHp ? dragon.hp / dragon.maxHp : 0;
  const gradKey = meterX + ":" + meterW;
  let grad = dragonVitalGradients.get(gradKey);
  if (!grad) {
    grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
    grad.addColorStop(0, "#9d2f2f"); grad.addColorStop(1, "#e88343");
    dragonVitalGradients.set(gradKey, grad);
  }
  ctx.fillStyle = grad; ctx.fillRect(meterX, meterY, Math.round(meterW * ratio), meterH);
  ctx.strokeStyle = "#d3a176"; ctx.strokeRect(meterX + 0.5, meterY + 0.5, meterW - 1, meterH - 1);
  ctx.font = "bold 8px monospace";
  ctx.fillStyle = "#f3eadb";
  ctx.fillText(dragon.hp + "/" + dragon.maxHp, meterX + 3, meterY + meterH / 2 + 0.5);
  if (dragon.down) {
    ctx.font = "7px monospace"; ctx.fillStyle = "#e79b91";
    ctx.fillText("FEED TO REVIVE", meterX, y + 37);
  }
  ctx.restore();
}

function hudTopInset() {
  const full = document.fullscreenElement || document.webkitFullscreenElement ||
    document.body.classList.contains("pseudoFullscreen");
  const touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  let embedded = false;
  try { embedded = window.top !== window.self; } catch (e) { embedded = true; }
  /* Only the ChatGPT embedded frame paints chrome over the game viewport.
     Normal iPhone browsers have a real visual viewport and need the HUD high. */
  return touch && embedded && !full ? Math.max(92, Math.round(VH * 0.14)) : 8;
}
function drawKingDragonHeadVitals(king, spriteX, spriteY, spriteW) {
  const maxHp = enemyMaxHp(king.kind, Number.isFinite(king.hx) ? king.hx : king.x);
  const width = Math.max(54, Math.min(76, Math.round(spriteW * 0.42)));
  /* The new king art has empty pixels above the crown. Keep this directly
     against the visible head instead of floating in that transparent space. */
  const height = 8, x = Math.round(king.x - width / 2), y = Math.round(spriteY + 3);
  const meterX = x + 2, meterY = y + 2, meterW = width - 4, meterH = 4;
  ctx.save();
  ctx.globalAlpha = 0.94; ctx.fillStyle = "#08050e";
  ctx.fillRect(x, y, width, height);
  ctx.globalAlpha = 1; ctx.strokeStyle = "#b46ee8"; ctx.lineWidth = 1;
  ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
  ctx.fillStyle = "#1b1029"; ctx.fillRect(meterX, meterY, meterW, meterH);
  const ratio = Math.max(0, Math.min(1, king.hp / maxHp));
  const grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
  grad.addColorStop(0, "#4c2370"); grad.addColorStop(0.55, "#8e42c7"); grad.addColorStop(1, "#d48aff");
  ctx.fillStyle = grad; ctx.fillRect(meterX, meterY, Math.max(1, Math.round(meterW * ratio)), meterH);
  ctx.fillStyle = "rgba(255,255,255,.32)"; ctx.fillRect(meterX, meterY, Math.max(1, Math.round(meterW * ratio)), 1);
  ctx.restore();
}

function drawHeartsLegacy() {
  if (saintT > 0) {
    const ending = saintT < 3;
    const puls = (Math.sin(saintT * (ending ? 16 : 6)) + 1) / 2;
    ctx.save();
    ctx.shadowColor = ending ? "#ffd070" : "#fff0b4";
    ctx.shadowBlur = (ending ? 10 : 14) + puls * (ending ? 14 : 10);
    ctx.translate(0, Math.sin(saintT * (ending ? 12 : 4)) * (ending ? 1.4 : 0.8));
  }
  const full = SPR["ui_heart"], empty = SPR["ui_heart_off"];
  if (!full) return;
  const HZ = 2;
  const step = full[2] * HZ + 3;
  const FACE = corinKit() + "idle_d";
  const fw = 34, fh = 34;                 /* the portrait badge */
  const pad = 5;
  const barX = 8, barY = hudTopInset();
  const rowW = pMax * step - 3;
  const wornList = ["flame", "twin", "brand", "spore", "ward", "edge"].filter(k => worn[k]);
  const CZ = 18, cGap = 3;
  const chW = wornList.length ? (6 + wornList.length * (CZ + cGap) - cGap) : 0;
  const boxW = pad + fw + 6 + rowW + chW + pad;
  const boxH = Math.max(fh, full[3] * HZ) + pad * 2;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = "#0b0e15";
  const r = 6, x = barX, y = barY, w = boxW, hgt = boxH;
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + hgt - r);
  ctx.quadraticCurveTo(x + w, y + hgt, x + w - r, y + hgt); ctx.lineTo(x + r, y + hgt);
  ctx.quadraticCurveTo(x, y + hgt, x, y + hgt - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
  ctx.globalAlpha = 0.85; ctx.strokeStyle = "#5a6377"; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  const f2 = SPR[FACE];
  /* Portrait artwork is decorative. Some costume sheets intentionally omit
     an idle portrait crop, so never let that suppress the health HUD. */
  if (f2) {
    const src = atlasImg;
    ctx.save();
    ctx.beginPath();
    ctx.arc(barX + pad + fw / 2, barY + pad + fh / 2, fw / 2, 0, Math.PI * 2);
    ctx.clip();
    const cx = 24, cw = 16;
    const cy = 18, ch = 16;
    const k = Math.max(fw / cw, fh / ch);
    const dw = Math.round(cw * k), dh = Math.round(ch * k);
    drawGameImage(ctx, src, f2[0] + cx, f2[1] + cy, cw, ch,
                  barX + pad + (fw - dw) / 2, barY + pad + (fh - dh) / 2, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 0.9; ctx.strokeStyle = "#8a93a8";
    ctx.beginPath();
    ctx.arc(barX + pad + fw / 2, barY + pad + fh / 2, fw / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const x0 = barX + pad + fw + 6, y0 = barY + (boxH - full[3] * HZ) / 2;
  if (saintT > 0) {
    const ending = saintT < 3;      /* the last three seconds run hot */
    const puls = (Math.sin(saintT * (ending ? 16 : 6)) + 1) / 2;
    const hw = full[2] * HZ, hh = full[3] * HZ;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < pMax; i++) {
      const cx3 = x0 + i * step + hw / 2, cy3 = y0 + hh / 2;
      const lag = (Math.sin(saintT * (ending ? 14 : 5) - i * 0.7) + 1) / 2;
      const R = hw * (1.5 + 0.5 * lag);
      const g = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, R);
      const a = (ending ? 0.5 : 0.38) + lag * 0.42;
      g.addColorStop(0, "rgba(255,246,214," + a.toFixed(3) + ")");
      g.addColorStop(0.35, "rgba(255," + (ending ? 206 : 226) + ",120," + (a * 0.6).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,190,80,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx3, cy3, R, 0, 6.283); ctx.fill();
    }
    const bg = ctx.createLinearGradient(x0 - 8, 0, x0 + rowW + 8, 0);
    const ba = (0.16 + puls * 0.2) * (ending ? 1.3 : 1);
    bg.addColorStop(0, "rgba(255,220,120,0)");
    bg.addColorStop(0.5, "rgba(255,244,200," + ba.toFixed(3) + ")");
    bg.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(x0 + rowW / 2, y0 + hh / 2, rowW * 0.62, hh * 1.1, 0, 0, 6.283);
    ctx.fill();
    ctx.fillStyle = "rgba(255,250,224,0.95)";
    for (let k = 0; k < 8; k++) {
      const ph = (saintT * 0.85 + k * 0.23) % 1;
      ctx.globalAlpha = (1 - ph) * 0.9;
      const sx = x0 + ((k * 0.17 + saintT * 0.09) % 1) * rowW;
      const sz = 2.2 * (1 - ph * 0.5);
      ctx.fillRect(sx, (y0 + hh * 0.5) - ph * 26, sz, sz);
    }
    ctx.restore();
  }
  for (let i = 0; i < pMax; i++) {
    const s2 = i < pHp ? full : (empty || full);
    if (s2 === full || i < pHp) ctx.globalAlpha = 1; else ctx.globalAlpha = 0.9;
    drawGameImage(ctx, atlasImg, s2[0], s2[1], s2[2], s2[3],
                  x0 + i * step, y0, s2[2] * HZ, s2[3] * HZ);
  }
  ctx.globalAlpha = 1;
  if (wornList.length) {
    let cx2 = x0 + rowW + 6;
    const cy2 = barY + (boxH - CZ) / 2;
    for (const k of wornList) {
      const nm = (SPR[CHARM_ART[k]] && CHARM_ART[k]) || CHARM_ICON[k];
      const sp = SPR[nm];
      if (sp) {
        const img = sp[5] === 2 ? smImg : sp[5] ? dragonImg : atlasImg;
        const kk = Math.min(CZ / sp[2], CZ / sp[3]);
        const dw = Math.round(sp[2] * kk), dh = Math.round(sp[3] * kk);
        drawGameImage(ctx, img, sp[0], sp[1], sp[2], sp[3],
                      cx2 + (CZ - dw) / 2, cy2 + (CZ - dh) / 2, dw, dh);
      }
      cx2 += CZ + cGap;
    }
  }
  if (saintT > 0) ctx.restore();
  if (hasDragon()) drawDragonVitals(barX, barY + boxH + 4, Math.max(190, Math.min(270, boxW)));
}

/* One compact party panel: the same portrait-and-meter language for Corin
   and the dragon, sized to stay out of the way on an iPhone. */
function drawPartyPortrait(sp, img, x, y, size, stroke, focus) {
  if (!sp) return;
  ctx.save(); ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2); ctx.clip();
  const crop = focus === "corin" ? 16 : focus === "dragon" ? 24
    : Math.max(1, Math.floor(Math.min(sp[2], sp[3]) * .52));
  const sx = focus === "corin" ? sp[0] + 24 : focus === "dragon" ? sp[0] + 31
    : sp[0] + Math.floor((sp[2] - crop) / 2);
  /* The south pose stores the tail high in its cell; the eyes are lower. */
  const sy = focus === "corin" ? sp[1] + 18 : focus === "dragon" ? sp[1] + 38 : sp[1];
  drawGameImage(ctx, img, sx, sy, crop, crop, x, y, size, size);
  ctx.restore(); ctx.strokeStyle = stroke; ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size / 2 - .5, 0, Math.PI * 2); ctx.stroke();
}
function drawHudHeart(x, y, px, color, alpha) {
  const rows = [[2,3,5,6],[1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,7],[1,2,3,4,5,6],[2,3,4,5],[3,4]];
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
  rows.forEach((cols, yy) => cols.forEach(xx => ctx.fillRect(x + xx * px, y + yy * px, px, px)));
  ctx.restore();
}
function drawHearts() {
  syncDragonVitality(false);
  const x = 8, y = hudTopInset(), step = 18;
  const w = Math.min(156, VW - 16), h = hasDragon() ? 54 : 28;
  const heartX = x + 35, portrait = 23;
  ctx.save(); ctx.globalAlpha = .68; ctx.fillStyle = "#0b0e15"; ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1; ctx.strokeStyle = saintT > 0 ? "#f0bd63" : "#65758c"; ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
  const drawRow = (hp, max, sp, img, ry, colour, focus) => {
    drawPartyPortrait(sp, img, x + 5, ry + 2, portrait, colour, focus);
    const slots = 6, on = Math.max(0, Math.min(slots, (max ? hp / max : 0) * slots));
    for (let i = 0; i < slots; i++) {
      const hx=heartX+i*step,hy=ry+8,fill=Math.max(0,Math.min(1,on-i));
      drawHudHeart(hx,hy,2,colour,.25);
      if(fill>0){ctx.save();ctx.beginPath();ctx.rect(hx,hy,16*fill,14);ctx.clip();
        drawHudHeart(hx,hy,2,colour,1);ctx.restore();}
    }
  };
  drawRow(pHp, pMax, SPR[corinKit() + "idle_d"], atlasImg, y + 1, "#4d83c9", "corin");
  if (hasDragon()) {
    const face = SPR.dr5_pose_south || SPR.dr5_idle_s;
    drawRow(dragon.hp, dragon.maxHp, face, face ? sheetOf(face) : dragonImg,
      y + 27, dragon.down ? "#a84a4e" : "#d44742", "dragon");
  }
  if (saintT > 0) {
    const pulse = .50 + .50 * (Math.sin((16 - saintT) * 8) + 1) / 2;
    ctx.globalAlpha = pulse; ctx.strokeStyle = "#ffe39a"; ctx.lineWidth = 2;
    ctx.strokeRect(heartX - 3, y + 8, step * 6 - 1, 14);
  }
  ctx.restore();
}
let foesHeld = false;
function stepCombat(dt) {
  stepTempleGates(dt);
  stepFly(dt); // Cosmetic pickups keep moving even with foes disabled.
  if (pInv > 0) pInv -= dt;
  stepKingShield(dt);
  if (bossScene) { stepRise(dt); stepBossScene(dt); return; }
  if (foesHeld) return;
  swingHits();
  stepFoes(dt);
  stepSpell(dt);
  stepHeal(dt);
  stepRise(dt);
  stepDust(dt);
  stepGraves(dt);
  stepFall(dt);
  stepGrief(dt);
  stepLichTransition(dt);
  lastFightHold();
  stepBlooms(dt);
  stepLoot(dt);
  stepBell(dt);
  stepArenas(dt);
  if (saintT > 0) { saintT -= dt; if (saintT <= 0) toast("the breath goes out of him"); }
  markSafe();
}

const ACT = {
  swing: { frames: 8, fps: 16, anim: "atk" },
  hurt:  { frames: 5, fps: 14, anim: "hurt" },
  fall:  { frames: 7, fps: 6, anim: "die" },
  die:   { frames: 7, fps: 9, anim: "die", hold: true, then: showDeath },
};
function startAct(kind) {
  if (P.act || fadeDir !== 0) return;
  if (kind === "swing" && worn.brand) {
    brandCount++;
    brandHot = (brandCount % 3 === 0);
  } else if (kind === "swing") brandHot = false;
  P.act = { kind, t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4(), hot: brandHot };
}
function stepAct(dt) {
  const a = P.act;
  if (!a) return;
  const spec = ACT[a.kind];
  a.t += dt * spec.fps;
  if (a.t >= spec.frames) {
    if (spec.hold) {
      a.t = spec.frames - 0.01;
      if (spec.then && !a.done) { a.done = 1; spec.then(); }
    } else P.act = null;
  }
}

const FACE_OF = {};
const FACE_CELL = 80, FACE_COLS = 8, FACE_ROWS = 5, FACE_SHOW = 124;
const NO_FACE = new Set(["Bolete", "Cap", "Chanter", "Fungo", "Gill", "Morel", "Mott", "Mycella", "Nib", "Pip", "Russ", "Spore", "Truffle", "Velva"]);
const FACE_COUNT = 0;  /* portraits 0..88 are drawn; 89..95 are empty slots */
function faceFor(who) {
  if (!who) return -1;
  if (NO_FACE.has(who)) return -1;      /* the mushroom folk have no portrait */
  if (FACE_OF[who] !== undefined) return FACE_OF[who];
  for (const k in FACE_OF) if (who.includes(k) || k.includes(who)) return FACE_OF[k];
  return -1;
}
const sayEl = document.getElementById("say");
const faceEl = document.getElementById("face");
const nameEl = document.getElementById("sayname");
faceEl.style.backgroundImage = 'url("' + FACE_SRC + '")';
let shownFace = -1;
function sayOn() { sayEl.classList.add("on"); sayEl.style.display = ""; }
function sayOff() {
  sayEl.classList.remove("on"); sayEl.style.display = "";
  nameEl.className = "";
}
function showFace(who) {
  const i = faceFor(who);
  shownFace = i;
  const el = document.getElementById("face") || faceEl;
  if (i < 0) { el.style.display = "none"; return; }
  if (!el.style.backgroundImage || el.style.backgroundImage === "none")
    el.style.backgroundImage = 'url("' + FACE_SRC + '")';
  const faceSide = /Corin/.test(who) ? "right" : "left";
  const k = FACE_SHOW / FACE_CELL;   /* drawn bigger than it is stored */
  el.style.backgroundPosition =
    `-${(i % FACE_COLS) * FACE_CELL * k}px -${Math.floor(i / FACE_COLS) * FACE_CELL * k}px`;
  el.style.backgroundSize = (FACE_COLS * FACE_SHOW) + "px "
                          + (FACE_ROWS * FACE_SHOW) + "px";
  el.className = faceSide;
  el.style.display = "block";
}
let sayNpc = null, sayLine = 0;
function whoSays(npc, line) {
  const colon = line.indexOf(": ");
  if (colon > 0 && colon < 22) return [line.slice(0, colon), line.slice(colon + 2)];
  return [npc.n, line];
}

let ride = null;
function ferryOf() { return MD.ferry || null; }
function ferryBoatObj() {
  const f = ferryOf(); if (!f) return null;
  const nm = NAME2I[f.boat];
  let best = null, bd = 9e9;
  for (const o of objs) {
    if (o.s !== nm) continue;
    for (const p of [f.a, f.b]) {
      const d = Math.abs(o.x / TS - p[0]) + Math.abs(o.y / TS - p[1]);
      if (d < bd && d < 8) { bd = d; best = o; }
    }
  }
  return best;
}
const FERRY_HOP = 0.45;
function ferryTry() {
  const f = ferryOf(); if (!f || ride) return false;
  const px = P.x / TS, py = (P.y - 1) / TS;
  const onPlank = terr[Math.floor(py) * MW + Math.floor(px)] === DECK;
  const near = (p) => Math.abs(px - p[0]) <= (onPlank ? 9 : 2.5) &&
                      Math.abs(py - p[1]) <= (onPlank ? 9 : 2.5);
  let from = null;
  if (near(f.land_a)) from = "a"; else if (near(f.land_b)) from = "b";
  if (!from) return false;
  const pts = f.pts.map(p => [p[0] * TS + TS / 2, p[1] * TS + TS]);
  const route = from === "a" ? pts : pts.slice().reverse();
  const d0 = Math.atan2(route[1][1] - route[0][1], route[1][0] - route[0][0]) + Math.PI / 2;
  ride = { pts: route, i: 0, t: 0,
           to: from === "a" ? f.land_b : f.land_a, flip: false,
           ang: 0, ang0: 0, angT: d0, turn: 0, turnFor: 0,
           board: FERRY_HOP, land: 0, from: [P.x, P.y] };
  let d = d0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  ride.angT = d;
  ride.turnFor = Math.min(1.6, Math.abs(d) / Math.PI * 1.6);   /* a half turn takes 1.6s */
  ride.turn = ride.turnFor;
  const b = ferryBoatObj();
  if (b) { hidden.add(b.id); rebuildBuckets(); }   /* buckets filter hidden AT BUILD */
  toast("you push off");
  return true;
}
const FERRY_SEAT = 14;
function ferrySeatAt(a) {
  const s = SPR[ferryOf().boat];
  return (a[1] - s[3] / 2) + FERRY_SEAT;
}
function ferrySeat() {
  const s = SPR[ferryOf().boat];
  return (ride.y - s[3] / 2) + FERRY_SEAT;
}
function stepFerry(dt) {
  if (!ride) return;
  P.moving = false;
  P.flip = false;
  P.dir = (ride.pts[ride.pts.length - 1][1] < ride.pts[0][1]) ? "u" : "d";
  if (ride.turn > 0) {                    /* she comes about first, while you watch */
    ride.turn -= dt;
    const k = ride.turnFor ? 1 - Math.max(0, ride.turn) / ride.turnFor : 1;
    const e = k * k * (3 - 2 * k);        /* ease, so she swings rather than snaps */
    ride.ang = ride.ang0 + (ride.angT - ride.ang0) * e;
    const a0 = ride.pts[0];
    ride.x = a0[0]; ride.y = a0[1];
    P.x = ride.from[0]; P.y = ride.from[1];   /* you are still on the boards */
    return;
  }
  if (ride.board > 0) {                   /* stepping down into the boat */
    ride.board -= dt;
    const k = 1 - Math.max(0, ride.board) / FERRY_HOP;
    const a = ride.pts[0];
    P.x = ride.from[0] + (a[0] - ride.from[0]) * k;
    P.y = ride.from[1] + (ferrySeatAt(a) - ride.from[1]) * k - Math.sin(k * Math.PI) * 7;
    ride.x = a[0]; ride.y = a[1];
    return;
  }
  if (ride.land > 0) {                    /* and back out at the far end */
    ride.land -= dt;
    const k = 1 - Math.max(0, ride.land) / FERRY_HOP;
    const a = ride.pts[ride.pts.length - 1];
    const tx = ride.to[0] * TS + TS / 2, ty = ride.to[1] * TS + TS;
    P.x = a[0] + (tx - a[0]) * k;
    P.y = ferrySeatAt(a) + (ty - ferrySeatAt(a)) * k - Math.sin(k * Math.PI) * 7;
    if (ride.land <= 0) { P.x = tx; P.y = ty; ride = null; toast("you step ashore"); }
    return;
  }
  const SPEED = 80;                       /* pixels a second -- an unhurried drift */
  let move = SPEED * dt;
  while (move > 0 && ride.i < ride.pts.length - 1) {
    const a = ride.pts[ride.i], b = ride.pts[ride.i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const rem = len * (1 - ride.t);
    if (move < rem) { ride.t += move / len; move = 0; }
    else { move -= rem; ride.i++; ride.t = 0; }
    ride.ang = Math.atan2(dy, dx) + Math.PI / 2;
  }
  const a = ride.pts[Math.min(ride.i, ride.pts.length - 1)];
  const b = ride.pts[Math.min(ride.i + 1, ride.pts.length - 1)];
  ride.x = a[0] + (b[0] - a[0]) * ride.t;
  ride.y = a[1] + (b[1] - a[1]) * ride.t;
  P.x = ride.x; P.y = ferrySeat();
  if (ride.i >= ride.pts.length - 1) {
    ride.land = FERRY_HOP;                /* hop out rather than cut */
    const bo = ferryBoatObj();
    if (bo) {
      bo.x = ride.pts[ride.pts.length - 1][0];
      bo.y = ride.pts[ride.pts.length - 1][1];
      hidden.delete(bo.id);
      rebuildBuckets();
    }
  }
}
function drawFerry(g) {
  if (!ride) return;
  const f = ferryOf(); const s = SPR[f.boat]; if (!s) return;
  const fr = Math.floor(performance.now() / 140) % s[4];
  g.save();
  g.translate(ride.x, ride.y - s[3] / 2);
  g.rotate(ride.ang);
  drawGameImage(g, atlasImg, s[0] + fr * s[2], s[1], s[2], s[3],
              -s[2] / 2, -s[3] / 2, s[2], s[3]);
  g.restore();
}
function npcContextDialogue(n, alt) {
  if(brambleQuest===1 && n.n!=="Rowan the Hunter" && !n.pettable &&
     (MAPID==="tavern" || (MD.title||"").startsWith("Thornwell") ||
      (MAPID==="world"&&n.x>=220*TS&&n.x<=320*TS&&n.y>=44*TS&&n.y<=150*TS)))
    return BRAMBLE_HINTS[n.n] || n.d;

  // Victory must outrank merchant repeats and every old fear-of-Halvard line.
  if (wonAll) return (alt && n.dv2) || n.dv || n.d;
  if (hasDragon()) {
    const visible = MAPID === "world" && dragonHere() && dragon.on &&
      (mounted || Math.hypot(n.x - dragon.x, n.y - dragon.y) < 160);
    if (visible) return (alt && n.dd2) || n.dd || n.dragonNear || n.d;
    return (alt && n.dragonRumor2) || n.dragonRumor || n.d;
  }
  if (alt && n.d2) return n.d2;
  return (hasSword() && n.dm) || n.d;
}

function finishSmithUpgrade() {
  const whetstone = () => {
    if (charm.edge) return;
    playScene(["Dunstan: You'll need this too."], { who: "Dunstan", after: () => {
      if (charm.edge) return;
      charm.edge = true;
      showReveal(SPR.it_edge ? "it_edge" : CHARM_ICON.edge,
        "Corin obtained Dunstan's Whetstone!", 5, true);
    } });
  };
  if (!smithUpgrade) {
    smithUpgrade = true;
    showReveal("corin_armor_idle_d", "Corin received an upgraded sword and armor!", 5, true, whetstone);
  } else whetstone();
}
let glassHatchStarted = -1;
function glassHatchFrame() { return glassHatchStarted < 0 ? 0 : Math.min(3, Math.floor((performance.now() / 1000 - glassHatchStarted) / 0.15)); }
function drawHettieCallout(n,sp) {
  const bob=Math.sin(tAcc*4)*1.5, x=Math.round(n.x-18),y=Math.round(n.y-sp[3]-21+bob);
  ctx.save();ctx.fillStyle="#493529";ctx.fillRect(x+2,y+2,36,17);
  ctx.fillStyle="#fff1d1";ctx.strokeStyle="#493529";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+4,y);ctx.lineTo(x+32,y);ctx.quadraticCurveTo(x+36,y,x+36,y+4);
  ctx.lineTo(x+36,y+12);ctx.quadraticCurveTo(x+36,y+16,x+32,y+16);
  ctx.lineTo(n.x+4,y+16);ctx.lineTo(n.x,y+21);ctx.lineTo(n.x-3,y+16);
  ctx.lineTo(x+4,y+16);ctx.quadraticCurveTo(x,y+16,x,y+12);ctx.lineTo(x,y+4);ctx.quadraticCurveTo(x,y,x+4,y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle="#34251b";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("hey!",n.x,y+8);
  if(Math.sin(tAcc*3)>0.55){ctx.strokeStyle="#f4ce76";ctx.beginPath();ctx.moveTo(x-5,y+2);ctx.lineTo(x-8,y);ctx.moveTo(x+41,y+2);ctx.lineTo(x+44,y);ctx.stroke();}
  ctx.restore();
}

let thornwellMet=false, thornwellArrival=null, thornwellReturn=null;
let brambleQuest=0, brambleMap="", brambleTrail=[], brambleDeparture=null;
function welcomePath() {
  // Local, collision-checked staging along an approach into town.
  const start=[Math.round(P.x/8)*8+24,Math.round(P.y/8)*8];
  if(!canStand(...start))return null;
  const stagingDistance=Math.max(80,Math.min(200,VW/cam.z/2+30));
  const q=[{p:start,path:[start]}],seen=new Set([start.join(',')]);let best=null;
  for(let i=0;i<q.length&&i<3000;i++){
    const cur=q[i],dist=Math.hypot(cur.p[0]-P.x,cur.p[1]-P.y);
    if(dist>=stagingDistance&&cur.path.length>=8){best=cur.path;break;}
    for(const [dx,dy] of [[8,0],[0,8],[0,-8],[-8,0]]){
      const p=[cur.p[0]+dx,cur.p[1]+dy],k=p.join(',');
      if(seen.has(k)||Math.hypot(p[0]-P.x,p[1]-P.y)>stagingDistance+48||!canStand(...p))continue;
      seen.add(k);q.push({p,path:cur.path.concat([p])});
    }
  }
  return best&&best.reverse();
}
function brambleActor(name) {
  const src=W.maps.world.npcs.find(n=>n.n===name);
  return {...src,id:"bramble-"+name,t:0,brambleCompanion:true,goto:null};
}
function syncBrambleParty() {
  if(brambleMap===MAPID)return;
  if(brambleQuest===2){brambleQuest=3;brambleDeparture=null;}
  brambleMap=MAPID;brambleTrail=[];
  npcs=npcs.filter(n=>n.n!=="Rowan the Hunter" && !n.pettable);
  if(brambleQuest===0||brambleQuest===3){
    if(MAPID==="world"){
      const dog=brambleActor("Bramble");npcs.push(dog);
      if(brambleQuest===3)npcs.push(brambleActor("Rowan the Hunter"));
    }
  }else if(brambleQuest===1){
    const dog=brambleActor("Bramble");dog.x=P.x;dog.y=P.y;npcs.push(dog);
  }
  if(MAPID==="tavern"&&brambleQuest<2){const hunter=brambleActor("Rowan the Hunter");hunter.x=240;hunter.y=220;npcs.push(hunter);}
}
function bramblePath(from,to) {
  const snap=p=>p.map(v=>Math.round(v/8)*8),a=snap(from),b=snap(to),q=[a],seen=new Map([[a.join(','),null]]);
  let end=null;
  for(let i=0;i<q.length&&i<12000;i++){
    const p=q[i];if(Math.hypot(p[0]-b[0],p[1]-b[1])<9){end=p;break;}
    for(const [dx,dy]of [[8,0],[0,8],[-8,0],[0,-8]]){
      const v=[p[0]+dx,p[1]+dy],key=v.join(',');
      if(seen.has(key)||Math.hypot(v[0]-a[0],v[1]-a[1])>480||!canStand(...v))continue;
      seen.set(key,p);q.push(v);
    }
  }
  if(!end)return null;const path=[];for(let p=end;p;p=seen.get(p.join(',')))path.push(p);return path.reverse();
}
function moveBrambleActor(n,path,speed,dt) {
  if(!path?.length)return;
  const [x,y]=path[0],d=Math.hypot(x-n.x,y-n.y),step=Math.min(d,speed*dt);faceToward(n,x,y);
  if(d){n.x+=(x-n.x)/d*step;n.y+=(y-n.y)/d*step;}if(d<=step+.01)path.shift();
}
function tryBrambleReunion(n) {
  if(n.n!=="Rowan the Hunter"||MAPID!=="tavern"||brambleQuest!==1)return false;
  const dog=npcs.find(n=>n.pettable);
  playScene(["Rowan: Bramble! There you are. Thank you for bringing him back.","Corin: He found me on the road. Friendly little fellow.","Rowan: I am Rowan. I hear you have a dragon travelling with you.",
    smithUpgrade?"Rowan: I see Dunstan has already worked on your blade. You chose well.":"Rowan: Take that sword to Dunstan, the blacksmith in Forgewick. He will give you a stronger blade for the road ahead.",
    "Rowan: We should head home. Come find us outside the house any time—Bramble's company is good for the spirits."],{bramble:true,after:()=>{
      brambleQuest=2;
      const exit=MD.doors.find(d=>d.to==="world"),target=[exit.x*TS+8,exit.y*TS-8];
      brambleDeparture=[n,dog].filter(Boolean).map((actor,i)=>({actor,path:bramblePath([actor.x,actor.y],[target[0]+i*8,target[1]])}));
      brambleTrail=[];
    }});return true;
}
function stepThornwellWelcome(dt) {
  syncBrambleParty();
  if(brambleDeparture){
    for(const v of brambleDeparture){if(v.path)moveBrambleActor(v.actor,v.path,54,dt);else if(v.actor.x<cam.x-32||v.actor.x>cam.x+VW/cam.z+32||v.actor.y<cam.y-32||v.actor.y>cam.y+VH/cam.z+32)v.path=[];}
    if(brambleDeparture.every(v=>v.path&&v.path.length===0)){npcs=npcs.filter(n=>!n.brambleCompanion);brambleDeparture=null;brambleQuest=3;}return;
  }
  if(thornwellArrival){
    const a=thornwellArrival;moveBrambleActor(a.dog,a.path,100,dt);
    if(!a.path.length){thornwellArrival=null;petCompanion(a.dog);faceCorinAt(a.dog.x,a.dog.y);}
    return;
  }
  if(brambleQuest===1){
    const dog=npcs.find(n=>n.pettable);if(!dog||sceneHold()||sayNpc||mounted||ride||doorMotion)return;
    const last=brambleTrail.at(-1);
    if(last&&Math.hypot(P.x-last[0],P.y-last[1])>40){
      const route=bramblePath([dog.x,dog.y],[P.x,P.y]);
      if(route)brambleTrail=route;
      else if(Math.hypot(dog.x-P.x,dog.y-P.y)>200&&(dog.x<cam.x-32||dog.x>cam.x+VW/cam.z+32||dog.y<cam.y-32||dog.y>cam.y+VH/cam.z+32)){dog.x=P.x;dog.y=P.y;brambleTrail=[];}
      else return;
    }else if(!last||Math.hypot(P.x-last[0],P.y-last[1])>=5)brambleTrail.push([P.x,P.y]);
    if(brambleTrail.length>600)brambleTrail.splice(0,brambleTrail.length-600);
    if(Math.hypot(dog.x-P.x,dog.y-P.y)>22&&brambleTrail.length) {
      if(canStand(...brambleTrail[0]))moveBrambleActor(dog,brambleTrail,85,dt);
      else brambleTrail.shift();
    }else if(brambleTrail.length>1)brambleTrail=brambleTrail.slice(-1);
    return;
  }
  if(brambleQuest!==0||MAPID!=="world"||mode!=="play"||editing||sceneHold()||sayNpc||doorMotion||ride||mounted)return;
  if(P.x<220*TS||P.x>320*TS||P.y<44*TS||P.y>150*TS)return;
  const dog=npcs.find(n=>n.pettable),path=welcomePath();if(!dog||!path)return;
  if(Math.hypot(dog.x-P.x,dog.y-P.y)<150){
    const nearby=bramblePath([dog.x,dog.y],[P.x+24,P.y]);if(!nearby)return;thornwellArrival={dog,path:nearby};
  }else{[dog.x,dog.y]=path[0];thornwellArrival={dog,path:path.slice(1)};}
  brambleQuest=1;thornwellMet=true;
  playScene(["Corin: Oh! Hello there. Come here, boy.","Corin scratches the dog's ears. His tail wags furiously.","Corin: You have a collar. We'd better find your owner.","The dog falls into step behind Corin."],{bramble:true,hold:()=>!thornwellArrival,after:()=>{brambleTrail=[];}});
}
function skipBrambleForTest(){
  if(scene?.bramble){scene=null;walker=null;sayOff();showFace(null);}
  if(sayNpc&&(sayNpc.pettable||sayNpc.n==='Rowan the Hunter')){sayNpc=null;sayOff();showFace(null);}
  thornwellMet=true;brambleQuest=3;thornwellArrival=null;thornwellReturn=null;
  brambleDeparture=null;brambleTrail=[];brambleMap='';syncBrambleParty();
  P.moving=false;
}
function petCompanion(n) {
  if (!n || !n.pettable || mounted || Math.hypot(n.x-P.x,n.y-P.y)>32) return false;
  const now=tAcc;
  if ((n.pettedUntil || 0)>now) return true;
  faceToward(n,P.x,P.y);
  n.pettedUntil=now+1.6;
  pHp=pMax; showHeal("potion");
  toast("You scratch Bramble behind the ears. Full health restored!");
  return true;
}
function drawPetHeart(n,t,sp) {
  if (!(n.pettedUntil>t)) return;
  const elapsed=1.6-(n.pettedUntil-t),x=Math.round(n.x-3),y=Math.round(n.y-sp[3]-8-elapsed*4);
  ctx.save();ctx.fillStyle="#f17a90";
  for(const [dy,row] of ["0110110","1111111","1111111","0111110","0011100","0001000"].entries())
    for(let dx=0;dx<row.length;dx++)if(row[dx]==="1")ctx.fillRect(x+dx,y+dy,1,1);
  ctx.restore();
}
let fishingPole=false, fishing=null;
const FISH_TAU=Math.PI*2;
function waterInReach(){
  if(!terr||!MW||!MH)return false;
  const dir=playerFacing4(),v={e:[1,0],w:[-1,0],n:[0,-1],s:[0,1]}[dir]||[0,1];
  // Sample a short fan in front of Corin, including the edge of a dock.
  for(const d of [8,16,24])for(const side of [-5,0,5]){
    const x=Math.floor((P.x+v[0]*d-v[1]*side)/TS),y=Math.floor((P.y+v[1]*d+v[0]*side)/TS);
    if(x<0||y<0||x>=MW||y>=MH)continue;
    if([WATER,DWATER,SEA,POOL_T].includes(terr[y*MW+x]))return true;
  }
  return false;
}
function fishingSafe(){
  return mode==='play'&&!sceneHold()&&!doorMotion&&!fadeDir&&!ride&&!mounted&&!arenaLock&&!trial&&!deadShown&&!P.act&&
    !foes.some(f=>f.hp>0&&Math.hypot(f.x-P.x,f.y-P.y)<180);
}
function endFishing(){
  fishing=null;running=false;P.moving=false;
  clearPadInputs();padDx=padDy=0;
  for(const k in keys)keys[k]=0;
}
function tryFishing(){
  if(!fishingPole||!waterInReach())return false;
  if(!fishingSafe()){toast('Find a quiet moment on the bank before fishing.');return true;}
  endFishing();
  fishing={phase:'prompt'};
  ask={quick:1,opts:[{n:'Do you want to fish?',head:true},{n:'YES',go:startFishing},{n:'NO',go:endFishing}]};
  askPick=1;askDraw();return true;
}
function fishingRegion(){
  let x=P.x/TS;
  if(MAPID!=='world'){
    // Follow interior exits back to their overworld region.
    let id=MAPID;const seen=new Set();
    while(id!=='world'&&!seen.has(id)){
      seen.add(id);const doors=W.maps[id]?.doors||[];
      const d=doors.find(d=>d.to==='world')||doors.find(d=>!seen.has(d.to));
      if(!d)break;x=d.tx;id=d.to;
    }
  }
  const tier=[700,1300,1900,2500,3100].filter(edge=>x>=edge).length;
  return {tier:tier+1,reward:tier+1,speed:2.4+tier*.36,halfWidth:.40-tier*.035};
}
function startFishing(){
  if(!fishingPole||!waterInReach()||!fishingSafe()){endFishing();return;}
  endFishing();
  fishing={phase:'spin',angle:-Math.PI/2,target:Math.random()*FISH_TAU,...fishingRegion(),
    elapsed:0,resultAge:0,caught:false};
}
function stepFishing(dt){
  if(!fishing)return;
  if(fishing.phase==='spin'){
    fishing.elapsed+=dt;fishing.angle=(fishing.angle+dt*fishing.speed)%FISH_TAU;
  }else if(fishing.phase==='result')fishing.resultAge+=dt;
}
function fishingAction(){
  const f=fishing;if(!f)return;
  if(f.phase==='spin'){
    if(f.elapsed<0.3)return; // Ignore the cast's trailing touch/mouse event.
    const gap=Math.abs(Math.atan2(Math.sin(f.angle-f.target),Math.cos(f.angle-f.target)));
    f.caught=gap<=f.halfWidth;f.phase='result';f.resultAge=0;
    if(f.caught)dragonFish+=f.reward;
  }else if(f.phase==='result'&&f.resultAge>=0.45)startFishing();
}
function drawFishing(){
  const f=fishing;if(!f||f.phase==='prompt')return;
  const w=Math.min(VW-24,340),h=Math.min(VH-24,340),x=(VW-w)/2,y=Math.max(12,(VH-h)/2-20);
  const cx=x+w/2,cy=y+h*0.48,r=Math.min(w*0.26,h*0.25);
  ctx.save();ctx.fillStyle='rgba(8,19,24,.66)';ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='#102f36';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#d6bf82';ctx.lineWidth=2;ctx.strokeRect(x+1,y+1,w-2,h-2);
  ctx.textAlign='center';ctx.fillStyle='#f5e7c5';ctx.font='bold 19px Georgia';ctx.fillText('CAST A LINE',cx,y+30);
  ctx.font='12px sans-serif';ctx.fillStyle='#c4ddd6';ctx.fillText('Stop the marker inside the green arc',cx,y+52);
  ctx.lineWidth=14;ctx.strokeStyle='#36555c';ctx.beginPath();ctx.arc(cx,cy,r,0,FISH_TAU);ctx.stroke();
  ctx.strokeStyle='#8dde91';ctx.beginPath();ctx.arc(cx,cy,r,f.target-f.halfWidth,f.target+f.halfWidth);ctx.stroke();
  // Gold end marks make the target readable without relying on color alone.
  ctx.strokeStyle='#fff2ad';ctx.lineWidth=2;
  for(const a of [f.target-f.halfWidth,f.target+f.halfWidth]){ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*(r-11),cy+Math.sin(a)*(r-11));ctx.lineTo(cx+Math.cos(a)*(r+11),cy+Math.sin(a)*(r+11));ctx.stroke();}
  const ax=Math.cos(f.angle),ay=Math.sin(f.angle);
  ctx.strokeStyle='#fff6dc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+ax*r,cy+ay*r);ctx.stroke();
  ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.arc(cx+ax*r,cy+ay*r,6,0,FISH_TAU);ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,5,0,FISH_TAU);ctx.fill();
  ctx.font='bold 16px sans-serif';ctx.fillStyle=f.phase==='result'&&f.caught?'#a2edac':'#fff0cb';
  ctx.fillText(f.phase==='spin'?'A  ·  REEL IN':f.caught?'FISH CAUGHT!  +'+f.reward:'It slipped away!',cx,y+h-66);
  ctx.font='12px sans-serif';ctx.fillStyle='#c4ddd6';
  ctx.fillText(f.phase==='result'?(f.caught?'Each fish restores '+DRAGON_FISH_HEAL+' dragon HP.':'Try stopping the marker between the gold marks.'):'Difficulty '+f.tier+'  ·  Catch '+f.reward+' fish',cx,y+h-44);
  ctx.fillText(f.phase==='result'?'A / Space: cast again  ·  B / Esc: leave':'B / Esc: cancel  ·  Space also reels in',cx,y+h-23);
  ctx.restore();
}
function interact() {
  if(fishing){if(fishing.phase==='prompt')askTake();else fishingAction();return;}
  if (MAPID === "glasshouse" && !sayNpc && Math.abs(P.x - 68) < 29 && Math.abs(P.y - 116) < 28) {
    if (glassHatchStarted < 0) glassHatchStarted = performance.now() / 1000;
    return;
  }
  if (doorMotion) return;
  if (P.act && P.act.kind === "fall") return;
  if (sceneHold()) { advanceScene(); return; }
  if (ride) return;                    /* already aboard */
  if (!sayNpc && dragon.down && dragonHere() &&
      Math.hypot(P.x - dragon.x, P.y - dragon.y) < 42) {
    if (boarMeat > 0) feedDragon("meat");
    else if (dragonFish > 0) feedDragon("fish");
    else toast("the dragon needs boar meat or fish");
    return;
  }
  if (!sayNpc && trialDemonHere() && !trial && Math.hypot(P.x - (MAPID==="witchmoor"?196:THRONE_DEMON.x), P.y - (MAPID==="witchmoor"?304:THRONE_DEMON.y)) < 48) {
    talkTrialDemon(); return;
  }
  if (!sayNpc && interactTrialPedestal()) return;
  if (ferryTry()) return;
  if (tryTreasuryChest()) return;
  if (tryTempleLever()) return;
  if (tryCellarSupplies()) return;
  if (tryChest()) return;              /* the temple chest, if he is at one */
  {
    const it = itemAt(P.x, P.y);
    if (it) { takeItem(it); return; }
  }
  {
    const said = questTalk();
    if (said) return;
  }
  if (sayNpc) {
    if (!typeDone()) { typeAll(); return; }   /* finish the line first */
    sayLine++;
    if (sayLine >= (sayNpc.said || sayNpc.d).length) {
      if (sayNpc.wasFacing) { sayNpc.f = sayNpc.wasFacing; sayNpc.wasFacing = null; }
      if (MAPID === "cinderhold" && /Halvard/.test(sayNpc.n || "")) {
        const gone = sayNpc;
        sayNpc = null; sayOff(); showFace(null);
        startLastFight();
        return;
      }
      const giver = sayNpc;
      sayNpc = null; sayOff(); showFace(null);
      if(giver.n==='Liora'&&!fishingPole){
        fishingPole=true;
        showReveal('fishing_rod','Corin obtained a Fishing Pole! Face water and press A to fish.');
        return;
      }
      if(giver.n==='Sela'&&!glassShield){
        glassShield=true; saveGame();
        showReveal(SPR.it_ward ? 'it_ward' : 'sh_glow','Corin obtained the Glass Shield! Hold B during battle to raise its force field.');
        return;
      }
      if (giver.n === "Dunstan" && hasSword() && (!smithUpgrade || !charm.edge)) {
        finishSmithUpgrade(); return;
      }
      if (giver.n !== "Dunstan" && giver.charm && !charm[giver.charm]) {
        const k = giver.charm;
        charm[k] = true;
        const art = (SPR[CHARM_ART[k]] && CHARM_ART[k]) || CHARM_ICON[k];
        showReveal(art, CHARM_NOTE[k]);
      }
      if (giver.gift && !breathHas[giver.gift]) {
        unlockDragonBreath(giver.gift);
        const giftName = giver.gift[0].toUpperCase() + giver.gift.slice(1);
        const giftIcon = HS_ICON[giver.gift];
        showReveal(SPR[giftIcon] ? giftIcon : "chest",
                   "Corin obtained a Heartstone! The " + giftName + " breath is unlocked.", 3);
      }
    }
    else {
      const [wn, tn] = whoSays(sayNpc, (sayNpc.said || sayNpc.d)[sayLine]);
      typeStart(wn, tn);
      showFace(wn);
      typePaint();
    }
    return;
  }
  let best = null, bd = 32; // Reach across NPC footing and a final movement step.
  for (const n of npcs) {
    if (!npcHere(n)) continue;
    if (n.noTalk) continue;
    if (lastFight && MAPID === "cinderhold" && /Halvard/.test(n.n || "")) continue;
    const d = npcTalkDistance(n);
    if (d < bd) { bd = d; best = n; }
  }
  if (best && tryBrambleReunion(best)) return;
  if (best && petCompanion(best)) return;
  if (best && best.pettable) return;
  if (best && /Ald[e]?ric/.test(best.n || "")) heartKnown = true;
  if (best) {
    const giftPending=(best.charm && !charm[best.charm]) || (best.gift && !breathHas[best.gift]);
    if(best.sells && !giftPending) merchantAsk(best);
    else beginNpcTalk(best);
    return;
  }
  if (tryFishing()) return;
  if (typeof mounted !== "undefined" && mounted && dragonHere()) {
    clawNow();
    return;
  }
  if (hasSword()) startAct("swing");
}
function beginNpcTalk(best) {
    if (MAPID === "cinderhold" && /Halvard/.test(best.n || "") && !wonAll && window.EmberKingMusic) window.EmberKingMusic.start();
    sayNpc = best; sayLine = 0;
    if (!best.wasFacing) best.wasFacing = best.f;
    if (best.patrol && best.goto) { best.goto = null; best.arrived = true; }
    faceToward(best, P.x, P.y);
    best.spoke = (best.spoke || 0) + 1;
    const alt = best.spoke % 2 === 0;
    if(best.n==='Liora'&&!fishingPole){
      sayNpc.said=["The trout gather beneath Forgefalls, where the current brings their supper.",
        "Here, Corin. My spare fishing pole deserves more adventures than my bag.",
        "Face any water and press A. Stop the spinning marker inside the green arc to catch a fish. Your dragon can eat the catch to recover."];
    }
    else if (best.n === "Sela" && !glassShield) {
      sayNpc.said = ["Sela: Corin, wait. I made something from the clearest furnace glass I have.",
        "Sela: It is not meant to stop a blade by being harder than steel. The glass catches the force and throws it back.",
        "Sela: Take the Glass Shield. Hold B when something attacks you and the field will turn the blow away."];
    }
    else if (best.n === "Maelis" && !charm.ward) {
      sayNpc.said = ["You have a talent for finding things that bite, Corin.",
        "Take my ward. Wear it, and a little of their spite will fall short.",
        "That is a gift. If you want to buy a curse, ask me another time."];
    }
    else if (best.n === "Dunstan" && hasSword() && !smithUpgrade) {
      sayNpc.said = [...(wonAll ? (best.dv || []) : []), "Maddock's blade has served you well. Let me fit you with something stronger.",
        "There. A stronger edge, and armor to match."];
    }
    else sayNpc.said = npcContextDialogue(best, alt);
    const [w0, t0] = whoSays(best, sayNpc.said[0]);
    typeStart(w0, t0);
    showFace(w0);
    typePaint();
    showFace(best.n);
    sayEl.classList.remove("narr");     /* a villager is always a person */
    sayOn();
}
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
{
  const el = document.getElementById("buildstamp");
  if (el) el.textContent = "  build 19:10:42";
}
padBind();
{
  const fb = document.getElementById("bFine");
  if (fb) fb.addEventListener("click", () => {
    finePlace = !finePlace;
    fb.classList.toggle("on", finePlace);
  });
}
function actionButton() {
  if(atlasOpen)return;
  if(fishing&&fishing.phase!=='prompt'){fishingAction();return;}
  if (typeof BOOT !== "undefined" && BOOT.waiting) { BOOT.close(); return; }
  if (deadShown) { getUp(); return; }
  if (typeof ovl !== "undefined" && ovl) { ovlTake(); return; }   /* A takes the entry */
  /* Any open menu takes A, not just the quick one. A shop list is built as
     a plain ask, so A used to fall through to interact() and start the
     merchant talking again instead of buying. */
  if (typeof ask !== "undefined" && ask) { askTake(); return; }
  if (typeof bagOpen !== "undefined" && bagOpen) { bagUse(); return; }
  if (grabGold()) return;      /* gold underfoot comes first */
  interact();
}
bindHold("act", actionButton, null);
bindHold("btnB", () => {
  if(fishing){askShut();endFishing();return;}
  if(atlasOpen){closeAtlas();return;}
  if (typeof ask !== "undefined" && ask) { askBack(); return; }
  if (typeof bagOpen !== "undefined" && bagOpen) { setBag(false); return; }
  if (typeof ovl !== "undefined" && ovl) { setOvl(null); return; }
  running = true;
  if (glassShield && inFight()) { glassShieldHeld = true; glassShieldWindowUntil = tAcc + GLASS_BLOCK_WINDOW; glassShieldPulse = Math.max(glassShieldPulse,.18); tryGlassShieldParry(); }
}, () => { running = false; glassShieldHeld = false; });
{
  const fb = document.getElementById("btnFire");
  if (fb) setInterval(() => fb.classList.toggle("cooling", !canBreathe()), 120);
}

const deckEl = document.getElementById("deck");
const devTitle = document.getElementById("devtitle");
let devOpen = false;

function setDevTitle(t) { devTitle.textContent = t || "DEV TOOLS"; }

let switching = false;
function closeOthers(keep) {
  if (switching) return;
  switching = true;
  if (keep !== "build") setBuild(false);
  if (keep !== "paint") setPaint(false);
  if (keep !== "travel") setTravel(false);
  if (keep !== "edit" && editing) {
    editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  }
  switching = false;
}

let devUnlocked = false;
function setDev(on) {
  if (on) devUnlocked = true;
  devOpen = on;
  deckEl.classList.toggle("dev", on);
  { const db = document.getElementById("devbtn");
    if (db) db.classList.toggle("on", on); }
  if (!on) { setTravel(false); setDevTitle(null); }
  refreshToolbar();
}

function exitTools() {
  doorEdit=false;collideView=false;geometryEnd();document.getElementById("geometryBar").style.display="none";
  setBuild(false); setPaint(false); setTravel(false);
  editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  setDev(false);
}

function activeTool() {
  if (building) return arenaMode ? "ARENA" : areaMode ? "MOVE AREAS"
                : (buildTool === "route" ? "ROUTE" : KINDS[areaKind].toUpperCase());
  if (painting) return "PAINT";
  if (editing) return "MOVE THINGS";
  return null;
}

function refreshToolbar() {
  const bar = document.getElementById("toolbar");
  const what = activeTool();
  const show = !!what && !devOpen;
  bar.classList.toggle("on", show);
  if (!show) return;
  document.getElementById("tbWhat").textContent = what;
  const un = document.getElementById("tbUndo");
  const n = building ? buildUndo.length : painting ? undoStack.length : 0;
  un.style.display = (building || painting) ? "" : "none";
  un.textContent = n ? "UNDO " + n : "UNDO";
  un.classList.toggle("off", n === 0);
  const tog = document.getElementById("tbToggle");
  const drawable = building && !areaMode && !arenaMode;
  tog.style.display = drawable ? "" : "none";
  tog.textContent = drawArmed ? "DRAWING" : "PAN";
  tog.classList.toggle("on", drawArmed);
}
{ const db = document.getElementById("devbtn");
  if (db) tap(db, () => setDev(!devOpen)); }

function recentreOnCorin() {
  if (cameraOwnsView()) return;
  camFree = false;
  cam.z = playZoom();
  cam.x = P.x - VW / cam.z / 2;
  cam.y = P.y - VH / cam.z / 2;
  clampCam();
  toast("back to " + (areaUnder(P.x, P.y) || "the character"));
}
tap(document.getElementById("devclose"), () => setDev(false));
tap(document.getElementById("tbUndo"), () => {
  if (building) document.getElementById("tUndo").click();
  else if (painting) window.__emberUndoStroke();
  else toast("nothing to undo here");
});
tap(document.getElementById("tbTools"), () => setDev(true));
tap(document.getElementById("tbToggle"), () => setArmed(!drawArmed));
tap(document.getElementById("tbDone"), exitTools);

function soloTool(name) {
  for (const [id, on] of [["bEdit", editing],
                          ["bPaint", painting], ["bBuild", building]])
    document.getElementById(id).classList.toggle("on", !!on);
  setDevTitle(name);
}

const bEdit = document.getElementById("bEdit");
const editEl = document.getElementById("edit"), selEl = document.getElementById("sel");
function tap(el, fn) {
  el.addEventListener("click", fn);
  el.addEventListener("touchstart", e => { e.preventDefault(); e.stopPropagation(); fn(); }, { passive: false });
}
const paintEl = document.getElementById("paint");
const bPaint = document.getElementById("bPaint");
function setPaint(on) {
  if (on) closeOthers("paint");
  painting = on;
  bPaint.classList.toggle("on", on);
  paintEl.style.display = on ? "block" : "none";
  soloTool(on ? "PAINT GROUND" : null);
  refreshToolbar();
  if (on) refreshUndo();
  if (on) { editing = false; bEdit.classList.remove("on"); editEl.style.display = "none"; }
}
tap(bPaint, () => { if (!devOpen) setDev(true); setPaint(!painting); });

const travelEl = document.getElementById("travel");
const bTravel = document.getElementById("bTravel");
let travelling = false;
function setTravel(on) {
  if (on) closeOthers("travel");
  travelling = on;
  bTravel.classList.toggle("on", on);
  travelEl.style.display = on ? "block" : "none";
  if (on) {
    setPaint(false); setBuild(false);
    editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
    buildTravel();
    setDevTitle("FAST TRAVEL");
  }
}
tap(bTravel, () => { if (!devOpen) setDev(true); setTravel(!travelling); });

tap(document.getElementById("bReset"), () => {
  const n = countChanges();
  if (!n) { toast("nothing to reset"); return; }
  if (!resetArmed) {
    resetArmed = true;
    setTimeout(() => { resetArmed = false; }, 4000);
    toast("tap RESET again to discard " + n + " change" + (n === 1 ? "" : "s"));
    return;
  }
  resetArmed = false;
  setBuild(false); setPaint(false);
  editing = false; bEdit.classList.remove("on"); editEl.style.display = "none";
  loadMap(MAPID, true);
  P.x = MD.spawn[0]; P.y = MD.spawn[1];
  cam.z = playZoom(); camFree = false;
  toast("reset -- back to the world as built");
});

const buildEl = document.getElementById("build");
const bBuild = document.getElementById("bBuild");
function setBuild(on) {
  if (on) closeOthers("build");
  building = on;
  bBuild.classList.toggle("on", on);
  buildEl.style.display = on ? "block" : "none";
  soloTool(on ? "DRAW ROUTES & AREAS" : null);
  refreshToolbar();
  if (on) {
    setPaint(false); editing = false; bEdit.classList.remove("on");
    editEl.style.display = "none";
    setArmed(false);          /* always open in PAN, never armed */
    areaMode = false; pickedArea = null; areaDrag = null; arenaMode = false;
    grabMode = false; grabRect = null;
    const grew = ensureWorkspace();
    camFree = true;                 /* free the camera, but do not move it */
    clampCam();
    refreshBuild();
    toast(grew ? "room added -- PAN to position, then tap PAN to draw"
               : "PAN to position, then tap PAN to draw");
  }
  drawA = drawB = null;
}
tap(bBuild, () => { if (!devOpen) setDev(true); setBuild(!building); });
function setArmed(on) {
  drawArmed = on;
  if (on) setDev(false);          /* get the panel out of the way to draw */
  const el = document.getElementById("tMode");
  el.textContent = on ? "DRAWING" : "PAN";
  el.classList.toggle("on", on);
  drawA = drawB = null;
  refreshBuild();
  refreshToolbar();
}
tap(document.getElementById("tMode"), () => setArmed(!drawArmed));
tap(document.getElementById("tRoute"), () => {
  buildTool = "route";
  document.getElementById("tRoute").classList.add("on");
  document.getElementById("tTown").classList.remove("on");
  refreshBuild();
  refreshToolbar();
});
tap(document.getElementById("tTown"), () => {
  buildTool = "town";
  document.getElementById("tTown").classList.add("on");
  document.getElementById("tRoute").classList.remove("on");
  refreshBuild();
});
tap(document.getElementById("tStyle"), () => {
  buildStyle = STYLES[(STYLES.indexOf(buildStyle) + 1) % STYLES.length];
  refreshBuild();
});
const EXPAND_STEP = 60;
function expand(dx, dy) {
  const w0 = MW, h0 = MH;
  if (!growWorld(MW + dx, MH + dy)) return;
  if (MW === w0 && MH === h0) {
    toast("the world is as big as it goes: " + MW + "x" + MH);
    return;
  }
  realizeFeatures();
  cam.z = Math.max(fitZoom(), Math.min(VW / PXW, VH / PXH));
  clampCam();
  toast("world is now " + MW + " x " + MH + " tiles");
}
tap(document.getElementById("tKind"), () => {
  areaKind = (areaKind + 1) % KINDS.length;
  refreshBuild();
});
tap(document.getElementById("tGrab"), () => {
  grabMode = !grabMode;
  if (grabMode) { setArmed(false); areaMode = false; arenaMode = false; setDev(false); }
  else { grabRect = null; grabDrag = null; }
  document.getElementById("tGrab").classList.toggle("on", grabMode);
  refreshBuild(); refreshToolbar();
  toast(grabMode ? "drag a box, then drag the box to move it" : "grab tool off");
});
tap(document.getElementById("tArena"), () => {
  arenaMode = !arenaMode;
  if (arenaMode) { setArmed(false); areaMode = false; }
  document.getElementById("tArena").classList.toggle("on", arenaMode);
  refreshBuild();
  if (arenaMode) setDev(false);
  refreshToolbar();
  toast(arenaMode ? "tap the path to clear an arena" : "arena tool off");
});
tap(document.getElementById("tAreas"), () => {
  areaMode = !areaMode;
  if (areaMode) { arenaMode = false; grabMode = false; grabRect = null;
                  document.getElementById("tArena").classList.remove("on");
                  document.getElementById("tGrab").classList.remove("on"); }
  if (areaMode) setArmed(false);
  pickedArea = null; areaDrag = null;
  refreshBuild();
  if (areaMode) setDev(false);
  refreshToolbar();
  toast(areaMode ? "areas highlighted -- drag one to move it"
                 : "back to drawing");
});
tap(document.getElementById("tEast"), () => expand(EXPAND_STEP, 0));
tap(document.getElementById("tSouth"), () => expand(0, EXPAND_STEP));

tap(document.getElementById("aSmall"), () => resizeArea(-4));
tap(document.getElementById("aBig"), () => resizeArea(4));
tap(document.getElementById("aFit"), (...args) => fitArea(...args));

tap(document.getElementById("tUndo"), () => {
  const act = buildUndo.pop();
  if (!act) { toast("nothing to undo"); return; }
  if (act.kind === "add") {
    const i = features.findIndex(f => f.id === act.id);
    if (i >= 0) {
      const f = features.splice(i, 1)[0];
      realizeFeatures();
      toast("removed " + (f.label || f.kind));
    }
  } else if (act.kind === "resize") {
    const f = features.find(x => x.id === act.id);
    if (f) {
      f.x0 = act.was.x0; f.y0 = act.was.y0; f.x1 = act.was.x1; f.y1 = act.was.y1;
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
      toast((f.label || "area") + " put back to its old size");
    }
  } else if (act.kind === "region") {
    const r = regionMoves[act.i];
    if (r) {
      moveRegion({ x0: r.x0 + r.dx, y0: r.y0 + r.dy,
                   x1: r.x1 + r.dx, y1: r.y1 + r.dy }, -r.dx, -r.dy, true);
      regionMoves.splice(act.i, 1);
      toast("region moved back");
    }
  } else {
    const f = features.find(x => x.id === act.id);
    if (f) {
      moveArea(f, -act.dx, -act.dy, true);       /* put it back, silently */
      toast((f.label || "area") + " moved back");
    }
  }
  refreshBuild();
});
tap(document.getElementById("tDone"), () => {
  setBuild(false);
  toast(buildUndo.length ? buildUndo.length + " change(s) -- tap COPY to send them"
                         : "nothing drawn");
});
let devHeldArena = null;
function setFoesEnabled(enabled) {
  foesHeld = !enabled;
  const button = document.getElementById("bFoes");
  button.textContent = foesHeld ? "FOES: OFF" : "FOES: ON";
  button.classList.toggle("on", foesHeld);
  button.setAttribute("aria-pressed", String(foesHeld));
  if (foesHeld) {
    devHeldArena = arenaLock ? {map:MAPID,ring:arenaLock,t:arenaT} : null;
    // Bypass barriers without completing encounters, granting rewards or changing saves.
    arenaLock=null; arenaT=0; arenaGoing=false; falling=null;
    bolts.length=0; breath=null; hunt=null; claw=null; spell=null;
  } else {
    if(devHeldArena && devHeldArena.map===MAPID &&
       (trial || arenaFoesLeft(devHeldArena.ring))) {
      arenaLock=devHeldArena.ring;arenaT=devHeldArena.t;
    }
    devHeldArena=null;
  }
  toast(foesHeld ? "Foes paused — passages and arena barriers are open" : "Foes and battle barriers enabled");
}
tap(document.getElementById("bFoes"), () => setFoesEnabled(foesHeld));
tap(document.getElementById("pDone"), () => {
  if (groundDirty) { groundDirty = false; finishPaint(); }
  setPaint(false);
  toast(painted.size ? "painted " + painted.size + " tiles -- tap COPY to send them"
                     : "no terrain changes");
});
const PAINTS = ["pGrass", "pDirt", "pWater", "pPool", "pPave2",
                "pMarble", "pTerrace", "pRoadSand",
                "pLava", "pVRock", "pVCrack", "pVStone"];
for (const id of PAINTS) {
  const el = document.getElementById(id);
  if (!el) continue;
  tap(el, () => {
    paintT = +el.dataset.t;
    for (const o of PAINTS) {
      const b = document.getElementById(o);
      if (b) b.classList.toggle("on", o === id);
    }
  });
}
tap(document.getElementById("pUndo"), (...args) => window.__emberUndoStroke(...args));
tap(document.getElementById("pSize"), () => {
  brush = brush === 1 ? 2 : brush === 2 ? 4 : brush === 4 ? 6 : 1;
  document.getElementById("pSize").textContent = "BRUSH " + brush;
});

tap(bEdit, () => {
  editing = !editing;
  if (editing) { setPaint(false); setBuild(false); }
  bEdit.classList.toggle("on", editing);
  editEl.style.display = editing ? "block" : "none";
  soloTool(editing ? "MOVE THINGS" : null);
  refreshToolbar();
  if (!editing) selected = null;
  refreshSel();
});
const xdelEl = document.getElementById("xdel");
function refreshHandle() {
  let wx = null, wy = null;
  if (editing && selected) {
    const sp = editorSprite(selected);
    if (!sp) return;
    wx = selected.x + (selected.wx || 0);
    wy = selected.y + (selected.wy || 0) - (sp ? sp[3] : 16) - 6;
  } else if (building && grabMode && grabRect && !grabDrag) {
    wx = (grabRect.x1 + 1) * TS;
    wy = grabRect.y0 * TS - 6;
  }
  if (wx === null) {
    if (xdelEl.style.display !== "none") xdelEl.style.display = "none";
    if (typeof xlistEl !== "undefined" && xlistEl.style.display !== "none") xlistEl.style.display = "none";
    return;
  }
  xdelEl.style.display = "block";
  xdelEl.style.left = ((wx - cam.x) * cam.z) + "px";
  xdelEl.style.top = ((wy - cam.y) * cam.z) + "px";
  if (typeof xlistEl !== "undefined") {
    const show = building && grabMode && grabRect && !grabDrag;
    xlistEl.style.display = show ? "block" : "none";
    if (show) {
      xlistEl.style.left = ((wx - cam.x) * cam.z) + "px";
      xlistEl.style.top = ((wy - cam.y) * cam.z + 26) + "px";
    }
  }
}
tap(xdelEl, () => {
  if (editing && selected) { deleteSelected(); return; }
  if (building && grabMode && grabRect) { deleteGrabbed(); return; }
});

function listGrabbed() {
  if (!grabRect) { toast("drag a box first"); return; }
  const { x0, y0, x1, y1 } = grabRect;
  const rows = [];
  const seen = (o, where) => {
    const nm = NAMES[o.s] || "?";
    if (!/^(oak_|bir_|spr_|fru_|mw_|kt_|blo_|wf_pine|deadtree|halfdead)/.test(nm))
      return;
    const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
    if (tx < x0 || tx > x1 || ty < y0 || ty > y1) return;
    rows.push(nm + " " + tx + " " + ty + " " + where);
  };
  for (const o of objs) if (!deleted.has(o.id)) seen(o, "stored");
  for (const o of fobjs) seen(o, "generated");
  rows.sort();
  const head = "EMBERFELL TREES v1\nMAP " + MAPID +
               "\nbox " + x0 + "," + y0 + " .. " + x1 + "," + y1 +
               "\n" + rows.length + " trees";
  copyText(head + "\n" + rows.join("\n"),
           () => toast(rows.length + " trees copied"));
}
const xlistEl = document.createElement("div");
xlistEl.id = "xlist";
xlistEl.className = "xdel";
xlistEl.textContent = "LIST";
xlistEl.style.display = "none";
document.body.appendChild(xlistEl);
tap(xlistEl, () => { if (building && grabMode && grabRect) listGrabbed(); });

function deleteGrabbed() {
  if (!grabRect) return;
  const { x0, y0, x1, y1 } = grabRect;
  const inside = (px, py) => {
    const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
    return tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1;
  };
  let n = 0;
  for (const o of objs.slice()) {
    if (o.feat || deleted.has(o.id) || !inside(o.x, o.y)) continue;
    deleted.add(o.id); objs = objs.filter(q => q !== o); n++;
  }
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++) {
      const key = tx + "," + ty;
      if (felled.has(key)) continue;
      felled.add(key); felledNew.push(key);
    }
  n += fobjs.filter(o => inside(o.x, o.y)).length;
  for (const [tag, arr] of [["s", scat], ["a", sanm]])
    for (let i = 0; i < arr.length; i += 3) {
      if (decorGone.has(tag + i) || !inside(arr[i + 1], arr[i + 2])) continue;
      decorGone.add(tag + i);
      decorDel.push([tag, Math.round(arr[i + 1]), Math.round(arr[i + 2])]);
      n++;
    }
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = y * MW + x;
      if (terr[i] === WATER || terr[i] === BRIDGE) continue;
      if (terr[i] !== GRASS) { terr[i] = GRASS; notePainted(i); n++; }
    }
  clearedBoxes.push([x0, y0, x1, y1]);
  grabRect = null; grabDrag = null;
  realizeFeatures();
  reindex(); indexScatter(); chunks.clear(); rebuildBuckets(); rebuildSolid();
  refreshHandle(); refreshBuild();
  toast("cleared " + n + " thing" + (n === 1 ? "" : "s"));
}

function refreshSel() {
  const exact=(MD?.roomActors||[]).filter(a=>a.exactFurniture&&!a.editorDeleted);
  selEl.textContent = selected
    ? (selected.n || selected.spr || NAMES[selected.s]) + " #" + (selected.id || "actor") + " @ " + Math.round(selected.x) + "," + Math.round(selected.y)
    : (editing&&MD?("drag anything to move it, then DONE · exact furniture: "+exact.length+(MD._exactFurnitureExpected?" / "+MD._exactFurnitureExpected.length:"")+(Number.isFinite(MD._recutCuts)?" · recut "+MD._recutCuts+"/"+MD._recutCandidates:"")):"drag anything to move it, then DONE");
  refreshHandle();
}
function countChanges() {
  let n = geometryPatch().length + Object.keys(actorLayouts[MAPID]||{}).length + deleted.size + added.length + painted.size + regionMoves.length
          + decorDel.length + felledNew.length + clearedBoxes.length;
  for (const [k, m] of decorMoved) {
    if (decorGone.has(k)) continue;
    const arr = m.tag === "s" ? scat : sanm;
    if (Math.round(arr[m.di + 1]) !== m.x0 || Math.round(arr[m.di + 2]) !== m.y0) n++;
  }
  for (const f of features)
    if (featOrig.get(f.id) !== JSON.stringify(f)) n++;
  for (const o of objs) {
    if (o.id >= ORIG.length || o.feat) continue;
    const a = ORIG[o.id];
    if (Math.round(o.x) !== a.x || Math.round(o.y) !== a.y) n++;
  }
  return n;
}

function doneEditing() {
  const n = countChanges();
  editing = false; selected = null; dragObj = null;
  bEdit.classList.remove("on");
  editEl.style.display = "none";
  reindex(); refreshSel();
  toast(n ? "saved -- " + n + " change" + (n === 1 ? "" : "s") + ", tap COPY to send them"
          : "no changes made");
}
tap(document.getElementById("nDone"), doneEditing);
function deleteSelected() {
  if (!selected) return;
  if(selected.interiorFurniture){
    const info=editorActorInfo(selected);if(!info)return;selected.editorDeleted=true;
    (actorLayouts[MAPID] ||= {})[info.key]={x:selected.x,y:selected.y,deleted:true};
    /* session-only until COPY */
    for(const i of selected.moveBlocks||[]){const b=MD.roomBlocks?.[i];if(b){b._furnitureHome ||= b.slice(0,4);b[0]=b[1]=b[2]=b[3]=-99999;}}
    selected=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return;
  }
  if(selected.editableWall){
    const key=editorActorInfo(selected).key;selected.editorDeleted=true;
    (actorLayouts[MAPID] ||= {})[key]={x:selected.x,y:selected.y,deleted:true};
    /* session-only until COPY */
    selected=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return;
  }
  if(editorActorInfo(selected)){toast("This actor can be moved. Keep its story identity intact.");return;}
  if (selected.feat) {
    const tx = Math.floor(selected.x / TS), ty = Math.floor((selected.y - 1) / TS);
    const key = tx + "," + ty;
    if (!felled.has(key)) { felled.add(key); felledNew.push(key); }
    selected = null;
    realizeFeatures(); rebuildBuckets(); rebuildSolid();
    refreshSel(); refreshHandle();
    return;
  }
  if (selected.decor) {
    decorGone.add(selected.decor + selected.di);
    decorDel.push([selected.decor, Math.round(selected.x), Math.round(selected.y)]);
  } else {
    deleted.add(selected.id);
    objs = objs.filter(o => o !== selected);
  }
  selected = null;
  reindex(); indexScatter(); chunks.clear(); rebuildBuckets();
  refreshSel(); refreshHandle();
}
tap(document.getElementById("nDel"), deleteSelected);
tap(document.getElementById("nDup"), () => {
  if (!selected) return;
  if(editorActorInfo(selected)){toast("Drag this actor to reposition it.");return;}
  const o = { id: nextId++, s: selected.s, x: selected.x + TS, y: selected.y + TS };
  objs.push(o); added.push(o); selected = o; reindex(); refreshSel();
});

function buildPatch() {
  const L = ["EMBERFELL PATCH v3", "MAP " + MAPID, ...geometryPatch()];
  for(const [key,v] of Object.entries(actorLayouts[MAPID]||{}))L.push("ACTOR "+JSON.stringify({key,...v}));
  for (const r of regionMoves)
    L.push("R " + r.x0 + " " + r.y0 + " " + r.x1 + " " + r.y1 + " " + r.dx + " " + r.dy);
  for (const f of features) {
    if (featOrig.get(f.id) === JSON.stringify(f)) continue;   /* unchanged */
    if (f.kind === "route")
      L.push("F route " + f.id + " " + f.x0 + " " + f.y0 + " " + f.x1 + " " +
             f.y1 + " " + f.w + " " + f.band + " " + f.style + " " +
             (f.a0 ? f.a0.area + ":" + f.a0.side : "-") + " " +
             (f.a1 ? f.a1.area + ":" + f.a1.side : "-") +
             (f.pts && f.pts.length > 2
                ? " " + f.pts.map(p => p[0] + "," + p[1]).join(";")
                : ""));
    else if (f.kind === "arena")
      L.push("F arena " + f.id + " " + f.x + " " + f.y + " " +
             (f.r || 6) + " " + f.style);
    else
      L.push("F area " + f.id + " " + f.x0 + " " + f.y0 + " " + f.x1 + " " +
             f.y1 + " " + f.band + " " + f.style + " " +
             (f.label || "Area").replace(/\s+/g, "_"));
  }
  const prows = new Map();
  for (const [i, tv] of painted) {
    const y = (i / MW) | 0, x = i % MW;
    if (!prows.has(y)) prows.set(y, []);
    prows.get(y).push([x, tv]);
  }
  for (const y of [...prows.keys()].sort((a, b) => a - b)) {
    const cells = prows.get(y).sort((a, b) => a[0] - b[0]);
    let i = 0;
    while (i < cells.length) {
      let j = i;
      while (j + 1 < cells.length && cells[j + 1][0] === cells[j][0] + 1 &&
             cells[j + 1][1] === cells[i][1]) j++;
      if (TCHAR[cells[i][1]] === undefined) { i = j; continue; }
      L.push("T " + TCHAR[cells[i][1]] + " " + cells[i][0] + " " + y + " " + (j - i + 1));
      i = j + 1;
    }
  }
  for (const o of objs) {
    if (o.id >= ORIG.length) continue;
    const a = ORIG[o.id];
    if (Math.round(o.x) !== a.x || Math.round(o.y) !== a.y)
      L.push("M " + o.id + " " + Math.round(o.x) + " " + Math.round(o.y));
  }
  for (const [x0, y0, x1, y1] of clearedBoxes)
    L.push("C " + x0 + " " + y0 + " " + x1 + " " + y1);
  const inBox = (tx, ty) => clearedBoxes.some(
    ([x0, y0, x1, y1]) => tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1);
  for (const id of [...deleted].sort((a, b) => a - b)) {
    const a = ORIG[id];
    if (a && inBox(Math.floor(a.x / TS), Math.floor((a.y - 1) / TS))) continue;
    L.push("D " + id);
  }
  for (const [tag, x, y] of decorDel)
    if (!inBox(Math.floor(x / TS), Math.floor((y - 1) / TS)))
      L.push("X " + tag + " " + x + " " + y);
  for (const [k, m] of decorMoved) {
    if (decorGone.has(k)) continue;             /* moved, then deleted */
    const arr = m.tag === "s" ? scat : sanm;
    const nx = Math.round(arr[m.di + 1]), ny = Math.round(arr[m.di + 2]);
    if (nx === m.x0 && ny === m.y0) continue;   /* dragged and put back */
    L.push("S " + m.tag + " " + (NAMES[m.s] || m.s) + " " +
           m.x0 + " " + m.y0 + " " + nx + " " + ny);
  }
  for (const k of felledNew) {
    const [kx, ky] = k.split(",").map(Number);
    if (!inBox(kx, ky)) L.push("K " + kx + " " + ky);
  }
  for (const o of added)
    if (!deleted.has(o.id))
      L.push("A " + NAMES[o.s] + " " + Math.round(o.x) + " " + Math.round(o.y));
  if (L.length === 2) L.push("(no changes on this map)");
  return L.join("\n");
}
const dumpEl = document.getElementById("dump"), dumpText = document.getElementById("dumpText");
const toastEl = document.getElementById("toast");
function toast(msg) {
  toastEl.textContent = msg; toastEl.style.display = "block";
  clearTimeout(toast._t); toast._t = setTimeout(() => toastEl.style.display = "none", 1800);
}
function copyText(txt, done) {
  const legacy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ta.setSelectionRange(0, txt.length);          /* iOS needs the range */
      const ok = document.execCommand && document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(
      () => done(true),
      () => done(legacy()));
    return;
  }
  done(legacy());
}

tap(document.getElementById("bCopy"), () => {
  const txt = buildPatch();
  const n = txt.split("\n").length - 1;
  copyText(txt, ok => {
    if (ok) toast("copied " + n + " change" + (n === 1 ? "" : "s"));
    else showDump(txt);
  });
});
function showDump(txt) {
  const dumpEl = document.getElementById("dump");
  const dumpText = document.getElementById("dumpText");
  if (!dumpEl || !dumpText) { toast("copy failed"); return; }
  dumpText.value = txt; dumpEl.style.display = "flex";
  dumpText.focus(); dumpText.select();
}
{
  const dc = document.getElementById("dumpClose");
  const de = document.getElementById("dump");
  if (dc && de) tap(dc, () => de.style.display = "none");
}

const isArea = (f) => f.kind === "area" || f.kind === "town";
let STYLE_TREE = ATLAS.styles.tree;
let STYLES = [];
const buildStyles = () => {
  STYLES = Object.keys(STYLE_TREE)
    .filter(k => !k.endsWith("_small") && k !== "dying");
};
function sows(style) { return !!style && style !== "volcano" && !!STYLE_TREE[style]; }
const TREE_STEP = 2;
const ROUTE_W = 5, ROUTE_BAND = 20, TOWN_BAND = 6, TOWN_MIN = 24;

var building = false, buildTool = "route", buildStyle = "spruce";
let drawArmed = false;
const KINDS = ["Town", "Graveyard", "Temple", "Camp", "Ruin", "Farmstead"];
let areaKind = 0;
let areaMode = false, pickedArea = null, areaDrag = null;
let arenaMode = false;
let grabMode = false, grabRect = null, grabDrag = null;
let regionMoves = [];
const ARENA_R = 6.3;
let buildUndo = [];
let features = [], fobjs = [], fsanim = [], baseTerr = null, featSeq = 1;
const DESERT_OK = /^(cactus|drock|palm|acacia|deadtree|halfdead|deadbush|bones|sand_)/;
function sandRefuses(o) {
  if (!baseTerr || !o || o.s === undefined) return false;
  const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return false;
  const _b = baseTerr[ty * MW + tx];
  const _desert = _b === SAND || _b === ROADSAND || _b === DWATER
                  || (typeof inDesert === "function" && inDesert(tx, ty));
  if (!_desert) return false;
  return !DESERT_OK.test(NAMES[o.s] || "");
}
let hidden = new Set();
let soilAreas = [];
function soilWob(t) {
  return Math.round(3.1 * Math.sin(t * 1.27) + 2.2 * Math.sin(t * 0.61 + 1.9)
                    + 1.3 * Math.sin(t * 2.13 + 0.4));
}
function soilIn(x, y) {
  for (const f of soilAreas)
    if (x >= f.x0 + soilWob(y) && x <= f.x1 - soilWob(y + 41) &&
        y >= f.y0 + soilWob(x + 17) && y <= f.y1 - soilWob(x + 63))
      return f.soil;
  return null;
}
function swampRoadAt(x, y) {
  if (terr[y * MW + x] !== DIRT) return inSwamp(x, y);
  let yes = 0, no = 0;
  for (let r = -3; r <= 3; r++) {
    if (inSwamp(x, y + r)) yes++; else no++;
    if (inSwamp(x + r, y)) yes++; else no++;
  }
  return yes >= no;
}
function inWinter(x, y) {
  const F = (typeof features !== "undefined" && features.length) ? features : MD.features;
  if (!F) return false;
  for (const f of F) {
    if (f.style !== "winter") continue;
    if (f.kind === "route") {
      const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
      for (const [a, b] of routeLegs(f)) {
        const vert = a[0] === b[0];
        const lo = (vert ? Math.min(a[1], b[1]) : Math.min(a[0], b[0])) - reach;
        const hi = (vert ? Math.max(a[1], b[1]) : Math.max(a[0], b[0])) + reach;
        const along = vert ? y : x, across = vert ? x : y;
        if (along >= lo && along <= hi &&
            Math.abs(across - (vert ? a[0] : a[1])) <= reach) return true;
      }
    } else if (f.x0 !== undefined &&
               x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return true;
  }
  const WR = MD.winter_regions;
  if (WR) for (const r of WR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  return false;
}
function hash2(x, y) {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  n = (n ^ (n >>> 13)) | 0;
  n = Math.imul(n, 1274126177) | 0;
  return ((n ^ (n >>> 16)) >>> 0);
}
function lavaPatch(x, y) {
  const C = 4;
  const gx = Math.floor(x / C), gy = Math.floor(y / C);
  const fx = (x - gx * C) / C, fy = (y - gy * C) / C;
  const v = (a, b) => (hash2(a, b) % 1000) / 1000;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = v(gx, gy)     + (v(gx + 1, gy)     - v(gx, gy))     * sx;
  const b = v(gx, gy + 1) + (v(gx + 1, gy + 1) - v(gx, gy + 1)) * sx;
  return a + (b - a) * sy;
}

/* wardrobe crop fix redeploy b8f3a79 */
