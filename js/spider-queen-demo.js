/* A harmless, repeatable animation audition above the north shroom field.
   Kept outside the combat/quest/save registries until her encounter is authored. */
const SpiderQueenDemo = (() => {
  const BASE='assets/sprites/spider-queen/', VERSION='20260930-demo1';
  const CELL=128, HEIGHT=96, FOOT=90, ALPHA=180;
  const VECTORS={d:[0,1],u:[0,-1],e:[1,0],w:[-1,0]};
  const route=[[27*16,7.5*16],[34*16,7.5*16],[34*16,5.5*16],[27*16,5.5*16]];
  const actor={x:route[0][0],y:route[0][1],dir:'e',state:'idle',t:0,leg:0,triggered:false};
  const frames={},shots=[],splashes=[];
  let ready=false,loading=null,failed=false,clock=0,impact=0;

  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function hardPixels(g,w,h){
    const image=g.getImageData(0,0,w,h),p=image.data;
    for(let i=0;i<p.length;i+=4){
      if(p[i+3]<=ALPHA)p.fill(0,i,i+4);
      else p[i+3]=255;
    }
    g.putImageData(image,0,0);
  }
  function isolate(source,pose){
    const [x,y,w,h]=pose.box,c=canvas(w,h),g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(source,x,y,w,h,0,0,w,h);
    if(pose.seed){
      // A generated row is not a uniform grid. Retain exactly this connected
      // silhouette, excluding any overlapping rectangle from its neighbour.
      const im=g.getImageData(0,0,w,h),p=im.data,seen=new Uint8Array(w*h);
      const queue=[(pose.seed[1]-y)*w+pose.seed[0]-x];seen[queue[0]]=1;
      for(let at=0;at<queue.length;at++){
        const q=queue[at],qx=q%w,qy=Math.floor(q/w);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const nx=qx+dx,ny=qy+dy,n=ny*w+nx;
          if(nx<0||ny<0||nx>=w||ny>=h||seen[n]||p[n*4+3]<=ALPHA)continue;
          seen[n]=1;queue.push(n);
        }
      }
      for(let i=0;i<seen.length;i++)if(!seen[i])p.fill(0,i*4,i*4+4);
      g.putImageData(im,0,0);
    }
    hardPixels(g,w,h);return c;
  }
  function pack(source,pose,scale,projectile=false){
    const crop=isolate(source,pose),c=canvas(projectile?32:CELL,projectile?32:HEIGHT);
    const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;
    const w=Math.max(1,Math.round(crop.width*scale)),h=Math.max(1,Math.round(crop.height*scale));
    g.drawImage(crop,0,0,crop.width,crop.height,Math.round((c.width-w)/2),projectile?Math.round((32-h)/2):FOOT-h,w,h);
    hardPixels(g,c.width,c.height);c.pixelLocked=true;return c;
  }
  async function loadArt(){
    const response=await fetch(BASE+'frames.json?v='+VERSION);
    if(!response.ok)throw Error('Spider Queen frame map could not load');
    const manifest=await response.json();
    await Promise.all(Object.entries(manifest).map(async([dir,spec])=>{
      const image=new Image();image.src=BASE+spec.file+'?v='+VERSION;await image.decode();
      if(dir==='venom'){
        frames.venom={};
        ['d','u','e','w','impact'].forEach((action,row)=>{
          frames.venom[action]=spec.rows[row].map(p=>pack(image,p,action==='impact'?.12:.105,true));
        });return;
      }
      const heights=spec.rows[0].map(p=>p.box[3]).sort((a,b)=>a-b),scale=64/heights[1];
      const rows=spec.rows.map(row=>row.map(p=>pack(image,p,scale)));
      frames[dir]={idle:rows[0],walk:rows[1].concat(rows[2]),stomp:rows[3].concat(rows[4]),hurt:rows[5],spit:rows[6]};
    }));
    ready=true;
  }
  function ensureArt(){
    if(!loading&&!failed)loading=loadArt().catch(error=>{
      failed=true;console.error('Spider Queen artwork:',error);
      if(typeof toast==='function')toast('Spider Queen artwork could not load. Reload to retry.');
    });
    return loading;
  }
  function active(){return typeof MAPID!=='undefined'&&MAPID==='world';}
  function prepareArea(){
    if(!active())return;
    // A small opening above the field keeps the north tree canopies from
    // covering the audition and lets Corin walk up from the existing field.
    const inside=(x,y)=>x>=22*TS&&x<=39*TS&&y<=11*TS ||
      x>=29*TS&&x<=32*TS&&y<=14*TS;
    const scenery=(s,x,y)=>inside(x,y)&&/^(mw_tree|spr_|sh_(big|wall|med|sml|fat|stalk|glow))/.test(NAMES[s]||'');
    for(const o of objs)if(scenery(o.s,o.x,o.y))hidden.add(o.id);
    fobjs=fobjs.filter(o=>!scenery(o.s,o.x,o.y));
    for(const [prefix,arr] of [['s',scat],['a',sanm]])
      for(let i=0;i<arr.length;i+=3)if(scenery(arr[i],arr[i+1],arr[i+2]))decorGone.add(prefix+i);
    rebuildBuckets();rebuildSolid();chunks.clear();
  }
  function nearby(){
    return Math.abs(P.x-30.5*16)<520&&P.y<650 ||
      actor.x>=cam.x-128&&actor.x<=cam.x+VW/cam.z+128&&actor.y>=cam.y-128&&actor.y<=cam.y+VH/cam.z+128;
  }
  function enter(state){actor.state=state;actor.t=0;actor.triggered=false;}
  function mouth(){
    const v=VECTORS[actor.dir];
    return {x:actor.x+v[0]*29,y:actor.y-47+v[1]*7};
  }
  function spit(){
    const v=VECTORS[actor.dir],m=mouth();
    shots.push({...m,dir:actor.dir,vx:v[0]*74,vy:v[1]*74,t:0});
  }
  function step(dt){
    if(!active()){shots.length=0;splashes.length=0;return;}
    if(!nearby())return;
    ensureArt();if(!ready)return;
    // The demonstration respects the same scene/menu pauses as player motion.
    if(mode!=='play'||scene||bossScene||ovl||ask||bagOpen||atlasOpen||fishing||fadeDir||doorMotion)return;
    dt=Math.min(.05,Math.max(0,dt));clock+=dt;actor.t+=dt;impact=Math.max(0,impact-dt);
    for(let i=shots.length-1;i>=0;i--){
      const s=shots[i];s.t+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
      if(s.t>=1.25||s.y<12){splashes.push({x:s.x,y:Math.max(12,s.y),t:0});shots.splice(i,1);}
    }
    for(let i=splashes.length-1;i>=0;i--){splashes[i].t+=dt;if(splashes[i].t>=.5)splashes.splice(i,1);}
    const state=actor.state;
    if(state==='walk'){
      const target=route[(actor.leg+1)%route.length],dx=target[0]-actor.x,dy=target[1]-actor.y,distance=Math.hypot(dx,dy),move=22*dt;
      if(distance<=move){actor.x=target[0];actor.y=target[1];enter('pause');}
      else{actor.x+=dx/distance*move;actor.y+=dy/distance*move;}
    }else if(state==='idle'&&actor.t>=1.8)enter('walk');
    else if(state==='pause'&&actor.t>=1.3)enter('stomp');
    else if(state==='stomp'){
      if(!actor.triggered&&actor.t>=.82){actor.triggered=true;impact=.28;}
      if(actor.t>=1.5)enter('recover');
    }else if(state==='recover'&&actor.t>=1.1)enter('spit');
    else if(state==='spit'){
      if(!actor.triggered&&actor.t>=.6){actor.triggered=true;spit();}
      if(actor.t>=1.1)enter('rest');
    }else if(state==='rest'&&actor.t>=1.5){
      actor.leg=(actor.leg+1)%route.length;
      actor.dir=['e','u','w','d'][actor.leg];enter('idle');
    }
  }
  function pose(actorState=actor){
    const actor=actorState;
    const action=['walk','stomp','spit','hurt'].includes(actor.state)?actor.state:'idle',strip=frames[actor.dir][action];
    let i;
    if(action==='stomp'){
      // Keep anticipation, raised legs and impact distinct even where a source
      // sheet supplied extra recovery poses rather than equal frame counts.
      const sequence={e:[0,0,1,1,4,5,6,7],w:[0,1,2,2,3,4,6,10],u:[0,1,2,2,3,4,6,11],d:[0,1,2,2,4,5,6,7]}[actor.dir];
      i=sequence[Math.min(7,Math.floor(actor.t/1.5*8))];
    }else if(action==='spit')i=Math.min(strip.length-1,Math.floor(actor.t/1.1*strip.length));
    else i=Math.floor(actor.t*(action==='walk'?6:3))%strip.length;
    return strip[Math.min(i,strip.length-1)];
  }
  function addToDraw(list){
    if(!active()||!ready)return;
    if(actor.x<cam.x-CELL||actor.x>cam.x+VW/cam.z+CELL||actor.y<cam.y-HEIGHT||actor.y>cam.y+VH/cam.z+HEIGHT)return;
    list.push({spiderQueen:true,x:actor.x,y:actor.y,sy:actor.y-8});
    for(const shot of shots)list.push({spiderVenom:shot,x:shot.x,y:shot.y,sy:shot.y+48});
    for(const splash of splashes)list.push({spiderSplash:splash,x:splash.x,y:splash.y});
  }
  function draw(o){
    if(!o.spiderQueen&&!o.spiderVenom&&!o.spiderSplash)return false;
    ctx.save();ctx.imageSmoothingEnabled=false;
    if(o.spiderQueen){
      const image=pose();
      ctx.fillStyle='rgba(12,10,23,.24)';ctx.beginPath();ctx.ellipse(Math.round(actor.x),Math.round(actor.y-7),35,9,0,0,Math.PI*2);ctx.fill();
      if(impact>0){
        const v=VECTORS[actor.dir],x=Math.round(actor.x+v[0]*28),y=Math.round(actor.y-6+v[1]*7);
        ctx.strokeStyle='#b49a70';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,14+(1-impact/.28)*9,4,0,0,Math.PI*2);ctx.stroke();
      }
      drawPixelImage(ctx,image,0,0,CELL,HEIGHT,Math.round(actor.x-CELL/2),Math.round(actor.y-FOOT),CELL,HEIGHT);
    }else{
      const effect=o.spiderVenom||o.spiderSplash,strip=frames.venom[o.spiderVenom?effect.dir:'impact'];
      const index=o.spiderVenom?Math.floor(effect.t*10)%strip.length:Math.min(strip.length-1,Math.floor(effect.t/.5*strip.length));
      drawPixelImage(ctx,strip[index],0,0,32,32,Math.round(effect.x-16),Math.round(effect.y-16),32,32);
    }
    ctx.restore();return true;
  }
  function travelPlace(){return {name:'Spider Queen — North Field Demo',kind:'Demo',map:'world',x:30,y:10};}
  return {step,addToDraw,draw,ensureArt,prepareArea,travelPlace,
    frame:(dir,state,t)=>pose({dir,state,t}),
    venomFrame:(dir,t)=>{const strip=frames.venom[dir];return strip[dir==='impact'?Math.min(strip.length-1,Math.floor(t/.5*strip.length)):Math.floor(t*10)%strip.length];},
    inspect:()=>({ready,failed,actor:{...actor},shots:shots.map(s=>({...s})),splashes:splashes.map(s=>({...s})),clock}),
  };
})();
