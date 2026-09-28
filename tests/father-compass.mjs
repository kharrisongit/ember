import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
let saves=0,reveal;
const c=vm.createContext({hareMeat:0,npcSeesDragon:()=>true,gameplayStarted:true,mode:'play',MD:{templeExpanded:true,templePlan:{}},
 sceneHold:()=>!!c.scene,sayNpc:null,fadeDir:0,fade:0,doorMotion:null,ovl:null,ask:null,bagOpen:false,editing:false,dying:()=>false,
 toast(){},saveGame:()=>saves++,showReveal:(...args)=>reveal=args,playScene:(lines,opts)=>c.scene={lines,i:0,...opts}});
const run=s=>vm.runInContext(s,c);
run(read('js/temple-compass.js'));
c.stepFatherCompass();assert.equal(c.scene,undefined,'no reveal before Nan gives the compass');
assert.equal(c.nanGiftBeat(5),false);assert.equal(saves,0);
assert.equal(c.nanGiftBeat(6),true);assert.equal(c.hareMeat,0);assert.equal(reveal[0],'inventory_mapCompass');
assert.equal(c.nanGiftBeat(6),false);assert.equal(saves,1,'Compass cannot duplicate');
assert.equal(c.nanGiftBeat(11),false);assert.equal(c.hareMeat,0,'Meat waits for Nan’s own line');
assert(c.worldMapUnlocked(),'The combined gift immediately unlocks the map');
assert.equal(c.nanGiftBeat(12),false);assert(c.worldMapUnlocked());assert.equal(c.hareMeat,0);
assert.equal(c.nanGiftBeat(12),false);assert.equal(saves,1,'Map is part of the same gift');
assert.equal(c.nanGiftBeat(14),true);assert.equal(c.hareMeat,3);assert.equal(reveal[0],'inventory_hareMeat');
assert.equal(c.nanGiftBeat(14),false);assert.equal(c.hareMeat,3);assert.equal(saves,2,'Meat cannot duplicate');
assert.equal(run('templeCompass.owned'),true);assert.equal(run('templeCompass.awakened'),false);
assert(run('FATHER_COMPASS_GIFT.join(" ")').includes('when you were born'));
assert(!/temple|heartstone/i.test(run('FATHER_COMPASS_GIFT.filter(line=>line.startsWith("Nan Ferrow:")).join(" ")')),'Nan does not explain the magic');
for(const prop of ['fade','fadeDir','doorMotion','ovl','ask','bagOpen','editing','sayNpc']){
 c[prop]=1;c.stepFatherCompass();assert.equal(c.scene,undefined,prop+' defers reveal');c[prop]=0;
}
c.MD={mountainPassage:true};c.stepFatherCompass();assert.equal(c.scene,undefined);
c.MD={templeExpanded:true,templePlan:{}};c.stepFatherCompass();assert.equal(c.scene.compassReveal,true);
assert.match(c.scene.lines[0],/light/);assert.equal(c.scene.lines[1],'Corin: Thanks, Dad.');
assert.equal(run('templeCompass.awakened'),false,'waits for Corin’s response');
c.awakenFatherCompass();assert.equal(saves,3);c.scene=null;c.stepFatherCompass();assert.equal(c.scene,null,'only once');
const saved=run('({owned:templeCompass.owned,awakened:templeCompass.awakened})');
c.restoreFatherCompass();assert.equal(run('templeCompass.owned'),false,'old saves reset ownership');
c.restoreFatherCompass(saved);assert.equal(run('templeCompass.awakened'),true,'new saves keep awakening');
c.awakenFatherCompass();assert.equal(saves,3,'idempotent awakening');
c.restoreFatherCompass({awakened:true});assert.equal(run('templeCompass.awakened'),false,'awakening requires ownership');
const game=read('js/generated/game-part-2.js'),bag=read('js/generated/game-part-3.js');
assert(game.includes('if (scene.compassReveal && scene.i >= 1) awakenFatherCompass();'));
assert(game.includes('if(scene.nanGifts&&nanGiftBeat(scene.i))return;'));
assert(game.includes("best.n==='Nan Ferrow'&&hasDragon()&&nanGiftPending()"));
assert(bag.includes('fatherCompass:{owned:templeCompass.owned,awakened:templeCompass.awakened,meatGiven:templeCompass.meatGiven,mapGiven:templeCompass.mapGiven}'));
console.log('PASS: Nan’s heirloom, family history, dormant ownership, transition-safe first temple reveal, exact Corin response and save restoration.');

