// Keep the completed world frame untouched while the fishing view owns input.
let fishingBackdrop=null;
let fishingView=null;
function captureFishingBackdrop(){
  if(fishingBackdrop)return fishingBackdrop;
  const image=document.createElement('canvas');image.width=cv.width;image.height=cv.height;
  image.getContext('2d').drawImage(cv,0,0);
  return fishingBackdrop=image;
}
function drawFishingBackdrop(){
  const image=captureFishingBackdrop();
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,0,0,image.width,image.height,0,0,VW,VH);
}
function openFishingView(){
  if(!document.body?.appendChild)return;
  if(!fishingView){
    const el=document.createElement('section');el.hidden=true;el.id='fishingView';el.className='fishing-view';
    el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Fishing');
    el.innerHTML=`<header class="fishing-header"><div><span class="fishing-eyebrow">EMBERFELL · WATERSIDE PURSUITS</span><h2>The Angler’s Rest</h2></div><button type="button" class="fishing-leave" aria-label="Leave fishing">Leave <span>Esc / B</span></button></header><div class="fishing-water"><canvas aria-label="Looking down across the water with your fishing rod in the foreground"></canvas><div class="fishing-scene-label"><span class="fishing-phase">READY TO CAST</span><span class="fishing-stock"></span></div><aside class="fishing-catch-popup" hidden role="status" aria-live="polite" aria-atomic="true"><span class="fishing-catch-seal" aria-hidden="true">✦</span><span class="fishing-catch-kicker">A FINE CATCH</span><h3>Congratulations!</h3><p class="fishing-catch-message"></p><span class="fishing-catch-bonus"></span></aside></div><footer class="fishing-footer"><div class="fishing-copy"><strong class="fishing-status" role="status" aria-live="polite"></strong><span class="fishing-hint"></span></div><button type="button" class="fishing-action"><span>Cast line</span><small>A / Space</small></button></footer>`;
    document.body.appendChild(el);
    fishingView={el,canvas:el.querySelector('canvas'),action:el.querySelector('.fishing-action'),
      leave:el.querySelector('.fishing-leave'),status:el.querySelector('.fishing-status'),
      hint:el.querySelector('.fishing-hint'),phase:el.querySelector('.fishing-phase'),stock:el.querySelector('.fishing-stock'),popup:el.querySelector('.fishing-catch-popup'),
      catchMessage:el.querySelector('.fishing-catch-message'),catchBonus:el.querySelector('.fishing-catch-bonus')};
    const press=e=>{e.preventDefault();if(e.button!==undefined&&e.button!==0)return;
      fishingView.action.setPointerCapture?.(e.pointerId);fishingAction();};
    fishingView.action.addEventListener('pointerdown',press);
    for(const event of ['pointerup','pointercancel','lostpointercapture'])fishingView.action.addEventListener(event,fishingRelease);
    // Clicks from assistive technology do not emit pointerdown/up.
    fishingView.action.addEventListener('click',e=>{if(e.detail!==0)return;
      if(fishing?.phase==='reel'){fishing.requireRelease=false;fishing.held=false;fishing.assistReel=!fishing.assistReel;}
      else fishingAction();});
    fishingView.leave.addEventListener('click',()=>{askShut();endFishing();});
    addEventListener('blur',fishingRelease);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)fishingRelease();});
    el.addEventListener('keydown',e=>{if(e.key!=='Tab')return;e.preventDefault();
      (document.activeElement===fishingView.action?fishingView.leave:fishingView.action).focus();});
  }
  if(fishingView.el.hidden){fishingView.previousFocus=document.activeElement;}
  fishingView.popup.hidden=true;
  fishingView.action.disabled=false;
  fishingView.el.hidden=false;
  fishingView.action.focus({preventScroll:true});
}
function closeFishingView(){
  if(!fishingView)return;
  fishingView.el.hidden=true;
  fishingView.previousFocus?.focus?.({preventScroll:true});
}
function startFishing(){
  if(!fishingPole||!waterInReach()||!fishingSafe()){endFishing();return;}
  const backdrop=captureFishingBackdrop();endFishing();fishingBackdrop=backdrop;
  fishing={...fishingRegion(),phase:'aim',age:0,elapsed:0,power:.5,castQuality:0,
    held:false,requireRelease:false,progress:0,tension:.22,slack:0,peakTension:0,
    fightAge:0,cycleAge:0,calmFor:2.6+Math.random()*.6,surgeFor:1.15,
    resultAge:0,caught:false,feedback:'',flash:0,particles:[],fishX:.5,fishY:.35};
  openFishingView();
}
function fishingBurst(f,color,count=16){
  for(let i=0;i<count;i++){
    const a=Math.random()*FISH_TAU,s=.02+Math.random()*.08;
    f.particles.push({x:f.fishX,y:f.fishY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.8,color});
  }
}
function finishFishing(caught,reason='The fish slipped away.'){
  const f=fishing;if(!f||f.phase==='result')return;
  f.catchOrigin={x:f.fishX,y:f.fishY};f.catchAngle=-.4+Math.sin(f.age*3)*.6;
  f.caught=caught;f.phase='result';f.resultAge=0;f.held=false;f.assistReel=false;f.reason=reason;
  f.bonus=caught&&f.castQuality>.8&&f.hookQuality>.55&&f.peakTension<.86?1:0;
  if(caught){globalThis.window?.EmberSfx?.pickup();dragonFish+=f.reward+f.bonus;fishingBurst(f,'#ffe3a0',32);saveGame();}
}
function fishingRelease(){
  if(fishing){fishing.held=false;fishing.assistReel=false;fishing.requireRelease=false;}
}
function stepFishing(dt){
  const f=fishing;if(!f||f.phase==='prompt')return;
  // A backgrounded tab cannot advance an unseen bite or break a line.
  dt=Math.max(0,Math.min(.05,dt));f.age+=dt;f.elapsed+=dt;f.flash=Math.max(0,f.flash-dt);
  for(const p of f.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}
  f.particles=f.particles.filter(p=>p.life>0);
  if(f.phase==='aim')f.power=.5+.5*Math.sin(f.elapsed*2.15-1.1);
  else if(f.phase==='cast'&&f.elapsed>=.7){f.phase='wait';f.elapsed=0;f.biteAfter=1.4+Math.random()*1.8;fishingBurst(f,'#b9f2e0');}
  else if(f.phase==='wait'&&f.elapsed>=f.biteAfter){
    f.phase='hook';f.elapsed=0;f.biteWindow=1.85-f.tier*.07;
    fishingBurst(f,'#fff0ae',24);globalThis.window?.EmberSfx?.ui?.();
  }else if(f.phase==='hook'&&f.elapsed>f.biteWindow)finishFishing(false,'The bite passed. Hook when the float dips!');
  else if(f.phase==='reel'){
    f.fightAge+=dt;f.cycleAge+=dt;
    if(f.cycleAge>=f.calmFor+f.surgeFor){f.cycleAge=0;f.calmFor=2.15+Math.random()*.9;f.surgeFor=.95+Math.random()*.4+f.tier*.035;}
    f.surging=f.cycleAge>=f.calmFor;f.warning=!f.surging&&f.cycleAge>f.calmFor-.55;
    const reeling=(f.held||f.assistReel)&&!f.requireRelease;
    if(reeling){
      f.slack=0;f.tension+=dt*(f.surging?.58+f.tier*.025:.12+f.tier*.008);
      f.progress+=dt*(f.surging?.022:.105-f.tier*.003)*(1+f.castQuality*.13);
    }else{
      f.slack+=dt;f.tension-=dt*(f.surging?.25:.38);f.progress-=dt*(f.surging?.016:.006);
    }
    f.progress=Math.max(0,Math.min(1,f.progress));f.tension=Math.max(.04,Math.min(1,f.tension));
    f.peakTension=Math.max(f.peakTension,f.tension);
    const sway=f.surging?.19:.1;
    f.fishX=.5+Math.sin(f.fightAge*(f.surging?4:1.6))*sway*(1-f.progress*.65);
    f.fishY=.28+f.progress*.39+Math.sin(f.fightAge*2.5)*.018;
    if(f.tension>=1)finishFishing(false,'The line snapped. Release while the fish lunges.');
    else if(f.slack>5.5)finishFishing(false,'Too much slack. Reel between the fish’s lunges.');
    else if(f.progress>=1)finishFishing(true);
  }else if(f.phase==='result')f.resultAge+=dt;
}
function fishingAction(){
  const f=fishing;if(!f||f.phase==='prompt')return;
  if(f.phase==='result'){if(f.resultAge>=(f.caught?1.9:.7))startFishing();return;}
  if(f.phase==='aim'){
    f.castQuality=Math.max(0,1-Math.abs(f.power-.72)/.3);f.castPower=f.power;
    f.phase='cast';f.elapsed=0;f.fishX=.5;f.fishY=.5-f.power*.25;return;
  }
  if(f.phase==='wait'){f.feedback='Wait for the float to dip…';f.flash=1;return;}
  if(f.phase==='hook'){
    f.hookQuality=1-f.elapsed/f.biteWindow;f.phase='reel';f.elapsed=0;
    f.progress=.07+f.castQuality*.055;f.requireRelease=true;f.held=false;
    fishingBurst(f,'#e5f8c5');return;
  }
  if(f.phase==='reel'&&!f.requireRelease)f.held=true;
}
function fishingCopy(f){
  if(f.phase==='aim')return ['Cast into the golden water','Tap when the marker reaches the gold zone.','Cast line','READY TO CAST'];
  if(f.phase==='cast')return ['A little patience…',f.castQuality>.8?'Beautiful cast! Watch your float.':'Watch for the float to dip beneath the surface.','Casting…','LINE AWAY'];
  if(f.phase==='wait')return ['Watch the float',f.flash>0?f.feedback:'Little ripples aren’t a bite. Wait for the splash!','Wait for it…','WAIT FOR A BITE'];
  if(f.phase==='hook')return ['A bite! Set the hook!','Tap now, before the fish lets go.','Hook!','FISH ON THE LINE'];
  if(f.phase==='reel')return [f.surging?'Lunge! Let the line run':f.warning?'It’s about to lunge…':f.slack>3?'Don’t let it slip away!':'Bring it closer',
    f.requireRelease?'Lift your finger, then hold to reel.':f.slack>3?'Hold to reel — there’s too much slack.':f.surging?'Release to ease the tension.':f.warning?'Get ready to release.':'Hold to reel. Release when the fish lunges.',
    (f.held||f.assistReel)?'Reeling…':'Hold to reel',f.surging?'RELEASE · LUNGE':'REEL IN YOUR CATCH'];
  if(f.phase==='result'&&f.caught&&f.resultAge<1.5)return ['Lifting your catch…','A worthy prize for a patient angler.','Landing fish…','A FINE CATCH'];
  return [f.caught?'A fine catch! +'+(f.reward+f.bonus)+' fish':'That one got away',
    f.caught?(f.bonus?'Flawless cast & control · +1 bonus fish':'Fresh fish restores '+DRAGON_FISH_HEAL+' dragon HP.'):f.reason,'Cast again',f.caught?'CATCH LANDED':'ANOTHER ONE AWAITS'];
}
function drawFishing(){
  const f=fishing;if(!f||f.phase==='prompt')return;
  const copy=fishingCopy(f);
  if(fishingView&&!fishingView.el.hidden){
    const v=fishingView;
    for(const [el,value]of [[v.status,copy[0]],[v.hint,copy[1]],[v.phase,copy[3]],[v.stock,'FISH IN BAG · '+dragonFish],[v.action.firstElementChild,copy[2]]])if(el.textContent!==value)el.textContent=value;
    const celebrating=f.phase==='result'&&f.caught&&f.resultAge>=1.5;
    const count=f.reward+(f.bonus||0);
    const catchMessage='You caught '+(count===1?'a fish!':count+' fish!');
    if(v.catchMessage.textContent!==catchMessage)v.catchMessage.textContent=catchMessage;
    const bonus=f.bonus?'Perfect technique · +1 bonus fish':'Added to your bag · A feast for your dragon';
    if(v.catchBonus.textContent!==bonus)v.catchBonus.textContent=bonus;
    v.popup.hidden=!celebrating;
    v.action.disabled=f.phase==='result'&&f.caught&&f.resultAge<1.9;
    v.action.dataset.active=(f.held||f.assistReel)?'true':'false';v.action.dataset.bite=f.phase==='hook'?'true':'false';
    v.action.setAttribute('aria-pressed',String(!!(f.held||f.assistReel)));
    const box=v.canvas.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1);
    const w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));
    if(v.canvas.width!==w||v.canvas.height!==h){v.canvas.width=w;v.canvas.height=h;}
    const g=v.canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
    drawFishingWater(g,box.width,box.height,f);
  }else drawFishingWater(ctx,VW,VH,f);
}
// Native canvas art: no added downloads at startup. Water, fish, line and rod
// all react to the current cast; the camera looks down from the south bank.
function drawFishingWater(g,w,h,f){
  if(w<1||h<1)return;
  g.save();g.imageSmoothingEnabled=false;
  const sx=w/640,sy=h/640,unit=Math.max(.85,Math.min(sx,sy)),t=f.age;
  const rect=(x,y,a,b,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(a),Math.ceil(b));};
  const poly=(points,c)=>{g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  const line=(points,c,l=1)=>{g.strokeStyle=c;g.lineWidth=l;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
  const ellipse=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,0,FISH_TAU);g.fill();};
  const text=(s,x,y,size,color='#e6f3df',align='center')=>{g.font=`600 ${size}px Georgia,serif`;g.textAlign=align;g.fillStyle=color;g.fillText(s,x,y);};
  // Broad pools of depth, small squared caustics, and translucent plant shadows.
  const water=g.createLinearGradient(0,0,w*.3,h);water.addColorStop(0,'#263d35');water.addColorStop(.4,'#486b56');water.addColorStop(1,'#78937a');
  g.fillStyle=water;g.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){
    const x=((i*173)%641)/640*w,y=((i*131)%613)/640*h;
    const shade=g.createRadialGradient(x,y,0,x,y,(70+i%3*35)*unit);
    shade.addColorStop(0,i%2?'#9baf7e20':'#1a30232b');shade.addColorStop(1,'#3c564000');
    g.fillStyle=shade;g.fillRect(0,0,w,h);
  }
  // Fractured reflections, with a fine bright edge drifting over a darker one.
  for(let i=0;i<23;i++){
    const x=((i*109+t*2)%680-20)*sx,y=((i*83)%610)*sy;
    const a=(13+i%4*6)*sx,b=(4+i%3*2)*sy;
    line([[x,y],[x+a*.3,y-b],[x+a*.8,y-b],[x+a,y]],'#a2d6b916',Math.max(1,unit));
    line([[x+a*.8,y-b+2*unit],[x+a,y+2*unit]],'#103e4619',unit);
  }
  const pixel=Math.max(1.5,unit*2);
  for(let i=0;i<135;i++){
    const x=((i*79.3+t*(i%3?1.8:-1.3))%660-10)/640*w,y=((i*137)%635)/640*h;
    const glow=.035+.045*(.5+.5*Math.sin(t*.8+i));g.globalAlpha=glow;
    rect(x,y,(6+i%5*5)*sx,pixel,'#d8ffe4');
    if(i%4===0){rect(x+10*sx,y+pixel,18*sx,pixel,'#c5ffe9');rect(x+28*sx,y+pixel*2,4*sx,pixel,'#c5ffe9');}
  }g.globalAlpha=1;
  // Fish beneath the surface swim away from the active line.
  for(let i=0;i<5;i++){
    const x=(.15+((i*.179+t*.013)% .72))*w,y=(.2+i*.115+Math.sin(t*.7+i)*.016)*h;
    drawFishingFish(g,x,y,Math.max(.42,unit*.8),Math.sin(t*.7+i)*.25+.2,t+i,'shadow');
  }
  // Overhanging reeds and mossy stones on the near corners, in foreshortened layers.
  for(const side of [-1,1]){
    const x=side<0?0:w;
    poly([[x,h*.75],[x-side*w*.075,h*.8],[x-side*w*.12,h],[x,h]],'#254d49');
    poly([[x,h*.8],[x-side*w*.048,h*.84],[x-side*w*.09,h],[x,h]],'#567a56');
    for(let i=0;i<6;i++){
      const bx=x-side*(8+i%3*13)*sx,by=h-(i*27+12)*sy;
      ellipse(bx+5*sx,by+6*sy,(13+i%2*8)*sx,9*sy,'#123e4140');
      poly([[bx-14*sx,by],[bx-9*sx,by-9*sy],[bx+9*sx,by-10*sy],[bx+16*sx,by],[bx+9*sx,by+7*sy],[bx-9*sx,by+6*sy]],'#68857a');
      line([[bx-8*sx,by-8*sy],[bx+8*sx,by-9*sy],[bx+14*sx,by-2*sy]],'#a7b29a',2*unit);
      rect(bx-8*sx,by+2*sy,15*sx,4*sy,'#426e59');
    }
    for(let i=0;i<15;i++){
      const bx=x-side*(5+i%5*10)*sx,by=h-(i%5*13)*sy;
      const tip=bx-side*(7+Math.sin(t*1.2+i)*4)*sx,top=by-(38+i%6*17)*sy;
      poly([[bx-2*sx,by],[tip,top],[bx+2*sx,by]],i%2?'#aac07c':'#6d9e69');
      if(i%4===0)rect(tip-2*sx,top,4*sx,12*sy,'#b6a070');
    }
  }
  // Lily pads and their offset underwater shadows.
  for(const [nx,ny,r]of [[.09,.29,16],[.13,.35,13],[.075,.42,19],[.9,.17,18],[.94,.24,12],[.85,.21,10]]){
    const x=nx*w+Math.sin(t*.45+ny*10)*2*unit,y=ny*h,rr=r*Math.max(.7,unit);
    ellipse(x+4*unit,y+6*unit,rr,rr*.55,'#133b4255');
    ellipse(x,y,rr,rr*.55,'#69a77c');ellipse(x-2*unit,y-2*unit,rr*.83,rr*.38,'#8ab989');
    poly([[x,y],[x+rr*.8,y-rr*.35],[x+rr*.85,y+rr*.25]],'#2b706b');
    line([[x-rr*.7,y],[x,y]],'#b3ce92',unit);
    if(ny===.35){for(let j=0;j<5;j++)ellipse(x+Math.cos(j*FISH_TAU/5)*4*unit,y-3*unit+Math.sin(j*FISH_TAU/5)*2*unit,4*unit,2.6*unit,'#e4cfca');ellipse(x,y-3*unit,2*unit,2*unit,'#f6dc89');}
  }
  const fx=f.fishX*w,fy=f.fishY*h;
  const active=['hook','reel'].includes(f.phase),caught=f.phase==='result'&&f.caught;
  if(f.phase==='aim'){
    const tx=w*.5,ty=h*.32;g.globalAlpha=.55+.2*Math.sin(t*2);
    g.strokeStyle='#f6d48a';g.lineWidth=2*unit;g.setLineDash([5*unit,7*unit]);g.beginPath();g.ellipse(tx,ty,43*unit,22*unit,0,0,FISH_TAU);g.stroke();g.setLineDash([]);g.globalAlpha=1;
  }
  if(active)drawFishingFish(g,fx+8*unit,fy+17*unit,Math.max(.8,unit*1.8),-.4+Math.sin(t*3)*.6,t,'water');
  const trophy=caught?fishingCatchPose(w,h,unit,f):null;
  // Expanding ellipse ripples convey the angled overhead camera.
  if(f.phase!=='aim')for(let i=0;i<4;i++){
    const r=7+((t*(f.surging?32:17)+i*12)%48);g.globalAlpha=(1-(r-7)/48)*.5;
    g.strokeStyle=f.phase==='hook'?'#fff1b7':'#c4f2dd';g.lineWidth=Math.max(1,unit*1.4);
    g.beginPath();g.ellipse(fx,fy+6*unit,r*unit,r*.43*unit,0,0,FISH_TAU);g.stroke();
  }g.globalAlpha=1;
  // The handle enters from the SOUTH edge. The flexible rod points away from us.
  const bend=f.phase==='reel'?f.tension:0.12;
  const lift=trophy?.lift||0;
  const baseX=w*(.54+((h<340?.94:.88)-.54)*lift),baseY=h+30*unit;
  const restX=w*.47+(fx-w*.5)*.35+bend*26*unit,restY=h*.61+bend*35*unit;
  const tipX=trophy?restX+(trophy.tipX-restX)*trophy.lift:restX;
  const tipY=trophy?restY+(trophy.tipY-restY)*trophy.lift:restY;
  // Lift the grip to the right and arch the shaft away from the hanging catch.
  const rodAt=q=>({x:baseX+(tipX-baseX)*q+Math.sin(q*Math.PI)*(bend*26*unit+(h<340?.1:.14)*w*lift),y:baseY+(tipY-baseY)*q});
  const rod=Array.from({length:19},(_,i)=>{const p=rodAt(i/18);return [p.x,p.y];});
  const cast=f.phase==='cast'?Math.min(1,f.elapsed/.7):1;
  const bx=f.phase==='aim'?tipX+15*unit:tipX+(fx-tipX)*cast;
  const by=f.phase==='aim'?tipY+30*unit:tipY+(fy-tipY)*cast-Math.sin(cast*Math.PI)*h*.18;
  if(!caught){
    g.strokeStyle=f.tension>.8?'#f8b69c':'#e8edcd';g.lineWidth=Math.max(1,unit*.9);g.beginPath();g.moveTo(tipX,tipY);
    g.quadraticCurveTo((tipX+bx)/2+(f.held?0:14*unit),(tipY+by)/2+(f.held?0:18*unit),bx,by);g.stroke();
    const dip=f.phase==='hook'?7*unit:Math.sin(t*3)*2*unit;
    ellipse(bx,by+5*unit,6*unit,2*unit,'#183d4770');
    rect(bx-unit,by-13*unit+dip,2*unit,11*unit,'#e9dc99');
    ellipse(bx,by-3*unit+dip,4*unit,6*unit,'#f0dbaf');
    ellipse(bx,by+dip,4*unit,3*unit,'#d36c58');
  }
  line(rod.map(([x,y])=>[x+4*unit,y+4*unit]),'#133c4355',9*unit);
  for(let i=1;i<rod.length;i++){
    line([rod[i-1],rod[i]],'#473b32',Math.max(1,8*(1-i/22))*unit);
    line([[rod[i-1][0]-unit,rod[i-1][1]],[rod[i][0]-unit,rod[i][1]]],'#d9af71',Math.max(.7,4*(1-i/22))*unit);
  }
  for(const q of [.24,.46,.66,.84,.98]){const p=rodAt(q);ellipse(p.x+3*unit,p.y,3*unit,2*unit,'#efe0ad');ellipse(p.x+3*unit,p.y,1.5*unit,unit,'#314b49');}
  const handle=rodAt(.16);line([[baseX,baseY],[handle.x,handle.y]],'#443d35',17*unit);
  line([[baseX-2*unit,baseY],[handle.x-2*unit,handle.y]],'#be9d70',11*unit);
  for(let q=.01;q<.16;q+=.018){const p=rodAt(q);line([[p.x-5*unit,p.y],[p.x+5*unit,p.y-2*unit]],'#876b50',2*unit);}
  const reel=rodAt(.12);ellipse(reel.x+15*unit,reel.y,12*unit,15*unit,'#303f40');ellipse(reel.x+15*unit,reel.y-2*unit,8*unit,11*unit,'#ad9670');ellipse(reel.x+15*unit,reel.y-2*unit,4*unit,6*unit,'#e0c691');
  const spin=f.held?t*12:0;line([[reel.x+16*unit,reel.y],[reel.x+(26+Math.sin(spin)*5)*unit,reel.y+Math.cos(spin)*7*unit]],'#d5be89',3*unit);
  if(trophy){
    // The line ends at the fish's mouth throughout the lift and pendulum sway.
    // Its shrinking water shadow and falling droplets separate it from the pool.
    const shadow=trophy.surfaceY+14*unit;
    g.globalAlpha=.24*(1-trophy.lift*.65);
    ellipse(trophy.surfaceX,shadow,30*unit*(1-trophy.lift*.25),7*unit,'#203a2e');g.globalAlpha=1;
    line([[tipX+unit,tipY],[trophy.mouthX+unit,trophy.mouthY]],'#20352a80',Math.max(2,unit*2.2));
    line([[tipX,tipY],[trophy.mouthX,trophy.mouthY]],'#fff2ce',Math.max(1.4,unit*1.3));
    const floatX=tipX+(trophy.mouthX-tipX)*.45,floatY=tipY+(trophy.mouthY-tipY)*.45;
    ellipse(floatX,floatY,3*unit,5*unit,'#edd9a4');ellipse(floatX,floatY+2*unit,3*unit,2*unit,'#9f493c');
    drawFishingFish(g,trophy.x,trophy.y,trophy.scale,trophy.angle,t*1.2,'catch');
    g.strokeStyle='#d8c498';g.lineWidth=1.5*unit;g.beginPath();
    g.arc(trophy.mouthX,trophy.mouthY+2*unit,3*unit,-Math.PI,Math.PI*.35);g.stroke();
    if(f.resultAge<3.8)for(let i=0;i<7;i++){
      const age=(f.resultAge*1.4+i*.19)%1;
      const dx=Math.sin(i*4.1)*13*unit;
      g.globalAlpha=(1-age)*.8;
      ellipse(trophy.x+dx,trophy.y+age*70*unit,unit,2.5*unit,'#d0e2bd');
    }g.globalAlpha=1;
  }
  for(const p of f.particles){g.globalAlpha=Math.max(0,p.life/.8);rect(p.x*w,p.y*h,3*unit,3*unit,p.color);}g.globalAlpha=1;
  // Compact, readable gauges sit over the water; the scene remains the focus.
  const gw=Math.min(w-40,h<340?200:360),gx=h<340?24:(w-gw)/2,gy=h<340?52:60,fs=Math.max(11,Math.min(15,w/30));
  const meter=(y,label,value,color)=>{rect(gx-12,y-23,gw+24,49,'#2c241beF');g.strokeStyle='#a58a51';g.lineWidth=1;g.strokeRect(gx-12,y-23,gw+24,49);
    for(const x of [gx-8,gx+gw+8])for(const yy of [y-19,y+22])rect(x,yy,2,2,'#d4b777');
    text(label,gx,y-6,fs,'#e8d5aa','left');
    rect(gx,y+3,gw,7,'#514636');rect(gx,y+3,gw*Math.max(0,Math.min(1,value)),7,color);};
  if(f.phase==='aim'){
    meter(gy+12,'CAST DISTANCE',1,'#514636');rect(gx+gw*.62,gy+15,gw*.2,7,'#b4a463');rect(gx+gw*.68,gy+15,gw*.08,7,'#f1d087');
    rect(gx+gw*f.power-2,gy+8,4,21,'#fff3cb');text('Tap in the gold',w/2,gy+56,fs,'#fff0c8');
  }else if(f.phase==='reel'){
    meter(gy,'CATCH  '+Math.round(f.progress*100)+'%',f.progress,'#b8d8a1');
    meter(gy+55,'LINE TENSION'+(f.tension>.76?' · RELEASE!':''),f.tension,f.tension>.76?'#ef997e':'#e5c88a');
    rect(gx+gw*.8,gy+54,2,14,'#fff1d0');
    if(f.slack>3)text('LINE GOING SLACK',w/2,gy+100,fs,'#ffe1a1');
  }else if(f.phase==='hook'){
    meter(gy+12,'BITE!  TAP TO HOOK',1-f.elapsed/f.biteWindow,'#f7d991');
  }else if(f.phase==='result'&&!f.caught){
    const y=h*.34;rect(w/2-gw/2-8,y-26,gw+16,104,'#2c241bef');
    text(f.caught?'A FINE CATCH':'UNTIL NEXT TIME',w/2,y,fs+5,'#f4d8a0');
    text(f.caught?'+'+(f.reward+f.bonus)+' fresh fish':'There are more fish in the water.',w/2,y+28,fs+2);
    text(f.caught&&f.bonus?'Perfect technique · bonus fish':f.caught?'For a hungry dragon.':'Try another cast.',w/2,y+55,fs,'#a6c7bc');
  }
  g.restore();
}
// Mouth-anchored pose shared by the splash, lift, line, and hanging fish.
function fishingCatchPose(w,h,unit,f){
  const age=f.resultAge||0,q=Math.min(1,age/1.35),lift=1-Math.pow(1-q,3);
  const origin=f.catchOrigin||{x:f.fishX,y:f.fishY};
  const short=h<340,tipX=w*(short?.69:.5),tipY=h*.13;
  const settle=Math.max(0,age-1.05),swing=Math.sin(settle*3.2)*.10*Math.exp(-settle*.24);
  const scale=(1.8+.8*lift)*unit,startAngle=f.catchAngle??-.4;
  const startX=origin.x*w+8*unit+Math.cos(startAngle)*20*1.8*unit;
  const startY=origin.y*h+17*unit+Math.sin(startAngle)*20*1.8*unit;
  // Gravity keeps the hook beneath the tip. Mouth, body and line swing together.
  const lineLength=h*(short?.15:.16);
  const mouthX=startX+(tipX+Math.sin(swing)*lineLength-startX)*lift;
  const mouthY=startY+(tipY+Math.cos(swing)*lineLength-startY)*lift;
  const angle=startAngle+(-Math.PI/2-startAngle)*lift-swing*lift;
  return {lift,tipX,tipY,mouthX,mouthY,angle,scale,
    x:mouthX-Math.cos(angle)*20*scale,y:mouthY-Math.sin(angle)*20*scale,
    surfaceX:origin.x*w,surfaceY:origin.y*h};
}
function drawFishingFish(g,x,y,scale,angle,t,kind){
  g.save();g.translate(x,y);g.rotate(angle);g.scale(scale,scale);
  const shadow=kind==='shadow',bright=kind==='catch';g.globalAlpha=shadow?.25:bright?1:.7;
  const body=shadow?'#092f3e':bright?'#d4dbaa':'#79b3a7',back=shadow?'#092f3e':bright?'#659887':'#468a89';
  const p=(pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();g.fill();};
  const tail=Math.sin(t*7)*3;
  p([[-18,0],[-29,-7+tail],[-26,1+tail],[-29,8+tail]],back);
  p([[-21,-2],[-12,-7],[5,-8],[15,-4],[20,0],[14,5],[3,8],[-12,6],[-21,2]],body);
  p([[-16,-3],[-6,-7],[7,-7],[14,-3],[4,-2],[-10,-1]],back);
  p([[-3,-6],[1,-13],[9,-7]],back);p([[0,5],[-7,12],[7,7]],back);
  if(!shadow){g.fillStyle=bright?'#fff0c5':'#9ecbb6';g.fillRect(-8,1,18,2);g.fillStyle='#133f46';g.fillRect(13,-2,2,2);
    g.fillStyle=bright?'#9dbd98':'#509391';for(let i=-10;i<8;i+=5)g.fillRect(i,0,2,2);}
  g.restore();
}
