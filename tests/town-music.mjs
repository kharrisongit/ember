import fs from 'node:fs';import zlib from 'node:zlib';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),html=read('index.html');
function setup(stored=null,ios=false,failBuffers=false){
 const elements=new Map(),timers=[],listeners={};let sync,now=0;
 const attrs=new Map([...html.matchAll(/<audio id="([^"]+)"([^>]*>)([\s\S]*?)<\/audio>/g)].map(m=>[m[1],(m[2]+m[3]).match(/src="([^"]*)"/)?.[1]||'']));
 const c=vm.createContext({gameplayStarted:true,mode:'play',quest:0,Q:{NOISE:5,ARMED:6,DONE:9},dragonJourneyEnded:false,dragonIntroDone:false,saveGame(){},MAPID:'house26',MD:{title:'Millwood — The Hearth House'},P:{x:24*16,y:430*16},TS:16,
 wonAll:false,lastFight:0,scene:null,sayNpc:null,features:[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}],
 document:{hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,{id,src:attrs.get(id),paused:true,volume:1,currentTime:17,plays:0,
  addEventListener(k,f){(this.events||={})[k]=f;},getAttribute(k){return k==='src'?this.src:null;},querySelector(){return null;},
  play(){this.plays++;if(this.waitForPlay)return new Promise(resolve=>{this.finishPlay=()=>{this.paused=false;resolve();};});this.paused=false;return Promise.resolve();},pause(){this.paused=true;}});return elements.get(id);}},
 localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v;}},Date:{now:()=>now},setTimeout:(f,ms)=>timers.push({f,at:now+ms}),setInterval:f=>{sync=f;},window:{addEventListener:(k,f)=>{listeners[k]=f;}}});
 const contexts=[];
 if(ios){
  const node=()=>({gain:{value:1,cancelScheduledValues(){},setTargetAtTime(v){this.value=v;}},connect(other){this.next=other;}});
  c.window.AudioContext=class{
   constructor(){this.state='suspended';this.currentTime=0;this.destination={};this.sources=new Map();this.resumes=0;contexts.push(this);}
   createGain(){return node();}
   decodeAudioData(){return Promise.reject(Error('Decode failed'));}
   createMediaElementSource(a){assert(!this.sources.has(a),'One source per audio element');const source=node();source.gain=null;this.sources.set(a,source);return source;}
   resume(){this.resumes++;this.state='running';return Promise.resolve();}
  };
  const get=c.document.getElementById;
  c.document.getElementById=id=>{const a=get(id);Object.defineProperty(a,'volume',{configurable:true,get:()=>1,set(){}});return a;};
 }
 if(failBuffers){c.window.AudioContext.prototype.createBufferSource=()=>{throw Error('Failed buffers must use streaming fallback');};c.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)});}
 const audible=a=>{
  if(a.paused)return 0;let level=a.volume,n=contexts[0]?.sources.get(a);
  while(n){if(n.gain)level*=n.gain.value;n=n.next;}return level;
 };
 vm.runInContext(read('js/audio.js'),c);
 const advance=async(ms=4000)=>{for(let i=0;i<5;i++)await Promise.resolve();const until=now+ms;while(timers.some(t=>t.at<=until)){timers.sort((a,b)=>a.at-b.at);const t=timers.shift();now=t.at;t.f();await Promise.resolve();}now=until;await Promise.resolve();};
 const change=async(map,title,x,y)=>{c.MAPID=map;c.MD={title};if(x!==undefined)c.P={x:x*16,y:y*16};sync();await advance();};
 return {c,track:name=>elements.get('emberfell'+name+'Bgm'),elements,change,advance,listeners,sync,contexts,audible,getStored:()=>stored};
}
const {c,track,elements,change,advance,listeners,sync,getStored}=setup();
assert.equal(c.window.EmberAudio.percent(),35);assert([...elements.values()].every(a=>a.paused),'No autoplay before a gesture');
listeners.pointerdown();await advance();assert.equal(track('Millwood').paused,false);assert.equal(track('Millwood').volume,.35*.85);
for(const [map,title,x,y]of [['world','Northern Woods',30,390],['world','Elder’s clearing',50,370],['world','Unknown road',500,500]]){
 await change(map,title,x,y);assert.equal(track('Millwood').paused,false,title+' uses the default until its own song exists');assert.equal(track('Millwood').currentTime,17);
}
for(const a of elements.values())if(!['emberfellMillwoodBgm','emberfellVillainBgm'].includes(a.id))assert.equal(a.plays,0,'Empty audio placeholders never replace the default');
await change('world','Emberfell',30,430);
c.scene={lines:["Maddock: Halvard's knights patrol the road."]};sync();await advance();assert.equal(track('Villain').paused,true,'Mentioning knights is not a royal conversation');
for(const name of ['Bram','Doran','Tolan',"King's Knight",'Royal Knight','Halvard']){
 c.scene={lines:[name+': Halt.','Corin: Let me pass.']};sync();await advance();assert.equal(track('Villain').paused,false,name+' conversation uses the King’s song');
 c.scene=null;sync();await advance();assert.equal(track('Villain').paused,true);assert.equal(track('Millwood').paused,false);
}
c.sayNpc={n:'Serjeant Bram'};sync();await advance();assert.equal(track('Villain').paused,false);c.sayNpc=null;sync();await advance();
c.window.EmberKingMusic.start();await advance();assert.equal(track('Villain').paused,false);c.scene={lines:['Out of my way, boy!']};sync();await advance();assert.equal(track('Villain').paused,false,'Scripted royal cue spans the blackouts');
c.scene=null;c.window.EmberKingMusic.stop();await advance();assert.equal(track('Millwood').paused,false);
c.lastFight=1;await change('cinderhold','Throne room');assert.equal(track('Villain').paused,false,'Final battle starts the theme even without prior dialogue');
c.lastFight=2;sync();await advance();assert.equal(track('Villain').paused,false,'King’s second phase keeps the song');
c.wonAll=true;sync();await advance();assert.equal(track('Cinderhold').paused,false,'Victory restores Cinderhold music');c.wonAll=false;c.lastFight=0;
await change('world','Emberfell',30,430);
// Royal music cuts the outgoing track immediately, including while buffering.
track('Villain').waitForPlay=true;c.window.EmberKingMusic.start();
assert.equal(track('Millwood').volume,0);assert(track('Millwood').paused);assert.equal(track('Villain').volume,.35*.85);
assert.equal(track('Villain').currentTime,0,'Every royal interruption starts on its opening beat');
track('Villain').finishPlay();await advance(1);
assert.equal(track('Villain').volume,.35*.85,'The opening beat is never faded in');
listeners.pointerdown();listeners.touchstart();assert.equal(track('Villain').volume,.35*.85);
c.window.EmberAudio.set(70);assert.equal(track('Villain').volume,.7*.85);assert.equal(getStored(),'70');
// Reverse a transition in flight; no third track or abandoned fade remains.
c.window.EmberKingMusic.stop();await advance();assert.equal(track('Millwood').volume,.7*.85);assert.equal(track('Villain').volume,0);assert(track('Villain').paused);
c.window.EmberKingMusic.start();c.window.EmberAudio.set(0);track('Villain').finishPlay();await advance();
assert([...elements.values()].every(a=>a.paused&&a.volume===0),'Mute wins over a pending play and all scheduled fades');
track('Villain').waitForPlay=false;c.window.EmberKingMusic.stop();c.window.EmberAudio.set(50);await advance();assert.equal(track('Millwood').volume,.5*.85);assert.equal(track('Millwood').paused,false);
// Thornwell uses its installed track, including the town interiors.
await change('inn','Thornwell Inn');assert.equal(track('Thornwell').paused,false);assert(track('Millwood').paused);
await change('house22','Millwood — Maddock’s House');assert.equal(track('Millwood').paused,false);assert(track('Thornwell').paused);
const muted=setup('0');muted.listeners.pointerdown();await muted.advance();assert([...muted.elements.values()].every(a=>a.paused),'Saved mute survives reload');
for(const [name,path,max]of [['Millwood','millwood-rustic-town.m4a',850000],['Villain','kings-villain-theme.m4a',900000],['Field','intertown-field.m4a',1350000],['Thornwell','thornwell-shop.m4a',1600000]]){
 const tag=html.match(new RegExp('<audio id="emberfell'+name+'Bgm"[^>]+>'))?.[0];assert(tag);assert.match(tag,/\bloop\b/);assert.match(tag,['Villain','Millwood'].includes(name)?/preload="auto"/:/preload="none"/);assert(tag.includes('assets/audio/'+path));
 const music=fs.readFileSync(new URL('../assets/audio/'+path,import.meta.url));assert.equal(music.toString('ascii',4,8),'ftyp');assert(music.length<max);
}
console.log('PASS: default music covers unassigned areas; actual royal speakers and both final battle phases get the King’s theme; empty tracks never play; buffer-aware fades, repeated taps, volume changes, interrupted fades, mute, saved volume and Thornwell’s installed song work.');

