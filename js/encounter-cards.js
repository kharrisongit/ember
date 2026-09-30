/* Game-view cards leave the controller deck available for the real A input. */
const encounterCards=new Set();
function layoutEncounterCards(){
  const canvas=document.getElementById('cv'),root=document.documentElement;
  const rect=canvas?.getBoundingClientRect?.();if(!rect?.width||!rect.height||!root?.style)return;
  const inset=Math.min(12,rect.width*.025,rect.height*.025);
  for(const [key,value]of Object.entries({left:rect.left+inset,top:rect.top+inset,width:rect.width-2*inset,height:rect.height-2*inset}))
    root.style.setProperty('--encounter-'+key,value+'px');
  root.dataset.encounterSize=rect.height<270?'tiny':rect.height<600?'compact':'regular';
}
window.EmberEncounterCard={layout:layoutEncounterCards,blocking:()=>[...encounterCards].some(n=>!n.hidden&&!!n.dataset.instruction),paint(node,{title,kicker='A NEW SKILL',detail='',action='',key='A',kind='lesson',dismiss=kind==='battle'?'battle':'control'}){
  layoutEncounterCards();encounterCards.add(node);
  node.replaceChildren();node.dataset.instruction=title;node.dataset.kind=kind;node.dataset.dismiss=dismiss;
  const footer=dismiss==='a'?'Press A to dismiss':dismiss==='battle'?'Press A to begin':'';
  node.classList.add('encounter-card');node.setAttribute('aria-label',[title,action,footer].filter(Boolean).join('. '));
  const add=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;node.appendChild(e);return e;};
  const atmosphere=add('span','encounter-atmosphere');atmosphere.setAttribute('aria-hidden','true');
  for(let i=0;i<12;i++){
    const spark=document.createElement('i');spark.style.setProperty('--x',((i*29+7)%94+3)+'%');
    spark.style.setProperty('--y',((i*43+11)%90+5)+'%');spark.style.setProperty('--delay',(-i*.61)+'s');
    spark.style.setProperty('--drift',(i%2?12:-12)+'px');atmosphere.appendChild(spark);
  }
  add('span','encounter-kicker',kicker);
  const emblem=add('span','encounter-emblem');emblem.setAttribute('aria-hidden','true');
  emblem.innerHTML='<svg viewBox="0 0 120 120" width="120" height="120"><circle class="encounter-orbit" cx="60" cy="60" r="49" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 7"/><g class="blade-left"><path d="M32 20 91 79 79 91 20 32 20 20Z" fill="currentColor"/><path d="m64 88 24-24 6 6-24 24Z" fill="#ba7652"/><path d="m81 88 12 12 7-7-12-12Z" fill="#edcb7b"/></g><g class="blade-right"><path d="M88 20 29 79 41 91 100 32 100 20Z" fill="currentColor"/><path d="m56 88-24-24-6 6 24 24Z" fill="#ba7652"/><path d="m39 88-12 12-7-7 12-12Z" fill="#edcb7b"/></g></svg>';
  if(kind!=='battle')emblem.innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true"><g class="lesson-book"><path d="M17 32q23-9 43 4 20-13 43-4v59q-23-9-43 4-20-13-43-4Z" fill="#fff8e8" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M60 38v51M28 48l20 3M28 59l20 3M73 50l17-3M73 61l17-3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path class="lesson-spark" d="m90 11 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#c59340"/></g></svg>';
  add('strong','encounter-title',title);
  add('span','encounter-detail',detail);
  const cta=add('span','encounter-action');if(key){const badge=document.createElement('b');badge.textContent=key;cta.appendChild(badge);}
  const label=document.createElement('span');label.textContent=action;cta.appendChild(label);
  if(footer)add('span','encounter-footnote',footer);
}};
window.addEventListener?.('resize',layoutEncounterCards);
window.visualViewport?.addEventListener('resize',layoutEncounterCards);
window.visualViewport?.addEventListener('scroll',layoutEncounterCards);
if(typeof ResizeObserver!=='undefined'){
  const canvas=document.getElementById('cv');if(canvas)new ResizeObserver(layoutEncounterCards).observe(canvas);
}