Object.assign(c,{MAPID:'world',TS:16,SPR:{},hasDragon:()=>c.hatched,hatched:false,dragonIntroDone:true,npcs:[],
 W:{maps:{house26:{npcs:[{n:'Nan Ferrow'}]}}},MD:{doors:[{to:'house26',x:13,y:420,triggerRect:{x:206,y:6721,w:20,h:29}},{to:'house24',x:23,y:413,triggerRect:{x:376,y:6615,w:16,h:22}},{to:'house25',x:35,y:413,triggerRect:{x:567,y:6612,w:19,h:27}}],features:[{kind:'area',label:'Millwood',x0:0,y0:404,x1:62,y1:453}]},P:{},revealing:false,scene:null,mounted:false,dragon:{air:false,tr:null,on:true},dragonHere:()=>true,dragonCanStand:()=>true,direction4:()=> 's',
 pendingActorStage:null,cam:{x:0,y:0,z:1},VW:400,VH:300,clampCam(){},faceCorinAt(){},refreshWingBtn(){},standableNear:(x,y)=>[x,y],clearPadInputs(){},running:false,canNpcStand:()=>true,maddockWalkPath:(n,t)=>[t],faceToward(){},setMounted:()=>{c.mounted=false;},dragonGround:()=>true,startTransition:()=>{c.dragon.tr={kind:'down'};}});
const startApproach=()=>{assert.equal(c.fadeDir,0,'No farewell fade');assert.equal(c.pendingActorStage,null,'No blackout staging');assert(c.scene);assert.equal(c.scene.hold(),false,'Dialogue waits for Nan to arrive');};
c.restoreFatherCompass();c.prepareNanDeparture();assert.equal(c.npcs.length,0);
c.hatched=true;c.prepareNanDeparture();assert.equal(c.npcs.length,1);c.prepareNanDeparture();assert.equal(c.npcs.length,1,'Nan is not duplicated');
assert(c.npcs[0].away,'Nan has no visible waiting presence');c.P={x:31*16,y:429*16};c.stepNanDeparture();startApproach();assert.deepEqual(Array.from(c.scene.lines),Array.from(run('FATHER_COMPASS_GIFT')),'Automatic encounter keeps the same complete conversation as manual talk');
assert.equal(c.npcs[0].stationary,false);assert(c.npcs[0].goto,'Nan walks to Corin');assert.equal(c.scene.hold(),false);
let nan=c.npcs[0];[nan.x,nan.y]=nan.goto;nan.goto=null;assert.equal(c.scene.hold(),true);assert(Math.hypot(nan.x-c.P.x,nan.y-c.P.y)<=37);
assert.equal(run('templeCompass.owned'),false,'gift waits for its dialogue line');c.nanGiftBeat(6);c.nanGiftBeat(12);c.nanGiftBeat(14);assert.equal(run('templeCompass.owned'),true);
const goodbye=[nan.x,nan.y],cameraOwner=c.scene.conversationCamera;
c.scene.after();assert.deepEqual([nan.x,nan.y],goodbye,'Goodbye never teleports Nan');assert.equal(nan.away,false);assert(nan.nanDeparting);
assert(c.scene.silent,'A silent scene keeps player input locked for the walk-off');
assert.equal(c.scene.conversationCamera,cameraOwner,'Walk-off retains the gift conversation camera');
assert.equal(c.scene.until(),false,'Control remains locked while Nan is visible');
c.finishNanDeparture(nan);assert.equal(c.scene.until(),true);
assert.equal(c.W.maps.house26.npcs[0].away,false,'Nan is available back inside her house');
c.scene.after();assert(!c.npcs.includes(nan),'The outdoor visitor is removed after walking off screen');
c.scene=null;c.stepNanDeparture();assert.equal(c.scene,null,'Nan does not stop Corin twice');

c.restoreFatherCompass();c.scene=null;c.mounted=true;c.dragon.air=true;c.P={x:nan.x+70,y:nan.y};
c.stepNanDeparture();startApproach();assert.equal(c.mounted,false);assert.equal(c.dragon.air,false);assert.equal(c.dragon.tr,null,'No visible landing animation');
nan=c.scene.npcActor;
[nan.x,nan.y]=nan.goto;nan.goto=null;assert.equal(c.scene.hold(),true);assert(Math.hypot(nan.x-c.P.x,nan.y-c.P.y)<=37);
console.log('PASS: Nan approaches within talking distance, blocks advances while approaching, and forces a mounted flying dragon to land first.');