// The route music follows the entire authored network, including bends that
// were far from the old endpoint-to-endpoint line. Town areas always win.
const world=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)"/)[1],'base64'))).maps.world;
const routes=setup();routes.c.features=world.features;routes.c.isHuntingArena=f=>f.hunting===true;
routes.listeners.pointerdown();await routes.advance();let routeSamples=0;
for(const road of world.features.filter(f=>f.kind==='route'&&!f.entrance&&!([3,5,212].includes(f.id))&&/^Route \d+$/.test(f.road||''))){
 const pts=road.pts||[[road.x0,road.y0],[road.x1,road.y1]];
 for(let i=1;i<pts.length;i++){
  const x=(pts[i][0]+pts[i-1][0])/2,y=(pts[i][1]+pts[i-1][1])/2;
  if(world.features.some(f=>f.kind==='area'&&!f.hidden&&!f.wild&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1))continue;
  await routes.change('world','Emberfell',x,y);assert(!routes.track(road.style==='blossom'?'Seatown':x>=1288&&x<=1452&&y>=70&&y<=238?'LavaRoute':'Field').paused,'Route '+road.id+' leg '+i+' uses The Field');routeSamples++;
 }
}
for(const name of ['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck']){
 const town=world.features.find(f=>f.kind==='area'&&f.label===name);
 await routes.change('world','Emberfell',(town.x0+town.x1)/2,(town.y0+town.y1)/2);
 assert(routes.track('Field').paused,name+' town does not inherit route music');assert(!routes.track(name==='Thornwell'?'Thornwell':name==='Forgewick'?'Forgewick':name==='Sandspire'?'Sandspire':name==='Coralmere'?'Seatown':name==='Hollybeck'?'Hollybeck':'Millwood').paused);
}
await routes.change('world','Northern Woods',30,350);assert(routes.track('Field').paused,'The original song remains in the Northern Woods');
routes.c.features=[{id:12,kind:'route',road:'Route 2',pts:[[200,200],[200,240],[300,240]]}];
await routes.change('world','Emberfell',200,230);assert(!routes.track('Field').paused,'Moved road geometry is used');
routes.c.scene={lines:['Bram: Halt.']};routes.sync();await routes.advance();assert(!routes.track('Villain').paused);assert(routes.track('Field').paused);
routes.c.scene=null;routes.sync();await routes.advance();assert(!routes.track('Field').paused,'Finishing a knight conversation returns to the route song');
await routes.change('tp1','Forgewick Temple');assert(routes.track('Field').paused,'Entering a temple leaves route music');
console.log(`PASS: The Field covers ${routeSamples} road segments, follows moved bends, yields to towns/interiors and royal conversations, and leaves Northern Woods on the original song.`);

