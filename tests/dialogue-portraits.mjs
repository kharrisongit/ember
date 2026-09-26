import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const scripts=[],images=[];
const face={style:{},dataset:{},removeAttribute(){delete this.dataset.speaker;}};
const c=vm.createContext({console,Map,Image:class {constructor(){images.push(this);}},
  faceEl:face,nameEl:{},shownFace:-1,typeWho:'',SPR:{},
  editorNpcKey:n=>n.editKey||'npc:'+n.n,
  document:{head:{appendChild:s=>scripts.push(s)},createElement:()=>({remove(){}})}});
c.window=c;
const run=s=>vm.runInContext(s,c);
run(read('assets/portraits/manifest.js'));
run(read('js/dialogue-portraits.js'));
const cast=JSON.parse(read('assets/portraits/cast.json'));
assert.equal(new Set(cast.map(n=>n.name)).size,131);
assert(cast.every(n=>run(`portraitFor(${JSON.stringify(n.name)})`)?.id===n.id));
for(let pack=1;pack<=7;pack++){
  run(read('assets/portraits/pack-'+pack+'.js'));
  const source=run(`portraitPackSources.get(${pack})`);
  const bytes=Buffer.from(source.split(',')[1],'base64');
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
}
// A late image must never resurrect a closed or different speaker's portrait.
run("typeWho='Nan Ferrow'; showDialoguePortrait('Nan Ferrow')");
assert.equal(c.nameEl.className,'on right');
run('showDialoguePortrait(null)');
assert.equal(c.nameEl.className,'');
scripts.at(-1).onload();images.at(-1).onload();await Promise.resolve();
assert.equal(face.style.display,'none');
assert.equal(c.nameEl.className,'');
run("showDialoguePortrait('Aurelius');showDialoguePortrait('Corin')");
scripts[0].onload();images.at(-1).onload();await Promise.resolve();
assert.equal(face.dataset.speaker,'Corin');assert.equal(face.className,'right');
assert.equal(face.style.display,'block');
run("showDialoguePortrait('Unknown traveller')");assert.equal(face.style.display,'none');
assert.equal(run("portraitFor('Pip').id"),10);
assert.equal(run("portraitFor('Puck').id"),119);
assert.equal(run("portraitFor('Maddock').id"),9);
// Renaming retains the identity addressed by old editor publications.
c.map={npcs:[{n:'Tessa',d:['Tessa: Hello.','Corin: Hello.']}]};
run("prepareDialoguePortraitCast(map,'school')");
assert.equal(c.map.npcs[0].n,'Tamsin');assert.equal(c.map.npcs[0].editKey,'npc:Tessa');
assert.equal(c.map.npcs[0].portraitOriginalName,'Tessa');
assert.equal(c.map.npcs[0].d[0],'Tamsin: Hello.');
run("prepareDialoguePortraitCast(map,'school')");assert.equal(c.map.npcs.length,1);
c.map={npcs:[{n:'Chanter'},{n:'Morel'},{n:'Pip'}]};
run("prepareDialoguePortraitCast(map,'world')");
assert(c.map.npcs.slice(0,2).every(n=>n.editorDeleted&&n.noTalk));
assert(!c.map.npcs[2].editorDeleted);
// The editor's server-side validation has no DOM head or image loader.
c.document.head=undefined;
assert.equal(await run('loadPortraitPack(7)'),null);
// Closing mid-sentence must stop the typewriter from restoring the name.
const game=read('js/generated/game-part-2.js');
run(game.slice(game.indexOf('const TYPE_CPS ='),game.indexOf('\nfunction showScene()')));
run(game.slice(game.indexOf('function sayOff()'),game.indexOf('\nlet sayNpc =')));
c.sayEl={classList:{remove(){}},style:{},innerHTML:''};
c.esc=s=>s;c.setDialogueTone=()=>{};
run("typeStart('Nan Ferrow','A sentence still being typed.'); stepType(0.1); sayOff(); stepType(1)");
assert.equal(c.nameEl.textContent,'');
assert.equal(c.nameEl.className,'');
assert.equal(face.style.display,'none');
assert.equal(run('typeDone()'),true);
run("typeStart('Corin','Next conversation.');typeAll();showFace('Corin')");
assert.equal(c.nameEl.textContent,'Corin');
assert.equal(c.nameEl.className,'on left');
console.log('PASS: all 131 portraits, unique names, valid image packs, exact aliases, delayed image cancellation, stable rename identities and mushroom-only village.');

c.smithUpgrade=true;assert.equal(c.portraitFor("Corin").pack,8);c.smithUpgrade=false;assert.equal(c.portraitFor("Corin").pack,1);
run(read("assets/portraits/pack-8.js"));assert(run("portraitPackSources.get(8).startsWith('data:image/webp;base64,')"));

c.scene={hatch:true};run("showDialoguePortrait('Corin')");
assert.equal(face.style.display,'none','Hatching hides Corin’s portrait');
run("showDialoguePortrait('Maddock')");
assert.equal(face.style.display,'none','Hatching hides Maddock’s portrait');
c.scene=null;run("showDialoguePortrait('Corin')");
assert.equal(face.style.display,'block','Portraits resume outside hatching');
