import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),html=read('index.html');
function setup(stored=null){
 const elements=new Map(),timers=[],listeners={};let sync,now=0;
 const attrs=new Map([...html.matchAll(/<audio id="([^"]+)"([^>]*>)([\s\S]*?)<\/audio>/g)].map(m=>[m[1],(m[2]+m[3]).match(/src="([^"]*)"/)?.[1]||'']));
 const c=vm.createContext({MAPID:'house26',MD:{title:'Millwood — The Hearth House'},P:{x:24*16,y:430*16},TS:16,
 wonAll:false,lastFight:0,scene:null,sayNpc:null,features:[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}],
 document:{hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,{id,src:attrs.get(id),paused:true,volume:1,currentTime:17,plays:0,
  getAttribute(k){return k==='src'?this.src:null;},querySelector(){return null;},
  play(){this.plays++;if(this.waitForPlay)return new Promise(resolve=>{this.finishPlay=()=>{this.paused=false;resolve();};});this.paused=false;return Promise.resolve();},pause(){this.paused=true;}});return elements.get(id);}},
 localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v;}},Date:{now:()=>now},setTimeout:(f,ms)=>timers.push({f,at:now+ms}),setInterval:f=>{sync=f;},window:{addEventListener:(k,f)=>{listeners[k]=f;}}});
 vm.runInContext(read('js/audio.js'),c);
 const advance=async(ms=1000)=>{for(let i=0;i<5;i++)await Promise.resolve();const until=now+ms;while(timers.some(t=>t.at<=until)){timers.sort((a,b)=>a.at-b.at);const t=timers.shift();now=t.at;t.f();await Promise.resolve();}now=until;await Promise.resolve();};
 const change=async(map,title,x,y)=>{c.MAPID=map;c.MD={title};if(x!==undefined)c.P={x:x*16,y:y*16};sync();await advance();};
 return {c,track:name=>elements.get('emberfell'+name+'Bgm'),elements,change,advance,listeners,sync,getStored:()=>stored};
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
for(const [name,path,max]of [['Millwood','millwood-rustic-town.m4a',850000],['Villain','kings-villain-theme.m4a',900000]]){
 const tag=html.match(new RegExp('<audio id="emberfell'+name+'Bgm"[^>]+>'))?.[0];assert(tag);assert.match(tag,/\bloop\b/);assert.match(tag,/preload="none"/);assert(tag.includes('assets/audio/'+path));
 const music=fs.readFileSync(new URL('../assets/audio/'+path,import.meta.url));assert.equal(music.toString('ascii',4,8),'ftyp');assert(music.length<max);
}
console.log('PASS: default music covers unassigned areas; actual royal speakers and both final battle phases get the King’s theme; empty tracks never play; buffer-aware fades, repeated taps, volume changes, interrupted fades, mute, saved volume and future town songs work.');
