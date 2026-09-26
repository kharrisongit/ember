let publishedEditorLayouts = {schema:1,maps:{},applied:[]};
const publishedEditorMaps = new WeakSet();
async function loadPublishedEditorLayouts() {
  const response=await fetch('assets/editor-layouts.json?v='+Date.now());
  if(!response.ok)throw Error('Published editor moves could not load. Refresh to retry.');
  const data=await response.json();
  if(data.schema!==1||!data.maps||!Array.isArray(data.applied))throw Error('Invalid published editor moves');
  publishedEditorLayouts=data;
}
function applyPublishedEditorLayout(m,id) {
  if(publishedEditorMaps.has(m))return;
  publishedEditorMaps.add(m);
  // Preserve the pre-existing authored placement of the world room exterior.
  if(id==='world'&&m.roomActors?.[24]?.spr==='rt_ext2')shiftActorData(m,m.roomActors[24],15330,4328,true);
  if(typeof preparePublishedNpcPlacements==='function')preparePublishedNpcPlacements(m,id);
  m.editorDeletedObjects=[];m.editorDeletedDecor=[];m.editorPublishedPaint=[];
  applyPublishedEditorEntries(m,id,publishedEditorLayouts.maps[id]||{});
}
function applyPublishedEditorEntries(m,id,layout) {
  if(layout.build){
    applyPublishedEditorEntries(m,id,layout.build.previous);
    Object.assign(m,EmberBuildData.apply(EmberBuildData.snapshot(m),layout.build));
  }
  const all=Object.values(layout).filter(op=>op.kind!=='build');
  // Append in publication order and retain these slots even after deletion.
  // Future moves/deletions use their stable ordinary-object indices.
  m.objs ||= [];
  for(const op of all)if(op.kind==='object-add')m.objs.push(op.sprite,op.x,op.y);
  const paint=new Map((m.editorPublishedPaint||[]).map(op=>[op.index,op]));
  for(const op of all)if(op.kind==='paint')paint.set(op.index,op);
  m.editorPublishedPaint=[...paint.values()];
  m.felled=[...new Set([...(m.felled||[]),...all.filter(op=>op.kind==='feature-delete').map(op=>op.key)])];
  const entries=all.filter(op=>['actor','object','decor'].includes(op.kind));
  const resolve = op => op.kind==='actor' ?
    (op.key.startsWith('npc:')?(m.npcs||[]).find(n=>(n.editKey||'npc:'+n.n)===op.key):(m.roomActors||[]).find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===op.key)) : null;
  // Check anchors together before parent moves shift children or linked collision.
  const valid=entries.filter(op=>{
    if(op.kind==='actor'){const a=resolve(op);return a&&(a.spr||a.portraitOriginalName||a.n)===op.identity&&a.x===op.originX&&a.y===op.originY;}
    const arr=op.kind==='object'?m.objs:op.tag==='s'?m.scatter:m.sanim;
    const i=op.kind==='object'?Number(op.key)*3:op.index;
    return arr&&arr[i]===op.sprite&&arr[i+1]===op.originX&&arr[i+2]===op.originY;
  });
  const depth=(actor,seen=new Set())=>{
    const index=(m.roomActors||[]).indexOf(actor);if(index<0||seen.has(index))return 0;seen.add(index);
    const parent=(m.roomActors||[]).find(a=>a.interiorChildren?.includes(index));return parent?1+depth(parent,seen):0;
  };
  const rank=op=>op.kind!=='actor'?2000:op.key.startsWith('npc:')?1000:depth(resolve(op));
  valid.sort((a,b)=>rank(a)-rank(b));
  for(const op of valid){
    if(op.kind==='actor'){
      const a=resolve(op);shiftActorData(m,a,op.x,op.y,!op.key.startsWith('npc:'),!op.independent);
      if(op.deleted&&(op.key.startsWith('npc:')||a.editableWall||a.interiorFurniture)){
        a.publishedDeleted=a.editorDeleted=true;
        for(const i of a.moveBlocks||[]){const b=m.roomBlocks?.[i];if(b)b[0]=b[1]=b[2]=b[3]=-99999;}
      }
    }else if(op.deleted){
      (op.kind==='object'?m.editorDeletedObjects:m.editorDeletedDecor).push(op.kind==='object'?Number(op.key):op.key);
    }else {const arr=op.kind==='object'?m.objs:op.tag==='s'?m.scatter:m.sanim;const i=op.kind==='object'?Number(op.key)*3:op.index;arr[i+1]=op.x;arr[i+2]=op.y;}
  }
  if(valid.length!==entries.length)console.warn('Some saved moves have changed anchors in '+id+' and were left unapplied.');
  for(const op of all){
    if(op.kind==='arena'){
      const arena=m.features?.find(f=>f.kind==='arena'&&f.id===op.id);
      if(!arena||EmberBuildData.hash(arena)!==EmberBuildData.hash(op.before))throw Error('Published hunting arena '+op.id+' changed anchors.');
      arena.encounter=op.encounter;
    }
    if(op.kind==='door'){const d=m.doors?.[op.index];if(d&&d.to===op.to)d.triggerRect={...op.rect};}
    if(op.kind==='collision')(m.collisionOverrides||={})[op.key]=op.blocked;
  }
}
let editorMapLoading=false;
function applyEditorPaint(captureBaseline=false){
  if(captureBaseline)terrOrig=terr.slice();
  for(const op of MD.editorPublishedPaint||[]){
    if(op.width!==MW||op.height!==MH||op.index>=terr.length)continue;
    if(op.override||terr[op.index]===op.originValue||terr[op.index]===op.value){terr[op.index]=op.value;if(captureBaseline)terrOrig[op.index]=op.value;}
  }
  for(const [i,v]of painted)if(i>=0&&i<terr.length)terr[i]=v;
}
