import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
const id=c.EmberPlayerIdentity;
assert.equal(id.cleanName('  Éowyn   O’Neil!  '),'Éowyn O’Neil');
assert.equal(Array.from(id.cleanName('ABCDEFGHIJKLMNOPQRSTUV')).length,16);
assert.equal(id.normalize({name:'<>{}',hair:'bogus'}).name,'Corin');
assert.equal(id.normalize({name:'<>{}',hair:'bogus'}).hair,'dark');
for(const name of ['Rowan','Aurelius','Cor','Corin Junior','El Corin','李明','Anne-Marie']){
 id.restore({name,hair:'copper'});
 assert.equal(id.text('Hello, Corin. Corin’s home.'),`Hello, ${name}. ${name}’s home.`);
 assert.equal(id.text(id.text('Corin says hello.')),name+' says hello.','Repeated display translation is safe');
 run('typeStart("Corin","Hello, Corin.");typeAll()');
 assert.equal(run('typeWho'),'Corin','Speaker key remains canonical even with NPC name collision');
 assert.equal(run('nameEl.textContent'),name);
 assert.equal(run('typeFull'),`Hello, ${name}.`);
 assert.equal(run('portraitFor("Corin").hair'),'copper');
 assert.notEqual(run('portraitFor("Aurelius").id'),run('portraitFor("Corin").id'));
}
for(const [column,hair] of ['brown','copper','blond','silver'].entries()){
 id.restore({name:'Kurtis',hair});run('smithUpgrade=false');assert.equal(run('portraitFor("Corin").pack'),1);assert.equal(run('portraitFor("Corin").cell'),0);
 run('smithUpgrade=true');assert.equal(run('portraitFor("Corin").pack'),8);assert.equal(run('portraitFor("Corin").cell'),0);
 const source=new Uint8ClampedArray([77,57,69,255,225,178,110,255,85,45,36,255,74,67,91,255,77,57,69,0]);
 assert.equal(id.recolorPixels(source,hair),1);assert.notDeepEqual([...source.slice(0,3)],[77,57,69]);
 assert.deepEqual([...source.slice(4)],[225,178,110,255,85,45,36,255,74,67,91,255,77,57,69,0],'Skin, clothing, armor and alpha untouched');
 const riding=new Uint8ClampedArray([76,58,69,255,222,25,24,255,225,178,110,255]);assert.equal(id.recolorPixels(riding,hair,true),1);assert.deepEqual([...riding.slice(4)],[222,25,24,255,225,178,110,255]);
}
run(`mode='play';gameplayStarted=true;quest=Q.DONE;MAPID='house26';MD=W.maps.house26;scene=null;sayNpc=null;foes=[];`);
id.restore({name:'Kurtis',hair:'silver',eyes:'green'});assert(run('saveToSlot(1,true)'));
id.restore({name:'Corin Junior',hair:'blond'});assert(run('saveToSlot(2,true)'));
assert(run('loadGame(1)'));assert.equal(id.capture().name,'Kurtis');assert.equal(id.capture().eyes,'green');assert.equal(id.capture().hair,'silver');
assert.match(run('saveSummary(2)'),/Corin Junior/);
assert(run('loadGame(2)'));assert.equal(id.capture().name,'Corin Junior');assert.equal(id.capture().hair,'blond');
run('localStorage.setItem(saveKey(3),JSON.stringify({...captureSave(),playerIdentity:undefined}));loadGame(3)');
assert.equal(id.capture().name,'Corin');assert.equal(id.capture().hair,'dark');assert.equal(run('portraitFor("Corin").pack'),8);
const chapters={window:{}};vm.runInNewContext(fs.readFileSync('js/prologue-chapters.js','utf8'),chapters);
const shots=chapters.window.EmberPrologueChapters;
assert.equal(shots.length,9);assert.equal(shots.reduce((n,s)=>n+s.duration,0),42500);
assert.deepEqual(Array.from(shots).flatMap(s=>Array.from(s.lines)),["Fifty years ago, the skies over Emberfell belonged to dragons.", "Seven Riders kept the peace, and every town slept safe beneath their wings.", "Then came Wingfall. Halvard, the seventh, turned on his brothers and sisters.", "Six Riders fell in a single day, and the sky burned red.", "Halvard crowned himself King, and his dragon is the only one he allows to fly.", "Every dragon but his own is hunted down. The skies went quiet.", "Monsters crept into the silence and took the roads. Now no one travels far.", "No new Riders were chosen, because no dragons were left to choose them.", "For fifty years the skies have stayed empty, and the world has learned to stop looking up.", "But a new dawn has come, and something has answered the old call."]);
for(const shot of shots)assert(fs.existsSync('assets/prologue/'+shot.image+'.webp'));
for(const key of ['01-seven-riders','02-wingfall','15-wingfall-temple'])assert.match(shots.find(s=>s.image===key).alt,/two-headed blue dragon/);
assert(!shots.some(s=>s.image.includes('winter-bosses')),'Intro preserves the surprise encounter');
console.log('PASS: names, canonical speakers, hair portraits/armor, pixel isolation, save slots, legacy saves, and half-length prologue.');

assert.equal(id.normalize({eyes:'invalid'}).eyes,'blue');
for(const eyes of ['green','brown','hazel','gray']){const pixels=new Uint8ClampedArray([45,116,183,255,225,178,110,255,130,142,155,255]);assert.equal(id.recolorEyes(pixels,eyes),1);assert.deepEqual([...pixels.slice(4)],[225,178,110,255,130,142,155,255]);}
id.restore({name:'Rowan',eyes:'hazel'});assert.equal(id.text(shots.at(-1).lines.at(-1)), 'But a new dawn has come, and something has answered the old call.');
const boot=fs.readFileSync('js/generated/game-part-3.js','utf8');const start=boot.indexOf('async close({newGame=false}');assert(boot.indexOf('EmberPlayerIdentity.choose()',start)<boot.indexOf('EmberPrologue.play()',start),'Identity selection precedes the opening movie');

assert.equal(shots[6].title,'The roads fall');assert.equal(shots.at(-1).title,'A new dawn');
