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
    const stopGesture=()=>{pointer=null;Crafting.release();};addEventListener('blur',stopGesture);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopGesture();});
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
    panel.innerHTML='<div class="craft-recipes" aria-label="Choose a recipe">'+learned.map(r=>`<button class="craft-recipe ${r.id===selected?'selected':''}" data-recipe="${r.id}" aria-pressed="${r.id===selected}">${icon(r.raw||r.id)}<span><strong>${r.name}</strong><small>${Crafting.maxBatch(r)?'Ready to make':'Need ingredients'}</small></span></button>`).join('')+`</div><article class="craft-detail"><div class="craft-recipe-hero">${icon(r.raw||r.id)}<div><small>${r.kind==='cook'?'CAMP KITCHEN':r.kind==='grind'?'POWDERS & TOOLS':'BREWS & REMEDIES'}</small><h2>${r.name}</h2></div></div><p>${esc(playerFacingText(r.effect))}</p><h3>For one batch</h3><ul class="craft-costs">${Object.entries(r.cost).map(([id,n])=>`<li class="${Crafting.count(id)<n?'missing':''}">${icon(id)}<div><strong>${label(id)}</strong><small>${Crafting.materials[id]?.source||'Hunting and fishing provide raw food.'}</small></div><b>${Crafting.count(id)} / ${n}</b></li>`).join('')}</ul><p class="craft-explain">Crush, mix, and finish with your hands. No timer or failed batches. You can skip preparation for the same result.</p><div class="craft-starts"><button data-start="1" ${!max?'disabled':''}>Make 1</button><button data-start="${max}" ${!max?'disabled':''}>Make ${max||'max'}${max===5?' · full batch':''}</button></div></article>`;
    for(const b of panel.querySelectorAll('[data-recipe]'))b.onclick=()=>{selected=b.dataset.recipe;book();};
    for(const b of panel.querySelectorAll('[data-start]'))b.onclick=()=>Crafting.start(selected,+b.dataset.start);
    root.querySelector('.craft-note').textContent=max?'Your ingredients are ready. Each batch makes the quantity you choose.':'Gather the ingredients listed in your learned recipe.';
    paintIcons();
  }
  let canvas=null,lastPhase='',pointer=null,particles=[],benchArt=null,toolArt=null,lastFrame=0;
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function loadBench(){
    if(benchArt)return;
    benchArt=new Image();benchArt.src='assets/crafting/camp-kit.webp?v=20261006-hands';
    toolArt=new Image();toolArt.src='assets/crafting/camp-tools.webp?v=20261006-hands';
    for(const img of [benchArt,toolArt])img.onload=()=>paint();
  }
  function instructions(s,r){
    if(s.phase==='prepare')return ['Prepare the ingredients','Rub or swipe across the mortar to crush the ingredients.','Grind'];
    if(s.phase==='mix')return r.kind==='cook'?['Season the pan','Sweep your finger across the pan to work in the seasoning.','Season']:r.kind==='grind'?['Blend the powder','Trace circles in the mortar to blend the crushed ingredients.','Blend']:['Stir the brew','Trace circles inside the pot to stir the mixture.','Stir'];
    if(s.phase==='finish')return r.kind==='brew'?['Bottle the brew','Slide across the camp kit to tilt the pot and fill the bottle.','Pour']:r.kind==='cook'?['Finish and plate','Swipe across your meal to brush on the finishing herbs.','Finish']:['Pack and seal','Press the mortar to pack the powder and seal your item.','Pack'];
    return ['Beautifully made',s.produced+' × '+r.name+' added to your Bag.','Back to recipes'];
  }
  function play(){
    loadBench();particles=[];lastPhase='';pointer=null;
    root.querySelector('.craft-book').hidden=true;root.querySelector('.craft-tabs').hidden=true;const panel=root.querySelector('.craft-play');panel.hidden=false;
    panel.innerHTML='<div class="craft-work-title"><small>THE TRAVELER’S CAMP KIT</small><h2></h2><div class="craft-steps"><span>1 · Prepare</span><span>2 · Mix</span><span>3 · Finish</span></div></div><div class="craft-stage"><canvas class="craft-hands-canvas" tabindex="0" role="application" aria-label="Portable camp kit. Use touch gestures, the action button, or A to prepare. Skip preparation makes the same batch instantly."></canvas><div class="craft-stage-caption"><span></span><div class="craft-effort"><i></i></div></div></div><div class="craft-instructions"><h3></h3><p class="craft-direction"></p><p class="craft-feedback" role="status" aria-live="polite"></p><div class="craft-work-actions"><button class="craft-action"></button><button class="craft-skip">Skip preparation</button></div><small>Take your time · A also works · B cancels and returns ingredients</small></div>';
    canvas=panel.querySelector('canvas');
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
    canvas.addEventListener('pointerdown',e=>{if(pointer||e.button>0||Crafting.current()?.phase==='result')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);const p=point(e);pointer={id:e.pointerId,...p,phase:Crafting.current().phase};const s=Crafting.current();s.touching=true;s.motion={...p,angle:Math.atan2(p.y-.52,p.x-.5)};Crafting.work(.07);emit(p.x,p.y,5);});
    canvas.addEventListener('pointermove',e=>{
      if(!pointer||pointer.id!==e.pointerId)return;e.preventDefault();const s=Crafting.current();if(!s||s.phase==='result')return;
      const p=point(e);if(p.x<0||p.x>1||p.y<0||p.y>1){pointer={...pointer,...p};return;}
      const distance=Math.hypot(p.x-pointer.x,p.y-pointer.y),angle=Math.atan2(p.y-.52,p.x-.5),old=Math.atan2(pointer.y-.52,pointer.x-.5);
      let delta=Math.atan2(Math.sin(angle-old),Math.cos(angle-old));
      const circular=s.phase==='mix'&&Crafting.recipe(s.id).kind!=='cook';
      if(pointer.phase!==s.phase){pointer={...pointer,...p,phase:s.phase};return;}
      s.motion={...p,angle};s.touching=true;
      if(distance>.003){const amount=circular?(Math.hypot(p.x-.5,p.y-.52)>.07&&Math.abs(delta)<.8?Math.abs(delta)/(Math.PI*3):0):Math.min(distance,.12)*.75;Crafting.work(amount);emit(p.x,p.y,2);}
      pointer={...pointer,...p};
    });
    const release=e=>{if(pointer?.id!==e.pointerId)return;pointer=null;Crafting.release();};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
    panel.querySelector('.craft-action').onclick=()=>{Crafting.press();emit(.5,.5,10);};
    panel.querySelector('.craft-skip').onclick=()=>Crafting.skipPreparation();
    root.querySelector('.craft-back').textContent='Cancel batch';root.querySelector('.craft-note').textContent='Skip preparation uses the same ingredients and makes the same quantity.';
    paint();canvas.focus({preventScroll:true});
  }
  function emit(x,y,n){if(reduced())return;for(let i=0;i<n&&particles.length<70;i++)particles.push({x,y,vx:(Math.random()-.5)*.004,vy:-.003-Math.random()*.004,life:1,size:2+Math.random()*3});}
  function back(){if(Crafting.current()){pointer=null;Crafting.cancel();book();}else Crafting.close();}
  function result(){pointer=null;emit(.5,.38,40);root.querySelector('.craft-back').textContent='Back to recipes';root.querySelector('.craft-note').textContent='Your finished items are in the Bag.';paint();}
  function paint(){
    const s=Crafting.current();if(!root||!s||root.hidden||!canvas)return;const panel=root.querySelector('.craft-play');if(panel.hidden)return;const r=Crafting.recipe(s.id),info=instructions(s,r),done=s.phase==='result';
    if(lastPhase!==s.phase){lastPhase=s.phase;panel.querySelector('h2').textContent=r.name+' · '+s.qty;panel.querySelector('h3').textContent=info[0];panel.querySelector('.craft-direction').textContent=info[1];panel.querySelector('.craft-action').textContent=info[2];panel.querySelector('.craft-skip').hidden=done;panel.querySelector('.craft-feedback').textContent=done?'Batch complete — ready for the road.':'';
      for(const [i,el]of [...panel.querySelectorAll('.craft-steps span')].entries()){el.classList.toggle('current',i===s.completed&&!done);el.classList.toggle('complete',i<s.completed||done);}
      canvas.setAttribute('aria-label',info[0]+'. '+info[1]+' Use A or the action button as an alternative.');
    }
    panel.querySelector('.craft-effort i').style.width=(done?100:s.progress*100)+'%';panel.querySelector('.craft-stage-caption span').textContent=done?'✦ Ready to take with you ✦':s.touching?'Keep going…':s.phase==='mix'&&r.kind!=='cook'?'Move your finger in circles':'Touch the tools to begin';
    drawBench(s,r);
  }
  function drawBench(s,r){
    const now=performance.now();if(now-lastFrame<30)return;lastFrame=now;
    const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;const dpr=.5; // Render effects on a crisp pixel grid, like the world sprites.
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;
    if(benchArt?.complete&&benchArt.naturalWidth){const scale=Math.max(w/benchArt.width,h/benchArt.height);g.drawImage(benchArt,(w-benchArt.width*scale)/2,(h-benchArt.height*scale)/2,benchArt.width*scale,benchArt.height*scale);}else{g.fillStyle='#493a2a';g.fillRect(0,0,w,h);}
    g.fillStyle='#07151530';g.fillRect(0,0,w,h);
    if(!reduced())for(let i=0;i<8;i++){const k=(s.age*.4+i/8)%1;g.globalAlpha=1-k;g.fillStyle=i%2?'#ffd368':'#ee8339';g.fillRect(Math.round((w*.5+Math.sin(i*2+s.age)*w*.06)/2)*2,Math.round(h*(.76-k*.25)/2)*2,4,6);}g.globalAlpha=1;
    const preparing=s.phase==='prepare';const size=Math.min(w*(preparing?.55:.70),h*.88),cx=w*(preparing?.30:.5),cy=h*(preparing?.65:.48),t=reduced()?0:s.age;
    const ellipse=(x,y,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,Math.PI*2);g.fill();};
    const sprite=(cell,x,y,width,height,angle=0)=>{if(!toolArt?.complete||!toolArt.naturalWidth)return;const sw=toolArt.width/3,sh=toolArt.height/2;g.save();g.translate(x,y);g.rotate(angle);g.drawImage(toolArt,cell%3*sw,Math.floor(cell/3)*sh,sw,sh,-width/2,-height/2,width,height);g.restore();};
    if(preparing)sprite(r.kind==='cook'?2:1,w*.57,h*.42,size*.92,size*.8);
    const cell=s.phase==='prepare'?0:r.kind==='brew'?1:r.kind==='cook'?2:0;
    const pouring=s.phase==='finish'&&r.kind==='brew',done=s.phase==='result',tilt=pouring?-.12-s.progress*.35:0;
    const bx=pouring?cx-size*.18:cx,by=cy;
    if(done){
      if(r.kind==='brew'){ellipse(cx,cy+size*.13,size*.15,size*.19,'#8ed9a8cc');sprite(5,cx,cy,size*.66,size*.82);}else sprite(r.kind==='cook'?2:0,cx,cy,size,size*.85);
      g.fillStyle='#fff1c0';g.font='bold '+Math.min(22,w/22)+'px Georgia';g.textAlign='center';g.fillText('✦ '+s.produced+' × '+r.name+' ✦',cx,h*.16);
    }else{
      sprite(cell,bx,by,size,size*.85,tilt);
      // Animated contents sit in the visible bowl opening; a shaded rim keeps
      // the generated vessel material visible around the mixture.
      const lipY=by+size*(cell===0?-.015:cell===1?-.015:.075),rx=size*(cell===0?.24:cell===1?.25:.22),ry=size*(cell===2?.12:.13);
      ellipse(bx,lipY,rx,ry,'#244e40');ellipse(bx-rx*.1,lipY-ry*.1,rx*.82,ry*.75,cell===0?'#71834c':'#679e78');
      g.save();g.beginPath();g.ellipse(bx,lipY,rx,ry,0,0,Math.PI*2);g.clip();
      for(let i=0;i<22;i++){const a=i*2.399+t*(s.touching?2:.25),rad=(.15+(i%7)/9);const x=bx+Math.cos(a)*rx*rad,y=lipY+Math.sin(a)*ry*rad;
        ellipse(x,y,s.phase==='prepare'?3-s.progress*2:1.5,1.4,i%3?'#cbd897':'#edd27b');}
      if(s.phase==='mix'){g.strokeStyle='#d7edba70';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(bx,lipY,rx*(.3+i*.22),ry*(.3+i*.22),Math.sin(t)*.07, t+i, t+i+Math.PI*1.3);g.stroke();}}
      g.restore();
      if(pouring){const bottleX=cx+size*.3,bottleY=cy+size*.1;ellipse(bottleX,bottleY+size*.09,size*.085,size*.11*s.progress,'#83dcb3bb');sprite(5,bottleX,bottleY,size*.4,size*.6);
        if(s.touching||s.progress>0){g.strokeStyle='#a2e8c9';g.lineWidth=3+s.progress*4;g.beginPath();g.moveTo(bx+rx*.8,lipY);g.quadraticCurveTo(bottleX,lipY,bottleX,bottleY-size*.15);g.stroke();}}
      else if(s.phase!=='finish'||r.kind!=='grind'){
        const angle=s.phase==='prepare'?.28:s.motion.angle*.15-.4,px=s.touching?w*s.motion.x:cx+Math.sin(t)*size*.08,py=s.touching?h*s.motion.y:cy-size*.19;
        sprite(s.phase==='prepare'?3:4,Math.max(cx-size*.28,Math.min(cx+size*.28,px)),Math.max(cy-size*.37,Math.min(cy-size*.05,py)),size*.55,size*.65,angle);
      }
      if(!reduced()&&s.phase!=='prepare')for(let i=0;i<6;i++){const k=(t*.27+i/6)%1;ellipse(bx+Math.sin(t+i)*size*.16,lipY-k*size*.45,size*.022*(1+k),size*.042,'rgba(231,235,208,'+(.2*(1-k))+')');}
    }
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.00014;p.life-=.025;g.globalAlpha=Math.max(0,p.life);g.fillStyle='#ebd382';g.fillRect(Math.round(p.x*w/2)*2,Math.round(p.y*h/2)*2,p.size,p.size);g.globalAlpha=1;}particles=particles.filter(p=>p.life>0);
  }
  function key(e){
    if(!Crafting.active())return false;const k=e.key.toLowerCase();
    if(k==='tab')return false;
    if(e.type==='keyup'){if(['a',' ','enter'].includes(k))Crafting.release();return true;}
    // Native Enter/Space activates a focused book control accessibly.
    if([' ','enter'].includes(k)&&e.target?.closest?.('button,input'))return true;
    e.preventDefault();if(e.repeat)return true;
    if(['b','escape'].includes(k))back();else if(['a',' ','enter'].includes(k)){if(Crafting.current())Crafting.press();else root.querySelector('[data-start="1"]')?.click();}
    return true;
  }
  window.CraftingView={show,hide,book,play,paint,result,key,back};
})();
