/* New journal entries announce themselves once. Discovery can happen inside
   speech; the brief, passive notice also appears over conversations. */
(function(){
  let seen=new Set(),pending=[],seedOnNextScan=false,card=null,current=[],nextScan=0;
  const noticeKey=q=>{
    const id=q.questId||q.id;
    if(id==='main')return dragonLearned('king-plan')?'main:overthrow':null;
    return id;
  };
  function scan(quests=atlasQuestOptions()){
    const entries=new Map();
    for(const q of quests){const key=noticeKey(q);if(key)entries.set(key,{key,id:q.questId||q.id,title:q.title,detail:q.detail,place:q.place});}
    if(seedOnNextScan){
      // An old save establishes a baseline; installing this feature does not
      // turn years of already-known leads into a queue of new announcements.
      for(const key of entries.keys())seen.add(key);
      for(const q of atlasCompletedEntries()){const key=noticeKey(q);if(key)seen.add(key);}
      seedOnNextScan=false;return;
    }
    for(const [key,q]of entries)if(!seen.has(key)){seen.add(key);pending.push(q);}
    // A lead completed before returning to gameplay no longer needs an alert.
    pending=pending.filter(q=>!atlasQuestComplete(q.id));
  }
  let elapsed=0,lastTick=null;
  function hidden(){if(card)card.hidden=true;}
  function node(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=playerFacingText(text);return el;}
  function render(){
    if(!card){card=node('aside');card.id='questUnlockNotice';card.setAttribute('role','status');card.setAttribute('aria-live','polite');card.setAttribute('aria-atomic','true');document.body.appendChild(card);}
    card.replaceChildren();card.classList.remove('fading');
    card.append(node('small',current.length===1?'NEW QUEST':current.length+' NEW QUESTS'));
    card.append(node('strong',current[0].title+(current.length>1?' · +'+(current.length-1)+' more':'')));
    card.append(node('span','View in Map → Quest List'));
    card.hidden=false;
  }
  function tick(now=performance.now()){
    const dt=lastTick===null?0:Math.max(0,now-lastTick);lastTick=now;
    if(!gameplayStarted||mode!=='play'||BOOT.waiting||document.hidden||window.EmberCloud?.isOpen()||window.__titleTransition){hidden();return;}
    if(now>=nextScan){scan();nextScan=now+400;}
    // It is a passive notice: dialogue keeps typing, choices remain usable,
    // and no dismissal or focus change is required, even in a conversation.
    if(current.length){
      elapsed+=dt;
      if(elapsed>=4800){current=[];hidden();}
      else{card.hidden=false;card.classList.toggle('fading',elapsed>=4100);return;}
    }
    if(!pending.length)return;
    current=pending.splice(0);elapsed=0;render();saveGame();
  }
  function capture(){return {version:1,seen:[...seen],pending:pending.map(q=>({...q}))};}
  function restore(saved){
    hidden();current=[];elapsed=0;lastTick=null;nextScan=0;pending=[];
    seen=new Set((Array.isArray(saved?.seen)?saved.seen:[]).filter(k=>typeof k==='string'&&k.length<150));
    seedOnNextScan=!saved||saved.version!==1;
    for(const q of Array.isArray(saved?.pending)?saved.pending:[])if(q&&typeof q.key==='string'&&typeof q.id==='string'&&typeof q.title==='string'&&typeof q.detail==='string'&&seen.has(q.key)&&!pending.some(p=>p.key===q.key))pending.push({...q});
  }
  window.EmberQuestNotifications={scan,tick,capture,restore};
})();
