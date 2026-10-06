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
 assert.equal(run('portraitFor("Corin").src'),'assets/portraits/corin-hair.webp?v=20261006-player');
 assert.notEqual(run('portraitFor("Aurelius").id'),run('portraitFor("Corin").id'));
}
for(const [column,hair] of ['brown','copper','blond','silver'].entries()){
 id.restore({name:'Kurtis',hair});run('smithUpgrade=false');assert.equal(run('portraitFor("Corin").cell'),column);
 run('smithUpgrade=true');assert.equal(run('portraitFor("Corin").cell'),column+4);
 const source=new Uint8ClampedArray([77,57,69,255,225,178,110,255,85,45,36,255,74,67,91,255,77,57,69,0]);
 assert.equal(id.recolorPixels(source,hair),1);assert.notDeepEqual([...source.slice(0,3)],[77,57,69]);
 assert.deepEqual([...source.slice(4)],[225,178,110,255,85,45,36,255,74,67,91,255,77,57,69,0],'Skin, clothing, armor and alpha untouched');
 const riding=new Uint8ClampedArray([76,58,69,255,222,25,24,255,225,178,110,255]);assert.equal(id.recolorPixels(riding,hair,true),1);assert.deepEqual([...riding.slice(4)],[222,25,24,255,225,178,110,255]);
}
run(`mode='play';gameplayStarted=true;quest=Q.DONE;MAPID='house26';MD=W.maps.house26;scene=null;sayNpc=null;foes=[];`);
id.restore({name:'Kurtis',hair:'silver'});assert(run('saveToSlot(1,true)'));
id.restore({name:'Corin Junior',hair:'blond'});assert(run('saveToSlot(2,true)'));
assert(run('loadGame(1)'));assert.equal(id.capture().name,'Kurtis');assert.equal(id.capture().hair,'silver');
assert.match(run('saveSummary(2)'),/Corin Junior/);
assert(run('loadGame(2)'));assert.equal(id.capture().name,'Corin Junior');assert.equal(id.capture().hair,'blond');
run('localStorage.setItem(saveKey(3),JSON.stringify({...captureSave(),playerIdentity:undefined}));loadGame(3)');
assert.equal(id.capture().name,'Corin');assert.equal(id.capture().hair,'dark');assert.equal(run('portraitFor("Corin").pack'),8);
const chapters={window:{}};vm.runInNewContext(fs.readFileSync('js/prologue-chapters.js','utf8'),chapters);
const shots=chapters.window.EmberPrologueChapters;
assert.equal(shots.length,13);assert.equal(shots.reduce((n,s)=>n+s.duration,0),67500);
for(const shot of shots)assert(fs.existsSync('assets/prologue/'+shot.image+'.webp'));
for(const key of ['01-seven-riders','02-wingfall','15-wingfall-temple'])assert.match(shots.find(s=>s.image===key).alt,/two-headed blue dragon/);
assert(!shots.some(s=>s.image.includes('winter-bosses')),'Intro preserves the surprise encounter');
console.log('PASS: names, canonical speakers, hair portraits/armor, pixel isolation, save slots, legacy saves, and half-length prologue.');
