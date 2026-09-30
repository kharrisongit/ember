import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c=vm.createContext({Image:class{},MAPID:'world',mode:'play',editing:false,wonAll:0,brambleQuest:0,breathHas:{},smithUpgrade:false,charm:{},glassShield:false,P:{x:0,y:0}});
vm.runInContext(fs.readFileSync('js/progression-gates.js','utf8'),c);const gates=vm.runInContext('JOURNEY_GATES',c);
const carts=c.journeyGateProps().filter(o=>o.spr==='story_mining_carts');
assert.equal(carts.length,1,'Forgewick uses the generated cart barricade');
assert(!c.journeyGateProps().some(o=>o.spr.startsWith('rp_carts_')||o.spr==='rc_cavedec_0_0'),'Old cart collage is removed');
const draws=[];c.ctx={};c.drawGameImage=(...args)=>draws.push(args);
vm.runInContext('miningCartsImage.complete=true;miningCartsImage.naturalWidth=887',c);
c.drawJourneyProp(carts[0],0);
const [dx,dy,dw,dh]=draws[0].slice(-4);
assert.deepEqual([dx,dy,dw,dh],[Math.round(gates.forgewick.x-27.2),Math.round(gates.forgewick.y+56-108.8),54.4,108.8]);
assert(gates.forgewick.rect[0]>=dx&&gates.forgewick.rect[1]>=dy&&gates.forgewick.rect[2]<=dx+dw&&gates.forgewick.rect[3]<=dy+dh,'Collision fits the visible barricade');
assert(fs.existsSync('assets/props/forgewick-mine-carts.png'),'Generated sprite is packaged');
for(const [key,g] of Object.entries(gates)){
 assert(c.journeyGateClosed(key));assert(c.progressionSolid(g.x,g.y));
 c.P.x=g.x-(key==='sandspire'?0:80);c.P.y=g.y+(key==='sandspire'?80:0);
 assert(!c.progressionMoveAllowed(g.x+(key==='sandspire'?0:10),g.y-(key==='sandspire'?10:0)),key+' blocks onward travel');
 const back={...c.P};c.P.x=g.x+(key==='sandspire'?0:80);c.P.y=g.y-(key==='sandspire'?80:0);
 assert(c.progressionMoveAllowed(back.x,back.y),key+' allows returning from older saves');
}
c.P.x=810*16;c.P.y=251*16;assert(c.progressionMoveAllowed(850*16,251*16),'Forgewick temple approach stays open');
c.P.x=1515*16;c.P.y=114*16;assert(c.progressionMoveAllowed(1515*16,130*16),'Sandspire temple approach stays open');
c.P.x=2720*16;c.P.y=198*16;assert(c.progressionMoveAllowed(2740*16,198*16),'Hollybeck temple approach stays open');
c.brambleQuest=2;assert(gates.thornwell.open());c.breathHas.lightning=true;assert(!gates.forgewick.open(),'temple alone does not bypass required equipment');
c.smithUpgrade=true;c.charm.edge=true;c.glassShield=true;assert(gates.forgewick.open());
c.breathHas.ice=true;assert(gates.sandspire.open(),'Sandspire clears after its Ice Heartstone');assert(!gates.hollybeck.open(),'Hollybeck waits for its own Shadow Heartstone');c.breathHas.shadow=true;for(const g of Object.values(gates))assert(!c.progressionSolid(g.x,g.y));
assert.equal(c.journeyGateProps().length,0,'The repaired roadwork wagon leaves; market stalls stay in their own maps');
c.MAPID='tp1';assert.equal(c.journeyGateProps().length,0);assert(c.progressionMoveAllowed(0,0));
assert(fs.readFileSync('js/generated/game-part-2.js','utf8').includes('const HERD_Y = 415;'));
console.log('PASS: four quest gates, required Forgewick equipment, return travel, all temple approaches, unlock removal and cow placement.');

// The first hunting loop and the Millwood–Thornwell road cross gate longitudes far from roadworks.
c.MAPID='world';c.brambleQuest=0;c.breathHas={};c.smithUpgrade=false;c.charm={};c.glassShield=false;
for(const y of [205,350,430]){
 c.P.x=319*16;c.P.y=y*16;
 assert(c.progressionMoveAllowed(321*16,y*16),'Thornwell longitude stays open away from the wagon at y='+y);
 assert(!c.progressionSolid(320*16,y*16));
}
for(const g of Object.values(gates)){
 c.P.x=g.x-1000;c.P.y=g.y+1000;
 assert(c.progressionMoveAllowed(g.x+1000,g.y+1000),'No remote invisible gate boundary');
}
const game=fs.readFileSync('js/generated/game-part-2.js','utf8');
assert(game.includes('if(progressionSolid(px,py))return "story";'),'Collision overlay uses a visible gate colour');
assert(game.includes('if(progressionSolid(px,py))return "roadworks";'),'Collision diagnostics identify roadworks');
console.log('PASS: early hunting roads cross gate longitudes freely; actual roadblocks remain visible and enforced.');

// The wagon fits the mountain opening; the camel team waits in front of it.
c.breathHas={};c.npcs=[];c.prepareJourneyGates();
const caravan=c.journeyGateProps().find(o=>o.spr==='story_caravan');assert(caravan);
assert(caravan.x-48>=24240&&caravan.x+48<=24352);
const houses=[[24200.5,1190,24263.5,1264],[24332.5,1232,24419.5,1344]];
for(const camel of c.journeyGateProps().filter(o=>o.spr==='camel_sit')){
 assert(camel.y-22>caravan.y,'Camels visibly lead in front of the wagon');
 assert(camel.y-22>=1184,'Camels clear the mountain foot');
 assert(houses.every(([x0,y0,x1,y1])=>camel.x+24<=x0||camel.x-24>=x1||camel.y<=y0||camel.y-22>=y1),'Camels clear nearby houses');
 assert(c.progressionSolid(camel.x,camel.y-4),'Camel footprint is solid while blocking');
 c.breathHas.ice=true;assert(!c.progressionSolid(camel.x,camel.y-4),'Camel collision clears with the caravan');c.breathHas.ice=false;
}
assert(c.npcs.some(n=>n.progressionWorker==='sandspire'&&n.d.some(s=>s.includes('Sandspire Temple'))));
const child=c.npcs.find(n=>n.progressionWorker==='hollybeck');assert.equal(child.n,'Tobin');assert.equal(child.packSpr,'hollybeck_tobin');
assert(child.packDirections&&child.packWalk&&!child.stationary&&child.patrolPoints.length>1);

assert(!child.portraitAlias);assert(child.d.some(s=>s.includes('come back later')));
assert(fs.existsSync('assets/props/sandspire-caravan.png'));for(const action of ['idle','walk'])assert(fs.existsSync('assets/sprites/hollybeck-tobin-'+action+'-v2.png'));
c.prepareJourneyGates();assert.equal(c.npcs.filter(n=>n.progressionWorker==='hollybeck').length,1);
const wagon=c.journeyGateProps().find(o=>o.spr==='story_broken_wagon');draws.length=0;
vm.runInContext('brokenWagonImage.complete=true;brokenWagonImage.naturalWidth=800;brokenWagonImage.naturalHeight=1280',c);
c.drawJourneyProp(wagon,0);assert.deepEqual(draws[0].slice(-2),[68,108.8]);
console.log('PASS: carts reduced 15%, caravan/camels clear the mountain, Sandspire explanation and unique child at the snowmen.');
