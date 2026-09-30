/* A single, touchable teaching surface: its button invokes the real A action. */
function layoutEncounterCards(){
  const canvas=document.getElementById('cv'),root=document.documentElement;
  const rect=canvas?.getBoundingClientRect?.();if(!rect?.width||!rect.height||!root?.style)return;
  const inset=Math.min(12,rect.width*.025,rect.height*.025);
  for(const [key,value]of Object.entries({left:rect.left+inset,top:rect.top+inset,width:rect.width-2*inset,height:rect.height-2*inset}))
    root.style.setProperty('--encounter-'+key,value+'px');
  root.dataset.encounterSize=rect.height<270?'tiny':rect.height<600?'compact':'regular';
}
window.EmberEncounterCard={layout:layoutEncounterCards,paint(node,{title,kicker='A NEW SKILL',detail='',action='Press A or tap to continue',kind='lesson'}){
  layoutEncounterCards();
  node.replaceChildren();node.dataset.instruction=title;node.dataset.kind=kind;
  node.classList.add('encounter-card');node.setAttribute('aria-label',title+'. '+action);
  const add=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls;if(text)e.textContent=text;node.appendChild(e);return e;};
  add('span','encounter-kicker',kicker);
  const emblem=add('span','encounter-emblem');emblem.setAttribute('aria-hidden','true');
  emblem.innerHTML='<svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="49" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 7"/><g class="blade-left"><path d="M32 20 91 79 79 91 20 32 20 20Z" fill="currentColor"/><path d="m64 88 24-24 6 6-24 24Z" fill="#ba7652"/><path d="m81 88 12 12 7-7-12-12Z" fill="#edcb7b"/></g><g class="blade-right"><path d="M88 20 29 79 41 91 100 32 100 20Z" fill="currentColor"/><path d="m56 88-24-24-6 6 24 24Z" fill="#ba7652"/><path d="m39 88-12 12-7-7 12-12Z" fill="#edcb7b"/></g></svg>';
  add('strong','encounter-title',title);
  add('span','encounter-detail',detail);
  const cta=add('span','encounter-action');const key=document.createElement('b');key.textContent='A';cta.appendChild(key);
  const label=document.createElement('span');label.textContent=action;cta.appendChild(label);
  add('span','encounter-footnote',kind==='battle'?'Take a breath. Make your first move count.':'One step at a time. You’ve got this.');
}};
window.addEventListener?.('resize',layoutEncounterCards);
window.visualViewport?.addEventListener('resize',layoutEncounterCards);
window.visualViewport?.addEventListener('scroll',layoutEncounterCards);
if(typeof ResizeObserver!=='undefined'){
  const canvas=document.getElementById('cv');if(canvas)new ResizeObserver(layoutEncounterCards).observe(canvas);
}
