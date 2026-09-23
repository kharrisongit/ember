/* Branched first temple: authored floors also define collision and encounter bounds. */
async function prepareExpandedFirstTemple(){
  if(W.maps.tp1.templeExpanded)return;
  const response=await fetch('assets/interiors/first-temple/layout.json?v=20260923-temple6-ornaments');
  if(!response.ok)throw Error('First temple layout could not load');
  const layout=await response.json(),images={};
  for(const id of Object.keys(layout)){
    const image=new Image();image.src='assets/interiors/first-temple/'+id+'.png?v=20260923-temple6-ornaments';
    await image.decode();images[id]=image;
  }
  const old=W.maps.tp1,outside=old.doors.find(d=>d.to==='world'),alderic=old.npcs.find(n=>n.n==='Alderic');
  for(const [id,plan] of Object.entries(layout)){
    const [width,height]=plan.size;
    const m={w:width/16,h:height/16,ts:16,title:plan.title,spawn:plan.spawn,firstTemple:true,
      templeExpanded:true,templeFloors:plan.floors,templePlan:plan,templeGateOpen:0,roomArt:'first_temple_continuous',
      _roomBaseCanvas:images[id],bg:'#19171c',floorbg:'#615b50',terr:terrRLE(Array(width*height/256).fill(DIRT)),
      objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],
      roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{}};
    m.base_terr=m.terr;
    for(const d of plan.doors){
      const [ax,ay]=d.arrival;
      m.doors.push({x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(ax-8)/16,ty:(ay-16)/16,
        dir:d.dir,explicitDir:true,triggerRect:{x:d.x-16,y:d.dir==='u'?d.y-16:d.y,w:32,h:16}});
      if(d.dir==='u')m.roomActors.push({spr:'first_temple_door',x:d.x,y:d.y,schoolArt:true,royalDoor:true});
      else m.templeFloors.push([d.x-16,d.y,d.x+16,d.y+48]);
    }
    for(const [kind,x,y,room] of plan.enemies)m.foes.push({k:kind,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
    // Wall torches and small stone ornaments preserve the first temple's visual identity.
    for(const [l,t,r,b] of plan.chambers){
      if(plan.entranceDecor && t===plan.entranceDecor.wallY)continue;
      for(const x of [l+32,r-32])m.roomActors.push({spr:'first_temple_torch',x,y:t+4,schoolArt:true});
      if(!plan.floors.some(([fl,ft,fr,fb])=>(l+r)/2>=fl&&(l+r)/2<fr&&t-16>=ft&&t-16<fb)&&!plan.doors.some(d=>d.dir==='u'&&d.y===t&&Math.abs(d.x-(l+r)/2)<48))m.roomActors.push({spr:'first_temple_dragon_head',x:(l+r)/2,y:t-8,schoolArt:true,stillFrame:0});
    }
    for(const [i,[x,y,gold]] of plan.chests.entries()){
      const block=m.roomBlocks.push([x-14,y-10,x+14,y])-1;
      m.roomActors.push({n:'Temple treasure',spr:'temple71_chest',schoolArt:true,x,y,editKey:id+':loot:'+i,
        moveBlocks:[block],houseLoot:{id:id+':loot:'+i,gold,item:i%2?'potion':'dragonFish',templeReward:true}});
    }
    W.maps[id]=m;
  }
  const entry=W.maps.tp1;
  const [ex,ey]=entry.templePlan.exit;
  entry.templeFloors.push([ex-16,ey,ex+16,ey+48]);
  entry.doors.push({x:(ex-8)/16,y:ey/16,to:'world',tx:outside.tx,ty:outside.ty,dir:'d',explicitDir:true,triggerRect:{x:ex-16,y:ey,w:32,h:16}});
  const worldDoor=W.maps.world.doors.find(d=>d.to==='tp1');worldDoor.tx=(entry.spawn[0]-8)/16;worldDoor.ty=(entry.spawn[1]-16)/16;
  const sanctum=W.maps.tp1_sanctum,sp=sanctum.templePlan;
  if(alderic){Object.assign(alderic,{x:sp.elder[0],y:sp.elder[1]});sanctum.npcs.push(alderic);}
  sanctum.roomActors.push({spr:'first_temple_bars',x:(sp.gate[0]+sp.gate[2])/2,y:sp.gate[3],schoolArt:true,expandedGate:true});
  for(const side of sp.entranceDecor.sides){
    for(const [spr,key] of [['first_temple_torch','torch'],['first_temple_dragon_head','head'],['temple67_sentinel','statue']]){
      const [x,y]=side[key],actor={spr,x,y,schoolArt:true,entranceOrnament:true};
      if(key==='head')actor.stillFrame=0;
      if(key==='statue')actor.moveBlocks=[sanctum.roomBlocks.push([x-8,y-10,x+8,y])-1];
      sanctum.roomActors.push(actor);
    }
  }
  const chest=CHESTS.find(c=>c.gift==='lightning');Object.assign(chest,{map:'tp1_sanctum',x:(sp.heartstone[0]-8)/16,y:(sp.heartstone[1]-16)/16});
  if(chestOpen.tp1||chestOpen.tp4||breathHas.lightning)chestOpen.tp1_sanctum=true;
  // A short horizontal spike crossing preserves the original temple's timing challenge.
  const halls=W.maps.tp1_halls;
  const hazard=halls.templePlan.hazard;
  for(const x of hazard.columns)for(let y=hazard.top+8;y<hazard.bottom;y+=16)halls.roomActors.push({spr:'temple71_spikes',x,y,sy:-100,schoolArt:true,expandedSpike:x});
  halls.roomActors.push({spr:'temple71_lever',x:hazard.lever[0],y:hazard.lever[1],schoolArt:true,expandedLever:true});
}
function expandedSanctumCleared(){
  return foesHeld||breathHas.lightning||W.maps.tp1_sanctum.foes.every((_,i)=>bossGone['tp1_sanctum:'+i]);
}
function expandedTempleSolid(x,y){
  if(!MD?.templeExpanded)return false;
  if(!MD.templeFloors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b))return true;
  const gate=MD.templePlan.gate;
  return !!gate&&MD.templeGateOpen<.99&&x>=gate[0]&&x<gate[2]&&y>=gate[1]&&y<gate[3];
}
function expandedSpikeFrame(x){
  if(foesHeld||bossGone['tp1_halls:spikes'])return 0;
  const phase=(tAcc+x/160)%4.8;
  return phase<2?0:phase<2.45?1:phase<2.65?2:phase<3.85?3:phase<4.1?4:5;
}
function stepExpandedTemple(dt){
  if(!MD?.templeExpanded)return;
  if(MAPID==='tp1_sanctum')MD.templeGateOpen=Math.min(1,MD.templeGateOpen+(expandedSanctumCleared()?dt*3:0));
  for(const f of foes){
    if(!f.expandedRoom||f.st==='dead')continue;
    const [l,t,r,b]=f.expandedRoom;
    f.x=Math.max(l+24,Math.min(r-24,f.x));f.y=Math.max(t+36,Math.min(b-24,f.y));
  }
  const h=MD.templePlan.hazard;
  if(h&&!sceneHold()&&!fadeDir)for(const x of h.columns)
    if(expandedSpikeFrame(x)===3&&Math.abs(P.x-x)<10&&P.y>h.top&&P.y<h.bottom)hurtPlayer(1);
}
function tryExpandedTempleLever(){
  const h=MD?.templePlan?.hazard;
  if(!h||Math.hypot(P.x-h.lever[0],P.y-h.lever[1])>28)return false;
  bossGone['tp1_halls:spikes']=true;saveGame();toast('The gallery spikes settle into the floor.');return true;
}
