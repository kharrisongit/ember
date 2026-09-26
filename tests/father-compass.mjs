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
assert(game.includes('giver.n === "Nan Ferrow" && !templeCompass.owned'));
assert(bag.includes('fatherCompass:{owned:templeCompass.owned,awakened:templeCompass.awakened}'));
console.log('PASS: Nan’s heirloom, family history, dormant ownership, transition-safe first temple reveal, exact Corin response and save restoration.');
