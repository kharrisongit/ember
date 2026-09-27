/* The first road battle teaches real controls; no simulated menu selections. */
(function(){
  'use strict';
  const FIRST_ARENA=208;
  let done=false,unlocked=false,phase='',ringId=null,internal=false,resumeRecovery=false,hintTime=0;
  const recoveryPhases=new Set(['recovery','dismountTalk','dismount','healTalk','itemsButton','heal','thanks']);
  const holding=()=>!!phase&&phase!=='battle';
  const hint=document.createElement('div');hint.id='ridingHint';hint.hidden=true;hint.setAttribute('role','status');document.body.appendChild(hint);
  const notice=text=>{hint.textContent=text;hint.hidden=!text;};
  function clearHighlight(){document.querySelectorAll('.riding-target').forEach(n=>n.classList.remove('riding-target'));}
  function moveTo(next,text=''){
    phase=next;clearHighlight();notice(text);hintTime=0;
    document.body.classList.toggle('riding-guide',holding());
    if(holding()){clearPadInputs();for(const key in keys)keys[key]=0;running=false;P.moving=false;P.act=null;}
  }
  function overlay(which){internal=true;try{setOvl(which);}finally{internal=false;}paint();}
  function say(lines,after){overlay(null);notice('');playScene(lines,{telepathy:true,after});}
  function allowedItem(menu,item){
    if(!holding()||internal)return true;
    if((phase==='mount'||phase==='dismount')&&menu==='airm')return item.el==='ride';
    if(phase==='fire'&&menu==='atkm')return item.el==='fire';
    return phase==='heal'&&menu==='itemm'&&item.key==='hareMeat';
  }
  function paint(){
    if(!holding())return;
    clearHighlight();
    const control=phase==='dragonButton'?'btnL':phase==='itemsButton'?'btnItems':null;
    if(control){document.getElementById(control)?.classList.add('riding-target');return;}
    if(!ovl||!MENUS[ovl])return;
    const menu=MENUS[ovl],items=menu.items(),rows=document.getElementById(menu.rows)?.querySelectorAll('.row')||[];
    const pick=items.findIndex(it=>allowedItem(ovl,it));
    if(pick<0)return;
    menu.pick=pick;
    rows.forEach((row,i)=>{row.classList.toggle('riding-target',i===pick);row.classList.toggle('on',i===pick);row.setAttribute('aria-disabled',String(i!==pick));});
    if(ovl==='itemm')rows[pick]?.scrollIntoView?.({block:'nearest'});
  }
  function entered(ring){
    if(done||phase||MAPID!=='world'||ring.id!==FIRST_ARENA||!hasDragon()||!dragonIntroDone)return;
    if(mounted)setMounted(false,true);
    ringId=ring.id;moveTo('walls');
    // Stop existing wind-ups at their current positions before the walls rise.
    for(const foe of foes)if(foe.st!=='dead'&&!foe.ally){foe.st='idle';foe.t=0;}
    hunt=null;breath=null;claw=null;dragon.moving=false;
    if(dragon.hp<=dragonFlightMinimum()){dragon.hp=dragonFlightMinimum()+1;dragon.down=false;dragon.revive=0;dragon.knockdown=0;}
  }
  function step(dt){
    if(!gameplayStarted||mode!=='play')return;
    if(resumeRecovery&&!scene&&!revealing){resumeRecovery=false;beginRecovery();return;}
    if(phase==='walls'&&arenaT>=1&&!scene){
      unlocked=true;moveTo('mountTalk');
      say(['Aurelius: Quick! Get on my back!'],()=>{
        moveTo('mount','Choose Mount in COMMAND.');overlay('airm');
      });
    }
    if(phase==='battle'&&hintTime>0){hintTime=Math.max(0,hintTime-dt);if(!hintTime)notice('');}
  }
  function mountedAction(on){
    if(phase==='mount'&&on){moveTo('dragonButton','Press the highlighted DRAGON button to choose an attack.');overlay(null);paint();return true;}
    if(phase==='dismount'&&!on){teachHealing();return true;}
    return false;
  }
  function allowOverlay(which){
    if(!holding()||internal)return true;
    return (phase==='dragonButton'&&which==='atkm')||(phase==='itemsButton'&&which==='itemm')||
      ((phase==='mount'||phase==='dismount')&&which==='airm')||(phase==='fire'&&which==='atkm')||(phase==='heal'&&which==='itemm');
  }
  function opened(which){
    if(internal)return;
    if(phase==='dragonButton'&&which==='atkm'){
      moveTo('fireTalk');
      say(['Aurelius: What should I do?'],()=>{
        breathCooldown.fire=0;
        moveTo('fire','Choose Fire to attack.');overlay('atkm');
      });
    }else if(phase==='itemsButton'&&which==='itemm'){
      moveTo('heal','Choose Hare Meat to heal Aurelius.');paint();
    }
  }
  function fired(element){
    if(phase!=='fire'||element!=='fire')return;
    moveTo('battle','Press A for Slash!');hintTime=8;overlay(null);saveGame();
  }
  function completed(ring){
    if(done||phase!=='battle'||ring?.id!==ringId)return;
    // A scripted exhausted state makes this lesson reliable even after a clean win.
    moveTo('recovery');beginRecovery();
  }
  function beginRecovery(){
    moveTo('recovery');
    dragon.hp=Math.max(1,Math.min(dragon.hp,dragonFlightMinimum()));
    dragon.down=false;dragon.revive=0;dragon.knockdown=0;dragon.inv=1.2;
    dragon.air=false;dragon.tr=null;dragon.moving=false;hunt=null;breath=null;claw=null;
    refreshWingBtn();chunks.clear();
    // Keep the lesson recoverable for old saves and players who used every ration.
    hareMeat=Math.max(1,hareMeat);
    saveGame();
    if(mounted){
      moveTo('dismountTalk');
      say(['Aurelius: I need a break. Let me show you how to dismount.'],()=>{
        moveTo('dismount','Choose Dismount in COMMAND.');overlay('airm');
      });
    }else teachHealing();
  }
  function teachHealing(){
    moveTo('healTalk');
    say([
      'Aurelius: I am too hurt to fly. A little food will help me recover.',
      'Corin: Nan packed some hare meat for you. Let me get it.'
    ],()=>{moveTo('itemsButton','Open the highlighted ITEMS button.');overlay(null);paint();});
  }
  function usedItem(item){
    if(phase!=='heal'||item.key!=='hareMeat'||dragon.hp<=dragonFlightMinimum())return false;
    moveTo('thanks');overlay(null);setBag(false);
    say(['Aurelius: That is better. Thank you, Corin.',
      'Aurelius: If I am badly hurt, I need meat or fish before I can fly again. Keep an eye on my health.'],()=>{
      done=true;unlocked=true;moveTo('');saveGame();
    });
    return true;
  }
  function allowControl(id){
    if(!holding())return true;
    return id==='act'||(phase==='dragonButton'&&id==='btnL')||(phase==='itemsButton'&&id==='btnItems');
  }
  function action(){
    if(!holding())return false;
    if(scene){advanceScene();return true;}
    if(phase==='dragonButton'){setOvl('atkm');return true;}
    if(phase==='itemsButton'){setOvl('itemm');return true;}
    return !ovl;
  }
  function key(event){
    if(!holding())return false;
    event.preventDefault();event.stopImmediatePropagation();
    if(!event.repeat&&['a',' ','enter'].includes(event.key.toLowerCase()))actionButton();
    return true;
  }
  function blockPointer(event){
    if(!holding())return false;
    if(event.target?.closest?.('.riding-target,#act,#say'))return false;
    event.preventDefault();event.stopImmediatePropagation();return true;
  }
  function capture(){return {version:1,done,unlocked,phase,ringId};}
  function restore(saved){
    clearHighlight();notice('');phase='';resumeRecovery=false;document.body.classList.remove('riding-guide');
    const data=saved.ridingTutorial;
    if(data?.version===1){done=!!data.done;unlocked=!!data.unlocked;ringId=data.ringId??null;resumeRecovery=!done&&recoveryPhases.has(data.phase);}
    else{
      // Existing players who were already taught riding keep their controls.
      unlocked=!!saved.dragonIntroDone;
      done=unlocked&&!!(saved.thornwellMet||saved.smithUpgrade||saved.wonAll||saved.breathHas?.lightning||saved.x>=220*TS);ringId=null;
    }
    if(resumeRecovery){phase='recovery';document.body.classList.add('riding-guide');}
    if((resumeRecovery||done)&&ringId!==null&&MAPID==='world'){
      cooling.set('world:'+ringId,ARENA_REST);
      const ring=currentArenaFeatures().find(a=>a.id===ringId);
      if(ring&&Math.hypot(P.x/TS-ring.x,P.y/TS-ring.y)<ring.r+2){
        for(const foe of foes)if(!foe.ally&&Math.hypot(foe.x/TS-ring.x,foe.y/TS-ring.y)<ring.r+5)foe.st='dead';
      }
    }
  }
  function skip(){done=true;unlocked=true;resumeRecovery=false;moveTo('');}
  window.EmberRiding={holding,step,entered,completed,allowedItem,allowOverlay,opened,paint,mountedAction,fired,usedItem,allowControl,action,key,blockPointer,capture,restore,skip,
    unlocked:()=>unlocked,protectFirstBattle:()=>phase==='battle',blocksArenaEntry:()=>recoveryPhases.has(phase)};
})();
