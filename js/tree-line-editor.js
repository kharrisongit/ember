/* A tree stroke is a batch of ordinary editor objects: existing Move, Undo,
   draft storage and Send Changes keep the same identities and publish format. */
const TREE_LINE_ART=/^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;
let treeLinePreviewCache=null;
function treeLineIsTree(o){return TREE_LINE_ART.test(NAMES[o.s]||'');}
function treeLineTooClose(a,b){return ((a.x-b.x)/(TS*2.1))**2+((a.y-b.y)/(TS*2.6))**2<.98;}

// Canonical direction makes dragging either way produce the same row. Continue
// an existing row's phase; otherwise sit halfway between the adjacent row.
function planTreeLine(ax,ay,bx,by,neighbors,allowed,species){
  if(ax>bx||(ax===bx&&ay>by))[ax,ay,bx,by]=[bx,by,ax,ay];
  const x0=ax*TS+TS/2,y0=(ay+1)*TS,dx=(bx-ax)*TS,dy=(by-ay)*TS;
  const length=Math.hypot(dx,dy);if(length<TS)return [];
  const ux=dx/length,uy=dy/length;
  let step=1/Math.hypot(ux/(TS*3),uy/(TS*4));
  const nearby=neighbors.map(o=>({...o,along:(o.x-x0)*ux+(o.y-y0)*uy,
    across:Math.abs((o.x-x0)*uy-(o.y-y0)*ux)}))
    .filter(o=>o.along>=-TS*14&&o.along<=length+TS*14&&o.across<TS*6.2);
  const rank=o=>o.across*8+Math.max(0,-o.along,o.along-length);
  const same=nearby.filter(o=>o.across<TS*.6).sort((a,b)=>rank(a)-rank(b));
  const beside=nearby.filter(o=>o.across>=TS*1.25).sort((a,b)=>rank(a)-rank(b));
  const anchor=same[0]||beside[0];
  if(anchor&&Math.max(Math.abs(ux),Math.abs(uy))>.97){
    const row=nearby.filter(o=>Math.abs(o.across-anchor.across)<TS*.6).sort((a,b)=>a.along-b.along);
    const gaps=row.slice(1).map((o,i)=>o.along-row[i].along).filter(d=>d>=TS*2.5&&d<=TS*7).sort((a,b)=>a-b);
    if(gaps.length)step=Math.round(gaps[Math.floor(gaps.length/2)]);
  }
  const phase=anchor?anchor.along+(same.length?0:step/2):0;
  const start=((phase%step)+step)%step,result=[];
  for(let d=start;d<=length+.01;d+=step){
    const p={x:Math.round(x0+d*ux),y:Math.round(y0+d*uy)};
    if(!allowed(p)||nearby.some(o=>treeLineTooClose(p,o))||result.some(o=>treeLineTooClose(p,o)))continue;
    const closest=nearby.filter(o=>Math.hypot(o.x-p.x,o.y-p.y)<=TS*12)
      .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
    const s=species(p,closest);if(s!==undefined)result.push({...p,s});
  }
  return result;
}