// Town entry stays free until Corin clears the two houses flanking the path.
for(const [x,y]of [[30,397],[30,404],[31,413],[31,414],[31,415],[31,415.9],[-.1,425],[62.1,425],[31,453.1]]){
 c.restoreFatherCompass();c.scene=null;c.dragonIntroDone=false;c.mounted=false;c.dragon.air=false;c.dragon.tr=null;
 c.npcs=[];c.P={x:x*16,y:y*16};c.stepNanDeparture();
 assert.equal(c.npcs.length,0,'No outdoor Nan before clearing the houses');
 assert.equal(c.scene,null,'No early farewell at '+x+','+y);
}
// Meet just beyond the entrance pair, well before Nan’s southern house; recover later saves too.
for(const [x,y]of [[31,415.9375],[31,416],[28,417],[34,417],[31,429]]){
 c.restoreFatherCompass();c.scene=null;c.npcs=[];c.prepareNanDeparture();
 const waiting=c.npcs[0];assert(waiting.away,'Nan stays hidden until the encounter');
 c.P={x:x*16,y:y*16};const corin={...c.P},camera={...c.cam};c.stepNanDeparture();startApproach();assert(c.scene,'Passing the houses triggers farewell');
 assert.deepEqual([c.P.x,c.P.y],[corin.x,corin.y],'Corin stays in place without a fade');assert.deepEqual(c.cam,camera,'Camera stays in place');
 assert((waiting.goto[0]-c.P.x)*(c.dragon.x-c.P.x)+(waiting.goto[1]-c.P.y)*(c.dragon.y-c.P.y)<0,'Dragon stands behind Corin, opposite Nan');
 assert(Math.hypot(c.dragon.x-c.P.x,c.dragon.y-c.P.y)>=40,'Dragon has room behind Corin');
 assert(waiting.y-64>Math.max(c.cam.y+c.VH/c.cam.z,c.P.y+c.VH/c.cam.z/2),'Nan starts fully below the current and following views');
 assert.equal(waiting.x,c.P.x,'Nan walks straight north toward Corin');
 assert.deepEqual(Array.from(waiting.goto),[c.P.x,c.P.y+36]);
 assert.equal(c.scene.npcActor,waiting,'The scene retains Nan through the gifts');
}
console.log('PASS: town entry and houses stay free; Nan approaches from the south just beyond the houses.');

// Indoors or with the dragon away, Corin brings up what happened himself.
c.npcSeesDragon=()=>false;
const indoors=c.fatherCompassGift({n:'Nan Ferrow'});
assert.match(indoors[0],/What has kept you/);assert.match(indoors[1],/I found a dragon's egg/);
assert.deepEqual(Array.from(indoors.slice(2)),Array.from(run('FATHER_COMPASS_GIFT.slice(2)')));
assert(!indoors.some(l=>/Aurelius|But first|Before you go/.test(l)));
console.log('PASS: Nan responds naturally to seeing the dragon or hearing Corin’s news, without knowing his name early.');

// A reload between gifts preserves the compass and still delivers the meat.
c.restoreFatherCompass({owned:true,awakened:false,meatGiven:false});
const meat=c.hareMeat;c.scene=null;c.fade=0;c.fadeDir=0;c.npcs=[];c.P={x:31*16,y:429*16};
c.stepNanDeparture();startApproach();assert.equal(c.scene.i,8);
assert.equal(c.nanGiftBeat(6),false);assert.equal(c.nanGiftBeat(14),true);assert.equal(c.hareMeat,meat+3);
assert.equal(c.nanGiftBeat(14),false);
console.log('PASS: gifts have separate dialogue beats and icons, dragon stays behind Corin from each approach, and partial-gift saves resume without duplicates.');

// A save between compass and map resumes without losing or repeating gifts.
c.restoreFatherCompass({owned:true,meatGiven:false,mapGiven:false});
assert(c.worldMapUnlocked(),'Partial legacy gifts gain the combined map');assert(c.nanGiftPending());
assert.equal(c.nanGiftBeat(6),false);assert.equal(c.nanGiftBeat(12),false);
assert(c.worldMapUnlocked());assert.equal(c.nanGiftBeat(12),false);
c.restoreFatherCompass({owned:true,meatGiven:true});assert(c.worldMapUnlocked(),'Legacy gift saves keep map access');
c.restoreFatherCompass();assert.equal(c.worldMapUnlocked(),false,'New game locks the map again');

const buttons=new Map(['btnMapQuick','bagMap'].map(id=>[id,{textContent:'MAP',style:{},setAttribute(){}}]));
c.document={getElementById:id=>buttons.get(id)};
c.restoreFatherCompass();c.refreshMapControls();
assert.equal(buttons.get('btnMapQuick').textContent,'');assert(buttons.get('btnMapQuick').disabled);
c.giveFatherCompass();assert.equal(buttons.get('btnMapQuick').textContent,'MAP');assert(!buttons.get('btnMapQuick').disabled);
console.log('PASS: the combined map and compass uses one reveal, migrates partial saves, and keeps MAP blank until received.');