// Reproduce Safari's real constraint: setting media.volume has no effect.
// Verify the connected gain graph's output, not the ignored media property.
const phone=setup(null,true),volume=()=>phone.audible(phone.track('Millwood'));
assert.equal(phone.contexts.length,0,'Audio graph waits for a user gesture');
phone.listeners.touchstart();await phone.advance();assert.equal(phone.contexts.length,1);assert.equal(volume(),.35*.85);
for(const pct of [1,100,25,75,0,1]){
 phone.c.window.EmberAudio.set(pct);await phone.advance();
 assert.equal(phone.track('Millwood').volume,1,'iPhone keeps the media property at 100%');
 assert(Math.abs(volume()-pct/100*.85)<1e-9,'Connected output really changes to '+pct+'%');
}
phone.c.window.EmberAudio.set(100);await phone.advance();phone.c.window.EmberKingMusic.start();await phone.advance(450);
const out=phone.audible(phone.track('Millwood')),incoming=phone.audible(phone.track('Villain'));
assert.equal(out,0,'iPhone stops Millwood immediately');assert.equal(incoming,.85,'iPhone king opening beat plays at full configured volume');
phone.listeners.touchstart();assert.equal(phone.audible(phone.track('Villain')),incoming,'Tapping does not bypass the gain fade');
phone.c.window.EmberAudio.set(1);assert(Math.abs(phone.audible(phone.track('Villain'))-incoming*.01)<1e-9,'Volume applies to both sides of the fade');
phone.c.window.EmberAudio.set(0);await phone.advance();assert([...phone.elements.values()].every(a=>phone.audible(a)===0&&a.paused));
phone.contexts[0].state='interrupted';phone.listeners.touchstart();assert.equal(phone.contexts[0].state,'running','A fresh gesture resumes interrupted iPhone audio');assert.equal(phone.contexts.length,1,'Gestures reuse one mixer');
const savedPhone=setup('1',true);savedPhone.listeners.pointerdown();await savedPhone.advance();assert.equal(savedPhone.audible(savedPhone.track('Millwood')),.01*.85,'Saved volume controls iPhone output after reload');
console.log('PASS: With the iPhone media-volume restriction reproduced, 1% output is 1/100 of 100%; gain-based fades, mute, interruption recovery and saved volume work.');

