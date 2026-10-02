/* Full-screen help stays inside the conversation's input/focus boundary. */
(function(){
  let panel=null,kind='',returnFocus=null;
  const node=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  function button(text,action,cls='conversationPanelButton'){
    const b=node('button',cls,text);b.type='button';
    b.onclick=e=>{e?.stopPropagation();action();};
    b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)action();}};return b;
  }
  function close(remember=true){
    if(!panel)return false;
    if(kind==='tutorial'&&remember)window.EmberFriendship.readTutorial();
    panel.remove();panel=null;kind='';
    const box=document.getElementById('bagAsk');for(const child of box.children){child.removeAttribute('inert');child.removeAttribute('aria-hidden');}
    returnFocus?.focus?.();returnFocus=null;window.EmberConversationFlow?.sync();return true;
  }
  function open(which='friendship'){
    if(panel)return;
    const box=document.getElementById('bagAsk');kind=which;returnFocus=document.activeElement;
    panel=node('section','conversationFullPanel scrolls');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','conversationPanelTitle');
    const header=node('header','conversationPanelHeader');
    const title=node('h2','',which==='tutorial'?'A little time to talk':'Friendships');title.id='conversationPanelTitle';
    header.append(node('small','conversationPanelEyebrow',which==='tutorial'?'Your first conversation':'The people you come to know'),title);
    const body=node('div','conversationPanelBody');
    if(which==='tutorial'){
      body.append(node('p','conversationPanelIntro','Conversations let Corin get to know people, hear their stories and share a little of his own. Take your time.'));
      body.append(node('p','conversationRewardExplanation','Friendships grow over several visits. Some topics only unlock later in the story, so discussing every topic available now may not fill the meter.'));
      const tips=node('dl','conversationTutorialTips');
      for(const [heading,words]of [
        ['Press To Chat','Tap the large button in Corin’s speech bubble, then choose a topic. His bubble becomes the topic list or his reply choices.'],
        ['Choose what Corin says','Read the NPC’s words, press Next, then choose a reply. Each reply has its own answer; you do not need to pick every branch to finish a topic.'],
        ['Read at your own pace','Next finishes a line that is still typing. Press it again to continue. After choosing a reply, the exchange flows to the final answer, which waits for you. Long lines follow the text as it appears; you can scroll back once it finishes.'],
        ['Come back to their last words','When a topic ends, the NPC’s last reply stays in the upper bubble. Press To Chat starts your next question. Profile is at the bottom left; Back / Goodbye and Next are in the middle.'],
        ['Grow each friendship','Finish a new conversation topic to raise that character’s friendship. Repeating a topic, picking another reply, shopping or collecting repeatable supplies does not earn extra progress.'],
        ['Some stories come later','Certain conversations only open as you progress through the story or help people. Using every topic available today may not fill the friendship meter. Keep exploring and return to talk again.'],
        ['A gift for getting to know them','Complete all of a character’s conversation topics and reach maximum friendship to receive 50 gold and a Potion, once for that character. Your progress and claimed rewards are saved with your game.'],
        ['Check your friendships','Tap the meter at the bottom right for a full-screen overview of the people you have spoken with. You can read these tips again there.']
      ])tips.append(node('dt','',heading),node('dd','',words));
      body.append(tips);
    }else{
      body.append(node('p','conversationPanelIntro','Some conversations only become available as you progress further into the story or help people. If you have discussed every topic you can see, keep exploring and visit again. Your friendship can still have room to grow.'));
      body.append(node('p','conversationRewardExplanation','Maximum friendship + every topic completed = 50 gold and 1 Potion. Each character gives this reward once. Replaying topics or choosing other replies never repeats the reward.'));
      body.append(button('How conversations work',()=>{close(false);open('tutorial');}));
      const cards=node('div','friendshipOverview');
      for(const s of window.EmberFriendship.overview()){
        const card=node('section','friendshipCard');
        card.classList.toggle('currentFriend',s.name===window.EmberFriendship.active().name);
        card.append(node('h3','',s.name),node('p','friendshipLevel','Friendship level '+s.level+' / 5 · '+s.percent+'%'));
        const meter=node('progress','friendshipProgress');meter.max=100;meter.value=s.percent;meter.setAttribute('aria-label',s.name+' friendship');card.append(meter);
        card.append(node('p','',s.completed+' of '+s.total+' topics completed'));
        card.append(node('p','friendshipAvailability',s.max?'Every topic completed.':s.remaining+' topics available to discuss · '+s.locked+' open later in the story'));
        card.append(node('p','friendshipReward',s.rewarded?'Reward received: 50 gold + 1 Potion':'Reward: 50 gold + 1 Potion'));
        cards.append(card);
      }
      body.append(node('h3','','People you have spoken with'),cards);
    }
    const footer=node('footer','conversationPanelFooter');footer.append(button(which==='tutorial'?'Got it — let’s talk':'Back to conversation',()=>close()));
    panel.append(header,body,footer);
    for(const child of box.children){child.setAttribute('inert','');child.setAttribute('aria-hidden','true');}
    box.append(panel);title.tabIndex=-1;title.focus?.({preventScroll:true});panel.scrollTop=0;
  }
  function key(e){
    if(!panel)return false;
    const k=e.key.toLowerCase();
    if(k==='tab'){
      const buttons=[...panel.querySelectorAll('button')];const i=buttons.indexOf(document.activeElement);
      e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus?.();return true;
    }
    if(['a','b','escape','enter',' '].includes(k)){
      // Let the focused help button own native activation; do not also select
      // the conversation option underneath the full-screen explanation.
      if((k==='enter'||k===' ')&&e.target?.closest?.('.conversationFullPanel button')){e.preventDefault();if(!e.repeat)e.target.closest('button').onclick?.(e);return true;}
      e.preventDefault();if(!e.repeat)close();return true;
    }
    if(k.startsWith('arrow')){e.preventDefault();panel.scrollTop+=(k==='arrowdown'?72:k==='arrowup'?-72:0);return true;}
    return true;
  }
  window.EmberConversationPanels={open,close,key,isOpen:()=>!!panel};
})();
