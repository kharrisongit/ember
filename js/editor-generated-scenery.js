/* Procedural forest repairs must never outrank an explicit editor move. */
function recordGeneratedRemoval(tx,ty){
  const key=tx+','+ty;
  // Authored felled cells can be replanted by border repairs. Always record
  // this new editor action independently of that historical terrain data.
  felled.add(key);
  if(!felledNew.includes(key))felledNew.push(key);
  return key;
}
function editorSceneryCell(o){return Math.floor(o.x/TS)+','+Math.floor((o.y-1)/TS);}
function removeGeneratedObject(o){
  const key=recordGeneratedRemoval(Math.floor(o.x/TS),Math.floor((o.y-1)/TS));
  fobjs=fobjs.filter(q=>editorSceneryCell(q)!==key);
  worldChanged();
}
function applyGeneratedEditorChanges(){
  if(!MD)return;
  const gone=new Set([...(MD.editorFelledKeys||[]),...felledNew]);
  const placed=new Set(MD.editorPlacedObjectIds||[]),manual=[];
  for(const o of objs){
    if(deleted.has(o.id))continue;
    if(!/^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/.test(NAMES[o.s]||''))continue;
    const old=ORIG[o.id];
    if(placed.has(o.id)||added.includes(o)||old&&(o.x!==old.x||o.y!==old.y))manual.push(o);
  }
  if(!gone.size&&!manual.length)return;
  const occupied=new Set(manual.map(editorSceneryCell));
  fobjs=fobjs.filter(o=>!gone.has(editorSceneryCell(o))&&!occupied.has(editorSceneryCell(o)));
  const opened=new Set();
  for(const key of gone){
    felled.add(key);
    const [x,y]=key.split(',').map(Number),i=y*MW+x;
    if(x<0||y<0||x>=MW||y>=MH||rockTiles?.has(key)||SCENE_WALL?.has(i))continue;
    opened.add(i);
    if(terr[i]===WALL)terr[i]=[GRASS,DIRT,SAND].includes(baseTerr[i])?baseTerr[i]:GRASS;
  }
  if(opened.size)blockTiles=blockTiles.filter(i=>!opened.has(i));
  for(const o of manual)hidden.delete(o.id);
}
