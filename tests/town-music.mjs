import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
function setup(stored=null){
 const elements=new Map(),timeouts=[],listeners={};let sync;
 const c=vm.createContext({MAPID:'house26',MD:{title:'Millwood — The Hearth House'},P:{x:24*16,y:430*16},TS:16,
 features:[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}],
 document:{hidden:false,getElementById:id=>{if(!elements.has(id))elements.set(id,{id,paused:true,volume:1,currentTime:17,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;}});return elements.get(id);}},
 localStorage:{getItem:()=>stored,setItem:(k,v)=>{stored=v;}},setTimeout:f=>timeouts.push(f),setInterval:f=>{sync=f;},window:{addEventListener:(k,f)=>{listeners[k]=f;}}});
 vm.runInContext(read('js/audio.js'),c);
 const finish=()=>{while(timeouts.length)timeouts.shift()();};
 const change=(map,title,x,y)=>{c.MAPID=map;c.MD={title};if(x!==undefined)c.P={x:x*16,y:y*16};sync();finish();};
 const track=name=>elements.get('emberfell'+name+'Bgm');
 return {c,track,change,finish,listeners};
}
const {c,track,change,finish,listeners}=setup();finish();
assert.equal(c.window.EmberAudio.percent(),35,'new players start at the intended volume');listeners.pointerdown();
assert.equal(track('Millwood').paused,false,'starting in Corin’s house plays Millwood music');
assert.equal(track('Millwood').volume,.35);
change('world','Emberfell',30,430);assert.equal(track('Millwood').paused,false,'town exterior uses the same track');
assert.equal(track('Millwood').currentTime,17,'moving between house and town keeps the song’s place');
change('world','Emberfell',500,500);assert.equal(track('Millwood').paused,true,'song stops outside Millwood');
change('house22','Millwood — Maddock’s House');assert.equal(track('Millwood').paused,false);
c.window.EmberKingMusic.start();finish();assert.equal(track('Villain').paused,false);assert.equal(track('Millwood').paused,true,'king scenes keep priority');
c.window.EmberKingMusic.stop();finish();assert.equal(track('Millwood').paused,false);
c.window.EmberKingMusic.start();c.window.EmberAudio.set(0);finish();
for(const name of ['Millwood','Villain','HomeTown','Battle'])assert.equal(track(name).paused,true,'mute cancels crossfades');
c.window.EmberKingMusic.stop();c.window.EmberAudio.set(50);assert.equal(track('Millwood').paused,false);assert.equal(track('Millwood').volume,.5);
// Published town moves change the music boundary with the town.
c.features[0]={kind:'area',label:'Millwood',x0:100,y0:100,x1:120,y1:120};
change('world','Emberfell',110,110);assert.equal(track('Millwood').paused,false);
change('world','Emberfell',30,430);assert.equal(track('Millwood').paused,true);
const muted=setup('0');muted.finish();muted.listeners.pointerdown();assert.equal(muted.c.window.EmberAudio.percent(),0);assert.equal(muted.track('Millwood').paused,true,'an intentional saved mute stays muted');
const html=read('index.html'),tag=html.match(/<audio id="emberfellMillwoodBgm"[^>]+>/)?.[0];
assert(tag);assert.match(tag,/\bloop\b/);assert.match(tag,/preload="none"/);assert.match(tag,/src="assets\/audio\/millwood-rustic-town.m4a\?/);
const music=fs.readFileSync(new URL('../assets/audio/millwood-rustic-town.m4a',import.meta.url));
assert.equal(music.toString('ascii',4,8),'ftyp');assert(music.length<850000,'compact file stays below 850 KB');
console.log('PASS: Millwood and its houses, town edits, region changes, king priority, looping, volume, saved mute and lazy audio loading.');
