/* Hooks run after the classic game scripts have initialized their shared state. */
const editorDraftBases = new Map();
const editorDraftStale = new Set();
const editorBuiltLayouts = EmberEditDrafts.clone(actorLayouts);
let editorDraftReady = false, editorDraftTimer = null;

function editorBaseFields(m) {
  return {w:m.w,h:m.h,objs:m.objs,roomActors:m.roomActors,npcs:m.npcs,
    roomBlocks:m.roomBlocks,doors:m.doors,scatter:m.scatter,sanim:m.sanim,features:m.features,
    terr:m.terr,base_terr:m.base_terr,felled:m.felled,felled_rle:m.felled_rle,cellarCaches:m.cellarCaches};
}
function editorPrepareMap(id, fresh) {
  const api = EmberEditDrafts;
  const held=api.store.get(id);
  if(held?.submission && publishedEditorLayouts.applied.includes(held.submission.id)) {
    try{api.store.remove(id);}catch(_){}
    delete actorLayouts[id];
  }
  if (fresh) {
    if (editorDraftBases.has(id)) {
      const base = editorDraftBases.get(id).map;
      for(let i=0;i<(base.roomActors||[]).length;i++){
        const original=base.roomActors[i],a=W.maps[id].roomActors?.[i];
        if(a?.stairTo)shiftActorData(W.maps[id],a,original.x,original.y,true);
      }
      for (const key of Object.keys(editorBaseFields(W.maps[id]))) {
        if (key in base) W.maps[id][key] = api.clone(base[key]); else delete W.maps[id][key];
      }
    }
    actorLayouts[id] = api.clone(editorBuiltLayouts[id] || {});
    delete geometryEdits[id]; saveGeometry();
    editorDraftStale.delete(id);
    try { api.store.remove(id); } catch (_) { toast('Could not clear the saved draft on this device.'); }
  }
  if (!editorDraftBases.has(id)) {
    const map = api.clone(editorBaseFields(W.maps[id]));
    editorDraftBases.set(id, {map, fingerprint:api.fingerprint(map)});
  }
  const draft = api.store.get(id);
  if (!draft) return null;
  if (draft.baseFingerprint !== editorDraftBases.get(id).fingerprint) {
    editorDraftStale.add(id);
    setTimeout(()=>toast('An older draft is held aside. COPY preserves it; RESET starts fresh with the updated area.'),500);
    return null;
  }
  actorLayouts[id] = api.clone(draft.state.actors || editorBuiltLayouts[id] || {});
  return draft.state;
}
function editorRestoreMap(s) {
  if (!s) { editorDraftReady = true; return; }
  const removed = new Set(s.deleted);
  const moved = new Map(s.moves.map(v=>[v.id,v]));
  objs = ORIG.map((o,id)=>({...o,id,...moved.get(id)})).filter(o=>!removed.has(o.id));
  added = EmberEditDrafts.clone(s.added); objs.push(...added.filter(o=>!removed.has(o.id)));
  deleted = removed; nextId = s.nextId;
  painted = new Map(s.painted); for (const [i,v] of painted) terr[i]=v;
  if (s.features) features = EmberEditDrafts.clone(s.features);
  regionMoves = s.regionMoves || []; clearedBoxes = s.clearedBoxes || [];
  felledNew = s.felledNew || []; for (const k of felledNew) felled.add(k);
  decorGone = new Set(s.decorGone); decorDel = s.decorDel || []; decorMoved = new Map(s.decorMoved);
  for (const [,d] of decorMoved) {
    const arr=d.tag==='s'?scat:sanm, md=d.tag==='s'?MD.scatter:MD.sanim;
    arr[d.di+1]=d.x;arr[d.di+2]=d.y;
    if(md){md[d.di+1]=d.x;md[d.di+2]=d.y;}
  }
  worldChanged(); editorDraftReady = true;
}
function saveEditorDraft() {
  clearTimeout(editorDraftTimer);
  if (!editorDraftReady || !MD || !editorDraftBases.has(MAPID) || editorDraftStale.has(MAPID)) return;
  const api=EmberEditDrafts, patch=buildPatch(true), old=api.store.get(MAPID);
  if (patch.includes('\n(no changes on this map)')) {
    if(old)try{api.store.remove(MAPID);}catch(_){}
    return;
  }
  const moves=objs.filter(o=>o.id<ORIG.length && (Math.round(o.x)!==ORIG[o.id].x||Math.round(o.y)!==ORIG[o.id].y)).map(o=>({id:o.id,s:o.s,x:Math.round(o.x),y:Math.round(o.y)}));
  const state={actors:actorLayouts[MAPID]||{},moves,added,deleted:[...deleted],nextId,painted:[...painted],
    features:features.some(f=>featOrig.get(f.id)!==JSON.stringify(f))?features:null,
    regionMoves,clearedBoxes,felledNew,decorGone:[...decorGone],decorDel,
    decorMoved:[...decorMoved].map(([k,d])=>{const a=d.tag==='s'?scat:sanm;return[k,{...d,x:a[d.di+1],y:a[d.di+2]}]})};
  const base=editorDraftBases.get(MAPID).map,operations=[];
  for(const move of moves)operations.push({kind:'object',key:String(move.id),sprite:base.objs[move.id*3],fromX:base.objs[move.id*3+1],fromY:base.objs[move.id*3+2],x:move.x,y:move.y});
  for(const [key,v]of Object.entries(state.actors)){
    const a=key.startsWith('npc:')?(base.npcs||[]).find(n=>'npc:'+n.n===key):(base.roomActors||[]).find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===key);
    if(a&&!v.deleted&&(a.x!==v.x||a.y!==v.y))operations.push({kind:'actor',key,identity:a.spr||a.n,fromX:a.x,fromY:a.y,x:v.x,y:v.y});
  }
  for(const [key,d]of state.decorMoved)if(!decorGone.has(key)&&(d.x!==d.x0||d.y!==d.y0))operations.push({kind:'decor',key,tag:d.tag,index:d.di,sprite:d.s,fromX:d.x0,fromY:d.y0,x:d.x,y:d.y});
  const draft={baseFingerprint:editorDraftBases.get(MAPID).fingerprint,sourceRevision:api.sourceRevision,patch,state,operations,
    updatedAt:new Date().toISOString(),submission:old?.patch===patch?old.submission:null,
    sentAt:old?.patch===patch?old.sentAt:null};
  try { api.store.put(MAPID,draft); }
  catch (_) { toast('Device storage is full or unavailable. Use SEND CHANGES or COPY before leaving.'); }
  return draft;
}
function scheduleEditorDraft() {
  if (!editorDraftReady || !(editing||building||painting||doorEdit||collideView)) return;
  clearTimeout(editorDraftTimer); editorDraftTimer=setTimeout(saveEditorDraft,200);
}
function sendEditorChanges() {
  const api=EmberEditDrafts;
  if(editorDraftStale.has(MAPID)){toast('This area changed since the draft. Use COPY to keep the old draft, then RESET before making new moves.');return;}
  const draft=editorDraftStale.has(MAPID)?api.store.get(MAPID):saveEditorDraft();
  if (!draft) { toast('No changes in this area to send.'); return; }
  if(!draft.operations?.length || draft.patch.split('\n').slice(2).some(line=>! /^(ACTOR |M |S )/.test(line)) || Object.values(draft.state.actors).some(a=>a.deleted)){
    toast('Auto publish supports moves. Keep other edits with COPY, or RESET this area and move objects only.');return;
  }
  if (!draft.submission) {
    draft.submission={schema:1,id:crypto.randomUUID(),map:MAPID,baseFingerprint:draft.baseFingerprint,
      gameVersion:api.version,sourceRevision:draft.sourceRevision,patch:draft.patch,changeCount:draft.operations.length,operations:draft.operations};
    try { api.store.put(MAPID,draft); } catch (_) { /* Sending is still available when local storage is full. */ }
  }
  const map=MAPID, submission=draft.submission;
  if(JSON.stringify(submission).length>48000){toast('Too many moves for one send. Use COPY to preserve this batch.');return;}
  api.send(submission,(ok,message)=>{
    if(ok){const latest=api.store.get(map);if(latest?.submission?.id===submission.id){latest.sentAt=new Date().toISOString();try{api.store.put(map,latest);}catch(_){}}}
    toast(message);
  });
}
tap(document.getElementById('bSendChanges'),sendEditorChanges);
tap(document.getElementById('nSendChanges'),sendEditorChanges);
for(const name of ['pointerup','touchend','mouseup','keyup'])document.addEventListener(name,scheduleEditorDraft);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveEditorDraft();});
window.addEventListener('pagehide',saveEditorDraft);
