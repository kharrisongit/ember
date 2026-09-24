/* Hollybeck: twenty sections with east/west switchbacks and the original skull chamber. */
async function prepareExpandedHollybeckTemple(){
  if(W.maps.sn1.hollybeck)return;
  const response=await fetch('assets/interiors/hollybeck-temple/layout.json?v=20260924-hollybeck1');
  if(!response.ok)throw Error('Hollybeck temple layout could not load');
  const plans=await response.json(),old=W.maps.sn1,outside=old.doors.find(d=>d.to==='world');
  const chamberProps=old.roomActors.filter(o=>!o.editableWall&&o.y<512).map(o=>({...o}));
  const chamberBlocks=old.roomBlocks.filter(b=>b[1]<512).map(b=>b.slice());
  const images=await Promise.all(Object.keys(plans).map(async id=>{
    const image=new Image();image.src='assets/interiors/hollybeck-temple/'+id+'.png?v=20260924-hollybeck1';
    await image.decode();return [id,image];
  }));
  for(const [id,image] of images){
    const plan=plans[id],[width,height]=plan.size;
    const m=W.maps[id]={w:width/16,h:height/16,ts:16,title:'Hollybeck Temple',spawn:plan.spawn,
      hollybeck:true,templeExpanded:true,templeDragon:true,templePlan:plan,templeFloors:plan.floors.map(r=>r.slice()),templeGateOpen:0,
      travel:id==='sn1',travel_kind:'Temple',roomArt:'dragon75_interior',_roomBaseCanvas:image,
      bg:'#19171c',floorbg:'#535d6f',terr:terrRLE(Array(width*height/256).fill(DIRT)),
      objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],
      roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{},templeClock:0,templeHazards:[]};
    m.base_terr=m.terr;
    for(const [kind,x,y,room] of plan.enemies)m.foes.push({k:kind,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
    for(const d of plan.doors){
      const room=plan.chambers.find(([l,t,r,b])=>d.x>l&&d.x<r&&d.y===t);
      const guards=d.sealed?m.foes.flatMap((f,i)=>f.expandedRoom.every((n,j)=>n===room[j])?[i]:[]):null;
      const door={x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(d.arrival[0]-8)/16,ty:(d.arrival[1]-16)/16,
        dir:d.dir,explicitDir:true,templeGuards:guards,triggerRect:{x:d.x-16,y:d.dir==='u'?d.y-16:d.y,w:32,h:16}};
      m.doors.push(door);
      if(d.dir==='u')m.roomActors.push({spr:d.sealed?'dragon77_bars':'dragon77_door',x:d.x,y:d.y,schoolArt:true,templeExit:true,
        ...(d.sealed?{templeExitDoor:door}:{royalDoor:true})});
      else m.templeFloors.push([d.x-16,d.y,d.x+16,d.y+48]);
    }
    for(const p of plan.passages)m.roomActors.push({spr:'dragon77_door',x:p.x,y:p.y,schoolArt:true,
      inlineTempleDoor:true,...(p.mode==='open'?{stillFrame:3}:{templePassDoor:true})});
    for(const [i,[x,y,gold,kind,enemy]] of plan.chests.entries()){
      const room=plan.chambers.find(([l,t,r,b])=>x>l&&x<r&&y>t&&y<b),lootId=id+':loot:'+i;
      const block=m.roomBlocks.push([x-14,y-12,x+14,y+10])-1;
      m.roomActors.push({n:'Temple treasure',spr:'temple71_chest',schoolArt:true,x,y,editKey:lootId,moveBlocks:[block],
        houseLoot:{id:lootId,gold,item:gold>0?(i%2?'potion':'dragonFish'):null,templeReward:true,ghost:kind==='ghost'}});
      if(kind==='ghost'){
        const gx=x+(x<(room[0]+room[2])/2?32:-32),gy=y+40;
        m.foes.push({k:enemy||'ghost3',x:(gx-8)/16,y:(gy-16)/16,expandedRoom:room,chestAmbush:lootId,ambushFrom:{x,y}});
      }
    }
    for(const [i,[l,t,r,b]] of plan.chambers.entries()){
      if(plan.heartstone&&plan.heartstone[1]>=t&&plan.heartstone[1]<b)continue;
      for(const x of [l+32,r-32])m.roomActors.push({spr:'torch77_sn1',x,y:t+4,schoolArt:true});
      if(!plan.doors.some(d=>d.dir==='u'&&d.y===t)&&!plan.floors.some(([fl,ft,fr,fb])=>(l+r)/2>fl&&(l+r)/2<fr&&t-16>=ft&&t-16<fb))
        m.roomActors.push({spr:i%2?'dragon75_banner_red':'dragon75_banner_blue',x:(l+r)/2,y:t-2,schoolArt:true,stillFrame:0});
    }
    if(!plan.heartstone)addSandspireCobwebs(m);
    for(const h of plan.hazards){
      m.roomActors.push({spr:'temple71_lever',x:h.lever[0],y:h.lever[1],schoolArt:true,expandedLever:h.id});
      h.lines.forEach((y,i)=>{
        const [l,r]=h.cross;
        if(h.type==='spikes')for(let x=l+8;x<r;x+=16)m.roomActors.push({spr:'temple71_spikes',x,y,sy:-100,schoolArt:true,expandedSpike:{id:h.id,phase:i*.55}});
        else{
          const dir=i%2?-1:1;
          m.templeHazards.push({hall:h.id,type:h.type,y,dir,minX:l,maxX:r,x:l+12,offset:i*.7,period:h.period,frame:0,active:false});
          if(h.type==='flame')m.roomActors.push({spr:'flame78_vent',x:dir>0?l-8:r+8,y:y+8,schoolArt:true,stillFrame:0});
        }
      });
    }
    // Stable keys keep legacy sn1 actor edits from moving unrelated new props.
    m.roomActors.forEach((a,i)=>{a.editKey||=id+':prop:'+i+':'+a.spr;});
  }
  const entry=W.maps.sn1,[ex,ey]=entry.templePlan.exit;
  entry.templeFloors.push([ex-16,ey,ex+16,ey+48]);
  entry.doors.push({x:(ex-8)/16,y:ey/16,to:'world',tx:outside.tx,ty:outside.ty,dir:'d',explicitDir:true,triggerRect:{x:ex-16,y:ey,w:32,h:16}});
  const worldDoor=W.maps.world.doors.find(d=>d.to==='sn1');
  if(worldDoor){worldDoor.tx=(entry.spawn[0]-8)/16;worldDoor.ty=(entry.spawn[1]-16)/16;}
  const sanctum=W.maps.sn_sanctum,plan=sanctum.templePlan,[dx,dy]=plan.preserveChamberOffset;
  sanctum.roomActors.push({spr:'dragon77_bars',x:160,y:plan.gate[3],schoolArt:true,expandedGate:true,editKey:'sn_sanctum:gate'});
  const blockStart=sanctum.roomBlocks.length;
  sanctum.roomBlocks.push(...chamberBlocks.map(([l,t,r,b])=>[l+dx,t+dy,r+dx,b+dy]));
  for(const [i,actor] of chamberProps.entries()){
    const blocks=chamberBlocks.flatMap(([l,t,r,b],j)=>actor.x>=l&&actor.x<=r&&Math.abs(b-actor.y)<4?[blockStart+j]:[]);
    sanctum.roomActors.push({...actor,x:actor.x+dx,y:actor.y+dy,sy:actor.sy>=0?actor.sy+dy:actor.sy,
      preservedHeartstoneProp:true,editKey:'sn_sanctum:original:'+i,moveBlocks:blocks});
  }
  const chest=CHESTS.find(c=>c.gift==='shadow');
  Object.assign(chest,{map:'sn_sanctum',x:(plan.heartstone[0]-8)/16,y:(plan.heartstone[1]-16)/16});
  if(chestOpen.sn1||chestOpen.sn4||breathHas.shadow)chestOpen.sn_sanctum=true;
  for(const id of Object.keys(plans))insetTempleSouthExits(W.maps[id]);
}
function stepHollybeckTemple(dt){
  if(MD.templePlan.gate){
    const clear=foesHeld||breathHas.shadow||MD.foes.every((_,i)=>bossGone[MAPID+':'+i]);
    MD.templeGateOpen=Math.min(1,MD.templeGateOpen+(clear?dt*3:0));
  }
  if(sceneHold()||fadeDir)return;
  MD.templeClock+=dt;
  stepExpandedDragonHazards(dt);
}
function stepExpandedDragonHazards(dt){
  for(const a of MD.templeHazards){
    const disabled=expandedTrapDisabled(a.hall),phase=(MD.templeClock+a.offset)%a.period;
    if(a.type==='flame'){
      a.frame=disabled||phase<1.6||phase>=2.5?0:Math.min(8,1+Math.floor((phase-1.6)/.1));
      a.active=!disabled&&a.frame>=3&&a.frame<=6;
      if(a.active&&Math.abs(P.y-a.y)<9&&P.x>a.minX&&P.x<a.maxX)hurtPlayer(1);
    }else{
      a.active=!disabled&&phase>=1.4&&phase<4.2;
      const prev=a.x;a.x=a.minX+12+(a.active?(a.maxX-a.minX-24)*Math.sin((phase-1.4)/2.8*Math.PI):0);
      a.frame=a.active?Math.floor(MD.templeClock*12)%6:0;
      if(a.active&&Math.abs(P.y-a.y)<12&&P.x>Math.min(prev,a.x)-11&&P.x<Math.max(prev,a.x)+11)hurtPlayer(1);
    }
  }
}
function drawHollybeckTraps(){
  const art=MD.mountainPassage?'passage_':'dragon75_';
  for(const a of MD.templeHazards){
    ctx.save();ctx.beginPath();ctx.rect(a.minX,a.y-16,a.maxX-a.minX,32);ctx.clip();
    if(a.type==='saw'){
      const rail=SPR[art+'rail'],sp=SPR[art+'saw'];
      drawGameImage(ctx,sheetOf(rail),rail[0],rail[1],rail[2],rail[3],(a.minX+a.maxX-rail[2])/2,a.y-1,rail[2],rail[3]);
      drawGameImage(ctx,sheetOf(sp),sp[0]+a.frame*sp[2],sp[1],sp[2],sp[3],Math.round(a.x-sp[2]/2),a.y-16,sp[2],sp[3]);
    }else if(a.frame>0){
      // The left sheet has different transparent padding. Mirror the right
      // sheet at the wall instead, and omit its baked-in nozzle (pixels 0–15).
      // The separate wall vent supplies the nozzle for both directions.
      const sp=SPR[art+'flame_r'],nozzle=16;
      ctx.translate(a.dir>0?a.minX:a.maxX,a.y-sp[3]/2);ctx.scale(a.dir,1);
      drawGameImage(ctx,sheetOf(sp),sp[0]+a.frame*sp[2]+nozzle,sp[1],sp[2]-nozzle,sp[3],0,0,sp[2]-nozzle,sp[3]);
    }
    ctx.restore();
  }
}
