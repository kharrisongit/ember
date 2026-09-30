/* Teach the real inventory controls after the Shroom King's gift. */
(function(){
  let pending=false,done=false,active=false,target=null,card=null;
  function clear(){target?.classList.remove('equipment-target');target=null;if(card)card.hidden=true;}
  function finish(){done=true;pending=active=false;clear();toast('Spore equipped. You can wear up to three charms.');saveGame();}
  function step(){
    if(done||!pending)return;
    if(worn.spore){finish();return;}
    if(scene||sayNpc||revealing||ask?.npcConversation||ask?.conversationPrompt||ask?.dragonConversation||mode!=='play'){clear();return;}
    if(!active){active=true;clearPadInputs();P.moving=false;P.act=null;}
    if(!card){card=document.createElement('aside');card.id='equipmentHint';card.setAttribute('role','status');document.body.appendChild(card);}
    clear();card.hidden=false;
    let instruction;
    if(!bagOpen){
      target=document.getElementById(ovl==='itemm'?'itemFullBtn':'btnItems');
      instruction=ovl==='itemm'?'Choose Full inventory to see your equipment.':'Open Items (the bag button) to use your new spore.';
    }else if(wornCount()>=WORN_MAX){
      const selected=bagHeld()[bagPick];
      target=selected?.charm&&worn[selected.charm]?document.getElementById('bagDesc').querySelector('.equipBtn'):null;
      instruction='Three charms are already equipped. Select one of them and choose UNEQUIP to make room for the spore.';
    }else if(bagHeld()[bagPick]?.charm!=='spore'){
      target=[...document.getElementById('bagRows').querySelectorAll('.slot')].find(el=>el.dataset.itemKey==='spore');
      instruction='Select the Spore of the deep ring in your inventory.';
    }else{
      target=document.getElementById('bagDesc').querySelector('.equipBtn');
      instruction=wornCount()>=WORN_MAX?'All three charm slots are full. Select an equipped charm and unequip it, then equip the spore.':'Choose EQUIP to wear the spore. Charms help only while equipped.';
    }
    card.textContent=instruction;target?.classList.add('equipment-target');
    // Fit the reminder in the game view above the controller, not over bag controls.
    const deck=document.getElementById('deck').getBoundingClientRect();
    if(bagOpen)document.getElementById('bagHead').after(card);
    else document.body.appendChild(card);
    card.style.bottom=Math.max(8,innerHeight-deck.top+8)+'px';
  }
  window.EmberEquipmentTutorial={step,holding:()=>active&&!done,
    earned:key=>{if(key==='spore'&&!done)pending=true;},
    capture:()=>({pending,done}),
    restore:s=>{clear();active=false;done=s.equipmentTutorial?!!s.equipmentTutorial.done:!!charm.spore;pending=!done&&!!s.equipmentTutorial?.pending;},
    skip:()=>{clear();pending=active=false;done=true;}};
})();
