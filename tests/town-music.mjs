import fs from 'node:fs';import zlib from 'node:zlib';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),html=read('index.html');
function setup(stored=null,ios=false){
 const elements=new Map(),timers=[],listeners={};let sync,now=0;
 const attrs=new Map([...html.matchAll(/<audio id="([^"]+)"([^>]*>)([\s\S]*?)<\/audio>/g)].map(m=>[m[1],(m[2]+m[3]).match(/src="([^"]*)"/)?.[1]||'']));
 const c=vm.createContext({MAPID:'house26',MD:{title:'Millwood — The Hearth House'},P:{x:24*16,y:430*16},TS:16,
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
for(const [map,title,x,y]of [['world','Northern Woods',30,390],['world','Elder’s clearing',50,370],['shroom','Mushroom cave'],['world','Unknown road',500,500],['tavern','Thornwell Tavern'],['royal_entry','Cinderhold entry'],['mine2','Forgewick Mine'],['witch_room','Witchmoor']]){
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
// Incoming audio may take time to buffer. Keep the old track until it plays.
track('Villain').waitForPlay=true;c.window.EmberKingMusic.start();await advance();
assert.equal(track('Millwood').volume,.35);assert.equal(track('Millwood').paused,false);assert.equal(track('Villain').volume,0);
track('Villain').finishPlay();await advance(450);
const half=track('Villain').volume;assert(half>.1&&half<.25);assert(track('Millwood').volume>0,'Both songs overlap during the fade');
listeners.pointerdown();listeners.touchstart();assert.equal(track('Villain').volume,half,'Further touches do not jump to full volume');
c.window.EmberAudio.set(70);assert.equal(track('Villain').volume,half*2,'Volume changes preserve the crossfade progress');
assert.equal(getStored(),'70');
// Reverse a transition in flight; no third track or abandoned fade remains.
c.window.EmberKingMusic.stop();await advance();assert.equal(track('Millwood').volume,.7);assert.equal(track('Villain').volume,0);assert(track('Villain').paused);
c.window.EmberKingMusic.start();c.window.EmberAudio.set(0);track('Villain').finishPlay();await advance();
assert([...elements.values()].every(a=>a.paused&&a.volume===0),'Mute wins over a pending play and all scheduled fades');
track('Villain').waitForPlay=false;c.window.EmberKingMusic.stop();c.window.EmberAudio.set(50);await advance();assert.equal(track('Millwood').volume,.5);assert.equal(track('Millwood').paused,false);
// A future town song wins when installed, while the remaining map keeps its fallback.
track('Thornwell').src='assets/audio/future-thornwell.m4a';await change('tavern','Thornwell Tavern');assert.equal(track('Thornwell').paused,false);assert(track('Millwood').paused);
await change('house22','Millwood — Maddock’s House');assert.equal(track('Millwood').paused,false);assert(track('Thornwell').paused);
const muted=setup('0');muted.listeners.pointerdown();await muted.advance();assert([...muted.elements.values()].every(a=>a.paused),'Saved mute survives reload');
for(const [name,path,max]of [['Millwood','millwood-rustic-town.m4a',850000],['Villain','kings-villain-theme.m4a',900000],['Field','intertown-field.m4a',1350000]]){
 const tag=html.match(new RegExp('<audio id="emberfell'+name+'Bgm"[^>]+>'))?.[0];assert(tag);assert.match(tag,/\bloop\b/);assert.match(tag,/preload="none"/);assert(tag.includes('assets/audio/'+path));
 const music=fs.readFileSync(new URL('../assets/audio/'+path,import.meta.url));assert.equal(music.toString('ascii',4,8),'ftyp');assert(music.length<max);
}
console.log('PASS: default music covers unassigned areas; actual royal speakers and both final battle phases get the King’s theme; empty tracks never play; buffer-aware fades, repeated taps, volume changes, interrupted fades, mute, saved volume and future town songs work.');

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
 assert(routes.track('Field').paused,name+' town does not inherit route music');assert(!routes.track('Millwood').paused);
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
assert(out>0&&out<1&&incoming>0&&incoming<1);assert(Math.abs(out+incoming-1)<1e-9,'iPhone crossfade keeps balanced output');
phone.listeners.touchstart();assert.equal(phone.audible(phone.track('Villain')),incoming,'Tapping does not bypass the gain fade');
phone.c.window.EmberAudio.set(1);assert(Math.abs(phone.audible(phone.track('Villain'))-incoming*.01)<1e-9,'Volume applies to both sides of the fade');
phone.c.window.EmberAudio.set(0);await phone.advance();assert([...phone.elements.values()].every(a=>phone.audible(a)===0&&a.paused));
phone.contexts[0].state='interrupted';phone.listeners.touchstart();assert.equal(phone.contexts[0].state,'running','A fresh gesture resumes interrupted iPhone audio');assert.equal(phone.contexts.length,1,'Gestures reuse one mixer');
const savedPhone=setup('1',true);savedPhone.listeners.pointerdown();await savedPhone.advance();assert.equal(savedPhone.audible(savedPhone.track('Millwood')),.01,'Saved volume controls iPhone output after reload');
console.log('PASS: With the iPhone media-volume restriction reproduced, 1% output is 1/100 of 100%; gain-based fades, mute, interruption recovery and saved volume work.');
