/* Full-screen fieldcraft book and a three-step, touch-first workbench. */
(()=>{
  let root=null,selected='potion',tab='recipes',steady=false,previousFocus=null,lastPhase='',lastStatus='';
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
    if(first)root.querySelector('.craft-note').textContent='Nan packed ingredients for three potions. Choose Potion to try your first batch.';
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
      panel.innerHTML='<div class="craft-ingredient-list">'+Object.entries(Crafting.materials).map(([id,m])=>`<article>${icon(id)}<div><h2>${m.name} <small>×${Crafting.count(id)}</small></h2><p>${m.source}</p>${Crafting.availableStock().includes(id)?`<button data-buy="${id}" ${gold<m.price?'disabled':''}>Buy 1 · ${m.price} gold</button>`:''}</div></article>`).join('')+'</div>';
      for(const b of panel.querySelectorAll('[data-buy]'))b.onclick=()=>Crafting.buy(b.dataset.buy);
      root.querySelector('.craft-note').textContent=Crafting.merchant()?'Common ingredients are sold here. Spirit essence must be found.':'Gather glowing patches with A. Plants regrow in 20 minutes; your discoveries and supplies are saved.';
      return;
    }
    const r=Crafting.recipe(selected)||Crafting.recipes[0],known=Crafting.known(r),max=Crafting.maxBatch(r),t=Crafting.teachers[r.teacher];
    panel.innerHTML='<div class="craft-recipes" aria-label="Choose a recipe">'+Crafting.recipes.map(r=>`<button class="craft-recipe ${r.id===selected?'selected':''}" data-recipe="${r.id}" aria-pressed="${r.id===selected}">${icon(r.raw||r.id)}<span><strong>${r.name}</strong><small>${!Crafting.known(r)?'Learn from '+Crafting.teachers[r.teacher].name:Crafting.maxBatch(r)?'Ready to make':'Need ingredients'}</small></span></button>`).join('')+`</div><article class="craft-detail"><div class="craft-recipe-hero">${icon(r.raw||r.id)}<div><small>${r.kind==='cook'?'CAMP KITCHEN':r.kind==='grind'?'POWDERS & TOOLS':'BREWS & REMEDIES'}</small><h2>${r.name}</h2></div></div><p>${r.effect}</p><p class="craft-teacher">${known?'Recipe learned from ': 'Learn this recipe from '}${t.name} · ${t.where}</p><h3>For one batch</h3><ul class="craft-costs">${Object.entries(r.cost).map(([id,n])=>`<li class="${Crafting.count(id)<n?'missing':''}">${icon(id)}<div><strong>${label(id)}</strong><small>${Crafting.materials[id]?.source||'Hunting and fishing provide raw food.'}</small></div><b>${Crafting.count(id)} / ${n}</b></li>`).join('')}</ul><p class="craft-explain">Prepare, tend the heat, then finish. Every completed batch makes the item. Careful timing earns one extra.</p><label class="craft-steady"><input type="checkbox" ${steady?'checked':''}> Steady mode <small>Untimed steps, same rewards</small></label><div class="craft-starts"><button data-start="1" ${!max?'disabled':''}>Make 1</button><button data-start="${max}" ${!max?'disabled':''}>Make ${max||'max'}${max===5?' · full batch':''}</button></div></article>`;
    for(const b of panel.querySelectorAll('[data-recipe]'))b.onclick=()=>{selected=b.dataset.recipe;book();};
    panel.querySelector('input').onchange=e=>{steady=e.target.checked;};
    for(const b of panel.querySelectorAll('[data-start]'))b.onclick=()=>Crafting.start(selected,+b.dataset.start,steady);
    root.querySelector('.craft-note').textContent=known?max?'Your ingredients are ready. A batch takes about ten seconds.':'The ingredient list tells you where to look. Merchants sell basic supplies.':'Each recipe lists its teacher so you can find your next lesson.';
    paintIcons();
  }
  function play(){
    root.querySelector('.craft-book').hidden=true;root.querySelector('.craft-tabs').hidden=true;const panel=root.querySelector('.craft-play');panel.hidden=false;
    panel.innerHTML='<div class="craft-progress"><span>1 · Prepare</span><span>2 · Heat</span><span>3 · Finish</span></div><canvas class="craft-workbench" aria-label="Your crafting pot and ingredients"></canvas><div class="craft-instructions"><h2></h2><p class="craft-direction"></p><div class="craft-gauge" role="meter" aria-label="Crafting timing" aria-valuemin="0" aria-valuemax="100"><span class="craft-zone"></span><i class="craft-needle"></i></div><p class="craft-feedback" role="status" aria-live="polite"></p><button class="craft-action"></button><small>A / Space · B to cancel and keep ingredients</small></div>';
    const b=panel.querySelector('.craft-action');
    b.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;e.preventDefault();b.setPointerCapture?.(e.pointerId);Crafting.press();paint();});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>Crafting.release());
    b.addEventListener('click',e=>{if(e.detail===0){const s=Crafting.current();if(s?.phase==='heat'&&!s.steady&&s.held)Crafting.release();else Crafting.press();paint();}});
    root.querySelector('.craft-back').textContent='Cancel batch';root.querySelector('.craft-note').textContent='Leaving or reloading an unfinished batch returns your ingredients.';
    lastPhase='';lastStatus='';b.focus({preventScroll:true});paint();
  }
  function back(){if(Crafting.current()){Crafting.cancel();book();}else Crafting.close();}
  function result(){
    const s=Crafting.current();if(!root||!s)return;
    root.querySelector('.craft-back').textContent='Back to recipes';root.querySelector('.craft-note').textContent='Your finished items are in the Bag.';paint();
  }
  function paint(){
    const s=Crafting.current();if(!root||!s||root.hidden)return;const r=Crafting.recipe(s.id),panel=root.querySelector('.craft-play');
    if(panel.hidden)return;
    const phase=s.phase,which=['prepare','heat','finish'].indexOf(phase);
    for(const [i,el]of [...panel.querySelectorAll('.craft-progress span')].entries())el.classList.toggle('current',i===which);
    const heading=phase==='result'?(s.bonus?'Beautifully made!':'Batch complete'):phase==='prepare'?(r.kind==='cook'?'Season your ingredients':'Prepare your ingredients'):phase==='heat'?(r.kind==='grind'?'Set the binding mixture':'Tend the heat'):'Finish your '+r.name.toLowerCase();
    const direction=phase==='result'?`${s.produced} × ${r.name}${s.bonus?' · +1 for careful crafting':''}`:s.steady?'Take your time. Press A when you are ready for the next step.':phase==='heat'?'Hold to warm; release to cool. Keep the marker inside the gold band.':'Tap when the moving marker reaches the gold band.';
    if(phase!==lastPhase){lastPhase=phase;panel.querySelector('h2').textContent=heading;panel.querySelector('.craft-direction').textContent=direction;}
    const status=phase==='heat'&&!s.steady?Math.max(0,Math.ceil(6-s.time))+' seconds · '+(s.heat<.35?'A little warmer':s.heat>.7?'Let it cool':'Just right'):s.feedback;
    if(status!==lastStatus){panel.querySelector('.craft-feedback').textContent=status;lastStatus=status;}
    const v=phase==='heat'?s.heat:s.meter,gauge=panel.querySelector('.craft-gauge');gauge.hidden=phase==='result'||s.steady;
    gauge.setAttribute('aria-valuenow',String(Math.round(v*100)));panel.querySelector('.craft-needle').style.left=(v*100)+'%';
    panel.querySelector('.craft-zone').style.cssText=phase==='heat'?'left:35%;width:35%':'left:38%;width:24%';
    const b=panel.querySelector('.craft-action');b.textContent=phase==='result'?'Back to recipes':s.steady?'Continue':phase==='heat'?(s.held?'Release to cool':'Hold to warm'):phase==='prepare'?'Prepare':'Finish';
    const canvas=panel.querySelector('canvas'),box=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(1,box.width),h=Math.max(1,box.height);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);drawBench(g,w,h,s,r);
  }
  function drawBench(g,w,h,s,r){
    g.clearRect(0,0,w,h);const size=Math.min(w*.65,h*.7,240),cx=w/2,cy=h*.62,t=s.age;
    const ellipse=(x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);g.fill();};
    const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#1e393d');bg.addColorStop(1,'#47645b');g.fillStyle=bg;g.fillRect(0,0,w,h);
    g.fillStyle='#573a29';g.fillRect(0,h*.8,w,h*.2);g.strokeStyle='#36291e';g.lineWidth=2;
    for(let x=0;x<w;x+=65){g.beginPath();g.moveTo(x,h*.8);g.lineTo(x+15,h);g.stroke();}
    ellipse(cx,cy+size*.28,size*.64,size*.13,'#16242377');
    if(s.phase==='heat')for(let i=-2;i<=2;i++)ellipse(cx+i*size*.12,cy+size*.2,size*.06,size*(.09+.025*Math.sin(t*7+i)),i%2?'#e19b42':'#f4c76a');
    const pot=r.kind==='cook'?'#372d27':r.kind==='grind'?'#7c8275':'#765846';
    ellipse(cx,cy,size*.47,size*.29,pot);ellipse(cx,cy-size*.12,size*.47,size*.15,'#cfb381');ellipse(cx,cy-size*.13,size*.41,size*.11,s.phase==='result'?'#b2c785':'#88a76e');
    if(r.kind!=='grind')for(let i=0;i<6;i++){const a=t*1.1+i*2.3;ellipse(cx+Math.sin(a)*size*.3,cy-size*.13+Math.cos(a*1.3)*size*.055,size*(.011+.008*(1+Math.sin(t*4+i)) ),size*.012,'#e1e9ba');}
    g.save();g.translate(cx,cy-size*.15);g.rotate(Math.sin(t*2)*.22-.55);g.fillStyle='#bb925d';g.fillRect(-size*.035,-size*.58,size*.07,size*.65);ellipse(0,size*.035,size*.075,size*.10,'#d7b075');g.restore();
    g.globalAlpha=.3;for(let i=0;i<3;i++){const y=((t*.22+i*.32)%1)*size*.65;ellipse(cx+(i-1)*size*.17+Math.sin(t+i)*6,cy-size*.26-y,size*.07,size*.10,'#e8eadb');}g.globalAlpha=1;
    if(s.phase==='result'){g.fillStyle='#fff0b2';g.textAlign='center';g.font='bold '+Math.max(16,size*.1)+'px Georgia';g.fillText('✦ '+s.produced+' × '+r.name+' ✦',cx,Math.max(26,h*.14));}
  }
  function key(e){
    if(!Crafting.active())return false;const k=e.key.toLowerCase();
    if(k==='tab')return false;
    if(e.type==='keyup'){if(['a',' ','enter'].includes(k))Crafting.release();return true;}
    // Native Enter/Space activates a focused book control accessibly.
    if([' ','enter'].includes(k)&&e.target?.closest?.('button,input')&&!e.target?.closest?.('.craft-action'))return true;
    e.preventDefault();if(e.repeat)return true;
    if(['b','escape'].includes(k))back();else if(['a',' ','enter'].includes(k)){if(Crafting.current())Crafting.press();else root.querySelector('[data-start="1"]')?.click();}
    return true;
  }
  window.CraftingView={show,hide,book,play,paint,result,key,back};
})();
