/* Learned recipes and an untimed, touch-first mixing board. */
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
    addEventListener('blur',()=>Crafting.release());document.addEventListener('visibilitychange',()=>{if(document.hidden)Crafting.release();});
  }
  function show(page='recipes'){
    shell();previousFocus=document.activeElement;root.hidden=false;document.body.classList.add('crafting-open');
    const first=Crafting.help();book(page);
    if(first)root.querySelector('.craft-note').textContent='Recipes appear here only after someone teaches them to you.';
    root.querySelector('.craft-close').focus({preventScroll:true});
  }
  function hide(){if(!root)return;root.hidden=true;document.body.classList.remove('crafting-open');previousFocus?.focus?.({preventScroll:true});}
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
    panel.innerHTML='<div class="craft-recipes" aria-label="Choose a recipe">'+learned.map(r=>`<button class="craft-recipe ${r.id===selected?'selected':''}" data-recipe="${r.id}" aria-pressed="${r.id===selected}">${icon(r.raw||r.id)}<span><strong>${r.name}</strong><small>${Crafting.maxBatch(r)?'Ready to make':'Need ingredients'}</small></span></button>`).join('')+`</div><article class="craft-detail"><div class="craft-recipe-hero">${icon(r.raw||r.id)}<div><small>${r.kind==='cook'?'CAMP KITCHEN':r.kind==='grind'?'POWDERS & TOOLS':'BREWS & REMEDIES'}</small><h2>${r.name}</h2></div></div><p>${esc(playerFacingText(r.effect))}</p><h3>For one batch</h3><ul class="craft-costs">${Object.entries(r.cost).map(([id,n])=>`<li class="${Crafting.count(id)<n?'missing':''}">${icon(id)}<div><strong>${label(id)}</strong><small>${Crafting.materials[id]?.source||'Hunting and fishing provide raw food.'}</small></div><b>${Crafting.count(id)} / ${n}</b></li>`).join('')}</ul><p class="craft-explain">Turn the mixing channels to connect the inlet to the bowl through the three gold stations. Take your time — this is a puzzle, not a race.</p><div class="craft-starts"><button data-start="1" ${!max?'disabled':''}>Make 1</button><button data-start="${max}" ${!max?'disabled':''}>Make ${max||'max'}${max===5?' · full batch':''}</button></div></article>`;
    for(const b of panel.querySelectorAll('[data-recipe]'))b.onclick=()=>{selected=b.dataset.recipe;book();};
    for(const b of panel.querySelectorAll('[data-start]'))b.onclick=()=>Crafting.start(selected,+b.dataset.start);
    root.querySelector('.craft-note').textContent=max?'Your ingredients are ready. Each batch makes the quantity you choose.':'Gather the ingredients listed in your learned recipe.';
    paintIcons();
  }
  function play(){
    root.querySelector('.craft-book').hidden=true;root.querySelector('.craft-tabs').hidden=true;const panel=root.querySelector('.craft-play');panel.hidden=false;
    panel.innerHTML='<div class="craft-puzzle-copy"><small>THE MIXING BOARD</small><h2></h2><p>Tap a channel to turn it. Connect the inlet to the bowl, passing through all three gold stations.</p><div class="craft-puzzle-supplies"></div></div><div class="craft-board-wrap"><span class="craft-inlet">INLET →</span><div class="craft-board" role="group" aria-label="Mixing channels"></div><span class="craft-outlet">→ BOWL</span></div><div class="craft-instructions"><p class="craft-feedback" role="status" aria-live="polite"></p><button class="craft-hint">Help with one channel</button><button class="craft-action"></button><small>No timer · Arrow keys to select · A to turn · B to cancel</small></div>';
    const board=panel.querySelector('.craft-board');
    for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.dataset.tile=i;b.addEventListener('click',()=>Crafting.rotate(i));b.addEventListener('focus',()=>{const s=Crafting.current();if(s?.phase==='mix'&&s.board.selected!==i){s.board.selected=i;paint();}});board.appendChild(b);}
    panel.querySelector('.craft-action').onclick=()=>{if(Crafting.current()?.phase==='result')Crafting.press();else Crafting.finish();};
    panel.querySelector('.craft-hint').onclick=()=>Crafting.hint();
    root.querySelector('.craft-back').textContent='Cancel batch';root.querySelector('.craft-note').textContent='Leaving or reloading an unfinished batch returns your ingredients.';
    paint();board.firstElementChild.focus({preventScroll:true});
  }
  function back(){if(Crafting.current()){Crafting.cancel();book();}else Crafting.close();}
  function result(){root.querySelector('.craft-back').textContent='Back to recipes';root.querySelector('.craft-note').textContent='Your finished items are in the Bag.';paint();}
  function paint(){
    const s=Crafting.current();if(!root||!s||root.hidden)return;const r=Crafting.recipe(s.id),panel=root.querySelector('.craft-play');if(panel.hidden)return;
    const flow=Crafting.route(),done=s.phase==='result',names=['up','right','down','left'];
    panel.querySelector('h2').textContent=done?'Batch complete':r.name;
    panel.querySelector('.craft-puzzle-supplies').innerHTML=Object.entries(r.cost).map(([id,n])=>`<span>${icon(id)}${label(id)} ×${n*s.qty}</span>`).join('');
    for(const [i,b]of [...panel.querySelectorAll('[data-tile]')].entries()){
      const mask=s.board.tiles[i],lit=flow.cells.includes(i),station=s.board.stations.indexOf(i);
      b.classList.toggle('flowing',lit);b.classList.toggle('selected',i===s.board.selected);b.disabled=done;
      b.setAttribute('aria-label',`Channel ${i+1}: ${names.filter((_,d)=>mask&(1<<d)).join(' and ')}${station>=0?', gold station '+(station+1):''}${lit?', connected':''}. Turn clockwise.`);
      const ends=[[50,0],[100,50],[50,100],[0,50]];
      b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+ends.filter((_,d)=>mask&(1<<d)).map(([x,y])=>`<path class="craft-channel" d="M50 50 L${x} ${y}"/>`).join('')+'<circle cx="50" cy="50" r="12" class="craft-junction"/>'+(station>=0?`<circle cx="50" cy="50" r="19" class="craft-station"/><text x="50" y="56">${station+1}</text>`:'')+'</svg>';
    }
    panel.querySelector('.craft-feedback').textContent=done?`${s.produced} × ${r.name} added to your Bag.`:s.feedback;
    const b=panel.querySelector('.craft-action');b.disabled=!done&&!flow.complete;b.textContent=done?'Back to recipes':'Make '+s.qty+' × '+r.name;
    panel.querySelector('.craft-hint').hidden=done;
    paintIcons();
  }
  function key(e){
    if(!Crafting.active())return false;const k=e.key.toLowerCase();
    if(k==='tab')return false;
    if(e.type==='keyup'){if(['a',' ','enter'].includes(k))Crafting.release();return true;}
    // Native Enter/Space activates a focused book control accessibly.
    if([' ','enter'].includes(k)&&e.target?.closest?.('button,input'))return true;
    e.preventDefault();if(e.repeat)return true;
    if(['b','escape'].includes(k))back();else if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k)){Crafting.select(k==='arrowleft'?-1:k==='arrowright'?1:0,k==='arrowup'?-1:k==='arrowdown'?1:0);root.querySelector('[data-tile="'+Crafting.current()?.board.selected+'"]')?.focus();}else if(['a',' ','enter'].includes(k)){if(Crafting.current())Crafting.press();else root.querySelector('[data-start="1"]')?.click();}
    return true;
  }
  window.CraftingView={show,hide,book,play,paint,result,key,back};
})();