// Regression: the published hunting loops are unnamed routes, not numbered roads.
const published=JSON.parse(read('assets/editor-layouts.json')),huntingPaths=new Map();
function findHuntingPaths(value){
 if(!value||typeof value!=='object')return;
 if(value.kind==='route'&&!value.road)huntingPaths.set(value.id,value);
 for(const child of Object.values(value))findHuntingPaths(child);
}
findHuntingPaths(published.maps.world);
huntingPaths.set(9148,{id:9148,kind:'route',w:5,pts:[[145,111],[145,67],[198,67],[198,107]]});
const hunt=setup();hunt.c.features=[...world.features,...huntingPaths.values()];
hunt.c.isHuntingArena=f=>f.kind==='arena'&&['bird','hare','boar','deer','fox'].includes(f.encounter);
hunt.listeners.pointerdown();await hunt.advance();let huntSamples=0;
for(const road of huntingPaths.values())for(let i=1;i<road.pts.length;i++){
 const a=road.pts[i-1],b=road.pts[i];
 for(const t of [.1,.5,.9]){
  const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
  if(world.features.some(f=>f.kind==='area'&&!f.hidden&&!f.wild&&x>=f.x0&&x<=f.x1&&y>=f.y0&&y<=f.y1))continue;
  await hunt.change('world','Emberfell',x,y);
  assert(!hunt.track('Field').paused||!hunt.track('Seatown').paused||!hunt.track('LavaRoute').paused,'Hunting path '+road.id+' segment '+i+' keeps route music');huntSamples++;
 }
}
assert(hunt.track('Field').plays>=1,'hunting paths outside the coast use route music');
for(const [id,map]of Object.entries(JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)"/)[1],'base64'))).maps)){
 if(id!=='world'&&map.title?.startsWith('Thornwell')){
  await hunt.change(id,map.title);assert(!hunt.track(/^school/.test(id)?'School':id==='tavern'?'Tavern':'Thornwell').paused,id+' plays its assigned music');
 }
}
console.log(`PASS: ${huntingPaths.size} authored hunting loops, ${huntSamples} samples, uninterrupted route playback and Thornwell interiors.`);

// The story track spans the warning, woods, egg return, hatch and introduction.
const journey=setup(null,true);journey.c.quest=5;
journey.listeners.touchstart();await journey.change('world','Northern Woods',30,350);
journey.c.window.EmberDragonMusic.omen();
assert([...journey.elements.values()].every(a=>a.paused),'Warning immediately cuts Millwood music');
journey.c.quest=6;journey.sync();await journey.advance();
assert([...journey.elements.values()].every(a=>a.paused),'Finishing dialogue early cannot start music over the roar/crash');
journey.c.window.EmberDragonMusic.reveal();await journey.advance();
assert(!journey.track('DragonReveal').paused);assert(journey.track('Millwood').paused);
assert(Math.abs(journey.audible(journey.track('DragonReveal'))-.35*.7*.85)<1e-9,'Reveal retains its quieter iPhone mixer level');
for(const quest of [6,7,8,9]){
 journey.c.quest=quest;await journey.change('world','Northern Woods',30,350);
 assert(!journey.track('DragonReveal').paused,'Story stage '+quest+' keeps the loop');
}
assert.equal(journey.track('DragonReveal').plays,1,'Story progression does not restart the music');
journey.c.dragonIntroDone=true;journey.sync();await journey.advance();assert(!journey.track('DragonReveal').paused);
await journey.change('world','Millwood',30,430);
assert(journey.track('DragonReveal').paused);assert(!journey.track('Millwood').paused);assert(journey.c.dragonJourneyEnded);
await journey.change('world','Northern Woods',30,350);assert(journey.track('DragonReveal').paused,'Leaving Millwood later does not restart story music');
journey.c.quest=8;journey.c.dragonJourneyEnded=false;journey.sync();await journey.advance();
assert(!journey.track('DragonReveal').paused,'Loading an unfinished journey resumes the loop');
journey.c.mode='title';journey.sync();await journey.advance();assert(journey.track('DragonReveal').paused);
assert.match(html.match(/<audio id="emberfellDragonRevealBgm"[^>]+>/)[0],/\bloop\b/);
journey.c.mode='play';journey.c.quest=9;journey.c.deadShown=true;journey.sync();await journey.advance();
assert([...journey.elements.values()].every(a=>a.paused),'Music fades out for the game-over cue');
journey.c.deadShown=false;await journey.change('world','Millwood',30,430);assert(!journey.track('Millwood').paused,'Retry restores area music');
console.log('PASS: warning cuts music immediately; Reveal waits for completion, spans hatch/introduction, ends on Millwood return and stays ended afterward.');

