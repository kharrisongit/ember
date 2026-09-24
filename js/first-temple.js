/* Branched first temple: authored floors also define collision and encounter bounds. */
async function prepareExpandedFirstTemple(){
  if(W.maps.tp1.templeExpanded)return;
  const response=await fetch('assets/interiors/first-temple/layout.json?v=20260924-chests-statues1');
  if(!response.ok)throw Error('First temple layout could not load');
  const layout=await response.json(),images={};
  for(const id of Object.keys(layout)){
    const image=new Image();image.src='assets/interiors/first-temple/'+id+'.png?v=20260923-temple12-corners';
    await image.decode();images[id]=image;
  }
  const old=W.maps.tp1,outside=old.doors.find(d=>d.to==='world'),alderic=old.npcs.find(n=>n.n==='Alderic');
  for(const [id,plan] of Object.entries(layout)){
    const [width,height]=plan.size;
    const m={w:width/16,h:height/16,ts:16,title:'Forgewick Temple',spawn:plan.spawn,firstTemple:true,
      templeExpanded:true,travel:id==='tp1',travel_kind:'Temple',templeFloors:plan.floors,templePlan:plan,templeGateOpen:0,roomArt:'first_temple_continuous',
      _roomBaseCanvas:images[id],bg:'#19171c',floorbg:'#615b50',terr:terrRLE(Array(width*height/256).fill(DIRT)),
      objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],
      roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{}};
    m.base_terr=m.terr;
    for(const d of plan.doors){
      const [ax,ay]=d.arrival;
      m.doors.push({x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(ax-8)/16,ty:(ay-16)/16,
        dir:d.dir,explicitDir:true,triggerRect:{x:d.x-16,y:d.dir==='u'?d.y-16:d.y,w:32,h:16}});
      if(d.dir==='u')m.roomActors.push({spr:'first_temple_door',x:d.x,y:d.y,schoolArt:true,royalDoor:true,templeExit:true});
      else m.templeFloors.push([d.x-16,d.y,d.x+16,d.y+48]);
    }
    for(const [kind,x,y,room] of plan.enemies)m.foes.push({k:kind,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
    // Passage doors stay in this map. Open arches remain open; intact doors
    // animate on contact and lead straight into the connected hall.
    for(const p of (plan.passages||[]).filter(p=>!plan.doors.some(d=>d.dir==='u'&&d.x===p.x&&d.y===p.y)))m.roomActors.push({spr:'first_temple_door',x:p.x,y:p.y,
      schoolArt:true,inlineTempleDoor:true,...(p.mode==='open'?{stillFrame:3}:{templePassDoor:true})});
    // Wall torches and small stone ornaments preserve the first temple's visual identity.
    for(const [l,t,r,b] of plan.chambers){
      if(plan.entranceDecor && t===plan.entranceDecor.wallY)continue;
      const holdsStatue=plan.statue&&plan.statue[0]>=l&&plan.statue[0]<r&&plan.statue[1]>=t&&plan.statue[1]<b;
      if(!holdsStatue)for(const x of [l+32,r-32])m.roomActors.push({spr:'first_temple_torch',x,y:t+4,schoolArt:true});
      if(!(plan.statue&&plan.statue[1]>=t&&plan.statue[1]<b)&&!plan.floors.some(([fl,ft,fr,fb])=>(l+r)/2+16>fl&&(l+r)/2-16<fr&&t-16>=ft&&t-16<fb)&&!plan.doors.some(d=>d.dir==='u'&&d.y===t&&Math.abs(d.x-(l+r)/2)<48))m.roomActors.push({spr:'first_temple_dragon_head',x:(l+r)/2,y:t-8,schoolArt:true,stillFrame:0});
    }
    for(const [i,[x,y,gold]] of plan.chests.entries()){
      const block=m.roomBlocks.push([x-14,y-12,x+14,y+10])-1;
      m.roomActors.push({n:'Temple treasure',spr:'temple71_chest',schoolArt:true,x,y,editKey:id+':loot:'+i,
        moveBlocks:[block],houseLoot:{id:id+':loot:'+i,gold,item:gold>0?(i%2?'potion':'dragonFish'):null,templeReward:true}});
    }
    if(!plan.heartstone)addSandspireCobwebs(m);
    W.maps[id]=m;
  }
  placeOtherTempleHeartstones();
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
      // The sentinel sheet has eleven transparent rows below its stone base.
      if(key==='statue')actor.moveBlocks=[sanctum.roomBlocks.push([x-8,y-19,x+8,y-11])-1];
      sanctum.roomActors.push(actor);
    }
  }
  const chest=CHESTS.find(c=>c.gift==='lightning');Object.assign(chest,{map:'tp1_sanctum',x:(sp.heartstone[0]-8)/16,y:(sp.heartstone[1]-16)/16});
  sanctum.roomBlocks.push([sp.heartstone[0]-14,sp.heartstone[1]-12,sp.heartstone[0]+14,sp.heartstone[1]+10]);
  const [sx,sy]=sp.statue;
  sanctum.roomActors.push({spr:'temple73_fire_statue',x:sx,y:sy,schoolArt:true,
    moveBlocks:[sanctum.roomBlocks.push([sx-13,sy-14,sx+13,sy])-1]});
  if(chestOpen.tp1||chestOpen.tp4||breathHas.lightning)chestOpen.tp1_sanctum=true;
  for(const id of Object.keys(layout)){
    const map=W.maps[id];
    insetTempleSouthExits(map);
    for(const h of map.templePlan.hazards||[]){
      h.lines.forEach((line,i)=>{
        for(let cross=h.cross[0]+8;cross<h.cross[1];cross+=16){
          const [x,y]=h.axis==='x'?[line,cross]:[cross,line];
          map.roomActors.push({spr:'temple71_spikes',x,y,sy:-100,schoolArt:true,expandedSpike:{id:h.id,phase:i*.55}});
        }
      });
      map.roomActors.push({spr:'temple71_lever',x:h.lever[0],y:h.lever[1],schoolArt:true,expandedLever:h.id});
    }
  }
}
function touchExpandedTempleDoor(x,y,dy){
  if(!MD.templeExpanded||foesHeld)return false;
  for(const o of MD.roomActors){
    if(!o.templePassDoor||o.editorDeleted||Math.abs(x-o.x)>15)continue;
    const north=dy<0&&P.y>=o.y&&y-PC_H<=o.y;
    const south=dy>0&&P.y-1<=o.y-32&&y-1>=o.y-32;
    if(!north&&!south)continue;
    o.entered=true;
    // Hold at the leaf while it swings, then let the same movement continue.
    if((o.openT||0)<.3)return true;
  }
  return false;
}
function insetTempleSouthExits(map){
  for(const door of map.doors)if(door.dir==='d'&&door.triggerRect&&!door.templeRecess){
    door.triggerRect.y+=32;door.templeRecess=true;
  }
}
function expandedTempleArenas(){
  return MD.templeRoomArenas ||= MD.templePlan.chambers.flatMap((room,i)=>{
    const occupants=MD.foes.filter(f=>f.expandedRoom?.every((v,j)=>v===room[j]));
    if(!occupants.length)return [];
    const [l,t,r,b]=room;
    return [{id:'temple-room:'+i,kind:'arena',templeRoom:room,templeMap:MAPID,
      templeBoss:occupants.some(f=>/^(golem[1234]|devil|lich|knight)$/.test(f.k)),
      x:(l+r)/32,y:(t+b)/32,r:Math.max(r-l,b-t)/32}];
  });
}
function expandedTempleFoeInArena(ring,foe){
  return ring.templeMap===MAPID&&!!foe.expandedRoom?.every((v,i)=>v===ring.templeRoom[i]);
}
function expandedTempleArenaContains(ring,x,y,pad=0){
  const [l,t,r,b]=ring.templeRoom;
  return x>=l+pad&&x<r-pad&&y>=t+pad&&y<b-pad;
}
function arenaFenceBlocks(px,py){
  if(foesHeld||arenaPass||!arenaLock||arenaT<=(arenaLock.templeRoom?0:.25))return false;
  if(arenaLock.templeRoom)return arenaLock.templeMap===MAPID&&!expandedTempleArenaContains(arenaLock,px,py);
  return Math.hypot(Math.floor(px/TS)-arenaLock.x,Math.floor(py/TS)-arenaLock.y)>arenaLock.r+.5;
}
function expandedTempleArenaRim(ring){
  if(ring.templeMap!==MAPID)return [];
  if(ring._templeRim)return ring._templeRim;
  const [l,t,r,b]=ring.templeRoom,out=[];
  const floor=(x,y)=>MD.templeFloors.some(([fl,ft,fr,fb])=>x>=fl&&x<fr&&y>=ft&&y<fb);
  const door=(x,y,dir)=>MD.templePlan.doors.some(d=>d.dir===dir&&d.y===y&&Math.abs(d.x-x)<16);
  // Existing masonry already seals the room. Raise the standard arena posts
  // only across the walkable openings and the doors that change maps.
  for(let x=l;x<r;x+=16){
    if(floor(x+8,t-1)||door(x+8,t,'u'))out.push([x/16,t/16-1]);
    if(floor(x+8,b)||door(x+8,b,'d'))out.push([x/16,b/16+1]);
  }
  for(let y=t;y<b;y+=16){
    if(floor(l-1,y+8))out.push([l/16-.5,y/16]);
    if(floor(r,y+8))out.push([r/16-.5,y/16]);
  }
  return ring._templeRim=out;
}
function stepExpandedTempleArena(dt){
  if(sceneHold()||fadeDir||doorMotion)return;
  if(arenaLock&&arenaLock.templeMap!==MAPID){arenaLock=null;arenaT=0;arenaGoing=false;}
  if(!arenaLock){
    // Wait until Corin's full footprint is inside, including when entering
    // from a side hall or returning through the boss room from the far exit.
    const ring=expandedTempleArenas().find(a=>expandedTempleArenaContains(a,P.x,P.y-6,12)&&arenaFoesLeft(a));
    if(!ring)return;
    arenaLock=ring;arenaT=0;arenaGoing=false;
  }
  arenaGoing=!arenaFoesLeft(arenaLock);
  arenaT=Math.min(1,arenaT+dt*(arenaGoing?-2.2:3));
  if(arenaGoing&&arenaT<=0){
    releaseArena();twinSpent=false;twinKills=0;
    for(const f of foes)if(f.raised){f.ally=0;f.raised=0;f.st='dead';f.t=0;}
  }
}
function placeOtherTempleHeartstones(){
  for(const id of ['ds1','sn1']){
    const m=W.maps[id],chest=CHESTS.find(c=>c.map===id);
    if(!m?.templeContinuous||!chest)continue;
    const oldX=chest.x*16+8,oldY=chest.y*16+16;
    const room=m.templeFloors.find(([l,t,r,b])=>oldX>=l&&oldX<r&&oldY>=t&&oldY<b);
    if(!room)continue;
    const x=room[2]-16,y=room[1]+24;
    const block=m.roomBlocks.findIndex(([l,t,r,b])=>Math.abs((l+r)/2-oldX)<3&&Math.abs(b-oldY)<2&&r-l<32);
    if(block>=0)m.roomBlocks[block]=[x-10,y-8,x+10,y];
    else m.roomBlocks.push([x-10,y-8,x+10,y]);
    chest.x=(x-8)/16;chest.y=(y-16)/16;
    // Leave a clear approach beside the desert chamber's specimen pod.
    if(id==='ds1')for(const actor of m.roomActors){
      if(actor.y>=room[3])continue;
      if(actor.spr==='scientist_web'&&actor.x>192)actor.x-=24;
      if(actor.spr==='scientist_pod_mid'&&actor.x===208){
        const box=m.roomBlocks.find(([l,t,r,b])=>actor.x>=l&&actor.x<=r&&Math.abs(b-actor.y)<=1);
        if(box){box[0]-=16;box[2]-=16;}
        actor.x-=16;
      }
    }
  }
}
function expandedSanctumCleared(){
  return foesHeld||breathHas.lightning||W.maps.tp1_sanctum.foes.every((_,i)=>bossGone['tp1_sanctum:'+i]);
}
function expandedTempleDoorLocked(door){
  return !foesHeld&&!!(door.templeGuards||door.sandspireGuards)?.some(i=>!bossGone[MAPID+':'+i]);
}
function expandedTempleSolid(x,y){
  if(!MD?.templeExpanded)return false;
  if(!MD.templeFloors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b))return true;
  const gate=MD.templePlan.gate;
  return !foesHeld&&!!gate&&MD.templeGateOpen<.99&&x>=gate[0]&&x<gate[2]&&y>=gate[1]&&y<gate[3];
}
function expandedTrapDisabled(id){return foesHeld||bossGone[MAPID+':spikes:'+id]||(MAPID==='tp1_halls'&&bossGone['tp1_halls:spikes']);}
function expandedSpikeFrame(trap){
  if(expandedTrapDisabled(trap.id))return 0;
  const phase=(tAcc+trap.phase)%4.8;
  return phase<2?0:phase<2.45?1:phase<2.65?2:phase<3.85?3:phase<4.1?4:5;
}
function stepExpandedTemple(dt){
  if(!MD?.templeExpanded)return;
  if(MD.sandspire)stepSandspireTemple(dt);
  if(MD.hollybeck)stepHollybeckTemple(dt);
  if(MD.mountainPassage)stepMountainPassage(dt);
  if(MAPID==='tp1_sanctum'&&!foesHeld)MD.templeGateOpen=Math.min(1,MD.templeGateOpen+(expandedSanctumCleared()?dt*3:0));
  for(const f of foes){
    if(!f.expandedRoom||f.st==='dead')continue;
    const [l,t,r,b]=f.expandedRoom;
    f.x=Math.max(l+24,Math.min(r-24,f.x));f.y=Math.max(t+36,Math.min(b-24,f.y));
  }
  if(!sceneHold()&&!fadeDir)for(const h of (MD.templePlan.hazards||[]).filter(h=>!h.type||h.type==='spikes'))
    h.lines.forEach((line,i)=>{
      const along=h.axis==='x'?P.x:P.y,cross=h.axis==='x'?P.y:P.x;
      if(expandedSpikeFrame({id:h.id,phase:i*.55})===3&&Math.abs(along-line)<10&&cross>h.cross[0]&&cross<h.cross[1])hurtPlayer(1);
    });
}
function tryExpandedTempleLever(){
  const h=MD?.templePlan?.hazards?.find(h=>Math.hypot(P.x-h.lever[0],P.y-h.lever[1])<=28);
  if(!h)return false;
  bossGone[MAPID+':spikes:'+h.id]=true;saveGame();toast(MD.sandspire||MD.hollybeck||MD.mountainPassage?'The mechanisms fall silent. This hall is safe now.':'The hall spikes settle into the floor.');return true;
}
