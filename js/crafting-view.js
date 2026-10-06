/* Learned recipes and a tactile, animated camp kit. */
(()=>{
  let root=null,selected='potion',tab='recipes',previousFocus=null;
  const icon=id=>{const i=Object.keys(Crafting.materials).indexOf(id);return i>=0?`<span class="craft-ingredient-art" style="background-position:${i%5*25}% ${Math.floor(i/5)*100}%" aria-hidden="true"></span>`:'<canvas class="craft-item-art" width="96" height="96" data-item="'+id+'" aria-hidden="true"></canvas>';};
  const label=id=>Crafting.materials[id]?.name||Crafting.recipe(id)?.name||({boarMeat:'Boar Meat',hareMeat:'Hare Meat',deerMeat:'Deer Meat',foxMeat:'Fox Meat',birdMeat:'Bird Meat',dragonFish:'Fresh Fish'})[id]||id;
  function shell(){
    if(root)return;
    root=document.createElement('section');root.id='craftingView';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','craftTitle');
    root.innerHTML='<header class="craft-header"><div><small>GATHER · LEARN · MAKE</small><h1 id="craftTitle">The Fieldcraft Book</h1></div><button class="craft-close" aria-label="Close crafting">×</button></header><nav class="craft-tabs" aria-label="Crafting pages"><button data-tab="recipes">Recipes</button><button data-tab="ingredients">Ingredients</button><span class="craft-account"></span></nav><div class="craft-book"></div><div class="craft-play" hidden></div><footer class="craft-footer"><span role="status" class="craft-note"></span><button class="craft-back">Return to game</button></footer>';
    document.body.appendChild(root);
    root.querySelector('.craft-close').onclick=()=>Crafting.close();root.querySelector('.craft-back').onclick=back;
    for(const b of root.querySelectorAll('[data-tab]'))b.onclick=()=>book(b.dataset.tab);
    root.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
    root.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...root.querySelectorAll('button,input')].filter(b=>!b.disabled&&b.getClientRects().length);if(!items.length)return;
      const i=items.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&i===items.length-1){e.preventDefault();items[0].focus();}});
    const stopGesture=()=>{drag=null;Crafting.release();};addEventListener('blur',stopGesture);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGesture();});
  }
  function show(page='recipes'){
    shell();previousFocus=document.activeElement;root.hidden=false;document.body.classList.add('crafting-open');
    const first=Crafting.help();book(page);
    if(first)root.querySelector('.craft-note').textContent='Recipes appear here only after someone teaches them to you.';
    root.querySelector('.craft-close').focus({preventScroll:true});
  }
  function hide(){drag=null;if(!root)return;root.hidden=true;document.body.classList.remove('crafting-open');previousFocus?.focus?.({preventScroll:true});}
  function paintIcons(){for(const c of root.querySelectorAll('canvas[data-item]')){const id=c.dataset.item,r=Crafting.recipe(id),key=r?.raw||id;drawBagIcon(c,BAG.find(i=>i.key===key)?.icon?.(),0);}}
  function book(page=tab){
    if(!root||!Crafting.active())return;
    if(Crafting.current()&&Crafting.current().phase!=='result')return;
    tab=page;root.querySelector('.craft-book').hidden=false;root.querySelector('.craft-play').hidden=true;root.querySelector('.craft-tabs').hidden=false;
    root.querySelector('.craft-back').textContent='Return to game';
    root.querySelector('.craft-account').textContent=Crafting.merchant()?gold+' gold':'';
    for(const b of root.querySelectorAll('[data-tab]'))b.setAttribute('aria-pressed',String(b.dataset.tab===tab));
    const panel=root.querySelector('.craft-book');panel.className='craft-book '+tab;
    if(tab==='ingredients'){
      panel.innerHTML='<div class="craft-ingredient-list">'+Object.entries(Crafting.materials).filter(([id])=>Crafting.count(id)>0||Crafting.availableStock().includes(id)||Crafting.recipes.some(r=>Crafting.known(r)&&r.cost[id])).map(([id,m])=>`<article>${icon(id)}<div><h2>${m.name} <small>×${Crafting.count(id)}</small></h2><p>${m.source}</p>${Crafting.availableStock().includes(id)?`<button data-buy="${id}" ${gold<m.price?'disabled':''}>Buy 1 · ${m.price} gold</button>`:''}</div></article>`).join('')+'</div>';
      if(!panel.querySelector('article'))panel.querySelector('.craft-ingredient-list').innerHTML='<p>Your gathered ingredients will appear here.</p>';
      for(const b of panel.querySelectorAll('[data-buy]'))b.onclick=()=>Crafting.buy(b.dataset.buy);
      root.querySelector('.craft-note').textContent=Crafting.merchant()?'Common ingredients are sold here. Spirit essence must be found.':'Gather glowing patches with A. Plants regrow in 20 minutes; your discoveries and supplies are saved.';
      return;
    }
    const learned=Crafting.recipes.filter(r=>Crafting.known(r));
    if(!learned.length){panel.innerHTML='<article class="craft-empty"><h2>Your recipe pages are blank</h2><p>The recipes you learn on your journey will be recorded here.</p></article>';root.querySelector('.craft-note').textContent='There are no recipes in your book yet.';return;}
    const r=learned.find(r=>r.id===selected)||learned[0];selected=r.id;const max=Crafting.maxBatch(r);
    panel.innerHTML='<div class="craft-recipes" aria-label="Choose a recipe">'+learned.map(r=>`<button class="craft-recipe ${r.id===selected?'selected':''}" data-recipe="${r.id}" aria-pressed="${r.id===selected}">${icon(r.raw||r.id)}<span><strong>${r.name}</strong><small>${Crafting.maxBatch(r)?'Ready to make':'Need ingredients'}</small></span></button>`).join('')+`</div><article class="craft-detail"><div class="craft-recipe-hero">${icon(r.raw||r.id)}<div><small>${r.kind==='cook'?'CAMP KITCHEN':r.kind==='grind'?'POWDERS & TOOLS':'BREWS & REMEDIES'}</small><h2>${r.name}</h2></div></div><p>${esc(playerFacingText(r.effect))}</p><h3>For one batch</h3><ul class="craft-costs">${Object.entries(r.cost).map(([id,n])=>`<li class="${Crafting.count(id)<n?'missing':''}">${icon(id)}<div><strong>${label(id)}</strong><small>${Crafting.materials[id]?.source||'Hunting and fishing provide raw food.'}</small></div><b>${Crafting.count(id)} / ${n}</b></li>`).join('')}</ul><p class="craft-explain">Choose your quantity, then slide to craft.</p><div class="craft-starts"><button data-start="1" ${!max?'disabled':''}>Make 1</button><button data-start="${max}" ${!max?'disabled':''}>Make ${max||'max'}${max===5?' · full batch':''}</button></div></article>`;
    for(const b of panel.querySelectorAll('[data-recipe]'))b.onclick=()=>{selected=b.dataset.recipe;book();};
    for(const b of panel.querySelectorAll('[data-start]'))b.onclick=()=>Crafting.start(selected,+b.dataset.start);
    root.querySelector('.craft-note').textContent=max?'Your ingredients are ready. Each batch makes the quantity you choose.':'Gather the ingredients listed in your learned recipe.';
    paintIcons();
  }
  let drag=null;
  function play(){
    drag=null;const s=Crafting.current(),r=Crafting.recipe(s.id),panel=root.querySelector('.craft-play');
    root.querySelector('.craft-book').hidden=true;root.querySelector('.craft-tabs').hidden=true;panel.hidden=false;panel.classList.add('craft-simple');
    panel.innerHTML='<div class="craft-confirm-card"><canvas class="craft-result-icon" width="128" height="128" aria-hidden="true"></canvas><h2>'+r.name+' × '+s.qty+'</h2><p>'+Object.entries(r.cost).map(([id,n])=>n*s.qty+' '+label(id)).join(' · ')+'</p><div class="craft-slide-track"><span>Slide to craft →</span><button class="craft-slider-thumb" role="slider" aria-label="Slide to craft '+r.name+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-valuetext="Slide right to craft">➜</button></div><p class="craft-slide-help">Drag the handle all the way right.</p><p class="craft-feedback" role="status" aria-live="polite"></p><button class="craft-done" hidden>Back to recipes</button></div>';
    drawBagIcon(panel.querySelector('canvas'),BAG.find(i=>i.key===r.id)?.icon?.(),0);
    const thumb=panel.querySelector('.craft-slider-thumb'),track=panel.querySelector('.craft-slide-track');
    thumb.onpointerdown=e=>{if(drag||e.button>0||Crafting.current()?.phase!=='confirm')return;e.preventDefault();thumb.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,start:Crafting.current().progress};};
    thumb.onpointermove=e=>{if(drag?.id!==e.pointerId)return;e.preventDefault();const span=track.clientWidth-thumb.offsetWidth-8;Crafting.slide(drag.start+(e.clientX-drag.x)/Math.max(1,span));};
    thumb.onpointerup=e=>{if(drag?.id!==e.pointerId)return;drag=null;if(Crafting.current().progress>=1)Crafting.finish();else Crafting.release();};
    for(const event of ['pointercancel','lostpointercapture'])thumb.addEventListener(event,()=>{if(drag){drag=null;Crafting.release();}});
    thumb.onkeydown=e=>{if(slideKey(e))e.stopPropagation();};
    panel.querySelector('.craft-done').onclick=()=>Crafting.press();
    root.querySelector('.craft-back').textContent='Cancel';root.querySelector('.craft-note').textContent='Cancelling returns all reserved ingredients.';paint();thumb.focus({preventScroll:true});
  }
  function slideKey(e){
    if(!e.target?.classList?.contains('craft-slider-thumb'))return false;
    const k=e.key;if(!['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','Home','End','Enter',' '].includes(k))return false;e.preventDefault();
    const s=Crafting.current();if(s?.phase!=='confirm')return true;
    if(k==='Enter'||k===' '){if(s.progress>=1)Crafting.finish();}
    else Crafting.slide(k==='Home'?0:k==='End'?1:Math.round((s.progress+(['ArrowRight','ArrowUp'].includes(k)?.1:-.1))*10)/10);return true;
  }
  function back(){drag=null;if(Crafting.current()){Crafting.cancel();book();}else Crafting.close();}
  function result(){drag=null;root.querySelector('.craft-back').textContent='Back to recipes';root.querySelector('.craft-note').textContent='Your finished items are in the Bag.';paint();root.querySelector('.craft-done').focus({preventScroll:true});}
  function paint(){
    const s=Crafting.current();if(!root||!s||root.hidden)return;const panel=root.querySelector('.craft-play');if(panel.hidden)return;const done=s.phase==='result',thumb=panel.querySelector('.craft-slider-thumb'),track=panel.querySelector('.craft-slide-track');if(!thumb)return;
    thumb.style.transform='translateX('+Math.max(0,(track.clientWidth-thumb.offsetWidth-8)*s.progress)+'px)';thumb.setAttribute('aria-valuenow',Math.round(s.progress*100));thumb.setAttribute('aria-valuetext',s.progress>=1?'Release or press Enter to craft':Math.round(s.progress*100)+' percent');track.style.setProperty('--fill',s.progress*100+'%');track.hidden=done;
    panel.querySelector('.craft-slide-help').hidden=done;panel.querySelector('.craft-done').hidden=!done;panel.querySelector('.craft-feedback').textContent=done?s.produced+' × '+Crafting.recipe(s.id).name+' added to your Bag.':'';
  }
  function key(e){
    if(!Crafting.active())return false;if(e.key==='Tab')return false;if(e.type==='keyup')return true;if(slideKey(e))return true;
    const k=e.key.toLowerCase();if([' ','enter'].includes(k)&&e.target?.closest?.('button,input'))return true;
    e.preventDefault();if(e.repeat)return true;if(['b','escape'].includes(k))back();else if(['a',' ','enter'].includes(k)){if(Crafting.current())Crafting.press();else root.querySelector('[data-start="1"]')?.click();}return true;
  }
  window.CraftingView={show,hide,book,play,paint,result,key,back};
})();