// Inspect the actual PCM loop: no padded silence or faded-out seam survives.
const wav=fs.readFileSync(new URL('../assets/audio/dragon-mystic-loop.wav',import.meta.url));
assert.equal(wav.toString('ascii',0,4),'RIFF');
let pcm=null,rate=0,channels=0;
for(let p=12;p+8<=wav.length;){const kind=wav.toString('ascii',p,p+4),size=wav.readUInt32LE(p+4);
 if(kind==='fmt '){assert.equal(wav.readUInt16LE(p+8),1);channels=wav.readUInt16LE(p+10);rate=wav.readUInt32LE(p+12);assert.equal(wav.readUInt16LE(p+22),16);}
 if(kind==='data')pcm=wav.subarray(p+8,p+8+size);p+=8+size+(size%2);
}
assert(pcm&&rate&&channels);const stride=Math.floor(rate*channels*.1);
for(let start=0;start+stride<pcm.length/2;start+=stride){let power=0;for(let i=0;i<stride;i++)power+=(pcm.readInt16LE((start+i)*2)/32768)**2;assert(Math.sqrt(power/stride)>.03,'Every 100ms stays audible, including the join');}
for(let channel=0;channel<channels;channel++)assert(Math.abs(pcm.readInt16LE(channel*2)-pcm.readInt16LE(pcm.length-channels*2+channel*2))/32768<.02,'The seam has no discontinuity spike');
console.log('PASS: lossless loop contains no silent/faded gap and has a continuous waveform join.');

const intro=setup();intro.c.features=[{kind:'route',road:'Route 1',pts:[[65,430],[79,430]]}];
intro.listeners.pointerdown();await intro.advance();
await intro.change('world','Route to Thornwell',70,430);
assert.equal(intro.track('Field').currentTime,0,'The first departure from Millwood includes the opening ten seconds');
assert(vm.runInContext('routeMusicIntroPlayed',intro.c));
intro.track('Field').currentTime=42;intro.sync();await intro.advance();assert.equal(intro.track('Field').currentTime,42,'Staying on the same road never restarts it');
await intro.change('tavern','Thornwell Tavern');
intro.c.features=[{kind:'route',road:'Route 2',pts:[[500,430],[540,430]]}];
await intro.change('world','Road from Thornwell',520,430);assert.equal(intro.track('Field').currentTime,10,'Leaving Thornwell skips the intro');
intro.track('Field').paused=true;intro.track('Field').events.ended();await intro.advance();
assert.equal(intro.track('Field').currentTime,10,'Later loops skip the intro too');
assert.equal(intro.track('Field').loop,false,'Native looping cannot replay the intro');
console.log('PASS: route intro plays once leaving Millwood; later departures and loops begin at ten seconds.');

const forge=setup();forge.listeners.pointerdown();await forge.advance();
await forge.change('house33','Forgewick — Smithy');assert(!forge.track('Forgewick').paused,'Forgewick interiors use Home Town');
await forge.change('mine2','Forgewick Mine');assert(forge.track('Forgewick').paused,'The mine retains its own music slot');
await forge.change('tp1','Forgewick Temple');assert(forge.track('Forgewick').paused,'The temple retains its own music slot');
assert(forge.track('Forgewick').src.includes('forgewick-home-town.m4a'));
console.log('PASS: Home Town plays in Forgewick and its town interiors; mine and temple remain separate.');

const temples=setup();temples.listeners.pointerdown();await temples.advance();
for(const [id,title]of [['tp1','Forgewick Temple'],['tp1_crossroads','Forgewick Temple'],['ds1','Sandspire Temple'],['ds_sanctum','Sandspire Temple'],['sn1','Hollybeck Temple'],['sn_altar','Hollybeck Temple']]){
 temples.c.MD.templeExpanded=true;await temples.change(id,title);temples.c.MD.templeExpanded=true;temples.sync();await temples.advance();
 assert(!temples.track('Temple').paused,id+' uses Spooky Cave');
 assert(temples.track('Forgewick').paused&&temples.track('Millwood').paused);
}
const templePlays=temples.track('Temple').plays;await temples.change('sn2','Hollybeck Temple');assert.equal(temples.track('Temple').plays,templePlays,'Room changes do not restart the temple song');
await temples.change('mine2','Forgewick Mine');assert(temples.track('Temple').paused);
await temples.change('passage','Mountain Passage');temples.c.MD={templeExpanded:true,mountainPassage:true};temples.sync();await temples.advance();assert(temples.track('Temple').paused,'The mountain passage is separate from the temples');
console.log('PASS: all three temples and their side rooms share Spooky Cave continuously; mines and mountain passages stay separate.');

const swamp=setup();swamp.listeners.pointerdown();await swamp.advance();
for(const [map,title,x,y]of [['witch_room','Witchmoor'],['witch_demon','Witchmoor'],['world','Dreadmarsh',1080,280]]){
 await swamp.change(map,title,x,y);assert(!swamp.track('Mystic').paused,map+' uses Mystic Forest');assert(swamp.track('Millwood').paused);
}
assert(swamp.track('Mystic').src.includes('swamp-mystic-forest.m4a'));
console.log('PASS: Mystic Forest covers the swamp, witch’s house and witch encounter.');

