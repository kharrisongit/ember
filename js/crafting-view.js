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
    const stopGesture=()=>Crafting.release();addEventListener('blur',stopGesture);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGesture();});
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
    panel.innerHTML='<div class="craft-recipes" aria-label="Choose a recipe">'+learned.map(r=>`<button class="craft-recipe ${r.id===selected?'selected':''}" data-recipe="${r.id}" aria-pressed="${r.id===selected}">${icon(r.raw||r.id)}<span><strong>${r.name}</strong><small>${Crafting.maxBatch(r)?'Ready to make':'Need ingredients'}</small></span></button>`).join('')+`</div><article class="craft-detail"><div class="craft-recipe-hero">${icon(r.raw||r.id)}<div><small>${r.kind==='cook'?'CAMP KITCHEN':r.kind==='grind'?'POWDERS & TOOLS':'BREWS & REMEDIES'}</small><h2>${r.name}</h2></div></div><p>${esc(playerFacingText(r.effect))}</p><h3>For one batch</h3><ul class="craft-costs">${Object.entries(r.cost).map(([id,n])=>`<li class="${Crafting.count(id)<n?'missing':''}">${icon(id)}<div><strong>${label(id)}</strong><small>${Crafting.materials[id]?.source||'Hunting and fishing provide raw food.'}</small></div><b>${Crafting.count(id)} / ${n}</b></li>`).join('')}</ul><p class="craft-explain">Choose a batch and watch it take shape. You can finish the animation immediately for the same result.</p><div class="craft-starts"><button data-start="1" ${!max?'disabled':''}>Make 1</button><button data-start="${max}" ${!max?'disabled':''}>Make ${max||'max'}${max===5?' · full batch':''}</button></div></article>`;
    for(const b of panel.querySelectorAll('[data-recipe]'))b.onclick=()=>{selected=b.dataset.recipe;book();};
    for(const b of panel.querySelectorAll('[data-start]'))b.onclick=()=>Crafting.start(selected,+b.dataset.start);
    root.querySelector('.craft-note').textContent=max?'Your ingredients are ready. Each batch makes the quantity you choose.':'Gather the ingredients listed in your learned recipe.';
    paintIcons();
  }
  let canvas=null,benchArt=null,toolArt=null,lastFrame=0,itemArt=null,rawArt=null;
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const styles={
    potion:{kind:'brew',color:'#76bb85',steps:['Crushing healing herbs','Simmering the remedy','Filling the potion bottle']},
    elixir:{kind:'brew',color:'#edc365',steps:['Infusing sunbloom petals','Blending the restorative','Sealing the golden elixir']},
    bomb:{kind:'brew',color:'#af7ad8',steps:['Steeping ghostcaps and reeds','Binding the spirit essence','Sealing Maelis’s Curse']},
    saint:{kind:'brew',color:'#93dfee',steps:['Infusing snowbells and berries','Drawing in the spirit essence','Bottling Saint’s Breath']},
    dust:{kind:'powder',color:'#b797d1',steps:['Crushing dried mushrooms','Grinding the bitterroot','Filling a pouch of Madness Dust']},
    salt:{kind:'powder',color:'#f5e1a0',steps:['Crushing sunbloom petals','Blending the mineral grains','Packing the consecrated powder']},
    bell:{kind:'bell',color:'#e7bc65',steps:['Shaping the stake','Hammering the little bell','Binding the bell and testing its ring']},
    mark:{kind:'marker',color:'#a8b7bf',steps:['Shaping a stone marker','Chiselling its inscription','Rubbing pigment into the carving']},
    stone:{kind:'crystal',color:'#8fddd3',steps:['Cutting the mineral facets','Polishing with snowbell essence','Awakening the Resurrection Stone']}
  };
  const foodSteps={boarMeat:['Scoring the boar cut','Searing over the grill','Resting the herb-roasted boar'],hareMeat:['Seasoning the hare','Turning the small roast','Serving the tender hare'],deerMeat:['Rubbing herbs into venison','Grilling the venison','Slicing the roast venison'],foxMeat:['Preparing the fox meat','Slow-roasting the cut','Finishing the fox roast'],birdMeat:['Seasoning the bird','Turning the roast bird','Crisping its golden skin'],dragonFish:['Filling the fish with herbs','Baking over gentle embers','Serving the herb-baked fish']};
  function style(r){return styles[r.id]||{kind:'food',color:'#d79c62',steps:foodSteps[r.raw]};}
  function loadArt(){
    if(benchArt)return;benchArt=new Image();benchArt.src='assets/crafting/camp-kit.webp?v=20261006-hands';toolArt=new Image();toolArt.src='assets/crafting/camp-tools.webp?v=20261006-hands';
    for(const img of [benchArt,toolArt])img.onload=()=>paint();
  }
  function makeIcon(id){const c=document.createElement('canvas');c.width=128;c.height=128;drawBagIcon(c,BAG.find(i=>i.key===id)?.icon?.(),0);return c;}
  function play(){
    loadArt();const s=Crafting.current(),r=Crafting.recipe(s.id);itemArt=makeIcon(r.id);rawArt=r.raw?makeIcon(r.raw):null;
    root.querySelector('.craft-book').hidden=true;root.querySelector('.craft-tabs').hidden=true;const panel=root.querySelector('.craft-play');panel.hidden=false;
    panel.innerHTML='<div class="craft-work-title"><small>THE TRAVELER’S CAMP KIT</small><h2>'+r.name+' · '+s.qty+'</h2><p class="craft-auto-label">Preparing your batch</p></div><div class="craft-stage"><canvas class="craft-hands-canvas" role="img" aria-label="'+r.name+' crafting animation"></canvas></div><div class="craft-instructions"><h3></h3><p class="craft-feedback" role="status" aria-live="polite"></p><div class="craft-work-actions"><button class="craft-action">Finish now</button></div><small>Your ingredients are measured for the entire batch.</small></div>';
    canvas=panel.querySelector('canvas');panel.querySelector('.craft-action').onclick=()=>Crafting.press();
    root.querySelector('.craft-back').textContent='Cancel batch';root.querySelector('.craft-note').textContent='Finish now makes the same items. Cancelling returns your ingredients.';paint();
  }
  function back(){if(Crafting.current()){Crafting.cancel();book();}else Crafting.close();}
  function result(){root.querySelector('.craft-back').textContent='Back to recipes';root.querySelector('.craft-note').textContent='Your finished items are in the Bag.';paint();}
  function paint(){
    const s=Crafting.current();if(!root||!s||root.hidden||!canvas)return;const panel=root.querySelector('.craft-play');if(panel.hidden)return;
    const r=Crafting.recipe(s.id),v=style(r),done=s.phase==='result';
    panel.querySelector('h3').textContent=done?'Batch complete':v.steps[Math.min(2,Math.floor(s.progress*3))];
    panel.querySelector('.craft-feedback').textContent=done?s.produced+' × '+r.name+' added to your Bag.':'';
    panel.querySelector('.craft-action').textContent=done?'Back to recipes':'Finish now';
    draw(s,r,v);
  }
  function draw(s,r,v){
    const now=performance.now();if(now-lastFrame<30)return;lastFrame=now;
    const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
    if(canvas.width!==Math.round(w*.5)||canvas.height!==Math.round(h*.5)){canvas.width=Math.round(w*.5);canvas.height=Math.round(h*.5);}const g=canvas.getContext('2d');g.setTransform(.5,0,0,.5,0,0);g.imageSmoothingEnabled=false;
    if(benchArt?.complete&&benchArt.naturalWidth){const z=Math.max(w/benchArt.width,h/benchArt.height);g.drawImage(benchArt,(w-benchArt.width*z)/2,(h-benchArt.height*z)/2,benchArt.width*z,benchArt.height*z);}else{g.fillStyle='#213e36';g.fillRect(0,0,w,h);}
    g.fillStyle='#081d2440';g.fillRect(0,0,w,h);
    const size=Math.min(w*.78,h*.87),x=w*.5,y=h*.49,p=s.progress,t=reduced()?0:s.age,phase=Math.min(2,Math.floor(p*3)),done=s.phase==='result';
    const ellipse=(xx,yy,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);g.fill();};
    const sprite=(cell,xx,yy,ww,hh,angle=0)=>{if(!toolArt?.complete||!toolArt.naturalWidth)return;g.save();g.translate(xx,yy);g.rotate(angle);const sw=toolArt.width/3,sh=toolArt.height/2;g.drawImage(toolArt,cell%3*sw,Math.floor(cell/3)*sh,sw,sh,-ww/2,-hh/2,ww,hh);g.restore();};
    const icon=(im,xx,yy,sz,angle=0)=>{if(!im)return;g.save();g.translate(xx,yy);g.rotate(angle);g.drawImage(im,-sz/2,-sz/2,sz,sz);g.restore();};
    const motes=(color,count=16)=>{for(let i=0;i<count;i++){const a=i*2.399+t*2,rad=size*(.22+(i%4)*.05);g.fillStyle=color;g.fillRect(x+Math.cos(a)*rad,y+Math.sin(a)*rad*.6,3,3);}};
    if(done){ellipse(x,y+size*.32,size*.24,size*.045,'#081b2380');icon(itemArt,x,y,size*.65);return;}
    if(!['brew','food'].includes(v.kind)){// A portable cloth covers the work area for dry preparation.
      g.fillStyle='#0d232b';g.fillRect(x-size*.49,y-size*.38,size*.98,size*.9);g.fillStyle='#796548';g.fillRect(x-size*.46,y-size*.35,size*.92,size*.84);g.strokeStyle='#c4aa75';g.lineWidth=2;g.strokeRect(x-size*.43,y-size*.32,size*.86,size*.78);
    }
    if(v.kind==='brew'){
      sprite(1,x,y,size,size*.85);ellipse(x,y-size*.015,size*.25,size*.13,v.color);
      for(let i=0;i<10;i++){const k=(t*.6+i/10)%1;ellipse(x+Math.sin(i*9)*size*.18,y-size*.02-k*size*.12,2+k*3,2+k*2,'#f3edc180');}
      if(phase===0){for(let i=0;i<5;i++){const k=(p*3+i/5)%1;g.fillStyle=v.color;g.fillRect(x+Math.sin(i*8)*size*.17,y-size*.36+k*size*.34,5,7);}}
      if(phase===1)sprite(4,x+Math.cos(t*6)*size*.08,y-size*.17,size*.5,size*.58,Math.PI+Math.sin(t*6)*.2);
      if(phase===2)icon(itemArt,x+size*.28,y+size*.08,size*.42);
      if(r.id==='bomb'||r.id==='saint')motes(v.color,8);
    }else if(v.kind==='powder'){
      if(phase<2){sprite(0,x,y,size,size*.85);ellipse(x,y-size*.015,size*.24,size*.13,v.color);sprite(3,x+Math.sin(t*9)*size*.07,y-size*(.18+Math.abs(Math.sin(t*9))*.05),size*.42,size*.52,.3);motes(v.color,12);}
      else{icon(itemArt,x,y,size*.62);for(let i=0;i<14;i++){g.fillStyle=v.color;g.fillRect(x+Math.sin(i*3)*size*.1,y-size*.35+((t+i*.13)%1)*size*.3,3,3);}}
    }else if(v.kind==='bell'){
      icon(itemArt,x,y,size*.76,phase===2?Math.sin(t*13)*.035:0);
      if(phase<2){g.save();g.translate(x+size*.2,y-size*.22);g.rotate(Math.sin(t*15)*.4);g.fillStyle='#8e6742';g.fillRect(0,0,size*.045,size*.24);g.fillStyle='#b9c0bf';g.fillRect(-size*.09,-size*.035,size*.2,size*.08);g.restore();motes('#efc970',6);}
      else{g.strokeStyle=v.color;for(const side of [-1,1]){g.beginPath();g.arc(x,y,size*.3,side<0?2.6:-.5,side<0?3.7:.5);g.stroke();}}
    }else if(v.kind==='marker'){
      icon(itemArt,x,y,size*.76);
      if(phase<2){g.fillStyle='#c9d5d1';g.save();g.translate(x+size*.1,y-size*.12+Math.sin(t*15)*size*.025);g.rotate(.4);g.fillRect(0,-size*.12,size*.035,size*.28);g.restore();motes('#c2c8ba',8);}
    }else if(v.kind==='crystal'){
      icon(itemArt,x,y,size*.72,phase===0?Math.sin(t*4)*.045:0);if(phase>0)motes(v.color);
    }else{
      // Each cut uses its own existing inventory art, including the whole bird
      // and fish silhouettes; the cooking method/captions follow the recipe.
      g.fillStyle='#20262a';g.fillRect(x-size*.4,y-size*.16,size*.8,size*.42);g.strokeStyle='#7d898a';g.lineWidth=3;for(let i=0;i<8;i++){g.beginPath();g.moveTo(x-size*.37+i*size*.105,y-size*.16);g.lineTo(x-size*.37+i*size*.105,y+size*.26);g.stroke();}
      const flip=phase===1?Math.sin(Math.max(0,p*3-1)*Math.PI):0;
      icon(rawArt,x,y-flip*size*.12,size*.57,flip*.22);
      if(phase!==1){for(let i=0;i<10;i++){g.fillStyle='#a5bd6a';g.fillRect(x+Math.sin(i*7)*size*.19,y+Math.cos(i*8)*size*.12,3,4);}}
      if(phase===2){g.fillStyle='#d59d3b25';g.fillRect(x-size*.2,y-size*.14,size*.4,size*.28);}
    }
  }
  function key(e){
    if(!Crafting.active())return false;const k=e.key.toLowerCase();if(k==='tab')return false;if(e.type==='keyup')return true;
    if([' ','enter'].includes(k)&&e.target?.closest?.('button,input'))return true;
    e.preventDefault();if(e.repeat)return true;if(['b','escape'].includes(k))back();else if(['a',' ','enter'].includes(k)){if(Crafting.current())Crafting.press();else root.querySelector('[data-start="1"]')?.click();}return true;
  }
  window.CraftingView={show,hide,book,play,paint,result,key,back};
})();