function treeLinePlan(ax,ay,bx,by){
  const key=[MAPID,ax,ay,bx,by,editStamp,objs.length,fobjs.length,deleted.size,hidden.size,buildStyle].join(':');
  if(treeLinePreviewCache?.key===key)return treeLinePreviewCache.plan;
  if(MAPID!=='world')return [];
  const trees=[],props=[];
  const left=Math.min(ax,bx)*TS-TS*10,right=Math.max(ax,bx)*TS+TS*10;
  const top=Math.min(ay,by)*TS-TS*10,bottom=Math.max(ay,by)*TS+TS*10;
  for(const o of [...objs,...fobjs]){
    if(deleted.has(o.id)||hidden.has(o.id))continue;
    if(treeLineIsTree(o)){
      if(SPR[NAMES[o.s]]&&o.x>=left&&o.x<=right&&o.y>=top&&o.y<=bottom)trees.push(o);
    }else{
      const sp=SPR[NAMES[o.s]],c=DEFS[o.s]?.c;if(!sp||!c)continue;
      if(o.x+sp[2]/2>=left&&o.x-sp[2]/2<=right&&o.y>=top&&o.y-sp[3]<=bottom)
        props.push([o.x-sp[2]/2,o.y-sp[3],o.x+sp[2]/2,o.y]);
    }
  }
  props.push(...(MD.roomBlocks||[]));
  const roads=features.filter(f=>f.kind==='route').flatMap(f=>routeLegs(f).map(([a,b])=>({a,b,pad:((f.w||ROUTE_W)>>1)+1})));
  const allowed=p=>{
    const x=Math.floor(p.x/TS),y=Math.floor((p.y-1)/TS);
    if(x<1||y<1||x>=MW-1||y>=MH-1||![GRASS,WALL,SAND].includes(terr[y*MW+x]))return false;
    if(inClearing(x,y)||features.some(f=>['arena','camp'].includes(f.kind)&&Math.hypot(x-f.x,y-f.y)<(f.r||6)+1))return false;
    if(CLEARINGS.some(c=>c.map===MAPID&&x>=c.x0&&x<=c.x1&&y>=c.y0&&y<=c.y1))return false;
    if(props.some(([l,t,r,b])=>p.x>=l-TS&&p.x<=r+TS&&p.y>=t-TS&&p.y<=b+TS))return false;
    if(npcs.some(n=>!n.editorDeleted&&Math.hypot(n.x-p.x,n.y-p.y)<TS*3))return false;
    if((MD.doors||[]).some(d=>Math.hypot((d.x??d[0])-p.x,(d.y??d[1])-p.y)<TS*3))return false;
    return !roads.some(({a,b,pad})=>{
      const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
      const u=len?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/len)):0;
      return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)<=pad;
    });
  };
  const species=(p,near)=>{
    const x=Math.floor(p.x/TS),y=Math.floor((p.y-1)/TS),style=styleAt(x,y);
    let names=STYLE_TREE[style==='swamp'?'swamp_safe':style]||STYLE_TREE[style];
    names=Array.isArray(names)?names:[names];
    const valid=names.map(n=>NAME2I[n]).filter(s=>s!==undefined&&SPR[NAMES[s]]);
    // Keep cacti on their desert terrain. Other rows inherit nearby species.
    if(near&&SPR[NAMES[near.s]]&&((style!=='desert'&&!/^cactus/.test(NAMES[near.s]))||valid.includes(near.s)))return near.s;
    return valid.length?valid[(((x*73856093)^(y*19349663))>>>0)%valid.length]:undefined;
  };
  const plan=planTreeLine(ax,ay,bx,by,trees,allowed,species);
  treeLinePreviewCache={key,plan};return plan;
}
function drawTreeLinePreview(ax,ay,bx,by){
  const plan=treeLinePlan(ax,ay,bx,by);
  ctx.strokeStyle=plan.length?'#a6e392':'#edbc82';ctx.beginPath();
  ctx.moveTo(ax*TS+TS/2,(ay+1)*TS);ctx.lineTo(bx*TS+TS/2,(by+1)*TS);ctx.stroke();
  for(const p of plan){const sp=SPR[NAMES[p.s]];if(!sp)continue;
    drawGameImage(ctx,sheetOf(sp),sp[0],sp[1],sp[2],sp[3],p.x-sp[2]/2,p.y-sp[3],sp[2],sp[3]);}
}
function commitTreeLine(ax,ay,bx,by){
  treeLinePreviewCache=null;
  const plan=treeLinePlan(ax,ay,bx,by),ids=[];
  for(const p of plan){const o={...p,id:nextId++};objs.push(o);added.push(o);ids.push(o.id);}
  if(!ids.length){toast('No room for trees here — draw along a forest edge, clear of paths');return;}
  buildUndo.push({kind:'trees',ids});finishTreeLineEdit();
  toast(ids.length+' smart trees planted — UNDO removes this line');
}
function undoTreeLine(ids){
  const remove=new Set(ids);
  objs=objs.filter(o=>!remove.has(o.id));added=added.filter(o=>!remove.has(o.id));
  for(const id of ids)deleted.delete(id);
  finishTreeLineEdit();toast('Tree line removed');
}
function finishTreeLineEdit(){
  treeLinePreviewCache=null;worldChanged();reindex();chunks.clear();
  scheduleEditorDraft();refreshBuild();refreshToolbar();
}
function selectTreeLine(){
  if(MAPID!=='world'){toast('Tree lines are available on the world map');return;}
  buildTool='trees';setBuild(true);treeLinePreviewCache=null;
  setDevTitle('SMART TREE LINE');setArmed(true);
  toast('Drag a straight tree line. PAN moves the map; UNDO removes a line.');
}
tap(document.getElementById('bTrees'),selectTreeLine);
tap(document.getElementById('tTrees'),selectTreeLine);