// The transition follows the same tile classifier used by the ground renderer.
const desertTest=setup(),groundCode=read('js/generated/game-part-2.js');
Object.assign(desertTest.c,{MW:14,MH:10,SAND:11,ROADSAND:12,PAVING2:8,GRASS:0,WALL:6,DIRT:1,COBBLE:2,
 terr:new Uint8Array(140),baseTerr:new Uint8Array(140),features:[{kind:'route',road:'Route 3',pts:[[0,4],[14,4]]}]});
for(let y=0;y<10;y++)for(let x=5;x<14;x++)desertTest.c.terr[y*14+x]=desertTest.c.baseTerr[y*14+x]=11;
vm.runInContext(groundCode.slice(groundCode.indexOf('function inDesert('),groundCode.indexOf('function groundTile(')),desertTest.c);
desertTest.listeners.pointerdown();await desertTest.advance();
await desertTest.change('world','Emberfell',4.99,4.5);
assert(desertTest.track('Desert').paused,'last grass tile must not start desert music even beside sand');
assert(!desertTest.track('Field').paused);
await desertTest.change('world','Emberfell',5,4.5);
assert(!desertTest.track('Desert').paused,'first sand tile starts Desert');assert(desertTest.track('Field').paused);
const starts=desertTest.track('Desert').plays;
await desertTest.change('world','Emberfell',7,4.5);assert.equal(desertTest.track('Desert').plays,starts,'crossing sand keeps a continuous song');
desertTest.c.features.push({kind:'area',label:'Sandspire',x0:9,y0:2,x1:12,y1:7});
await desertTest.change('world','Emberfell',9,4.5);assert(!desertTest.track('Sandspire').paused);assert(desertTest.track('Desert').paused);
const townStarts=desertTest.track('Sandspire').plays;
await desertTest.change('house_desert','Sandspire — A home');assert.equal(desertTest.track('Sandspire').plays,townStarts,'town interiors keep the same loop');
await desertTest.change('ds1','Sandspire Temple');assert(!desertTest.track('Temple').paused);assert(desertTest.track('Sandspire').paused);
await desertTest.change('world','Emberfell',8.99,4.5);assert(!desertTest.track('Desert').paused);
await desertTest.change('world','Emberfell',4.99,4.5);assert(desertTest.track('Desert').paused);assert(!desertTest.track('Field').paused);
console.log('PASS: Desert begins at the first sand tile, never on adjacent grass; Sandspire and its homes share their own continuous song, temples keep Spooky Cave, and leaving restores the road track.');

for(const file of ['desert-route-loop.wav','sandspire-town-loop.wav','school-loop.wav','tavern-loop.wav']){
 const b=fs.readFileSync(new URL('../assets/audio/'+file,import.meta.url));
 const channels=b.readUInt16LE(22),rate=b.readUInt32LE(24),data=b.subarray(44);
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(34),16);
 for(let ch=0;ch<channels;ch++)assert(Math.abs(data.readInt16LE(ch*2)-data.readInt16LE(data.length-channels*2+ch*2))/32768<.012,'no click at '+file+' wrap');
 const window=Math.floor(rate*channels*.1);
 for(let i=0;i+window<=data.length/2;i+=window){let power=0;for(let j=0;j<window;j++)power+=(data.readInt16LE((i+j)*2)/32768)**2;assert(Math.sqrt(power/window)>.005,'no silent loop padding in '+file);}
}
console.log('PASS: both delivered PCM loops have continuous joins and no silent encoder padding.');

const interiors=setup();interiors.listeners.pointerdown();await interiors.advance();
await interiors.change('school','Thornwell School — Reading Hall');assert(!interiors.track('School').paused);assert(interiors.track('Thornwell').paused);
const schoolStarts=interiors.track('School').plays;
await interiors.change('school2','Thornwell School — Upper Study');assert.equal(interiors.track('School').plays,schoolStarts,'going upstairs never restarts school music');
await interiors.change('tavern','The Copper Cup — Thornwell Tavern');assert(!interiors.track('Tavern').paused);assert(interiors.track('School').paused);assert(interiors.track('Thornwell').paused);
await interiors.change('inn','Thornwell Inn');assert(!interiors.track('Thornwell').paused);assert(interiors.track('Tavern').paused);
console.log('PASS: School loops continuously across both floors; Tavern uses its own track; other town interiors restore Thornwell.');

