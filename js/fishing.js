// Hold the last completed world frame while fishing. Re-running the world
// renderer with dt=0 bypasses its normal update path and can leak camera state.
let fishingBackdrop=null;
function captureFishingBackdrop(){
  if(fishingBackdrop)return fishingBackdrop;
  const image=document.createElement('canvas');image.width=cv.width;image.height=cv.height;
  image.getContext('2d').drawImage(cv,0,0);
  return fishingBackdrop=image;
}
function drawFishingBackdrop(){
  const image=captureFishingBackdrop();
  // Use CSS-pixel coordinates at the device pixel ratio, even after a resize.
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=false;
  ctx.drawImage(image,0,0,image.width,image.height,0,0,VW,VH);
}
/* Fishing uses the existing A/Space and B/Esc bindings on keyboard and touch. */
function startFishing(){
  if(!fishingPole||!waterInReach()||!fishingSafe()){endFishing();return;}
  const backdrop=captureFishingBackdrop();
  endFishing();fishingBackdrop=backdrop;
  fishing={...fishingRegion(),phase:'cast',age:0,elapsed:0,angle:-Math.PI/2,
    target:.4+Math.random()*5,roundAge:0,lock:0,pulls:0,tension:0,perfect:0,
    resultAge:0,caught:false,feedback:'',flash:0,particles:[]};
}
function fishingBurst(f,color,count=12){
  for(let i=0;i<count;i++){
    const a=Math.random()*FISH_TAU,s=18+Math.random()*42;
    f.particles.push({x:170,y:120,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,life:.65,color});
  }
}
function finishFishing(caught){
  const f=fishing;if(!f||f.phase==='result')return;
  f.caught=caught;f.phase='result';f.resultAge=0;
  f.bonus=caught&&f.perfect>=3?1:0;
  if(caught){globalThis.window?.EmberSfx?.pickup();dragonFish+=f.reward+f.bonus;fishingBurst(f,'#f9d67b',24);saveGame();}
}
function fishingMiss(){
  const f=fishing;f.tension++;f.flash=.7;f.feedback='Too much strain!';f.lock=.42;
  f.roundAge=0;fishingBurst(f,'#ef997c',8);
  if(f.tension>=3)finishFishing(false);
}
function stepFishing(dt){
  const f=fishing;if(!f||f.phase==='prompt')return;
  // Bound catch-up after a suspended tab; an unseen frame cannot cost a catch.
  dt=Math.max(0,Math.min(.05,dt));f.age+=dt;f.elapsed+=dt;
  f.lock=Math.max(0,f.lock-dt);f.flash=Math.max(0,f.flash-dt);
  for(const p of f.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=70*dt;p.life-=dt;}
  f.particles=f.particles.filter(p=>p.life>0);
  if(f.phase==='cast'){
    if(f.elapsed>=.85){f.phase='hook';f.elapsed=0;f.feedback='A bite! Time your hook.';f.flash=1;fishingBurst(f,'#b6e7e8');}
  }else if(f.phase==='hook'||f.phase==='reel'){
    f.angle=(f.angle+dt*f.speed*(1+.12*Math.sin(f.age*2.6)+f.pulls*.07))%FISH_TAU;
    f.roundAge+=dt;
    if(f.phase==='reel')f.target=(f.target+dt*.16*Math.sin(f.age*1.7))%FISH_TAU;
    if(f.roundAge>=9)fishingMiss();
  }else if(f.phase==='result')f.resultAge+=dt;
}
function fishingAction(){
  const f=fishing;if(!f)return;
  if(f.phase==='result'){if(f.resultAge>=.65)startFishing();return;}
  if(!['hook','reel'].includes(f.phase)||f.elapsed<.25||f.lock>0)return;
  const gap=Math.abs(Math.atan2(Math.sin(f.angle-f.target),Math.cos(f.angle-f.target)));
  // A wider hook window introduces the rhythm before the fish starts fighting.
  const width=f.halfWidth*(f.phase==='hook'?1.45:1.25);
  if(gap>width){fishingMiss();return;}
  const perfect=gap<=width*.4;
  if(perfect)f.perfect++;
  f.feedback=perfect?'Perfect pull!':'Good timing!';f.flash=.85;f.lock=.42;f.roundAge=0;
  fishingBurst(f,perfect?'#f9d67b':'#9ce6ca');
  if(f.phase==='hook'){f.phase='reel';f.feedback=perfect?'Perfect hook!':'Hooked! Reel it in.';}
  else if(++f.pulls>=3){finishFishing(true);return;}
  // Leave the next target ahead of the marker, avoiding a surprise instant input.
  f.target=(f.angle+1.6+Math.random()*1.5)%FISH_TAU;
}
function drawFishing(){
  const f=fishing;if(!f||f.phase==='prompt')return;
  const scale=Math.min(1.3,(VW-20)/340,(VH-20)/410),ox=(VW-340*scale)/2,oy=(VH-410*scale)/2;
  ctx.save();ctx.fillStyle='rgba(5,12,20,.78)';ctx.fillRect(0,0,VW,VH);
  ctx.translate(ox,oy);ctx.scale(scale,scale);
  const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
  const text=(s,x,y,size=12,color='#dbebdf')=>{ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(s,x,y);};
  const line=(points,c,width=1)=>{ctx.strokeStyle=c;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();};
  rect(0,0,340,410,'#0b1c29');rect(3,3,334,404,'#94764a');rect(5,5,330,400,'#122b38');
  for(const x of [9,325])for(const y of [9,396])rect(x,y,6,5,'#dfbb74');
  text('FISHING',170,29,19,'#f4d99b');
  text('CAST  /  HOOK  /  REEL',170,48,10,'#91b8b8');
  // Pixel water, banks and travelling glints give the scene depth without new assets.
  rect(15,61,310,111,'#173f50');rect(15,110,310,62,'#123445');
  ctx.save();ctx.beginPath();ctx.rect(15,61,310,111);ctx.clip();
  for(let i=0;i<28;i++){
    const x=15+((i*73+f.age*(i%2?8:-5)+620)%310),y=69+(i*29)%92;
    rect(Math.round(x),y,7+i%4*3,2,i%3?'#275666':'#3c7280');
  }
  rect(15,62,43,11,'#466555');rect(15,73,26,8,'#354e43');
  for(let i=0;i<6;i++){rect(18+i*5,62-i%3*4,2,10,'#769477');}
  // Rod, float and fish respond to both progress and line strain.
  const cast=f.phase==='cast'?Math.min(1,f.elapsed/.85):1;
  const fx=f.phase==='result'&&f.caught?170:174+Math.sin(f.age*(2+f.tension))*(24-f.pulls*4),fy=126+Math.sin(f.age*3)*4;
  line([[38,96],[62,76],[92,67]],'#c8a771',4);
  line([[92,67],[115,69+Math.sin(f.age*2)*3],[135+(fx-135)*cast,84+(fy-90)*cast]],f.tension>1?'#f8ac86':'#b5d7d9',1);
  const bx=135+(fx-135)*cast,by=84+(fy-90)*cast;
  for(let i=0;i<3;i++){
    const r=5+((f.age*12+i*7)%24);ctx.globalAlpha=(1-(r-5)/24)*.55;
    ctx.strokeStyle='#83bdc4';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(bx,by+4,r,r*.3,0,0,FISH_TAU);ctx.stroke();
  }
  ctx.globalAlpha=1;rect(bx-2,by-5,4,5,'#f7d48c');rect(bx-2,by,4,4,'#d67465');
  if(f.phase!=='cast'){
    ctx.save();ctx.translate(Math.round(fx),Math.round(fy+10));
    const jump=f.phase==='result'&&f.caught?-Math.sin(Math.min(1,f.resultAge/.65)*Math.PI)*25:0;
    ctx.translate(0,jump);const bright=f.phase==='result'&&f.caught;
    rect(-12,-3,22,7,bright?'#b5eadb':'#558c99');rect(-8,-6,14,3,bright?'#dfecb2':'#639dad');
    rect(-8,4,13,2,bright?'#719eab':'#345f74');rect(10,-5,4,11,bright?'#e8bd76':'#477c8d');rect(-9,-2,2,2,'#132838');ctx.restore();
  }
  for(const p of f.particles){ctx.globalAlpha=Math.max(0,p.life/.65);rect(p.x,p.y,3,3,p.color);}ctx.globalAlpha=1;
  ctx.restore();
  // Three distinct pull markers and a numbered strain meter work without color cues.
  text('PULLS',52,192,10,'#9bbdbb');
  for(let i=0;i<3;i++){rect(88+i*23,180,17,14,i<f.pulls?'#a6e2ba':'#294553');text(String(i+1),96+i*23,191,10,i<f.pulls?'#153e42':'#90a8b0');}
  text('STRAIN',220,192,10,'#9bbdbb');
  for(let i=0;i<3;i++){rect(250+i*20,180,16,14,i<f.tension?'#eb9479':'#294553');text(String(i+1),258+i*20,191,10,i<f.tension?'#492c2c':'#90a8b0');}
  const cx=170,cy=265,r=48,active=['hook','reel'].includes(f.phase),width=f.halfWidth*(f.phase==='hook'?1.45:1.25);
  ctx.lineWidth=12;ctx.strokeStyle='#0a202d';ctx.beginPath();ctx.arc(cx,cy,r,0,FISH_TAU);ctx.stroke();
  if(active){
    // A subtle outer countdown shows when the fish will tug on an idle line.
    ctx.lineWidth=2;ctx.strokeStyle='#799ca5';ctx.beginPath();ctx.arc(cx,cy,r+12,-Math.PI/2,-Math.PI/2+FISH_TAU*(1-f.roundAge/9));ctx.stroke();
    ctx.lineWidth=12;ctx.strokeStyle='#80cbaa';ctx.beginPath();ctx.arc(cx,cy,r,f.target-width,f.target+width);ctx.stroke();
    ctx.strokeStyle='#f5d57f';ctx.beginPath();ctx.arc(cx,cy,r,f.target-width*.4,f.target+width*.4);ctx.stroke();
    for(const a of [f.target-width,f.target+width])line([[cx+Math.cos(a)*(r-9),cy+Math.sin(a)*(r-9)],[cx+Math.cos(a)*(r+9),cy+Math.sin(a)*(r+9)]],'#f4f0d6',2);
    for(let i=5;i>=0;i--){const a=f.angle-i*.10;ctx.globalAlpha=1-i*.15;rect(cx+Math.cos(a)*r-3,cy+Math.sin(a)*r-3,6,6,'#fff4d5');}ctx.globalAlpha=1;
    text('A',cx,cy+5,27,'#fff1cb');text(f.phase==='hook'?'HOOK':'PULL',cx,cy+23,9,'#b4d2ce');
  }else{
    text(f.phase==='cast'?'···':f.caught?'CAUGHT':'LOST',cx,cy+5,f.phase==='cast'?26:15,f.caught?'#b8e6b8':'#f4d99b');
  }
  let title=f.phase==='cast'?'Casting your line…':f.phase==='hook'?'A bite! Set the hook':f.phase==='reel'?'Keep the fish on the line':f.caught?'Fresh catch! +'+(f.reward+f.bonus)+' fish':'The fish got away';
  text(title,170,345,14,f.phase==='result'&&!f.caught?'#efaa94':'#f4d99b');
  const hint=f.phase==='result'?(f.bonus?'Perfect technique: +1 bonus fish':f.caught?'Fresh fish restores '+DRAGON_FISH_HEAL+' dragon HP':'Three strains broke the line. Try again!'):
    f.flash>0?f.feedback:f.phase==='cast'?'Three pulls land it · three strains lose it':'Tap A in the arc · gold center is perfect';
  text(hint,170,365,10,f.flash>0?'#fff0ba':'#b9d1d0');
  text(f.phase==='result'?'A / Space: cast again   B / Esc: leave':'A / Space: pull   B / Esc: leave',170,388,10,'#a7b9bc');
}
