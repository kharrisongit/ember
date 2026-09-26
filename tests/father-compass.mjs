import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
let saves=0,reveal;
const c=vm.createContext({gameplayStarted:true,mode:'play',MD:{templeExpanded:true,templePlan:{}},
 sceneHold:()=>!!c.scene,sayNpc:null,fadeDir:0,fade:0,doorMotion:null,ovl:null,ask:null,bagOpen:false,editing:false,dying:()=>false,
 saveGame:()=>saves++,showReveal:(...args)=>reveal=args,playScene:(lines,opts)=>c.scene={lines,i:0,...opts}});
const run=s=>vm.runInContext(s,c);
run(read('js/temple-compass.js'));
c.stepFatherCompass();assert.equal(c.scene,undefined,'no reveal before Nan gives the compass');
c.giveFatherCompass();assert.equal(saves,1);assert.equal(reveal[0],'inventory_compass');
assert.equal(run('templeCompass.owned'),true);assert.equal(run('templeCompass.awakened'),false);
assert(run('FATHER_COMPASS_GIFT.join(" ")').includes('when you were born'));
assert(!/temple|heartstone/i.test(run('FATHER_COMPASS_GIFT.join(" ")')),'Nan does not explain the magic');
for(const prop of ['fade','fadeDir','doorMotion','ovl','ask','bagOpen','editing','sayNpc']){
 c[prop]=1;c.stepFatherCompass();assert.equal(c.scene,undefined,prop+' defers reveal');c[prop]=0;
}
c.MD={mountainPassage:true};c.stepFatherCompass();assert.equal(c.scene,undefined);
c.MD={templeExpanded:true,templePlan:{}};c.stepFatherCompass();assert.equal(c.scene.compassReveal,true);
assert.match(c.scene.lines[0],/light/);assert.equal(c.scene.lines[1],'Corin: Thanks, Dad.');
assert.equal(run('templeCompass.awakened'),false,'waits for Corin’s response');
c.awakenFatherCompass();assert.equal(saves,2);c.scene=null;c.stepFatherCompass();assert.equal(c.scene,null,'only once');
const saved=run('({owned:templeCompass.owned,awakened:templeCompass.awakened})');
c.restoreFatherCompass();assert.equal(run('templeCompass.owned'),false,'old saves reset ownership');
c.restoreFatherCompass(saved);assert.equal(run('templeCompass.awakened'),true,'new saves keep awakening');
c.awakenFatherCompass();assert.equal(saves,2,'idempotent awakening');
c.restoreFatherCompass({awakened:true});assert.equal(run('templeCompass.awakened'),false,'awakening requires ownership');
const game=read('js/generated/game-part-2.js'),bag=read('js/generated/game-part-3.js');
assert(game.includes('if (scene.compassReveal && scene.i >= 1) awakenFatherCompass();'));
assert(game.includes('giver.n === "Nan Ferrow" && hasDragon() && !templeCompass.owned'));
assert(bag.includes('fatherCompass:{owned:templeCompass.owned,awakened:templeCompass.awakened}'));
console.log('PASS: Nan’s heirloom, family history, dormant ownership, transition-safe first temple reveal, exact Corin response and save restoration.');

Object.assign(c,{MAPID:'world',TS:16,hasDragon:()=>c.hatched,hatched:false,dragonIntroDone:true,npcs:[],
 W:{maps:{house26:{npcs:[{n:'Nan Ferrow'}]}}},MD:{doors:[{to:'house26',x:13,y:420}]},P:{},revealing:false,scene:null,mounted:false,dragon:{air:false,tr:null},
 clearPadInputs(){},running:false,canNpcStand:()=>true,maddockWalkPath:(n,t)=>[t],faceToward(){},setMounted:()=>{c.mounted=false;},dragonGround:()=>true,startTransition:()=>{c.dragon.tr={kind:'down'};}});
c.restoreFatherCompass();c.prepareNanDeparture();assert.equal(c.npcs.length,0);
c.hatched=true;c.prepareNanDeparture();assert.equal(c.npcs.length,1);c.prepareNanDeparture();assert.equal(c.npcs.length,1,'Nan is not duplicated');
c.P={x:c.npcs[0].x+30,y:c.npcs[0].y};c.stepNanDeparture();assert(c.scene.lines[0].includes('Before you go'));
assert.equal(c.npcs[0].stationary,false);assert(c.npcs[0].goto,'Nan walks to Corin');assert.equal(c.scene.hold(),false);
const nan=c.npcs[0];[nan.x,nan.y]=nan.goto;nan.goto=null;assert.equal(c.scene.hold(),true);assert(Math.hypot(nan.x-c.P.x,nan.y-c.P.y)<=23);
assert.equal(run('templeCompass.owned'),false,'gift waits for the encounter to finish');c.scene.after();assert.equal(run('templeCompass.owned'),true);
c.scene=null;c.stepNanDeparture();assert.equal(c.scene,null,'Nan does not stop Corin twice');

c.restoreFatherCompass();c.scene=null;c.mounted=true;c.dragon.air=true;c.P={x:nan.x+70,y:nan.y};
c.stepNanDeparture();assert.equal(c.mounted,false);assert.equal(c.dragon.air,false);assert.equal(c.dragon.tr.kind,'down');
[nan.x,nan.y]=nan.goto;nan.goto=null;assert.equal(c.scene.hold(),false,'Conversation waits for landing');
c.dragon.tr=null;assert.equal(c.scene.hold(),true);assert(Math.hypot(nan.x-c.P.x,nan.y-c.P.y)<=23);
console.log('PASS: Nan approaches within talking distance, blocks advances while approaching, and forces a mounted flying dragon to land first.');

for(const [x,y]of [[60,425],[30,407],[67,430]]){
 c.restoreFatherCompass();c.scene=null;c.dragonIntroDone=false;c.mounted=true;c.dragon.air=true;c.dragon.tr=null;
 c.MD.features=[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}];
 c.P={x:x*16,y:y*16};c.stepNanDeparture();
 assert(c.scene,'Nan stops a bypass far from her house at '+x+','+y);
 assert.equal(c.mounted,false);assert.equal(c.dragon.air,false);
 [nan.x,nan.y]=nan.goto;nan.goto=null;c.dragon.tr=null;c.scene.hold();c.scene.after();
}
console.log('PASS: Nan intercepts north/east town crossings and flying departures before the dragon introduction.');