const castle=setup();castle.listeners.pointerdown();await castle.advance();
for(const id of ['royal_entry','royal_hall','royal_treasury','royal_seal','cinderhold']){
 await castle.change(id,'Cinderhold — Castle');assert(!castle.track('Cinderhold').paused,id+' plays castle music');
}
assert.equal(castle.track('Cinderhold').plays,1,'Room transitions keep the same continuous loop');
castle.c.lastFight=1;castle.sync();await castle.advance();assert(!castle.track('Villain').paused);assert(castle.track('Cinderhold').paused);
castle.c.wonAll=true;castle.sync();await castle.advance();assert(!castle.track('Cinderhold').paused,'Victory restores castle music');
for(const [id,title,x,y] of [['world','Cinderhold',1400,120],['world','Ashcrag',1300,200],['mine2','Forgewick Mine'],['house22','Millwood — Maddock’s House'],['inn','Thornwell Inn']]){
 await castle.change(id,title,x,y);assert(castle.track('Cinderhold').paused,'Castle music stops in '+id+' '+title);
}
console.log('PASS: Cinderhold loop stays inside castle rooms, yields to final battle music, resumes after victory and stops on exit.');

const coast=setup();coast.c.features=[{kind:'route',style:'blossom',pts:[[100,100],[200,100],[200,200]]},{kind:'area',label:'Coralmere',x0:190,y0:190,x1:220,y1:220}];
coast.c.inSwamp=(x,y)=>x>=230;coast.listeners.pointerdown();await coast.advance();
await coast.change('world','Road',87,100);assert(coast.track('Seatown').paused,'Before blossoms keeps prior song');
await coast.change('world','Blossom road',88,101);assert(!coast.track('Seatown').paused,'First blossom band starts Seatown');
const coastStarts=coast.track('Seatown').plays;
await coast.change('world','Coralmere',200,200);assert.equal(coast.track('Seatown').plays,coastStarts,'Entering Coralmere keeps the song');
await coast.change('house_coast','Coralmere — Home');assert.equal(coast.track('Seatown').plays,coastStarts);
await coast.change('world','Swamp',230,200);assert(coast.track('Seatown').paused);assert(!coast.track('Mystic').paused,'Swamp keeps Mystic Forest');
await coast.change('world','Blossom road',200,150);assert(!coast.track('Seatown').paused);
await coast.change('royal_entry','Cinderhold');assert(coast.track('Seatown').paused);assert(!coast.track('Cinderhold').paused);
console.log('PASS: Seatown follows blossom roads and Coralmere interiors continuously, yields to swamp, and never follows into Cinderhold.');

const steady=setup(null,true);steady.listeners.touchstart();await steady.advance();
let gainWrites=0,mediaWrites=0;
for(const a of steady.elements.values()){
 const source=steady.contexts[0].sources.get(a);let n=source?.next;
 while(n){if(n.gain){let value=n.gain.value;Object.defineProperty(n.gain,'value',{configurable:true,get:()=>value,set:v=>{gainWrites++;value=v;}});}n=n.next;}
 Object.defineProperty(a,'volume',{configurable:true,get:()=>1,set(){mediaWrites++;}});
}
const steadyStarts=steady.track('Millwood').plays;
for(let i=0;i<30;i++){steady.listeners.pointerdown();steady.listeners.touchstart();steady.listeners.keydown();}
assert.equal(gainWrites,0,'A/touch gestures never rewrite the running music gain');
assert.equal(mediaWrites,0,'A/touch gestures never reset media output volume');
assert.equal(steady.track('Millwood').plays,steadyStarts,'Repeated presses never restart the music');
steady.contexts[0].state='interrupted';steady.listeners.touchstart();await steady.advance();assert.equal(steady.contexts[0].state,'running','Interrupted iPhone audio still recovers');
console.log('PASS: repeated A/touch gestures do not touch music gains, media volumes or playback; interruption recovery still works.');

const pacing=setup();pacing.listeners.pointerdown();await pacing.advance();pacing.c.window.EmberKingMusic.start();await pacing.advance();
pacing.c.window.EmberKingMusic.stop();await pacing.advance(300);assert.equal(pacing.track('Millwood').volume,0,'Pause before Millwood returns');
await pacing.advance(1000);assert(pacing.track('Millwood').volume>0&&pacing.track('Millwood').volume<.35*.85*.5,'Millwood returns gradually after Halvard');
await pacing.advance(2400);assert.equal(pacing.track('Millwood').volume,.35*.85);
console.log('PASS: all output is 15% quieter; Millwood waits briefly then fades in over 3.2 seconds after the King.');

const recovery=setup(null,true,true);recovery.listeners.touchstart();await recovery.advance();
assert(!recovery.track('Millwood').paused,'Startup song plays directly without waiting for a decoded buffer');
await recovery.change('school','Thornwell School');await recovery.advance();
assert(!recovery.track('School').paused,'Failed loop decode falls back to media playback');
assert.equal(recovery.audible(recovery.track('School')),.35*.85,'Fallback honors the same music gain');
console.log('PASS: startup uses immediate media playback; failed buffered loops recover audibly with the shared mixer.');

