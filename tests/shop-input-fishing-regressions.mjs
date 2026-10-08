import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
import {gameDom} from './helpers-game-dom.mjs';
const dom=gameDom(),events=new Map();
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){},error:console.error},{
  furniture:false,document:dom.document,
  windowEvents:(type,fn)=>{if(!events.has(type))events.set(type,[]);events.get(type).push(fn);}
});
const dispatch=(type,props={})=>{
  const event={type,key:'',target:c.document.body,preventDefault(){this.defaultPrevented=true;},stopPropagation(){},stopImmediatePropagation(){this.stopped=true;},...props};
  for(const fn of events.get(type)||[]){fn(event);if(event.stopped)break;}return event;
};
run(`mode='play';gameplayStarted=true;quest=Q.DONE;loadMap('house22');
window.EmberArenaEntry=undefined;window.EmberRiding=undefined;window.EmberEquipmentTutorial=undefined;window.EmberConversationFlow=undefined;
scene=null;sayNpc=null;revealing=false;ovl=null;ask=null;foes=[];arenaLock=null;fadeDir=0;doorMotion=null;bossScene=null;P.act=null;arriveT=0;pHp=6;`);
for(const loss of ['blur','pagehide','visibilitychange']){
  run('P.x=128;P.y=192;P.act=null;P.moving=false;');
  dispatch('keydown',{key:'ArrowRight'});dispatch('keydown',{key:'b'});
  assert(run('keys.arrowright&&running'));
  run('glassShieldHeld=true;stepPlayer(.1)');assert(run('P.x>128'),'Movement works before losing focus');
  const x=run('P.x');
  if(loss==='visibilitychange'){c.document.hidden=true;dom.dispatch(c.document.body,loss);}
  else dispatch(loss);
  assert.equal(run('keys.arrowright'),0,loss+' releases the keyboard');
  assert.equal(run('running||glassShieldHeld'),false,loss+' releases sprint/block');
  run('stepPlayer(.1)');assert.equal(run('P.x'),x,loss+' leaves no held movement');
  c.document.hidden=false;
  dispatch('keydown',{key:'ArrowRight'});run('stepPlayer(.1)');assert(run('P.x>'+x),'A fresh key press still moves');dispatch('keyup',{key:'ArrowRight'});
}
console.log('PASS: blur, pagehide and hidden-page events release movement, sprint and block without disabling later input.');

// Keep the real key handler and transactions; layout rendering is irrelevant.
c.drawMerchantShop=()=>{};
// Exercise the co-op capture handler too, without starting network transport.
const campaign=fs.readFileSync(new URL('../js/coop-campaign.js',import.meta.url),'utf8');
run(`var active=true,pressed=new Set(),sentKeys=[];function send(data){sentKeys.push(data);}window.LDRCoopUI={dispatching:false};`);
run('var exitDialog=null;function localSettings(){return false;}');
run(campaign.slice(campaign.indexOf('  function keyboard('),campaign.indexOf('  function viewport(')));
const shop=dom.element('merchantShop');
for(const label of ['Back to goods','Change quantity','Leave shop','Confirm purchase']){
  const button=c.document.createElement('button');button.textContent=label;shop.appendChild(button);
  for(const key of ['Enter',' ']){
    run(`gold=100;potions=0;var merchant={n:'Wren'};openMerchantShop(merchant);confirmPurchase(merchant,'potion',1);`);
    const event=dispatch('keydown',{key,target:button});
    assert(!event.defaultPrevented,label+' retains native '+key+' activation');
    assert.equal(run('gold'),100,'Global hotkeys must not buy while a button owns focus');assert.equal(run('potions'),0);
    c.shopEvent=event;run('keyboard(shopEvent)');
    assert(!event.defaultPrevented,'Co-op also leaves the focused button in control');assert.equal(run('sentKeys.length'),0);
  }
}
for(const key of ['Enter',' ','a']){
  run(`gold=100;potions=0;confirmPurchase(merchant,'potion',1);`);
  assert(dispatch('keydown',{key}).defaultPrevented);assert.equal(run('gold'),80);assert.equal(run('potions'),1,'Controller-style confirmation still buys exactly once');
}
run(`confirmPurchase(merchant,'potion',1);`);dispatch('keydown',{key:'Escape'});assert(run('!!ask.quantity'),'Escape still goes back');run('askShut()');
console.log('PASS: focused shop buttons retain native Enter/Space in solo and co-op; background confirmation and Escape keep working.');

run(`P.x=128;P.y=192;P.act=null;scene=null;sayNpc=null;ovl=null;ask=null;charm.wake=true;wakeCool=0;foes=[];fishingPole=true;terr.fill(WATER);P.dir='d';P.dir8='s';`);
assert(run('waterInReach()&&fishingSafe()'));
assert(run('wakeTheDead()'));assert.equal(run('foes.filter(f=>f.ally).length'),2);
assert(run('tryFishing()'));assert.equal(run('fishing.phase'),'prompt','Friendly summons allow fishing');run('askShut();endFishing()');
run(`foes.push({kind:'knight',storyPassive:true,hp:8,st:'idle',x:P.x,y:P.y});`);assert(run('fishingSafe()'),'Passive story actors are not threats');
run(`foes.push({kind:'wraith',hp:8,st:'idle',x:P.x+20,y:P.y});`);
assert(!run('fishingSafe()'),'A nearby hostile still blocks fishing');run('tryFishing()');assert.equal(run('fishing'),null);
run('foes.at(-1).x=P.x+300');assert(run('fishingSafe()'),'Distant hostiles do not block fishing');
run('foes.at(-1).x=P.x;foes.at(-1).st="dead"');assert(run('fishingSafe()'),'Dead enemies are not threats');
console.log('PASS: summoned spirits and passive actors allow fishing while nearby live hostiles still block it.');
