window.EMBER_ASSETS.DOCK_ORIGINAL_ASSETS.push(...[{"name":"passage_torch","w":32,"h":48,"frames":6,"src":"assets/interiors/mountain-passage/passage-torch.png?v=20260924-passage1"},{"name":"passage_door","w":32,"h":48,"frames":4,"src":"assets/interiors/mountain-passage/passage-door.png?v=20260924-passage1"},{"name":"passage_bars","w":32,"h":48,"frames":4,"src":"assets/interiors/mountain-passage/passage-bars.png?v=20260924-passage1"},{"name":"passage_vent","w":16,"h":16,"frames":1,"src":"assets/interiors/mountain-passage/passage-vent.png?v=20260924-passage1"},{"name":"passage_flame_r","w":112,"h":32,"frames":9,"src":"assets/interiors/mountain-passage/passage-flame_r.png?v=20260924-passage1"},{"name":"passage_saw","w":32,"h":32,"frames":6,"src":"assets/interiors/mountain-passage/passage-saw.png?v=20260924-passage1"},{"name":"passage_rail","w":92,"h":3,"frames":1,"src":"assets/interiors/mountain-passage/passage-rail.png?v=20260924-passage1"}]);
/* Mountain Passage: one through-route, nine optional branches and the original Ashfiend. */
async function prepareExpandedMountainPassage(){
  if(W.maps.passage.mountainPassage)return;
  const response=await fetch('assets/interiors/mountain-passage/layout.json?v=20260924-passage1');
  if(!response.ok)throw Error('Mountain passage layout could not load');
  const plans=await response.json();
  const frostExit=W.maps.passage.doors.find(d=>d.to==='world');
  const ashExit=W.maps.passage3.doors.find(d=>d.to==='world');
  const bossKind=W.maps.passage3.foes[0].k;
  const images=await Promise.all(Object.keys(plans).map(async id=>{
    const image=new Image();image.src='assets/interiors/mountain-passage/'+id+'.png?v=20260924-passage1';
    await image.decode();return [id,image];
  }));
  for(const [id,image] of images){
    const plan=plans[id],[width,height]=plan.size;
    const m=W.maps[id]={w:width/16,h:height/16,ts:16,title:'Mountain Passage',spawn:plan.spawn,
      mountainPassage:true,templeExpanded:true,templeDragon:true,templeScience:true,
      templePlan:plan,templeFloors:plan.floors.map(r=>r.slice()),templeGateOpen:0,
      travel:id==='passage',travel_kind:'Cave',roomArt:'dragon75_interior',_roomBaseCanvas:image,
      bg:'#19171c',floorbg:'#343933',terr:terrRLE(Array(width*height/256).fill(DIRT)),
      objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],
      roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{},templeClock:0,
      templeHazards:[],templeMachines:[],templeShots:[]};
    m.base_terr=m.terr;
    for(const [kind,x,y,room] of plan.enemies)m.foes.push({k:id==='passage3'?bossKind:kind,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
    for(const d of plan.doors){
      const room=plan.chambers.find(([l,t,r,b])=>d.x>l&&d.x<r&&d.y===t);
      const guards=d.sealed?m.foes.flatMap((f,i)=>f.expandedRoom.every((n,j)=>n===room[j])?[i]:[]):null;
      const door={x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(d.arrival[0]-8)/16,ty:(d.arrival[1]-16)/16,
        dir:d.dir,explicitDir:true,templeGuards:guards,triggerRect:{x:d.x-16,y:d.dir==='u'?d.y-16:d.y,w:32,h:16}};
      m.doors.push(door);
      if(d.dir==='u')m.roomActors.push({spr:d.sealed?'passage_bars':'passage_door',x:d.x,y:d.y,schoolArt:true,templeExit:true,
        ...(d.sealed?{templeExitDoor:door}:{royalDoor:true})});
      else m.templeFloors.push([d.x-16,d.y,d.x+16,d.y+48]);
    }
    for(const p of plan.passages)m.roomActors.push({spr:'passage_door',x:p.x,y:p.y,schoolArt:true,
      inlineTempleDoor:true,...(p.mode==='open'?{stillFrame:3}:{templePassDoor:true})});
    for(const [i,[x,y,gold,kind,enemy]] of plan.chests.entries()){
      const room=plan.chambers.find(([l,t,r,b])=>x>l&&x<r&&y>t&&y<b),lootId=id+':loot:'+i;
      const block=m.roomBlocks.push([x-14,y-12,x+14,y+10])-1;
      m.roomActors.push({n:'Passage treasure',spr:'temple71_chest',schoolArt:true,x,y,editKey:lootId,moveBlocks:[block],
        houseLoot:{id:lootId,gold,item:gold>0?(i%2?'potion':'dragonFish'):null,templeReward:true,ghost:kind==='ghost'}});
      if(kind==='ghost'){
        const gx=x+(x<(room[0]+room[2])/2?32:-32),gy=y+40;
        m.foes.push({k:enemy,x:(gx-8)/16,y:(gy-16)/16,expandedRoom:room,chestAmbush:lootId,ambushFrom:{x,y}});
      }
    }
    for(const [i,[l,t,r,b]] of plan.chambers.entries()){
      if(i===plan.exitChamber)continue;
      for(const x of [l+32,r-32])m.roomActors.push({spr:'passage_torch',x,y:t+4,schoolArt:true});
    }
    if(id!=='passage3')addSandspireCobwebs(m);
    for(const h of plan.hazards){
      m.roomActors.push({spr:'temple71_lever',x:h.lever[0],y:h.lever[1],schoolArt:true,expandedLever:h.id});
      if(h.type==='arrow'||h.type==='cannon'){
        const lines=h.type==='cannon'?h.lines.filter((_,i)=>i%2===0):h.lines;
        lines.forEach((y,i)=>{
          const [l,r]=h.cross,dir=i%2?-1:1,idx=m.templeMachines.length;
          m.templeMachines.push({hall:h.id,type:h.type,x:dir>0?l+12:r-12,y,dir,minX:l,maxX:r,period:h.period,offset:i*.53,lastCycle:-1,frame:0});
          m.roomActors.push({spr:'scientist_'+(h.type==='cannon'?'cannon_':'arrow_port_')+(dir>0?'r':'l'),
            x:h.type==='cannon'?(dir>0?l-16:r+16):(dir>0?l-8:r+8),y:y+(h.type==='cannon'?16:8),schoolArt:true,templeMachine:idx});
          if(h.type==='cannon')m.roomBlocks.push(dir>0?[l-48,y-16,l+4,y+16]:[r-4,y-16,r+48,y+16]);
        });
      }else h.lines.forEach((y,i)=>{
        const [l,r]=h.cross;
        if(h.type==='spikes')for(let x=l+8;x<r;x+=16)m.roomActors.push({spr:'temple71_spikes',x,y,sy:-100,schoolArt:true,expandedSpike:{id:h.id,phase:i*.55}});
        else{
          const dir=i%2?-1:1;
          m.templeHazards.push({hall:h.id,type:h.type,y,dir,minX:l,maxX:r,x:l+12,offset:i*.7,period:h.period,frame:0,active:false});
          if(h.type==='flame')m.roomActors.push({spr:'passage_vent',x:dir>0?l-8:r+8,y:y+8,schoolArt:true,stillFrame:0});
        }
      });
    }
    m.roomActors.forEach((a,i)=>{a.editKey||=id+':mountain1:prop:'+i+':'+a.spr;});
  }
  const entry=W.maps.passage,[ex,ey]=entry.templePlan.exit;
  entry.templeFloors.push([ex-16,ey,ex+16,ey+48]);
  entry.doors.push({x:(ex-8)/16,y:ey/16,to:'world',tx:frostExit.tx,ty:frostExit.ty,dir:'d',explicitDir:true,
    triggerRect:{x:ex-16,y:ey,w:32,h:16}});
  const finale=W.maps.passage3,plan=finale.templePlan,[ax,ay]=plan.ashcragExit;
  finale.doors.push({x:(ax-8)/16,y:(ay-16)/16,to:'world',tx:ashExit.tx,ty:ashExit.ty,dir:'u',explicitDir:true,
    triggerRect:{x:ax-16,y:ay-16,w:32,h:16}});
  finale.roomActors.push({spr:'passage_bars',x:160,y:plan.gate[3],schoolArt:true,expandedGate:true,editKey:'passage3:mountain1:gate'},
    {spr:'passage_door',x:ax,y:ay,schoolArt:true,templeExit:true,royalDoor:true,editKey:'passage3:mountain1:exit'});
  for(const d of W.maps.world.doors){
    const arrival=d.to==='passage'?entry.spawn:d.to==='passage3'?plan.ashcragArrival:null;
    if(arrival){d.tx=(arrival[0]-8)/16;d.ty=(arrival[1]-16)/16;}
  }
  for(const id of Object.keys(plans))insetTempleSouthExits(W.maps[id]);
}
function stepMountainPassage(dt){
  const gate=MD.templePlan.gate;
  if(gate){
    // Ashcrag is also a real entrance. Let a returning traveller enter the
    // boss room, then close safely behind them until the Ashfiend is defeated.
    if(P.y<gate[1]-16)MD.passageReverseEntry=true;
    if(P.y>gate[3]+48)MD.passageReverseEntry=false;
    const clear=foesHeld||bossGone['passage3:0']||MD.passageReverseEntry;
    MD.templeGateOpen=Math.max(0,Math.min(1,MD.templeGateOpen+(clear?dt*3:-dt*3)));
  }
  if(sceneHold()||fadeDir)return;
  MD.templeClock+=dt;
  stepExpandedTempleMachines(dt);
  stepExpandedDragonHazards(dt);
}
