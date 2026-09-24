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
  const all=Object.values(publishedEditorLayouts.maps[id]||{});
  m.editorPublishedPaint=all.filter(op=>op.kind==='paint');
  m.felled=[...new Set([...(m.felled||[]),...all.filter(op=>op.kind==='feature-delete').map(op=>op.key)])];
  m.editorDeletedObjects=[];m.editorDeletedDecor=[];
  const entries=all.filter(op=>['actor','object','decor'].includes(op.kind));
  const resolve = op => op.kind==='actor' ?
    (op.key.startsWith('npc:')?(m.npcs||[]).find(n=>'npc:'+n.n===op.key):(m.roomActors||[]).find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===op.key)) : null;
  // Check anchors together before parent moves shift children or linked collision.
  const valid=entries.filter(op=>{
    if(op.kind==='actor'){const a=resolve(op);return a&&(a.spr||a.n)===op.identity&&a.x===op.originX&&a.y===op.originY;}
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
      const a=resolve(op);shiftActorData(m,a,op.x,op.y,!op.key.startsWith('npc:'));
      if(op.deleted&&(a.editableWall||a.interiorFurniture)){
        a.publishedDeleted=a.editorDeleted=true;
        for(const i of a.moveBlocks||[]){const b=m.roomBlocks?.[i];if(b)b[0]=b[1]=b[2]=b[3]=-99999;}
      }
    }else if(op.deleted){
      (op.kind==='object'?m.editorDeletedObjects:m.editorDeletedDecor).push(op.kind==='object'?Number(op.key):op.key);
    }else {const arr=op.kind==='object'?m.objs:op.tag==='s'?m.scatter:m.sanim;const i=op.kind==='object'?Number(op.key)*3:op.index;arr[i+1]=op.x;arr[i+2]=op.y;}
  }
  if(valid.length!==entries.length)console.warn('Some saved moves have changed anchors in '+id+' and were left unapplied.');
}
let editorMapLoading=false;
function applyEditorPaint(captureBaseline=false){
  if(captureBaseline)terrOrig=terr.slice();
  for(const op of MD.editorPublishedPaint||[]){
    if(op.width!==MW||op.height!==MH||op.index>=terr.length)continue;
    if(terr[op.index]===op.originValue||terr[op.index]===op.value){terr[op.index]=op.value;if(captureBaseline)terrOrig[op.index]=op.value;}
  }
  for(const [i,v]of painted)if(i>=0&&i<terr.length)terr[i]=v;
}
