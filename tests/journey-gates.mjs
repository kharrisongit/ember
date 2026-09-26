import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c=vm.createContext({MAPID:'world',mode:'play',editing:false,wonAll:0,brambleQuest:0,breathHas:{},smithUpgrade:false,charm:{},glassShield:false,P:{x:0,y:0}});
vm.runInContext(fs.readFileSync('js/progression-gates.js','utf8'),c);const gates=vm.runInContext('JOURNEY_GATES',c);
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
c.breathHas.shadow=true;c.breathHas.ice=true;for(const g of Object.values(gates))assert(!c.progressionSolid(g.x,g.y));
assert.equal(c.journeyGateProps().length,1,'only the returned market wagon remains');
c.MAPID='tp1';assert.equal(c.journeyGateProps().length,0);assert(c.progressionMoveAllowed(0,0));
assert(fs.readFileSync('js/generated/game-part-2.js','utf8').includes('const HERD_Y = 415;'));
console.log('PASS: four quest gates, required Forgewick equipment, return travel, all temple approaches, unlock removal and cow placement.');
