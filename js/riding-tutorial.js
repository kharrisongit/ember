/* The first sword and riding battles teach the real combat controls. */
(function(){
  'use strict';
  // Arena tool #5: the eastbound road out of Millwood (stable feature ID 11).
  const FIRST_ARENA=11;
  const SWORD_ARENA=208;
  let swordDone=false,corinHealDone=false,corinHit=false,corinStartHp=6,resumeCorin=false;
  let done=false,unlocked=false,phase='',ringId=null,internal=false,resumeRecovery=false,hintTime=0,assembly=null;
  const recoveryPhases=new Set(['recovery','dismountTalk','dismount','healTalk','itemsButton','heal','thanks']);
  const corinRecoveryPhases=new Set(['corinRecovery','corinHealTalk','corinItemsButton','corinHeal','corinThanks']);
  const holding=()=>!!phase&&(phase!=='battle'||hintTime>0)&&phase!=='swordBattle';
  const hint=document.createElement('button');hint.type='button';hint.id='ridingHint';hint.hidden=true;document.body.appendChild(hint);
  hint.addEventListener('click',e=>{e.preventDefault();actionButton();});
  const notice=text=>{
    hint.classList.remove('dismissing');hint.hidden=!text;hint.dataset.instruction=text;
    hint.classList.toggle('combat-prompt',/^Press A to (Swing Your Sword|Slash)$/.test(text));hint.classList.toggle('slash-prompt',text==='Press A to Slash');
    if(!text)return;
    const slash=text==='Press A to Slash',sword=text==='Press A to Swing Your Sword';
    window.EmberEncounterCard.paint(hint,{title:text,kicker:slash?'DRAGON • SLASH':sword?'SWORD • SWING':'LEARN THE CONTROLS',
      detail:slash?'Strike together. Aurelius slashes the foes in front of him.':sword?'Face your enemy and swing. Your first battle starts with you.':
        /Hare Meat|Potion/.test(text)?'A little care gets you back into the fight.':/Mount|Dismount/.test(text)?'You and Aurelius make a team. Choose how to travel together.':'Use the highlighted control. This card also performs that action.',
      action:slash||sword?'Press A or tap to attack':'Press A or tap to try it',kind:slash?'dragon':'lesson'});
  };
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
    return menu==='itemm'&&((phase==='heal'&&item.key==='hareMeat')||(phase==='corinHeal'&&item.key==='potion'));
  }
  function paint(){
    hint.hidden=!hint.dataset.instruction||!!scene||!!revealing;
    if(!holding())return;
    clearHighlight();
    const control=phase==='swordSwipe'?'act':phase==='dragonButton'?'btnL':['itemsButton','corinItemsButton'].includes(phase)?'btnItems':null;
    if(control){document.getElementById(control)?.classList.add('riding-target');return;}
    if(!ovl||!MENUS[ovl])return;
    const menu=MENUS[ovl],items=menu.items(),rows=document.getElementById(menu.rows)?.querySelectorAll('.row')||[];
    const pick=items.findIndex(it=>allowedItem(ovl,it));
    if(pick<0)return;
    menu.pick=pick;
    rows.forEach((row,i)=>{row.classList.toggle('riding-target',i===pick);row.classList.toggle('on',i===pick);row.setAttribute('aria-disabled',String(i!==pick));});
    if(ovl==='itemm')rows[pick]?.scrollIntoView?.({block:'nearest'});
  }
  function stageEnemies(ring){
    if(MAPID!=='world')return;
    if(!ring){
      for(const a of currentArenaFeatures())if(a.id===FIRST_ARENA||a.id===SWORD_ARENA)stageEnemies(a);
      return;
    }
    const sword=ring.id===SWORD_ARENA;
    if((ring.id!==FIRST_ARENA&&!sword)||(sword?swordDone:done))return;
    const cx=ring.x*TS+TS/2,cy=ring.y*TS+TS/2,limit=(ring.r-1.5)*TS;
    const north=[];
    // Bring both tutorial rows into view; their sprites stand near the center.
    for(let y=sword?cy+TS/2:cy;y<=(sword?cy+TS/2:cy);y+=24)for(const offset of [-36,0,36,-54,54]){
      const x=cx+offset;
      if(Math.hypot(x-cx,y-cy)<limit&&dragonCanStand(x,y))north.push([x,y]);
    }
    if(!north.length)return;
    const enemies=foes.filter(f=>f.st!=='dead'&&!f.ally&&!f.huntingArena&&
      (f.ridingArena===ring.id||Math.hypot(f.x/TS-ring.x,f.y/TS-ring.y)<ring.r+5));
    enemies.forEach((foe,i)=>{
      if(foe.ridingArena===ring.id)return; // Entering must never relocate a visible foe.
      [foe.x,foe.y]=north[i%north.length];foe.hx=foe.x;foe.hy=foe.y;
      foe.ridingArena=ring.id;foe.st='idle';foe.t=0;foe.dir='s';
    });
  }
  function waitingEnemy(foe){
    if(MAPID==='world'&&foe.ridingArena===SWORD_ARENA)return !swordDone;
    return !done&&MAPID==='world'&&foe.ridingArena===FIRST_ARENA&&
      (arenaLock?.id!==FIRST_ARENA||holding());
  }
  function entered(ring){
    if(!swordDone&&!phase&&MAPID==='world'&&ring.id===SWORD_ARENA&&hasSword()){
      corinStartHp=pHp;corinHit=false;
      stageEnemies(ring);moveTo('swordWalls');return;
    }
    if(done||phase||MAPID!=='world'||ring.id!==FIRST_ARENA||!hasDragon()||!dragonIntroDone)return;
    if(mounted)setMounted(false,true);
    ringId=ring.id;moveTo('gather');
    hunt=null;breath=null;claw=null;dragonFacingLocked=false;
    dragon.air=false;dragon.tr=null;dragon.moving=false;dragon.placed=MAPID;
    const cx=ring.x*TS+TS/2,cy=ring.y*TS+TS/2,limit=(ring.r-1.5)*TS;
    const inRing=(x,y)=>Math.hypot(x-cx,y-cy)<limit;
    stageEnemies(ring);
    let flyIn=false;
    const approach=(actor,x,y,clear)=>{
      let landing=null;
      for(const radius of [0,8,16,24,32])for(let a=0;a<8;a++){
        const target=[x+Math.cos(a*Math.PI/4)*radius,y+Math.sin(a*Math.PI/4)*radius];
        if(target[1]<cy+8||!inRing(...target)||!clear(...target))continue;
        landing ||= target;
        const path=maddockWalkPath(actor,target,clear);
        if(path)return path;
      }
      // If trees cut off his ground route, Aurelius can hop over them and
      // land on a checked spot inside, before asking Corin to mount.
      if(actor===dragon&&landing){flyIn=true;return [landing];}
      return null;
    };
    assembly={p:approach(P,cx-24,cy+60,canStand),d:approach(dragon,cx+24,cy+56,dragonCanStand)};
    dragon.air=flyIn;
    if(dragon.hp<=dragonFlightMinimum()){dragon.hp=dragonFlightMinimum()+1;dragon.down=false;dragon.revive=0;dragon.knockdown=0;}
  }
  function gather(dt){
    if(phase!=='gather')return false;
    const walk=(actor,path,speed)=>{
      actor.moving=false;if(!path)return false;
      let left=speed*dt;
      while(path.length&&left>0){
        const [x,y]=path[0],dx=x-actor.x,dy=y-actor.y,d=Math.hypot(dx,dy),step=Math.min(d,left);
        if(actor===P)faceCorinAt(x,y);else dragon.dir=direction4(dx,dy,dragon.dir);
        actor.moving=d>0;
        if(d<=step){actor.x=x;actor.y=y;path.shift();}
        else{actor.x+=dx/d*step;actor.y+=dy/d*step;}
        left-=step;
      }
      return path.length===0;
    };
    const playerReady=walk(P,assembly.p,90),dragonReady=walk(dragon,assembly.d,130);
    if(playerReady&&dragonReady){
      P.moving=false;dragon.moving=false;dragon.air=false;faceCorinAt(P.x,P.y-TS);dragon.dir='n';
      assembly=null;moveTo('walls');
    }
    return true;
  }
  function step(dt){
    if(!gameplayStarted||mode!=='play')return;
    hint.hidden=!hint.dataset.instruction||!!scene||!!revealing;
    if(phase==='swordWalls'&&arenaT>=1&&!scene){
      window.EmberBattleMusic?.start();moveTo('swordTalk');
      playScene(["Corin: What are these walls? I can’t escape! I have to fight!"],{who:'Corin',hidePortrait:true,after:()=>{
        moveTo('swordSwipe','Press A to Swing Your Sword');paint();
      }});
    }
    if(resumeRecovery&&!scene&&!revealing){resumeRecovery=false;beginRecovery();return;}
    if(resumeCorin&&!scene&&!revealing){resumeCorin=false;beginCorinRecovery();return;}
    if(phase==='walls'&&arenaT>=1&&!scene){
      window.EmberBattleMusic?.start();unlocked=true;moveTo('mountTalk');
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
    if(!unlocked&&(which==='airm'||which==='atkm'))return false;
    if(!holding()||internal)return true;
    return (phase==='dragonButton'&&which==='atkm')||(['itemsButton','corinItemsButton'].includes(phase)&&which==='itemm')||
      ((phase==='mount'||phase==='dismount')&&which==='airm')||(phase==='fire'&&which==='atkm')||(['heal','corinHeal'].includes(phase)&&which==='itemm');
  }
  function opened(which){
    if(internal)return;
    if(phase==='dragonButton'&&which==='atkm'){
      breathCooldown.fire=0;
      moveTo('fire','Choose Fire to attack.');
      // Keep the menu open under his question; the next input selects Fire.
      playScene(['Aurelius: What should I do?'],{telepathy:true,ridingFirePrompt:true});
      paint();
    }else if(phase==='itemsButton'&&which==='itemm'){
      moveTo('heal','Choose Hare Meat to heal Aurelius.');paint();
    }else if(phase==='corinItemsButton'&&which==='itemm'){
      moveTo('corinHeal','Choose Potion to restore Corin’s hearts.');paint();
    }
  }
  function fired(element){
    if(phase!=='fire'||element!=='fire')return;
    if(scene?.ridingFirePrompt){scene=null;showScene();}
    window.EmberArenaEntry?.activate(arenaLock);
    moveTo('battle','Press A to Slash');hintTime=Infinity;overlay(null);saveGame();
  }
  function completed(ring){
    if(!corinHealDone&&phase==='swordBattle'&&ring?.id===SWORD_ARENA){beginCorinRecovery();return;}
    if(done||phase!=='battle'||ring?.id!==ringId)return;
    // A scripted exhausted state makes this lesson reliable even after a clean win.
    moveTo('recovery');beginRecovery();
  }
  function swordContact(){
    if(phase!=='swordBattle'||corinHealDone||corinHit)return;
    corinHit=true;
    // The first close exchange guarantees a small, nonlethal graze if no
    // enemy has already hurt him. It happens on contact, never on a missed A.
    if(pHp>=corinStartHp&&pHp>1){
      pHp--;pInv=1.1;
      P.act={kind:'hurt',t:0,dir:P.dir,flip:P.flip,dir8:playerFacing4()};
    }
  }
  function beginCorinRecovery(){
    moveTo('corinRecovery');overlay(null);
    // Keep a reload or an automatic healing charm from making the lesson unusable.
    pHp=Math.max(1,Math.min(pHp,pMax-1));potions=Math.max(1,potions);
    saveGame();moveTo('corinHealTalk');
    playScene(['Corin: Ow... I should drink a potion before I go any farther.'],{who:'Corin',after:()=>{
      moveTo('corinItemsButton','Open the highlighted BAG button.');paint();
    }});
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
    ],()=>{moveTo('itemsButton','Open the highlighted BAG button.');overlay(null);paint();});
  }
  function usedItem(item){
    if(phase==='corinHeal'&&item.key==='potion'){
      moveTo('corinThanks');overlay(null);setBag(false);
      playScene(['Corin: That’s better. Potions restore my hearts. I should keep some with me.'],{who:'Corin',after:()=>{
        corinHealDone=true;moveTo('');saveGame();
      }});
      return true;
    }
    if(phase!=='heal'||item.key!=='hareMeat'||dragon.hp<=dragonFlightMinimum())return false;
    moveTo('thanks');overlay(null);setBag(false);
    say(['Aurelius: That is better. Thank you, Corin.',
      'Aurelius: If I am badly hurt, I need meat or fish before I can fly again. Keep an eye on my health.'],()=>{
      done=true;unlocked=true;moveTo('');saveGame();
    });
    return true;
  }
  function allowControl(id){
    if(!unlocked&&(id==='btnL'||id==='btnR'))return false;
    if(!holding())return true;
    return id==='act'||(phase==='dragonButton'&&id==='btnL')||(['itemsButton','corinItemsButton'].includes(phase)&&id==='btnItems');
  }
  function action(){
    // A still reaches the normal slash control; only its teaching card fades.
    if(phase==='battle'&&hintTime>0&&!hint.classList.contains('dismissing')&&!scene&&!ovl&&!ask&&!bagOpen&&!revealing){
      hintTime=0;notice('');document.body.classList.remove('riding-guide');
    }
    if(!holding())return false;
    if(phase==='swordSwipe'){
      startAct('swing');
      if(P.act?.kind==='swing'){swordDone=true;window.EmberArenaEntry?.activate(arenaLock);moveTo('swordBattle');saveGame();}
      return true;
    }
    if(phase==='fire'&&ovl==='atkm'){ovlTake();return true;}
    if(scene){advanceScene();return true;}
    if(phase==='dragonButton'){setOvl('atkm');return true;}
    if(['itemsButton','corinItemsButton'].includes(phase)){setOvl('itemm');return true;}
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
    if(event.target?.closest?.('.riding-target,#act,#say,#ridingHint'))return false;
    event.preventDefault();event.stopImmediatePropagation();return true;
  }
  function capture(){return {version:3,done,unlocked,phase,ringId,swordDone,corinHealDone,corinHit,corinStartHp};}
  function restore(saved){
    clearHighlight();notice('');phase='';assembly=null;resumeRecovery=false;resumeCorin=false;document.body.classList.remove('riding-guide');
    const data=saved.ridingTutorial;
    swordDone=data?.swordDone===undefined?(saved.quest>Q.ARMED||!!data?.done):!!data.swordDone;
    corinHealDone=data?.version===3?!!data.corinHealDone:swordDone;
    corinHit=!!data?.corinHit;corinStartHp=Number.isFinite(data?.corinStartHp)?data.corinStartHp:pHp;
    resumeCorin=!corinHealDone&&corinRecoveryPhases.has(data?.phase);
    if(data?.version===1||data?.version===2||data?.version===3){
      done=!!data.done;ringId=data.ringId??null;
      resumeRecovery=!done&&recoveryPhases.has(data.phase);
      // Incomplete lessons from the previous arena restart at #5. A lesson
      // already in combat or recovery keeps its unlocked controls on reload.
      unlocked=done||resumeRecovery||(ringId===FIRST_ARENA&&data.phase==='battle');
    }
    else{
      // Existing players who were already taught riding keep their controls.
      done=!!saved.dragonIntroDone&&!!(saved.thornwellMet||saved.smithUpgrade||saved.wonAll||saved.breathHas?.lightning||saved.x>=220*TS);
      unlocked=done;ringId=null;
    }
    if(resumeRecovery){phase='recovery';document.body.classList.add('riding-guide');}
    if(resumeCorin){
      phase='corinRecovery';document.body.classList.add('riding-guide');
      cooling.set('world:'+SWORD_ARENA,ARENA_REST);
      const ring=MAPID==='world'&&currentArenaFeatures().find(a=>a.id===SWORD_ARENA);
      if(ring)for(const foe of foes)if(!foe.ally&&Math.hypot(foe.x/TS-ring.x,foe.y/TS-ring.y)<ring.r+5)foe.st='dead';
    }else if(!corinHealDone&&data?.phase==='swordBattle')phase='swordBattle';
    if((resumeRecovery||done)&&ringId!==null&&MAPID==='world'){
      cooling.set('world:'+ringId,ARENA_REST);
      const ring=currentArenaFeatures().find(a=>a.id===ringId);
      if(ring&&Math.hypot(P.x/TS-ring.x,P.y/TS-ring.y)<ring.r+2){
        for(const foe of foes)if(!foe.ally&&Math.hypot(foe.x/TS-ring.x,foe.y/TS-ring.y)<ring.r+5)foe.st='dead';
      }
    }
    stageEnemies();
  }
  function skip(){swordDone=true;corinHealDone=true;done=true;unlocked=true;resumeRecovery=false;resumeCorin=false;moveTo('');}
  window.EmberRiding={stageEnemies,waitingEnemy,holding,step,gather,gathering:()=>phase==='gather',entered,completed,allowedItem,allowOverlay,opened,paint,mountedAction,fired,usedItem,swordContact,allowControl,action,key,blockPointer,capture,restore,skip,
    canSwipe:()=>swordDone||phase==='swordSwipe',
    unlocked:()=>unlocked,protectFirstBattle:()=>phase==='battle',protectSwordBattle:()=>phase==='swordBattle',blocksArenaEntry:()=>recoveryPhases.has(phase)||corinRecoveryPhases.has(phase)};
})();
