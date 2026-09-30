import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),console,{furniture:false});
run(`for(const [id,m]of Object.entries(W.maps)){prepareMarketNpcCast(m,id);prepareDialoguePortraitCast(m,id)}brambleQuest=1;quest=Q.DONE;templeCompass.owned=true;templeCompass.meatGiven=true;`);
// Include every actual resident, inside and outside, rather than a handpicked list.
const residents=run(`Object.entries(W.maps).flatMap(([map,m])=>(m.npcs||[]).filter(n=>!n.noTalk&&!n.pettable&&!n.editorDeleted&&!n.publishedDeleted&&n.n!=='Rowan the Hunter'&&(/Thornwell|Copper Cup/.test(m.title||'')||(map==='world'&&n.x>=220*TS&&n.x<=322*TS&&n.y>=44*TS&&n.y<=150*TS))).map(n=>({map,n})))`);
for(const {map,n}of residents){c.actor=n;c.mapId=map;run('MAPID=mapId;MD=W.maps[mapId];if(actor.charm)charm[actor.charm]=true;if(actor.gift)breathHas[actor.gift]=true;');assert(run('brambleHint(actor)'),n.n+' has a clue');assert(run('openNpcTopics(actor)'),n.n+' opens topics');assert(run('ask.opts.some(o=>o.n==="Do you know Bramble?")'),n.n+' exposes a separate topic');}
for(const name of ['Isolde','Cartwright Oswin','Linna']){c.actor={n:name,x:0,y:0};assert(run('brambleHint(actor)'),name+' explicit clue works after editor moves');}
run("MAPID='world';MD=W.maps.world;P.x=215*TS;P.y=112*TS");assert(!run('brambleWelcomeInside()'));run('P.x=217*TS');assert(run('brambleWelcomeInside()'));
c.canStand=(x,y)=>x>=100&&x<=200&&y>=100&&y<=200;
run('P.x=100;P.y=120');c.dog={pettable:true};assert(run('placeBrambleBesideCorin(dog)'));assert(run('Math.hypot(dog.x-P.x,dog.y-P.y)>=16'));assert(c.canStand(c.dog.x,c.dog.y));
run('dragon.hp=0;dragon.down=true;dragon.revive=2;pHp=1;tAcc=10');assert(run('petCompanion(dog)'));assert.equal(run('pHp'),run('pMax'));assert.equal(run('dragon.hp'),run('dragon.maxHp'));assert(!run('dragon.down'));assert.equal(run('dragon.revive'),0);
const linna=run("W.maps.world.npcs.find(n=>n.n==='Linna')");assert(linna.stationary&&!linna.packWalk);
assert.equal(linna.packSpr,'pack_girl');assert.equal(linna.idleFrame,0,'Linna does not wave');
const isolde=run("W.maps.world.npcs.find(n=>n.n==='Isolde')");assert(!isolde.packSpr.startsWith(linna.packSpr));
assert.notEqual(linna.packSpr,run("W.maps.world.npcs.find(n=>n.n==='Gwil').packSpr"));
assert(run("Object.values(W.maps).some(m=>m.npcs?.some(n=>n.n==='Bors'))"));assert(!run("Object.values(W.maps).some(m=>m.npcs?.some(n=>n.n==='Mattock'))"));
for(const name of ['Isolde','Linna','Bevan','Cartwright Oswin','Ovid','Prue']){c.who=name;const p=run('portraitFor(who)');assert(p.src,name+' has corrected art');assert(fs.existsSync(p.src.split('?')[0]));}
for(const name of ['Isolde','Linna']){c.actor={n:name};const p=run('npcWorldProfile(actor)');assert(!/ledger|burn the page|keep my hands/i.test(JSON.stringify(p)));}
assert.equal(run('journeyWagon.spr'),'story_broken_wagon');assert(fs.existsSync('assets/props/broken-wagon.png'));
console.log(`PASS: ${residents.length} Thornwell residents have accessible Bramble topics; earlier roadside welcome, adjacent spawning, shared healing, Linna animation, Bors identity, corrected portraits, and new wagon.`);

const handlers={},touchContext=vm.createContext({lockEl:null,scrollerFor:()=>null,document:{addEventListener:(name,fn)=>handlers[name]=fn}});
const game=fs.readFileSync('js/generated/game-part-2.js','utf8'),start=game.indexOf('document.addEventListener("touchmove", e => {');
vm.runInContext(game.slice(start,game.indexOf('document.addEventListener("touchend"',start)),touchContext);
for(const id of ['merchantShop','cloudSaveDialog']){
 let prevented=false;handlers.touchmove({cancelable:true,target:{closest:s=>s.includes('#'+id)?{}:null},preventDefault(){prevented=true;}});
 assert(!prevented,id+' permits native touch scrolling');
}
console.log('PASS: purchase and sign-in scrolling bypass the gameplay touch blocker.');
// The first approach must still work with the town fence on Corin's right.
c.canStand=(x,y)=>!(x>=120&&x<=136&&y>=64&&y<=136);
run('P.x=100;P.y=100');
const welcome=run('welcomePath()');
assert(welcome?.length,'Bramble routes around a fence on the eastern approach');
assert(welcome[0][0]>100+60,'Bramble starts east of Corin');
assert(welcome.every(p=>Math.hypot(p[0]-100,p[1]-100)>=12),'Bramble does not cross through Corin');
assert(welcome.every(p=>c.canStand(...p)),'Every approach waypoint is on clear ground');
assert.equal(Math.hypot(welcome.at(-1)[0]-100,welcome.at(-1)[1]-100),16,'Bramble finishes exactly one tile in front of Corin');
console.log('PASS: Bramble approaches from the east and walks around local fences.');
