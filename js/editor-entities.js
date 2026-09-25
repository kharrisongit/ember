/* Stable editor identities for rewards and the optional NPC audition field. */
let devNpcLineupActive=false,devNpcLineupCategory='walking',devNpcLineupPage=0;
const NPC_LINEUP_TYPES=[['walking','Walking'],['standing','Standing'],['seated','Seated'],['scenes','At work']];

function prepareEditorEntities(m,id) {
  if(typeof prepareHollybeckVillagers==='function')prepareHollybeckVillagers(m,id);
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

function walkingNpcLineupCatalog() {
  const entries=[];
  const directions=['d','u','e','w'];
  const complete=base=>directions.every(d=>SPR[base+'_walk_'+d]?.[4]>1&&SPR[base+'_idle_'+d]);
  // Include unused citizen variants as well as the walking story cast. Enemy
  // sheets and Corin's player outfits are not NPC appearances.
  const humanPack=/^(?:guild_|market_citizen|hollybeck_|pack_smith$|custom_maddock$|maddock_smith|hettie96$|herbalist$|lodge_|hg$|kg$)/;
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
  // Append new residents after the original slots; saved lineup deletions use their anchors.
  return entries.sort((a,b)=>Number(a.key.startsWith('pack:hollybeck_'))-Number(b.key.startsWith('pack:hollybeck_'))||a.key.localeCompare(b.key));
}

function npcLineupCatalog() {
  // Keep the original walking roster and its ordering intact: published edits
  // already refer to these names and positions.
  const walking=walkingNpcLineupCatalog().map(n=>({...n,category:'walking'}));
  const extras=new Map(),seen=new Set(walking.map(n=>n.key));
  const add=(key,look,category)=>{if(!seen.has(key)){seen.add(key);extras.set(key,{key,...look,category});}};
  const seated=k=>/^(?:villager_seated_|seated_body_|pack_pupil_)|_seated$/.test(k);
  const scene=k=>/^(?:tavern_(?:src_|anim_)|school(?:2)?_|library_reader_|smithy_anim_8$|smithout_anim_7$|glassnew_anim_[46]$)/.test(k);
  const direct=(spr,category)=>{if(SPR[spr])add('sprite:'+spr,{packSpr:typeof npcSingleSprite==='function'?npcSingleSprite(spr):spr,packDirections:false,packWalk:false},category);};
  for(const spr of Object.keys(SPR).sort()){
    if(/^(?:pack_|guild_)/.test(spr)&&!/_((?:idle|walk|run|atk|hurt|die|death))_[a-z]$/.test(spr))direct(spr,seated(spr)?'seated':'standing');
    if(/^(?:guild_|pack_).*_idle_d$/.test(spr)){
      const base=spr.slice(0,-7);
      if(!seen.has('pack:'+base))add('pack:'+base,{packSpr:base,packDirections:true,packWalk:false},'standing');
    }
    if(/^npc_.+_d$/.test(spr)){
      const sk=spr.slice(4,-2);add('skin:'+sk,{sk,idleFrame:0},'standing');
    }
    if(/^(?:villager_seated_|seated_body_)|^(?:king|maddock)_seated$/.test(spr))direct(spr,'seated');
    if(/^(?:desert_trader\d+|royal_intro_guard_(?:white|black)|market_(?:weapon|drinks|bread|lute|flute))$/.test(spr))direct(spr,'standing');
    if(/^(?:fisher|hb_(?:boy_red|boy_grn|fisher|oldman|kobold)|herbalist_front)$/.test(spr))direct(spr,'standing');
    if(/^royal_(?:guest_woman|guest_man|reader)$/.test(spr))direct(spr,'seated');
    // Named scene characters only: exclude room backgrounds, doors and clocks.
    if(/^tavern_src_(?!Windows_doors$)/.test(spr)||/^school_src_(?:Reader\d+|Visitor|Librarian_|Globe_character_)/.test(spr)||
       /^school2_anim_[3-7]$|^school_anim_[5-6]$|^library_reader_red$|^smithy_anim_8$|^smithout_anim_7$|^glassnew_anim_[46]$/.test(spr))direct(spr,'scenes');
  }
  // Include any additional friendly appearance assigned by the authored cast.
  for(const m of Object.values(W.maps))for(const n of m.npcs||[]){
    if(n.devLineup)continue;
    if(n.packSpr){
      const base=n.packSpr;
      if(/^npc_.+_d$/.test(base)&&seen.has('skin:'+base.slice(4,-2)))continue;
      if(seen.has('pack:'+base)||seen.has('sprite:'+base))continue;
      if(SPR[base])direct(base,seated(base)?'seated':scene(base)?'scenes':'standing');
      else if(SPR[base+'_idle_d'])add('pack:'+base,{packSpr:base,packDirections:true,packWalk:false},'standing');
    }
    if(n.seatSpr)direct(n.seatSpr,'seated');
    if(n.school&&n.lookId)direct(n.lookId,'scenes');
    if(n.body&&SPR[n.body+'_idle_d']&&!seen.has('pack:'+n.body))add('body:'+n.body,{body:n.body},'standing');
  }
  return walking.concat([...extras.values()].sort((a,b)=>a.key.localeCompare(b.key)));
}

function prepareNpcLineup(m) {
  m.npcs ||= [];
  const counts={};
  npcLineupCatalog().forEach(entry=>{
    const {key,category,...look}=entry,editKey='npc:lineup:'+key;
    const i=counts[category]||0;counts[category]=i+1;
    const capacity=category==='walking'?48:24,page=Math.floor(i/capacity),slot=i%capacity;
    const existing=m.npcs.find(n=>n.editKey===editKey);
    if(existing){existing.devLineupCategory=category;existing.devLineupPage=page;return;}
    // Walking slots retain their original coordinates. Other pages use a wider
    // grid north of the field's two trees, with room for seated/scene artwork.
    const x=category==='walking'?21.5*TS+(slot%8)*40:22*TS+(slot%6)*48;
    const y=category==='walking'?13*TS+Math.floor(slot/8)*48:13*TS+Math.floor(slot/6)*60;
    const sp=SPR[look.packSpr]||SPR[look.packSpr+'_idle_d']||SPR['npc_'+look.sk+'_d']||SPR[look.body+'_idle_d'];
    const scale=category==='walking'||!sp?1:Math.min(1,40/sp[2],52/sp[3]);
    m.npcs.push({...look,editKey,devLineup:true,devLineupCategory:category,devLineupPage:page,
      devLineupScale:scale,
      n:'NPC sample: '+key.split(':')[1],x,y,stationary:true,noTalk:true,f:'d',idleFps:5,d:[]});
  });
}

function npcLineupVisible(n) {
  if(n.packSpr==='hettie96'||n.packSpr==='market_bread')return false;
  return devNpcLineupActive&&(n.devLineupCategory||'walking')===devNpcLineupCategory&&(n.devLineupPage||0)===devNpcLineupPage;
}
function refreshNpcLineupControls() {
  const panel=document.getElementById('npcLineupControls');if(!panel)return;
  panel.hidden=!(devNpcLineupActive&&MAPID==='world'&&editing);
  const type=NPC_LINEUP_TYPES.find(t=>t[0]===devNpcLineupCategory);
  const rows=(typeof npcs==='undefined'?[]:npcs).filter(n=>n.devLineup&&(n.devLineupCategory||'walking')===devNpcLineupCategory);
  const pages=Math.max(1,...rows.map(n=>(n.devLineupPage||0)+1));
  const shown=rows.filter(n=>(n.devLineupPage||0)===devNpcLineupPage&&!n.editorDeleted).length;
  document.getElementById('bNpcType').textContent=type[1]+' ▸';
  document.getElementById('npcLineupStatus').textContent=(devNpcLineupPage+1)+' / '+pages+' · '+shown+' shown';
  document.getElementById('bNpcPrev').disabled=document.getElementById('bNpcNext').disabled=pages===1;
}
function changeNpcLineup(typeStep=0,pageStep=0) {
  if(!devNpcLineupActive||MAPID!=='world')return;
  saveEditorDraft();
  if(typeStep){
    const index=NPC_LINEUP_TYPES.findIndex(t=>t[0]===devNpcLineupCategory);
    devNpcLineupCategory=NPC_LINEUP_TYPES[(index+typeStep+NPC_LINEUP_TYPES.length)%NPC_LINEUP_TYPES.length][0];devNpcLineupPage=0;
  }else{
    const rows=npcs.filter(n=>n.devLineup&&(n.devLineupCategory||'walking')===devNpcLineupCategory);
    const pages=Math.max(1,...rows.map(n=>(n.devLineupPage||0)+1));
    devNpcLineupPage=(devNpcLineupPage+pageStep+pages)%pages;
  }
  selected=null;dragObj=null;refreshSel();rebuildSolid();mapDirty=true;refreshNpcLineupControls();
}
function closeNpcLineup() {
  saveEditorDraft();devNpcLineupActive=false;selected=null;dragObj=null;
  rebuildSolid();mapDirty=true;refreshSel();refreshNpcLineupControls();
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
  refreshToolbar();refreshSel();rebuildSolid();mapDirty=true;refreshNpcLineupControls();
  const count=npcs.filter(n=>n.devLineup&&!n.editorDeleted&&npcLineupVisible(n)).length;
  toast(count+' NPC samples on this page. Cycle types and pages; DELETE removes a sample, SEND CHANGES publishes.');
}
