/* Sandspire: compact rooms, seven-stage main route and three optional branches. */
async function prepareExpandedSandspireTemple(){
  if(W.maps.ds1.sandspire)return;
  const response=await fetch('assets/interiors/sandspire-temple/layout.json?v=20260923-sandspire1');
  if(!response.ok)throw Error('Sandspire temple layout could not load');
  const plans=await response.json(),outside=W.maps.ds1.doors.find(d=>d.to==='world');
  const images=await Promise.all(Object.keys(plans).map(async id=>{
    const image=new Image();image.src='assets/interiors/sandspire-temple/'+id+'.png?v=20260923-sandspire1';
    await image.decode();return [id,image];
  }));
  for(const [id,image] of images){
    const plan=plans[id],[width,height]=plan.size;
    const m=W.maps[id]={w:width/16,h:height/16,ts:16,title:'Sandspire Temple',spawn:plan.spawn,
      sandspire:true,templeExpanded:true,templePlan:plan,templeFloors:plan.floors.map(r=>r.slice()),templeGateOpen:0,
      travel:id==='ds1',travel_kind:'Temple',roomArt:'scientist_interior',_roomBaseCanvas:image,
      bg:'#19171c',floorbg:'#615b50',terr:terrRLE(Array(width*height/256).fill(DIRT)),
      objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],
      roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{},templeScience:true,
      templeClock:0,templeMachines:[],templeShots:[]};
    m.base_terr=m.terr;
    for(const [kind,x,y,room] of plan.enemies)m.foes.push({k:kind,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
    for(const d of plan.doors){
      const room=plan.chambers.find(([l,t,r,b])=>d.x>l&&d.x<r&&d.y===t);
      const guards=d.sealed?m.foes.map((f,i)=>({f,i})).filter(({f})=>f.expandedRoom.every((n,j)=>n===room[j])).map(({i})=>i):null;
      const door={x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(d.arrival[0]-8)/16,ty:(d.arrival[1]-16)/16,
        dir:d.dir,explicitDir:true,sandspireGuards:guards,
        triggerRect:{x:d.x-16,y:d.dir==='u'?d.y-16:d.y,w:32,h:16}};
      m.doors.push(door);
      if(d.dir==='u')m.roomActors.push({spr:d.sealed?'first_temple_bars':'first_temple_door',x:d.x,y:d.y,schoolArt:true,templeExit:true,
        ...(d.sealed?{sandspireExit:door}:{royalDoor:true})});
      else m.templeFloors.push([d.x-16,d.y,d.x+16,d.y+48]);
    }
    for(const p of (plan.passages||[]).filter(p=>!plan.doors.some(d=>d.dir==='u'&&d.x===p.x&&d.y===p.y)))m.roomActors.push({spr:'first_temple_door',x:p.x,y:p.y,schoolArt:true,
      inlineTempleDoor:true,...(p.mode==='open'?{stillFrame:3}:{templePassDoor:true})});
    for(const [i,[x,y,gold,kind]] of plan.chests.entries()){
      const room=plan.chambers.find(([l,t,r,b])=>x>l&&x<r&&y>t&&y<b),lootId=id+':loot:'+i;
      const block=m.roomBlocks.push([x-14,y-12,x+14,y+10])-1;
      m.roomActors.push({n:'Temple treasure',spr:'temple71_chest',schoolArt:true,x,y,editKey:lootId,moveBlocks:[block],
        houseLoot:{id:lootId,gold,item:gold>0?(i%2?'potion':'dragonFish'):null,templeReward:true,ghost:kind==='ghost'}});
      if(kind==='ghost'){
        const gx=x+(x<(room[0]+room[2])/2?32:-32),gy=y+40;
        m.foes.push({k:'ghost',x:(gx-8)/16,y:(gy-16)/16,expandedRoom:room,chestAmbush:lootId,ambushFrom:{x,y}});
      }
    }
    // Preserve the laboratory character without crowding corners or entrances.
    for(const [i,[l,t,r,b]] of plan.chambers.entries()){
      if(plan.heartstone&&plan.heartstone[1]>t&&plan.heartstone[1]<b)continue;
      if(plan.entranceDecor&&t===plan.entranceDecor.wallY)continue;
      for(const x of [l+32,r-32])m.roomActors.push({spr:'first_temple_torch',x,y:t+4,schoolArt:true});
      if(!plan.doors.some(d=>d.dir==='u'&&d.y===t)&&!plan.floors.some(([fl,ft,fr,fb])=>(l+r)/2>fl&&(l+r)/2<fr&&t-16>=ft&&t-16<fb)){
        const x=(l+r)/2,block=m.roomBlocks.push([x-15,t+6,x+15,t+16])-1;
        m.roomActors.push({spr:i%2?'scientist_shelf_plant':'scientist_shelf',x,y:t+16,schoolArt:true,moveBlocks:[block]});
      }
    }
    addSandspireCobwebs(m);
    for(const h of plan.hazards||[]){
      m.roomActors.push({spr:'temple71_lever',x:h.lever[0],y:h.lever[1],schoolArt:true,expandedLever:h.id});
      if(h.type==='spikes'){
        h.lines.forEach((line,i)=>{for(let x=h.cross[0]+8;x<h.cross[1];x+=16)
          m.roomActors.push({spr:'temple71_spikes',x,y:line,sy:-100,schoolArt:true,expandedSpike:{id:h.id,phase:i*.55}});
        });
      }else{
        const lines=h.type==='cannon'?h.lines.filter((_,i)=>i%2===0):h.lines;
        lines.forEach((y,i)=>{
          const [l,r]=h.cross,dir=i%2?-1:1;
          const x=dir>0?l+12:r-12,artX=h.type==='cannon'?(dir>0?l-16:r+16):(dir>0?l-8:r+8);
          const machine=m.templeMachines.length;
          m.templeMachines.push({hall:h.id,type:h.type,x,y,dir,minX:l,maxX:r,period:h.period,offset:i*.53,lastCycle:-1,frame:0});
          m.roomActors.push({spr:'scientist_'+(h.type==='cannon'?'cannon_':'arrow_port_')+(dir>0?'r':'l'),
            x:artX,y:y+(h.type==='cannon'?16:8),schoolArt:true,templeMachine:machine});
          if(h.type==='cannon')m.roomBlocks.push(dir>0?[l-48,y-16,l+4,y+16]:[r-4,y-16,r+48,y+16]);
        });
      }
    }
  }
  const entry=W.maps.ds1,[ex,ey]=entry.templePlan.exit;
  entry.templeFloors.push([ex-16,ey,ex+16,ey+48]);
  entry.doors.push({x:(ex-8)/16,y:ey/16,to:'world',tx:outside.tx,ty:outside.ty,dir:'d',explicitDir:true,triggerRect:{x:ex-16,y:ey,w:32,h:16}});
  const worldDoor=W.maps.world.doors.find(d=>d.to==='ds1');
  if(worldDoor){worldDoor.tx=(entry.spawn[0]-8)/16;worldDoor.ty=(entry.spawn[1]-16)/16;}
  const sanctum=W.maps.ds_sanctum,sp=sanctum.templePlan;
  sanctum.roomActors.push({spr:'first_temple_bars',x:(sp.gate[0]+sp.gate[2])/2,y:sp.gate[3],schoolArt:true,expandedGate:true});
  for(const side of sp.entranceDecor.sides)for(const [spr,key] of [['first_temple_torch','torch'],['first_temple_dragon_head','head'],['temple67_sentinel','statue']]){
    const [x,y]=side[key],actor={spr,x,y,schoolArt:true,entranceOrnament:true};
    if(key==='head')actor.stillFrame=0;
    if(key==='statue')actor.moveBlocks=[sanctum.roomBlocks.push([x-8,y-10,x+8,y])-1];
    sanctum.roomActors.push(actor);
  }
  sanctum.roomActors.push({spr:'scientist_skull',x:184,y:96,schoolArt:true,moveBlocks:[sanctum.roomBlocks.push([168,80,200,96])-1]});
  // Restore both animated specimens at native size. Their bases flank the
  // entrance lane and leave the upper-right Heartstone approach clear.
  for(const x of [136,208]){
    const y=152,block=sanctum.roomBlocks.push([x-12,y-14,x+12,y])-1;
    sanctum.roomActors.push({n:'Floating specimen jar',spr:'scientist_flask',x,y,schoolArt:true,
      editKey:'ds_sanctum:specimen:'+x,moveBlocks:[block]});
  }
  const chest=CHESTS.find(c=>c.gift==='ice');
  Object.assign(chest,{map:'ds_sanctum',x:(sp.heartstone[0]-8)/16,y:(sp.heartstone[1]-16)/16});
  sanctum.roomBlocks.push([sp.heartstone[0]-14,sp.heartstone[1]-12,sp.heartstone[0]+14,sp.heartstone[1]+10]);
  if(chestOpen.ds1||chestOpen.ds4||breathHas.ice)chestOpen.ds_sanctum=true;
  for(const id of Object.keys(plans))insetTempleSouthExits(W.maps[id]);
}
function addSandspireCobwebs(map){
  const plan=map.templePlan,treasures=plan.chests.map(c=>c.slice(0,2));
  if(plan.heartstone)treasures.push(plan.heartstone);
  const web=(x,y,flip)=>map.roomActors.push({spr:'scientist_web',x,y,sy:y-64,
    schoolArt:true,stillFrame:0,templeWebFlip:flip,editKey:'web:'+x+':'+y});
  for(const [l,t,r,b] of plan.chambers){
    for(const [x,flip] of [[l+16,false],[r-16,true]]){
      if(treasures.some(([cx,cy])=>Math.abs(cx-x)<48&&Math.abs(cy-t)<48))continue;
      web(x,t+16,flip);
    }
  }
  // Catch the upper wall corners at both ends of the east/west passages.
  for(const [l,t,r,b] of plan.floors)if(b-t===32&&r-l>=160){
    web(l+32,t+8,false);web(r-32,t+8,true);
  }
}
function sandspireDoorLocked(door){
  return expandedTempleDoorLocked(door);
}
function stepSandspireTemple(dt){
  if(MD.templePlan.gate){
    const clear=foesHeld||breathHas.ice||MD.foes.every((_,i)=>bossGone[MAPID+':'+i]);
    MD.templeGateOpen=Math.min(1,MD.templeGateOpen+(clear?dt*3:0));
  }
  if(sceneHold()||fadeDir)return;
  MD.templeClock+=dt;
  stepExpandedTempleMachines(dt);
}
function stepExpandedTempleMachines(dt){
  if(foesHeld){MD.templeShots=[];return;}
  for(const a of MD.templeMachines){
    const disabled=expandedTrapDisabled(a.hall),time=MD.templeClock+a.offset,cycle=Math.floor(time/a.period),phase=time%a.period;
    a.frame=disabled||phase>3.4?0:phase<1.5?0:phase<1.9?1:phase<2.2?2:Math.min(9,3+Math.floor((phase-2.2)/.12));
    if(!disabled&&phase>=2.2&&a.lastCycle!==cycle){a.lastCycle=cycle;MD.templeShots.push({...a,age:0});}
  }
  const live=[];
  for(const shot of MD.templeShots){
    if(expandedTrapDisabled(shot.hall))continue;
    const prev=shot.x;shot.x+=shot.dir*(shot.type==='arrow'?180:140)*dt;shot.age+=dt;
    const end=Math.max(shot.minX,Math.min(shot.maxX,shot.x));
    if(Math.abs(P.y-shot.y)<(shot.type==='arrow'?8:10)&&P.x>=Math.min(prev,end)-7&&P.x<=Math.max(prev,end)+7){hurtPlayer(1);continue;}
    if(shot.x>shot.minX&&shot.x<shot.maxX&&shot.age<2)live.push(shot);
  }
  MD.templeShots=live;
}
function releaseChestGhost(id){
  const idx=MD.foes?.findIndex(f=>f.chestAmbush===id);
  if(idx===undefined||idx<0||bossGone[MAPID+':'+idx]||foes.some(f=>f.idx===idx))return;
  const source=MD.foes[idx],x=source.x*TS+8,y=source.y*TS+16;
  foes.push({kind:source.k,x,y,hx:x,hy:y,hp:enemyMaxHp(source.k,x),st:'idle',t:0,dir:'d',flip:false,hurt:0,idx,
    expandedRoom:source.expandedRoom,chestAmbush:id,ambushFrom:source.ambushFrom,hold:1.4,holdMax:1.4,emerge:0});
  showRise(source.ambushFrom.x,source.ambushFrom.y);
  rebuildBuckets();toast('A ghost bursts out of the chest!');
}
