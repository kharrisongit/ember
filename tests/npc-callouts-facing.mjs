import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const m={n:'Elder Maddock',x:128,y:100,stationary:true,packDirections:true,f:'u',kf:'u'};
const c=vm.createContext({npcs:[m],P:{x:128,y:130},MAPID:'house22',sayNpc:m,editing:false,scene:null,bossScene:null,walker:null,
 stepHettie(){},stepThornwellWelcome(){},npcHere:()=>true,faceCorinAt(){}});
const run=s=>vm.runInContext(s,c);
run(source.slice(source.indexOf('function faceToward('),source.indexOf('function npcHere(')));
run(source.slice(source.indexOf('function stepWalkers('),source.indexOf('function faceCorinAt(')));
for(const [x,y,kf]of [[128,130,'d'],[128,70,'u'],[98,100,'w'],[158,100,'e']]){
 c.P.x=x;c.P.y=y;run('faceToward(sayNpc,P.x,P.y);stepWalkers(.05)');assert.equal(m.kf,kf,'Maddock keeps facing the speaker '+kf);
 assert.equal(m.x,128);assert.equal(m.y,100);
}
c.sayNpc=null;run('stepWalkers(.05)');assert.equal(m.kf,'u','returns to his painting after the conversation');
c.scene={who:'Maddock'};c.walker=m;c.P.x=90;run('stepWalkers(.05)');assert.equal(m.kf,'w','scripted conversations also turn him');
const texts=[],rects=[],ctx=new Proxy({fillText:(...a)=>texts.push(a),fillRect:(...a)=>rects.push(a)},{get:(o,k)=>k in o?o[k]:()=>{}});
const d=vm.createContext({ctx,tAcc:0,n:{x:100,y:100},sp:[0,0,20,30]});
vm.runInContext(source.slice(source.indexOf('function drawHettieCallout('),source.indexOf('let thornwellMet=')),d);
vm.runInContext('drawHettieCallout(n,sp)',d);assert.equal(texts[0][0],'Yoo-hoo!');assert.equal(rects.length,0,'Hettie callout has no shadow rectangle');
assert(source.includes("royalBlackout('Out of my way, boy!'"));
console.log('PASS: Maddock turns from all four sides and returns to his painting; Hettie calls Yoo-hoo without a shadow; King’s call is capitalized.');
