/* A guided, touch-driven lesson using the same cards as riding. */
(function(){
  let pending=false,done=false,active=false,target=null,card=null,lastStep='';
  function clear(){target?.classList.remove('equipment-target');target=null;if(card)card.hidden=true;}
  function finish(){done=true;pending=active=false;lastStep='';clear();toast('Spore equipped! Each defeated enemy restores one heart. You can wear three charms.');saveGame();}
  function step(){
    if(done||!pending)return;
    if(worn.spore){finish();return;}
    if(scene||sayNpc||revealing||ask?.npcConversation||ask?.conversationPrompt||ask?.dragonConversation||mode!=='play'){clear();return;}
    if(!active){active=true;clearPadInputs();P.moving=false;P.act=null;}
    if(!card){card=document.createElement('aside');card.id='equipmentHint';card.setAttribute('role','status');document.body.appendChild(card);}
    const oldTarget=target;target?.classList.remove('equipment-target');target=null;card.hidden=false;
    let title,detail,action,stage,number;
    if(!bagOpen){
      const quick=ovl==='itemm';stage=quick?'inventory':'bag';number=quick?2:1;
      target=document.getElementById(quick?'itemFullBtn':'btnItems');
      title=quick?'Open your full inventory':'Put your new charm to use';
      detail=quick?'Your inventory holds your equipment and key items. Open it to find the Shroom King’s gift.':'The Deep Ring Spore restores one heart after every defeated enemy, but first you need to equip it.';
      action=quick?'Tap Full inventory.':'Tap the highlighted Bag button.';
    }else if(wornCount()>=WORN_MAX){
      stage='make-room';number=3;
      const selected=bagHeld()[bagPick];
      target=selected?.charm&&worn[selected.charm]?document.getElementById('bagDesc').querySelector('.equipBtn'):
        [...document.getElementById('bagRows').querySelectorAll('.slot')].find(el=>worn[bagHeld().find(it=>it.key===el.dataset.itemKey)?.charm]);
      title='Make room for the spore';detail='You can wear three charms at once. Unequipping a charm keeps it safely in your Bag, ready to swap back later.';
      action=selected?.charm&&worn[selected.charm]?'Tap UNEQUIP to free a slot.':'Tap an equipped charm, then tap UNEQUIP.';
    }else if(bagHeld()[bagPick]?.charm!=='spore'){
      stage='spore';number=3;
      target=[...document.getElementById('bagRows').querySelectorAll('.slot')].find(el=>el.dataset.itemKey==='spore');
      title='Find the Deep Ring Spore';detail='Tap an item to see what it does. Charms must be equipped; simply carrying one will not activate its effect.';
      action='Tap the highlighted spore.';
    }else{
      stage='equip';number=4;target=document.getElementById('bagDesc').querySelector('.equipBtn');
      title='Equip your first charm';detail='The spore will fill one of your three charm slots. Its healing effect starts as soon as you equip it.';
      action='Tap EQUIP to wear the spore.';
    }
    if(stage!==lastStep){
      lastStep=stage;
      window.EmberEncounterCard.paint(card,{title,kicker:'EQUIPMENT · STEP '+number+' OF 4',detail,action,key:'↓',kind:'lesson',dismiss:'control'});
      card.dataset.step=stage;
      const progress=document.createElement('div');progress.className='equipment-progress';
      for(let i=1;i<=4;i++){const dot=document.createElement('span');dot.className=i<number?'complete':i===number?'current':'';dot.textContent=i<number?'✓':String(i);progress.appendChild(dot);}
      card.appendChild(progress);
    }else if(stage==='make-room'){
      const text=card.querySelector('.encounter-action span');if(text)text.textContent=action;
    }
    target?.classList.add('equipment-target');
    if(bagOpen){if(card.parentNode!==document.getElementById('bagHead').parentNode)document.getElementById('bagHead').after(card);}
    else if(card.parentNode!==document.body)document.body.appendChild(card);
    if(target&&target!==oldTarget&&bagOpen)target.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  }
  window.EmberEquipmentTutorial={step,holding:()=>active&&!done,
    earned:key=>{if(key==='spore'&&!done)pending=true;},
    capture:()=>({pending,done}),
    restore:s=>{clear();lastStep='';active=false;done=s.equipmentTutorial?!!s.equipmentTutorial.done:!!charm.spore;pending=!done&&!!s.equipmentTutorial?.pending;},
    skip:()=>{clear();lastStep='';pending=active=false;done=true;}};
})();