// Newly supplied regional tracks take priority over the general road fallback.
const regions=setup();regions.listeners.pointerdown();await regions.advance();
for(const id of ['mine','mine2','mine3','mine4','mine5']){await regions.change(id,'Forgewick Mine');assert.equal(regions.track('Mine').paused,false,id);}
regions.c.inWinter=(x,y)=>x===1200;
await regions.change('world','Snow route',1200,100);assert.equal(regions.track('SnowRoute').paused,false);assert(regions.track('Mine').paused);
regions.c.features.push({kind:'area',label:'Hollybeck',x0:1190,x1:1210,y0:90,y1:110});
await regions.change('world','Hollybeck',1200,100);assert.equal(regions.track('Hollybeck').paused,false);assert(regions.track('SnowRoute').paused);
await regions.change('world','Ashcrag',1350,180);assert.equal(regions.track('LavaRoute').paused,false);assert(regions.track('Hollybeck').paused);
await regions.change('royal_hall','Cinderhold Hall');assert.equal(regions.track('Cinderhold').paused,false);assert(regions.track('LavaRoute').paused);
console.log('PASS: all mine floors, snow route, Hollybeck override, lava route and castle boundary.');

const themed=setup();themed.listeners.pointerdown();await themed.advance();
for(const [id,title]of [['shroom','Mushroom Cave'],['spore_home','Sporehollow']]){await themed.change(id,title);assert(!themed.track('Spores').paused);}
themed.c.features=world.features;await themed.change('world','Spore forest',30,170);assert(!themed.track('Spores').paused);await themed.change('world','Sporehollow',95,77);assert(!themed.track('Spores').paused);await themed.change('world','Elder woods',45,374);assert(!themed.track('Millwood').paused);
themed.c.gameplayStarted=false;themed.sync();await themed.advance();assert(!themed.elements.get('lastDragonriderTitleBgm').paused);
themed.c.gameplayStarted=true;await themed.change('house22','Millwood — Maddock');assert(themed.elements.get('lastDragonriderTitleBgm').paused);
themed.c.window.EmberEndingMusic.start();await themed.advance();assert(!themed.elements.get('lastDragonriderTitleBgm').paused);themed.c.window.EmberEndingMusic.stop();await themed.advance();assert(themed.elements.get('lastDragonriderTitleBgm').paused);
console.log('PASS: mushroom forest/cave/hollow, elder woods, title screen and ending transitions.');

const cinematic=setup();cinematic.c.gameplayStarted=false;cinematic.sync();cinematic.listeners.pointerdown();await cinematic.advance();
assert(cinematic.elements.get('lastDragonriderTitleBgm').paused,'Incidental loading taps do not start title music');
cinematic.c.window.EmberTitleAudio.begin();await cinematic.advance();
const titleTrack=cinematic.elements.get('lastDragonriderTitleBgm');assert(!titleTrack.paused);
const fadingTitle=cinematic.c.window.EmberTitleAudio.fadeOut(1200);await cinematic.advance(600);assert(titleTrack.volume>0&&titleTrack.volume<.35*.85);
cinematic.sync();await cinematic.advance(650);await fadingTitle;assert(titleTrack.paused);
await cinematic.advance(550);cinematic.sync();assert([...cinematic.elements.values()].every(a=>a.paused),'Silent beat stays silent despite region checks');
const fadingGame=cinematic.c.window.EmberTitleAudio.fadeIn();await cinematic.advance(700);assert(!cinematic.track('Millwood').paused);assert(cinematic.track('Millwood').volume<.35*.85);assert(titleTrack.paused);
await cinematic.advance(1000);await fadingGame;assert.equal(cinematic.c.gameplayStarted,false,'Music precedes gameplay');
cinematic.c.gameplayStarted=true;cinematic.c.window.EmberTitleAudio.finish();assert(titleTrack.paused);
console.log('PASS: title fades out, region checks preserve silence, and gameplay music fades in before controls unlock.');

const gesture=setup(null,true);gesture.c.gameplayStarted=false;gesture.sync();
gesture.listeners.pointerdown();assert.equal(gesture.contexts.length,0,'No AudioContext before Begin');
gesture.c.window.EmberTitleAudio.begin();
const gestureTitle=gesture.elements.get('lastDragonriderTitleBgm');
assert.equal(gestureTitle.plays,1,'Title play is called synchronously within Begin');
assert(gesture.contexts[0].sources.has(gestureTitle),'Title streams through the shared iPhone gain');
assert.equal(gesture.contexts[0].state,'running');await gesture.advance();assert(gesture.audible(gestureTitle)>0);
console.log('PASS: Begin synchronously resumes audio and plays streamed title music through the iPhone volume mixer.');
