/* Shared opening UI. The server owns every story step, line and map transition. */
window.LDRCoopStory={create({send,release,notify,session,members,closeBag,leave}){
 const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 let state=null,loadedEpoch=0,loading=false,failed=false,lastLine='',mapGeneration=0;const artCache=new Map();
 const panel=el('section');panel.id='coopStory';panel.hidden=true;panel.setAttribute('aria-label','Shared story conversation');
 const heading=el('strong'),counter=el('small'),words=el('p'),status=el('span'),next=el('button','Continue');next.type='button';
 words.setAttribute('aria-live','polite');next.addEventListener('click',advance);panel.append(heading,counter,words,status,next);document.body.append(panel);
 const loadingPanel=el('div');loadingPanel.id='coopMapLoading';loadingPanel.hidden=true;
 const loadingText=el('p'),retry=el('button','Retry loading'),exit=el('button','Leave room');retry.type=exit.type='button';
 retry.onclick=()=>{failed=false;void loadCurrentMap();};exit.onclick=leave;loadingPanel.append(loadingText,retry,exit);document.body.append(loadingPanel);
 function advance(){if(state?.scene&&!state.waiting)send('story-next',{id:state.scene.id,line:state.scene.line});}
 async function loadCurrentMap(){
  if(!state||loading||failed)return;
  const target=state,token=mapGeneration;loading=true;release();closeBag();loadingPanel.hidden=false;retry.hidden=true;
  loadingText.textContent='Travelling together… '+(W.maps[target.map]?.title||'Loading the next area');
  try{
   if(MAPID!==target.map)await BOOT.map(target.map,true,100,100,'Travelling together');
   if(token!==mapGeneration)return;
   loadedEpoch=target.epoch;send('map-loaded',{epoch:target.epoch,map:target.map});loadingPanel.hidden=true;
  }catch(error){if(token!==mapGeneration)return;failed=true;loadingText.textContent='This area could not finish loading. Your partner is waiting safely.';retry.hidden=false;}
  finally{loading=false;}
 }
 function update(value){
  state=value;if(!state){panel.hidden=loadingPanel.hidden=true;return;}
  if(loadedEpoch!==state.epoch||MAPID!==state.map)void loadCurrentMap();
  const scene=state.scene;panel.hidden=!scene;
  if(!scene)return;
  closeBag();
  const key=scene.id+':'+scene.line;
  if(key!==lastLine){
   lastLine=key;release();heading.textContent=scene.who||'The Last Dragonrider';words.textContent=scene.text;
   counter.textContent=(scene.line+1)+' / '+scene.total;
   if(scene.kind==='crash'&&scene.line===0)window.EmberDragonSceneAudio?.distant?.();
   if(scene.kind==='hatch'&&scene.line===3)window.EmberSfx?.hatch?.();
  }
  const voted=scene.ready.includes(session()),waiting=members().filter(p=>!scene.ready.includes(p.id)).map(p=>p.id===session()?'you':p.name);
  status.textContent=state.waiting?'Waiting for both players to connect and load.':voted?'Waiting for '+(waiting.join(' and ')||'the scene to finish')+'.':'Both players continue when ready.';
  next.disabled=state.waiting||voted;next.textContent=voted?'Ready ✓':scene.line+1===scene.total?'Finish together':'Continue';
 }
 function nearest(own){
  if(!state||state.scene||!own||loading||state.waiting)return null;
  const score=a=>Math.hypot(a.x-own.rider.x,a.y-own.rider.y)-(a.id.startsWith('chapter:')?100:0);
  return state.actions.filter(a=>Math.hypot(a.x-own.rider.x,a.y-own.rider.y)<=44).sort((a,b)=>score(a)-score(b))[0]||null;
 }
 function drawSprite(key,x,y,width,frame=0,purple=false){
  const sprite=SPR[key];if(!sprite)return;
  const h=width*sprite[3]/sprite[2];let image=sheetOf(sprite),sx=sprite[0]+frame*sprite[2],sy=sprite[1];
  if(purple){
   const cacheKey=key+':'+frame;let canvas=artCache.get(cacheKey);
   if(!canvas){canvas=document.createElement('canvas');canvas.width=sprite[2];canvas.height=sprite[3];const g=canvas.getContext('2d');
    drawGameImage(g,image,sx,sy,sprite[2],sprite[3],0,0,sprite[2],sprite[3]);
    const pixels=g.getImageData(0,0,canvas.width,canvas.height);LDRCoopAppearance.purpleDragon(pixels.data);g.putImageData(pixels,0,0);
    if(artCache.size>=64)artCache.delete(artCache.keys().next().value);artCache.set(cacheKey,canvas);
   }image=canvas;sx=sy=0;
  }
  drawGameImage(ctx,image,sx,sy,sprite[2],sprite[3],Math.round(x-width/2),Math.round(y-h),width,h);
 }
 function addActors(draw){
  if(!state)return;
  const names=new Set(['Nan Ferrow','Hettie','Elder Maddock','King Halvard','Serjeant Bram','Doran','Tolan']);
  for(let i=draw.length-1;i>=0;i--)if(names.has(draw[i].n))draw.splice(i,1);
  for(const npc of state.npcs)draw.push({coopStoryNpc:npc,x:npc.x,y:npc.y});
  if(state.step==='gear'&&state.map==='house26_bedroom')draw.push({coopStoryProp:'gear',x:65,y:151,sy:162});
  if(state.scene?.kind==='hatch')draw.push({coopStoryProp:'hatch',x:state.scene.x,y:state.scene.y+2});
  if(state.scene?.kind==='dragon')draw.push({coopStoryProp:'dragon',x:488,y:352,sy:1e8});
 }
 function drawActor(actor){
  if(actor.coopStoryNpc){
   const n=actor.coopStoryNpc,dir=n.f||'d';
   const sprite=n.packSpr?SPR[n.packDirections?n.packSpr+'_idle_'+dir:n.packSpr]:SPR[n.body+'_idle_'+dir]||SPR['npc_'+n.sk+'_idle'];
   if(sprite)drawNpcFrame({...n,n:n.name},sprite,Math.floor(tAcc*5)%sprite[4],sheetOf(sprite));return true;
  }
  if(!actor.coopStoryProp)return false;
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(actor.coopStoryProp==='gear')drawSprite('inventory_travelGear',actor.x,actor.y,24);
  if(actor.coopStoryProp==='dragon'){
   const s=state.scene,t=s.elapsed/1000,w=96,h=84;
   const row=s.line===0?(t<1.2?0:1):s.line===3?0:s.line===2?3:2;
   const frame=(row===1||row===3)?Math.min(5,Math.floor(Math.max(0,t-(row===1?1.2:0))*5)):Math.floor(t*4)%6;
   const offset=s.line===0?Math.max(0,1-t/1.2)*120:s.line===3?-Math.min(180,t*80):0;
   const rise=s.line===0?Math.max(0,1-t/1.2)*50:s.line===3?Math.min(90,t*40):0;
   drawGameImage(ctx,greenSceneImg,frame*128,row*112,128,112,actor.x-w/2+offset,actor.y-h-rise,w,h);
  }
  if(actor.coopStoryProp==='hatch'){
   const s=state.scene,party=members();
   party.forEach((member,i)=>{
    const x=actor.x+(i?14:-14),y=actor.y;
    if(s.line<3){drawSprite('inventory_egg',x+(s.line===2?Math.sin(s.elapsed/70)*1.5:0),y,18);return;}
    const dx=member.rider.x-x,dy=member.rider.y-y,len=Math.hypot(dx,dy)||1;
    const dir=s.line===4?(s.elapsed<700?'n':'s'):s.line>=5?(Math.abs(dx)>Math.abs(dy)?dx<0?'w':'e':dy<0?'n':'s'):'s';
    const toward=s.line>5?1:s.line===5?Math.min(1,s.elapsed/1300):0,travel=Math.max(0,len-18)*toward;
    const action=s.line===5&&toward<1?'walk':'idle',key=SPR['dr5_'+action+'_'+dir]?'dr5_'+action+'_'+dir:'dr5_idle_s',sprite=SPR[key];
    if(sprite)drawSprite(key,x+dx/len*travel,y+dy/len*travel,30,Math.floor(tAcc*(action==='walk'?8:4))%sprite[4],member.id!==session());
   });
  }
  ctx.restore();return true;
 }
 function frameCamera(own){
  if(!state)return false;
  const scene=state.scene,top=document.querySelector('#coopHud').getBoundingClientRect().bottom+8;
  const bottom=scene?panel.getBoundingClientRect().top-12:Math.min(document.querySelector('#coopPad').getBoundingClientRect().top,VH-12)-12;
  const available=Math.max(100,bottom-top),point=state.map!=='world'?{x:state.width/2,y:state.height/2}:scene?{x:scene.x,y:scene.y-8}:own.rider;
  cam.z=Math.min(playZoom(),state.map==='world'?(scene?available/180:playZoom()):Math.min((VW-20)/state.width,available/state.height));
  cam.z=Math.max(.65,cam.z);cam.x=point.x-VW/cam.z/2;cam.y=point.y-(top+available/2)/cam.z;
  // Small interiors are centered in the usable area; clamping would put them behind the HUD.
  if(state.map==='world')clampCam();return true;
 }
 function drawWaypoint(own){
  if(!state?.waypoint||state.scene||!own)return;
  const p=state.waypoint,dx=p.x-own.rider.x,dy=p.y-own.rider.y,len=Math.hypot(dx,dy);
  ctx.save();ctx.fillStyle='#ffe6a0';ctx.strokeStyle='#342d20';ctx.lineWidth=1;
  if(len>90){
   const x=own.rider.x+dx/len*45,y=own.rider.y-10+dy/len*45;
   ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-4,-4);ctx.lineTo(-2,0);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.stroke();
  }else{
   ctx.beginPath();ctx.arc(p.x,p.y-5,10+Math.sin(tAcc*3),0,Math.PI*2);ctx.strokeStyle='#ffe6a0';ctx.stroke();
  }ctx.restore();
 }
 function journal(container){
  if(!state)return;
  container.append(el('h3','Shared story'),el('p',state.objective));
  if(state.completed.length){const details=el('details'),summary=el('summary','Completed steps · '+state.completed.length),list=el('ol');for(const text of state.completed)list.append(el('li',text));details.append(summary,list);container.append(details);}
 }
 return {update,advance,nearest,addActors,drawActor,frameCamera,drawWaypoint,journal,
  get mapReady(){return !state||!loading&&!failed&&loadedEpoch===state.epoch&&MAPID===state.map;},
  resetMap(){loadedEpoch=0;},
  reset(){mapGeneration++;state=null;loadedEpoch=0;failed=false;artCache.clear();panel.hidden=loadingPanel.hidden=true;}
 };
}};
