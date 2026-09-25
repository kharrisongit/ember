/* NPC additions and cross-map transfers are ordinary, reviewable editor operations. */
const npcEditorOps={};
// Keep placement UUIDs and editor names intact so existing GitHub moves still apply.
const PLACED_NPC_DIALOGUE={
  'f30b6b62-a107-47b7-95ad-7cc27ab5c605':{
    d:['Edda: Thornwell cider. Apple, a little honey, and whatever the bees were complaining about.',
      'Corin: Is it good?', 'Edda: Ask me when I stop making that face.'],
    d2:['Edda: Fen swears he can taste the difference between every orchard.',
      'Edda: I poured him the same cider twice. Apparently the second orchard gets more sun.']
  },
  '4448128f-6fca-4e17-88f9-389ee42251f7':{
    d:['Fen: A toast to dry boots and a road that brings you home.',
      'Corin: No toast to adventure?', 'Fen: That is how you get wet boots.'],
    d2:['Fen: Edda thinks I cannot tell her cider apart.',
      'Corin: Can you?', 'Fen: Of course. One cup was fuller.']
  },
  '627dc59a-0b1b-4fba-a947-39f09f5987d2':{
    d:['Tallis: I tune the lute to the forge hammers. Saves an argument.',
      'Corin: And when the smith changes his rhythm?', 'Tallis: A new verse. Forgewick is generous that way.'],
    d2:['Tallis: The miners asked for something cheerful. The smiths asked for something loud.',
      'Tallis: I am taking requests from the bread seller next. She pays in bread.']
  },
  '6a8e054e-f933-4e1e-9327-bcb79ae59cfb':{
    d:['Kip: You are standing in a very promising spot for finding lost coins.',
      'Corin: Have you found any?', 'Kip: Three buttons and a crab. Coralmere keeps its money well guarded.'],
    d2:['Kip: I trade shells. Smooth ones for luck, striped ones for stories.',
      'Corin: What does that broken one buy?', 'Kip: A short story. It broke.']
  }
};
function preparePlacedNpcDialogue(m){
  for(const n of m.npcs||[]){
    const lines=PLACED_NPC_DIALOGUE[n.editKey?.replace(/^npc:placed:/,'')];
    if(lines)Object.assign(n,lines,{noTalk:false});
  }
}
// Source sheets can contain several poses inside each animation frame. Reuse
// the already isolated scene actors, and crop the remaining source-only people.
const NPC_SCENE_ALIASES={
  Sit_char:22,Lute_player:18,Player_dwarf:16,Drinker6:8,Think_guy:15,
  Player_drow:23,Drinker7:20,Knight:12,Killer:21,Client:10,Sleep_guy2:11,
  Drinker4:17,Card_player_orc:13,Watcher:19,Host:9,Drinker3:7,Dancer:14,Drinker5:6
};
const NPC_SCENE_CROPS={
  tavern_src_Drinker1:[32,40],tavern_src_Drinker2:[32,40],tavern_src_Eater:[32,32],
  school_src_Reader1:[32,40],school_src_Reader2:[32,40],school_src_Reader3:[32,24],
  school_src_Reader4:[32,32],school_src_Reader5:[32,24],school_src_Reader6:[32,32]
};
function npcSingleSprite(name){
  if(name==='school_src_Reader1'&&SPR.library_reader_red)return 'library_reader_red';
  const actor=NPC_SCENE_ALIASES[name?.replace(/^tavern_src_/,'')];
  if(name?.startsWith('tavern_src_')&&actor!==undefined&&SPR['tavern_anim_'+actor])return 'tavern_anim_'+actor;
  const crop=NPC_SCENE_CROPS[name],source=SPR[name];
  if(!crop||!source)return name;
  const key='npc_single_'+name;
  if(!SPR[key]){
    const [w,h]=crop,c=document.createElement('canvas');c.width=w*source[4];c.height=h;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    for(let f=0;f<source[4];f++)drawGameImage(g,sheetOf(source),source[0]+f*source[2],source[1],w,h,f*w,0,w,h);
    animalSheets[key]=c;SPR[key]=[0,0,w,h,source[4],key];
  }
  return key;
}
function npcAppearance(n){
  return (npcSingleSprite(n.packSpr||n.seatSpr||n.lookId)||(n.sk?'npc_'+n.sk+'_d':n.body||''))
    .replace(/_(?:idle|walk)_[duwe]$/, '').replace(/^npc_(.+)_(?:idle|sidle|uidle|[dsuwe])$/, 'skin:$1');
}
function npcLayoutOps(layout){
  return [...(layout?.build?npcLayoutOps(layout.build.previous):[]),...Object.values(layout||{}).filter(o=>o.kind==='npc-add'||o.kind==='npc-transfer')];
}
function npcPendingOps(id){
  if(npcEditorOps[id])return npcEditorOps[id];
  const draft=EmberEditDrafts.store.get(id);
  if(!draft||draft.sourceRevision!==EmberEditDrafts.sourceRevision||publishedEditorLayouts.applied.includes(draft.submission?.id))return [];
  return draft.state.npcOps||[];
}
function npcPlacementKey(op){return 'npc:placed:'+op.key;}
function npcPlacementSource(op){return W.maps[op.sourceMap]?.npcs?.find(n=>editorNpcKey(n)===op.sourceKey&&n.n===op.identity);}
function npcCreatePlacement(m,op){
  const key=npcPlacementKey(op);if(m.npcs?.some(n=>editorNpcKey(n)===key))return;
  let n;
  if(op.kind==='npc-add'){
    const entry=npcLineupCatalog().find(e=>e.key===op.look);if(!entry)return;
    const {key,category,...look}=entry;n={...look,n:op.name||op.look.split(':')[1],d:[],noTalk:true};
  }else{
    const original=npcPlacementSource(op);if(!original)return;
    n={...original};
    if(n.school&&n.lookId){n.packSpr=n.lookId;n.packDirections=false;n.packWalk=false;}
  }
  if(n.packSpr)n.packSpr=npcSingleSprite(n.packSpr);
  // A moved person keeps their appearance/dialogue, not their old furniture,
  // patrol route, scene reservation, visibility conditions or dialogue anchor.
  for(const k of ['school','lookId','seatClipY','sy','counter','talkX','talkY','patrol','patrolPoints','goto','sceneReserved','devLineup','devLineupScale','editorDeleted','publishedDeleted','_editorTransferred','when','until','away','_seatContact'])delete n[k];
  Object.assign(n,{editKey:key,x:op.x,y:op.y,stationary:true,f:n.f||'d',idleFps:n.idleFps||5});
  (m.npcs||=[]).push(n);
}
function preparePublishedNpcPlacements(m,id){for(const op of npcLayoutOps(publishedEditorLayouts.maps[id]))npcCreatePlacement(m,op);}
function prepareLocalNpcPlacements(m,id,state){
  npcEditorOps[id]=EmberEditDrafts.clone(state?.npcOps||[]);
  for(const op of npcEditorOps[id])npcCreatePlacement(m,op);
}
function syncNpcTransferVisibility(m,id){
  const transferred=new Set();
  for(const dest of Object.keys(W.maps))for(const op of [...npcLayoutOps(publishedEditorLayouts.maps[dest]),...npcPendingOps(dest)])if(op.kind==='npc-transfer'&&op.sourceMap===id)transferred.add(op.sourceKey);
  for(const n of m.npcs||[]){
    if(n._editorTransferred)n.editorDeleted=!!(n.publishedDeleted||actorLayouts[id]?.[editorNpcKey(n)]?.deleted);
    n._editorTransferred=transferred.has(editorNpcKey(n));
    if(n._editorTransferred)n.editorDeleted=true;
  }
}
function npcPendingMove(key,x,y,remove=false){
  const ops=npcEditorOps[MAPID]||[],i=ops.findIndex(op=>npcPlacementKey(op)===key);
  if(i<0)return false;
  if(remove){ops.splice(i,1);MD.npcs=MD.npcs.filter(n=>editorNpcKey(n)!==key);npcs=npcs.filter(n=>editorNpcKey(n)!==key);}
  else Object.assign(ops[i],{x:Math.round(x),y:Math.round(y)});
  return true;
}
function npcSelection(){
  if(!selected)return null;
  const info=editorActorInfo(selected);
  return info?.kind==='npc'?info.source:MD.npcs.find(n=>editorNpcKey(n)===selected.editorNpcKey||n.n===selected.interiorNpc);
}
function npcOpenPanel(title){
  document.getElementById('npcPlacementPanel')?.remove();
  const panel=document.createElement('div');panel.id='npcPlacementPanel';
  panel.className='scrolls';
  panel.style.cssText='position:fixed;z-index:10010;inset:8% 4% 12%;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:#201c16;color:#f9eed9;border:2px solid #b99b64;border-radius:12px;padding:14px;font:15px sans-serif;';
  const close=document.createElement('button');close.textContent='CLOSE';close.style.cssText='float:right;padding:10px';close.onclick=()=>panel.remove();panel.append(close);
  const heading=document.createElement('h3');heading.textContent=title;panel.append(heading);document.body.append(panel);return panel;
}
function npcEditingAt(key,x,y,travel=false){
  const view={x:cam.x,y:cam.y,z:cam.z};
  closeOthers('edit');doorEdit=false;collideView=false;geometryEnd();document.getElementById('geometryBar').style.display='none';
  editing=true;selected=npcs.find(n=>editorNpcKey(n)===key);dragObj=null;
  bEdit.classList.add('on');editEl.style.display='block';soloTool('MOVE THINGS');
  camFree=true;
  if(travel){P.x=x;P.y=y+48;cam.x=x-VW/cam.z/2;cam.y=y-VH/cam.z/2;}
  else Object.assign(cam,view);
  clampCam();setDev(false);
  rebuildSolid();mapDirty=true;refreshSel();saveEditorDraft();
}
function transportSelectedNpc(city){
  const n=npcSelection();if(!n)return;
  const sourceMap=MAPID,sourceKey=editorNpcKey(n),identity=n.n;
  saveEditorDraft();document.getElementById('npcPlacementPanel')?.remove();
  if(MAPID!=='world')loadMap('world');
  const point=standNear(city.x,city.y),x=point.x*TS+TS/2,y=point.y*TS+TS;
  let key=sourceKey;
  if(sourceMap==='world'){
    const live=npcs.find(p=>editorNpcKey(p)===sourceKey);moveEditorActor(live,x,y,true);
  }else{
    const op={kind:'npc-transfer',key:crypto.randomUUID(),sourceMap,sourceKey,identity,x,y};
    (npcEditorOps.world||=[]).push(op);npcCreatePlacement(MD,op);key=npcPlacementKey(op);
    // Rebuild live NPCs through the usual map loader; it restores this saved draft.
    saveEditorDraft();loadMap('world');
  }
  npcEditingAt(key,x,y,true);toast('NPC moved to '+city.name+'. Drag to position, then SEND CHANGES.');
}
function openNpcTransport(){
  const n=npcSelection();if(!n)return;
  const panel=npcOpenPanel('Transport '+n.n);
  const names=/^(Millwood|Thornwell|Forgewick|Sandspire|Coralmere|Hollybeck|Frostcrag|Ashcrag|Cinderhold)(?: Castle)?$/i;
  const cities=(W.maps.world.features||[]).filter(f=>names.test(f.label||'')).map(f=>({name:f.label,x:Math.round(f.x??(f.x0+f.x1)/2),y:Math.round(f.y??(f.y0+f.y1)/2)}));
  for(const city of cities){const b=document.createElement('button');b.textContent=city.name;b.style.cssText='display:block;width:100%;padding:14px;margin:6px 0';b.onclick=()=>transportSelectedNpc(city);panel.append(b);}
}
function npcLookUsed(entry){
  const family=npcAppearance;
  const wanted=family(entry);
  if(/^(?:skin:(?:lumberjack_jack|chef_chloe|farmer_buba|miner_mike|pharaoh)|market_citizen[1-5])$/.test(wanted))return true;
  for(const [id,m]of Object.entries(W.maps))for(const n of m.npcs||[]){
    if(n.devLineup||n.editorDeleted||n.publishedDeleted)continue;
    const removed=publishedEditorLayouts.maps[id]?.['actor:'+editorNpcKey(n)];if(removed?.deleted)continue;
    if(wanted&&wanted===family(n))return true;
    if(entry.sk&&entry.sk===n.sk||entry.body&&entry.body===n.body)return true;
  }
  for(const id of Object.keys(W.maps))if([...npcLayoutOps(publishedEditorLayouts.maps[id]),...npcPendingOps(id)].some(op=>op.kind==='npc-add'&&op.look===entry.key))return true;
  return false;
}
function addUnusedNpc(entry){
  document.getElementById('npcPlacementPanel')?.remove();
  const op={kind:'npc-add',key:crypto.randomUUID(),look:entry.key,name:entry.key.split(':')[1].replaceAll('_',' '),
    x:Math.round(cam.x+VW/cam.z/2),y:Math.round(cam.y+VH/cam.z/2)};
  op.x=Math.max(0,Math.min(PXW-1,op.x));op.y=Math.max(0,Math.min(PXH-1,op.y));
  camFree=true;
  (npcEditorOps[MAPID]||=[]).push(op);npcCreatePlacement(MD,op);saveEditorDraft();loadMap(MAPID);
  npcEditingAt(npcPlacementKey(op),op.x,op.y);toast('NPC added. Drag to position, then SEND CHANGES.');
}
function openNpcAdd(){
  const panel=npcOpenPanel('Add an unused NPC');
  const search=document.createElement('input');search.placeholder='Search NPCs';search.style.cssText='width:95%;padding:12px';panel.append(search);
  const list=document.createElement('div');panel.append(list);
  const seen=new Set(),entries=npcLineupCatalog().filter(e=>{
    const key=npcAppearance(e);if(seen.has(key)||npcLookUsed(e))return false;seen.add(key);return true;
  });
  const render=()=>{list.replaceChildren();for(const e of entries.filter(e=>e.key.toLowerCase().includes(search.value.toLowerCase()))){
    const b=document.createElement('button');b.style.cssText='display:inline-flex;vertical-align:top;align-items:center;gap:8px;width:48%;min-height:78px;margin:1%;text-align:left;';
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;canvas.style.cssText='width:64px;height:64px;image-rendering:pixelated';
    const sp=SPR[e.packSpr]||SPR[e.packSpr+'_idle_d']||SPR['npc_'+e.sk+'_d']||SPR[e.body+'_idle_d'];
    if(sp){const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;const z=Math.min(2,60/sp[2],60/sp[3]);drawGameImage(g,sheetOf(sp),sp[0],sp[1],sp[2],sp[3],(64-sp[2]*z)/2,(64-sp[3]*z)/2,sp[2]*z,sp[3]*z);}
    const label=document.createElement('span');label.textContent=e.key.split(':')[1].replaceAll('_',' ');b.append(canvas,label);b.onclick=()=>addUnusedNpc(e);list.append(b);
  }if(!list.children.length)list.textContent='No unused NPCs match.';};search.oninput=render;render();
}
function refreshNpcPlacementControls(){
  const b=document.getElementById('nTransport');if(b)b.style.display=editing&&npcSelection()?'':'none';
}
function installNpcPlacementControls(){
  const add=document.createElement('div');add.id='bAddNpc';add.className='mini';add.textContent='ADD NPC';document.getElementById('tools').append(add);tap(add,openNpcAdd);
  const move=document.createElement('div');move.id='nTransport';move.className='mini';move.textContent='TRANSPORT';move.style.display='none';document.getElementById('edit').append(move);tap(move,openNpcTransport);
}
installNpcPlacementControls();
