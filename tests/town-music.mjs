import fs from 'node:fs';import zlib from 'node:zlib';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),html=read('index.html');
function setup(stored=null,ios=false){
 const elements=new Map(),timers=[],listeners={};let sync,now=0;
 const attrs=new Map([...html.matchAll(/<audio id="([^"]+)"([^>]*>)([\s\S]*?)<\/audio>/g)].map(m=>[m[1],(m[2]+m[3]).match(/src="([^"]*)"/)?.[1]||'']));
 const c=vm.createContext({mode:'play',quest:0,Q:{NOISE:5,ARMED:6,DONE:9},dragonJourneyEnded:false,dragonIntroDone:false,saveGame(){},MAPID:'house26',MD:{title:'Millwood — The Hearth House'},P:{x:24*16,y:430*16},TS:16,
 wonAll:false,lastFight:0,scene:null,sayNpc:null,features:[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}],
 document:{hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,{id,src:attrs.get(id),paused:true,volume:1,currentTime:17,plays:0,
  getAttribute(k){return k==='src'?this.src:null;},querySelector(){return null;},
  play(){this.plays++;if(this.waitForPlay)return new Promise(resolve=>{this.finishPlay=()=>{this.paused=false;resolve();};});this.paused=false;return Promise.resolve();},pause(){this.paused=true;}});return elements.get(id);}},
 localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v;}},Date:{now:()=>now},setTimeout:(f,ms)=>timers.push({f,at:now+ms}),setInterval:f=>{sync=f;},window:{addEventListener:(k,f)=>{listeners[k]=f;}}});
 const contexts=[];
 if(ios){
  const node=()=>({gain:{value:1,cancelScheduledValues(){},setTargetAtTime(v){this.value=v;}},connect(other){this.next=other;}});
  c.window.AudioContext=class{
   constructor(){this.state='suspended';this.currentTime=0;this.destination={};this.sources=new Map();this.resumes=0;contexts.push(this);}
   createGain(){return node();}
   createMediaElementSource(a){assert(!this.sources.has(a),'One source per audio element');const source=node();source.gain=null;this.sources.set(a,source);return source;}
   resume(){this.resumes++;this.state='running';return Promise.resolve();}
  };
  const get=c.document.getElementById;
  c.document.getElementById=id=>{const a=get(id);Object.defineProperty(a,'volume',{configurable:true,get:()=>1,set(){}});return a;};
 }
 const audible=a=>{
  if(a.paused)return 0;let level=a.volume,n=contexts[0]?.sources.get(a);
  while(n){if(n.gain)level*=n.gain.value;n=n.next;}return level;
 };
 vm.runInContext(read('js/audio.js'),c);
 const advance=async(ms=1000)=>{for(let i=0;i<5;i++)await Promise.resolve();const until=now+ms;while(timers.some(t=>t.at<=until)){timers.sort((a,b)=>a.at-b.at);const t=timers.shift();now=t.at;t.f();await Promise.resolve();}now=until;await Promise.resolve();};
 const change=async(map,title,x,y)=>{c.MAPID=map;c.MD={title};if(x!==undefined)c.P={x:x*16,y:y*16};sync();await advance();};
 return {c,track:name=>elements.get('emberfell'+name+'Bgm'),elements,change,advance,listeners,sync,contexts,audible,getStored:()=>stored};
}
const {c,track,elements,change,advance,listeners,sync,getStored}=setup();
assert.equal(c.window.EmberAudio.percent(),35);assert([...elements.values()].every(a=>a.paused),'No autoplay before a gesture');
listeners.pointerdown();await advance();assert.equal(track('Millwood').paused,false);assert.equal(track('Millwood').volume,.35);
for(const [map,title,x,y]of [['world','Northern Woods',30,390],['world','Elder’s clearing',50,370],['shroom','Mushroom cave'],['world','Unknown road',500,500],['royal_entry','Cinderhold entry'],['mine2','Forgewick Mine'],['witch_room','Witchmoor']]){
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
c.wonAll=true;sync();await advance();assert.equal(track('Millwood').paused,false,'Victory restores the default');c.wonAll=false;c.lastFight=0;
await change('world','Emberfell',30,430);
// Royal music cuts the outgoing track immediately, including while buffering.
track('Villain').waitForPlay=true;c.window.EmberKingMusic.start();
assert.equal(track('Millwood').volume,0);assert(track('Millwood').paused);assert.equal(track('Villain').volume,.35);
assert.equal(track('Villain').currentTime,0,'Every royal interruption starts on its opening beat');
track('Villain').finishPlay();await advance(1);
assert.equal(track('Villain').volume,.35,'The opening beat is never faded in');
listeners.pointerdown();listeners.touchstart();assert.equal(track('Villain').volume,.35);
c.window.EmberAudio.set(70);assert.equal(track('Villain').volume,.7);assert.equal(getStored(),'70');
// Reverse a transition in flight; no third track or abandoned fade remains.
c.window.EmberKingMusic.stop();await advance();assert.equal(track('Millwood').volume,.7);assert.equal(track('Villain').volume,0);assert(track('Villain').paused);
c.window.EmberKingMusic.start();c.window.EmberAudio.set(0);track('Villain').finishPlay();await advance();
assert([...elements.values()].every(a=>a.paused&&a.volume===0),'Mute wins over a pending play and all scheduled fades');
track('Villain').waitForPlay=false;c.window.EmberKingMusic.stop();c.window.EmberAudio.set(50);await advance();assert.equal(track('Millwood').volume,.5);assert.equal(track('Millwood').paused,false);
// Thornwell uses its installed track, including the town interiors.
await change('tavern','Thornwell Tavern');assert.equal(track('Thornwell').paused,false);assert(track('Millwood').paused);
await change('house22','Millwood — Maddock’s House');assert.equal(track('Millwood').paused,false);assert(track('Thornwell').paused);
const muted=setup('0');muted.listeners.pointerdown();await muted.advance();assert([...muted.elements.values()].every(a=>a.paused),'Saved mute survives reload');
for(const [name,path,max]of [['Millwood','millwood-rustic-town.m4a',850000],['Villain','kings-villain-theme.m4a',900000],['Field','intertown-field.m4a',1350000],['Thornwell','thornwell-shop.m4a',1600000]]){
 const tag=html.match(new RegExp('<audio id="emberfell'+name+'Bgm"[^>]+>'))?.[0];assert(tag);assert.match(tag,/\bloop\b/);assert.match(tag,name==='Villain'?/preload="auto"/:/preload="none"/);assert(tag.includes('assets/audio/'+path));
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
  await routes.change('world','Emberfell',x,y);assert(!routes.track('Field').paused,'Route '+road.id+' leg '+i+' uses The Field');routeSamples++;
 }
}
for(const name of ['Millwood','Thornwell','Forgewick','Sandspire','Coralmere','Hollybeck']){
 const town=world.features.find(f=>f.kind==='area'&&f.label===name);
 await routes.change('world','Emberfell',(town.x0+town.x1)/2,(town.y0+town.y1)/2);
 assert(routes.track('Field').paused,name+' town does not inherit route music');assert(!routes.track(name==='Thornwell'?'Thornwell':'Millwood').paused);
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
phone.listeners.touchstart();await phone.advance();assert.equal(phone.contexts.length,1);assert.equal(volume(),.35);
for(const pct of [1,100,25,75,0,1]){
 phone.c.window.EmberAudio.set(pct);await phone.advance();
 assert.equal(phone.track('Millwood').volume,1,'iPhone keeps the media property at 100%');
 assert(Math.abs(volume()-pct/100)<1e-9,'Connected output really changes to '+pct+'%');
}
phone.c.window.EmberAudio.set(100);await phone.advance();phone.c.window.EmberKingMusic.start();await phone.advance(450);
const out=phone.audible(phone.track('Millwood')),incoming=phone.audible(phone.track('Villain'));
assert.equal(out,0,'iPhone stops Millwood immediately');assert.equal(incoming,1,'iPhone king opening beat plays at full configured volume');
phone.listeners.touchstart();assert.equal(phone.audible(phone.track('Villain')),incoming,'Tapping does not bypass the gain fade');
phone.c.window.EmberAudio.set(1);assert(Math.abs(phone.audible(phone.track('Villain'))-incoming*.01)<1e-9,'Volume applies to both sides of the fade');
phone.c.window.EmberAudio.set(0);await phone.advance();assert([...phone.elements.values()].every(a=>phone.audible(a)===0&&a.paused));
phone.contexts[0].state='interrupted';phone.listeners.touchstart();assert.equal(phone.contexts[0].state,'running','A fresh gesture resumes interrupted iPhone audio');assert.equal(phone.contexts.length,1,'Gestures reuse one mixer');
const savedPhone=setup('1',true);savedPhone.listeners.pointerdown();await savedPhone.advance();assert.equal(savedPhone.audible(savedPhone.track('Millwood')),.01,'Saved volume controls iPhone output after reload');
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
  assert(!hunt.track('Field').paused,'Hunting path '+road.id+' segment '+i+' keeps route music');huntSamples++;
 }
}
assert.equal(hunt.track('Field').plays,1,'moving among hunting paths never restarts the route song');
for(const [id,map]of Object.entries(JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)"/)[1],'base64'))).maps)){
 if(id!=='world'&&map.title?.startsWith('Thornwell')){
  await hunt.change(id,map.title);assert(!hunt.track('Thornwell').paused,id+' plays Thornwell music');
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
assert(Math.abs(journey.audible(journey.track('DragonReveal'))-.35*.7)<1e-9,'Reveal retains its quieter iPhone mixer level');
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
