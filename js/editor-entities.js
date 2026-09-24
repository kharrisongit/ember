/* Stable editor identities for rewards and the optional NPC audition field. */
let devNpcLineupActive=false;

function prepareEditorEntities(m,id) {
  m.roomActors ||= [];
  const addChest=(kind,identity,x,y,spr)=>{
    const editKey='chest:'+kind+':'+identity;
    if(m.roomActors.some(a=>a.editKey===editKey))return;
    // Attach the chest's small footprint, never the neighbouring pedestal.
    const block=(m.roomBlocks||[]).findIndex(([l,t,r,b])=>
      r-l<=32&&b-t<=32&&Math.abs((l+r)/2-x)<3&&y>=t&&y<=b);
    m.roomActors.push({editKey,n:kind==='heartstone'?'Heartstone chest ('+identity+')':'Treasury chest',
      spr,x,y,editorChestKind:kind,editorChestId:identity,editorProxy:true,
      moveBlocks:block<0?[]:[block]});
  };
  for(const c of CHESTS)if(c.map===id)addChest('heartstone',c.gift,c.x*TS+TS/2,c.y*TS+TS,'heartstone_chest');
  if(id==='royal_treasury')for(const c of TREASURY_CHESTS)addChest('treasury',c.id,c.x,c.y,'temple71_chest');
  // Scene-sheet NPCs have a separate visible actor and dialogue anchor.
  for(const n of m.npcs||[])if(n.school&&n.lookId){
    const art=m.roomActors.find(a=>a.spr===n.lookId);
    if(art)art.editorNpcKey=editorNpcKey(n);
  }
  if(id==='world')prepareNpcLineup(m);
}

function syncEditorChest(m,a,dx,dy) {
  if(a.editorChestKind==='heartstone'){
    const c=CHESTS.find(c=>c.gift===a.editorChestId);
    if(c){c.x=(a.x-TS/2)/TS;c.y=(a.y-TS)/TS;}
  }else if(a.editorChestKind==='treasury'){
    const c=TREASURY_CHESTS.find(c=>c.id===a.editorChestId);
    if(c){c.x=a.x;c.y=a.y;}
  }
  if(a.houseLoot&&(dx||dy)){
    a.houseLoot.x=a.x;a.houseLoot.y=a.y;
    for(const f of m.foes||[])if(f.chestAmbush===a.houseLoot.id){
      f.x+=dx/TS;f.y+=dy/TS;
      if(f.ambushFrom){f.ambushFrom.x+=dx;f.ambushFrom.y+=dy;}
    }
  }
}

function syncEditorNpcArt(m) {
  for(const a of m.roomActors||[])if(a.editorNpcKey){
    const n=m.npcs.find(n=>editorNpcKey(n)===a.editorNpcKey);
    if(n)a.editorDeleted=!!n.editorDeleted;
  }
}

function npcLineupCatalog() {
  const entries=[];
  const directions=['d','u','e','w'];
  const complete=base=>directions.every(d=>SPR[base+'_walk_'+d]?.[4]>1&&SPR[base+'_idle_'+d]);
  // Include unused citizen variants as well as the walking story cast. Enemy
  // sheets and Corin's player outfits are not NPC appearances.
  const humanPack=/^(?:guild_|market_citizen|pack_smith$|custom_maddock$|maddock_smith|hettie96$|herbalist$|lodge_|hg$|kg$)/;
  for(const key of Object.keys(SPR).sort()){
    if(key.endsWith('_walk_d')){
      const base=key.slice(0,-7);
      if(humanPack.test(base)&&complete(base))entries.push({key:'pack:'+base,packSpr:base,packDirections:true,packWalk:true});
      if(['br','sd'].includes(base)&&complete(base))entries.push({key:'body:'+base,body:base});
    }
    // The legacy side sheet is mirrored for east/west, giving four directions.
    if(/^npc_.+_d$/.test(key)){
      const sk=key.slice(4,-2);
      if(['d','s','u'].every(d=>SPR['npc_'+sk+'_'+d]?.[4]>1))entries.push({key:'skin:'+sk,sk,idleFrame:0});
    }
  }
  return entries.sort((a,b)=>a.key.localeCompare(b.key));
}

function prepareNpcLineup(m) {
  m.npcs ||= [];
  npcLineupCatalog().forEach((entry,i)=>{
    const {key,...look}=entry,editKey='npc:lineup:'+key;
    if(m.npcs.some(n=>n.editKey===editKey))return;
    // North Shroom Pass Field: inside the mushroom border, with the short final
    // row left of the two trees at (424,464) and (552,464).
    m.npcs.push({...look,editKey,devLineup:true,n:'NPC sample: '+key.split(':')[1],
      x:21.5*TS+(i%8)*40,y:13*TS+Math.floor(i/8)*48,
      stationary:true,noTalk:true,f:'d',idleFps:5,d:[]});
  });
}

function showNpcLineup() {
  if(!devItemTest){toast('Press SKIP first to unlock the NPC lineup.');return;}
  if(scene||bossScene||fadeDir||doorMotion){toast('Wait for the current scene to finish, then open NPC LINEUP.');return;}
  devNpcLineupActive=true;
  loadMap('world');
  P.x=30*TS+8;P.y=32*TS;P.dir='u';P.dir8='n';P.act=null;P.moving=false;
  mounted=false;dragon.placed=null;
  doorEdit=false;collideView=false;geometryEnd();document.getElementById('geometryBar').style.display='none';
  setPaint(false);setBuild(false);setTravel(false);setArenas(false);
  editing=true;selected=null;bEdit.classList.add('on');editEl.style.display='block';
  soloTool('MOVE THINGS');setDev(false);
  // Fit the whole field initially; the existing pan and pinch controls still work.
  camFree=true;cam.z=Math.min(playZoom(),VW/400,VH/440);
  cam.x=30*TS-VW/cam.z/2;cam.y=21*TS-VH/cam.z/2;clampCam();
  refreshToolbar();refreshSel();rebuildSolid();mapDirty=true;
  const count=npcs.filter(n=>n.devLineup&&!n.editorDeleted).length;
  toast(count+' idle NPC samples. Tap or drag to select, DELETE to remove; SEND CHANGES to publish.');
}
