/* Shared planting for blossom borders, Millwood and the Northern Woods.
   Smaller spruce canopies need closer rows than the broad blossom trees. */
const BLOSSOM_TREE_STEP = 91 / 16;
const BLOSSOM_BAND_STEP = 3;
const BLOSSOM_TREE_CLEARANCE = 4;
const BLOSSOM_ROUTE_TREES = /^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;

function treeBorderSpacing(feature) {
  // Spruce art is 61 opaque pixels tall; leave its trunk visible above the
  // next canopy while keeping the staggered bands just two tiles apart.
  return feature.region==='millwood'
    ? {step:62/16,band:2,clearance:36/16}
    : {step:BLOSSOM_TREE_STEP,band:BLOSSOM_BAND_STEP,clearance:BLOSSOM_TREE_CLEARANCE};
}
function blossomRoadDistance(x,y,{a,b}) {
  const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
  const t=l2?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l2)):0;
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
function blossomPoint(x,y,details) {
  return {x:Math.round(x*16)/16,y:Math.round(y*16)/16,...details};
}
function blossomTownBox(t,row=0) {
  const outer=row*treeBorderSpacing(t).band,inset=(t.band||6)-1-outer;
  return {left:t.x0+inset,right:t.x1-inset,top:t.y0+(t.northInset??((t.band||6)-1))-outer,bottom:t.y1-inset};
}
function blossomInsideBox(x,y,b,pad=0) {
  return x>b.left-pad&&x<b.right+pad&&y>b.top-pad&&y<b.bottom+pad;
}
function blossomRowValues(lo,hi,row,step=BLOSSOM_TREE_STEP) {
  const phase=row%2*step/2;
  const first=Math.ceil((lo-phase)/step);
  const last=Math.floor((hi-phase)/step);
  return Array.from({length:Math.max(0,last-first+1)},(_,i)=>(first+i)*step+phase);
}
function blossomRouteCandidates(roads,row) {
  const result=[];
  for(const r of roads.filter(r=>r.blossom)) {
    const vert=r.a[0]===r.b[0],axis=vert?r.a[0]:r.a[1];
    const lo=Math.min(vert?r.a[1]:r.a[0],vert?r.b[1]:r.b[0]);
    const hi=Math.max(vert?r.a[1]:r.a[0],vert?r.b[1]:r.b[0]);
    const spacing=treeBorderSpacing(r),off=r.half+2+row*spacing.band;
    for(const side of [-1,1])for(const v of blossomRowValues(lo-off,hi+off,row,spacing.step)) {
      const p=blossomPoint(vert?axis+side*off:v,vert?v:axis+side*off,
        {row,vertical:vert,kind:'route',source:r.id,tree:r.tree,region:r.region});
      if(r.minY!==undefined&&p.y<r.minY)continue;
      result.push(p);
    }
  }
  return result;
}
function blossomArenaCandidates(a,row) {
  const spacing=treeBorderSpacing(a),innerRadius=(a.r||6)+2.5,radius=innerRadius+row*spacing.band;
  // An even count gives both sides of the road matching gaps. Space the whole
  // circumference once rather than rounding every trunk onto crowded tiles.
  // Share the angular grid across bands so each middle-band tree sits between
  // two inner trees; changing the count per ring would realign and crowd them.
  const count=Math.max(6,2*Math.floor(Math.PI*innerRadius/spacing.step));
  return Array.from({length:count},(_,i)=>{
    const angle=-Math.PI/2+(i+(row%2)/2)*2*Math.PI/count;
    return blossomPoint(a.x+Math.cos(angle)*radius,a.y+Math.sin(angle)*radius,
      {row,kind:'arena',source:a.id,tree:a.tree,region:a.region});
  });
}
function blossomTownCandidates(t,row) {
  if(row===3) {
    if(t.northInset===undefined)return [];
    const b=blossomTownBox(t),spacing=treeBorderSpacing(t);
    return blossomRowValues(b.left,b.right,row,spacing.step).map(x=>
      blossomPoint(x,b.top+spacing.band,{row,vertical:false,kind:'town',source:t.id,
        tree:t.tree,region:t.region,roofBacking:true}));
  }
  const b=blossomTownBox(t,row),result=[],spacing=treeBorderSpacing(t);
  for(const x of blossomRowValues(b.left,b.right,row,spacing.step))for(const y of [b.top,b.bottom])
    result.push(blossomPoint(x,y,{row,vertical:false,kind:'town',source:t.id,tree:t.tree,region:t.region}));
  for(const y of blossomRowValues(b.top,b.bottom,row,spacing.step))for(const x of [b.left,b.right])
    result.push(blossomPoint(x,y,{row,vertical:true,kind:'town',source:t.id,tree:t.tree,region:t.region}));
  return result;
}
function planBlossomLayout(roads,arenas,towns,allowed=()=>true) {
  const result=[];
  for(let row=0;row<4;row++) {
    // Arena and town borders own their junctions with routes. All inner rows
    // precede the outer bands, which cannot displace those clean borders.
    const groups=row===3?[towns.flatMap(t=>blossomTownCandidates(t,row))]:
      [arenas.flatMap(a=>blossomArenaCandidates(a,row)),
       towns.flatMap(t=>blossomTownCandidates(t,row)),blossomRouteCandidates(roads,row)];
    for(const group of groups)for(const p of group.sort((a,b)=>a.y-b.y||a.x-b.x)) {
      const borderRow=p.roofBacking?0:row;
      if(roads.some(r=>blossomRoadDistance(p.x,p.y,r)<r.half+2+(r.blossom?borderRow*treeBorderSpacing(r).band:0)-.04))continue;
      if(arenas.some(a=>!(p.kind==='arena'&&p.source===a.id)&&
        Math.hypot(p.x-a.x,p.y-a.y)<(a.r||6)+2.5+borderRow*treeBorderSpacing(a).band-.04))continue;
      if(towns.some(t=>!(p.kind==='town'&&p.source===t.id)&&blossomInsideBox(p.x,p.y,blossomTownBox(t,borderRow))))continue;
      const clearance=treeBorderSpacing(p).clearance;
      if(!allowed(p)||result.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<Math.max(clearance,treeBorderSpacing(q).clearance)-.04))continue;
      result.push(p);
    }
  }
  return result;
}
function planBlossomRows(roads,allowed=()=>true) {
  return planBlossomLayout(roads,[],[],allowed);
}

function treeBorderScope(list,legsFor) {
  const woods=list.find(f=>f.label==='Northern Woods');
  const millwood=list.find(f=>f.label==='Millwood');
  const inWoods=(x,y)=>woods&&x>=woods.x0&&x<=woods.x1&&y>=woods.y0&&y<=woods.y1;
  const nativeRoute=f=>f.style==='spruce'&&((millwood&&(f.joins||[]).includes('Millwood'))||
    (woods&&((f.joins||[]).includes('Elders Home')||legsFor(f).some(([a,b])=>inWoods(a[0],a[1])||inWoods(b[0],b[1])))));
  const roads=list.filter(f=>f.kind==='route').flatMap(f=>{
    const native=nativeRoute(f),managed=f.style==='blossom'||native;
    return legsFor(f).map(([a,b])=>({a,b,id:f.id,half:(f.w||5)>>1,band:f.band||20,
      blossom:managed,tree:native?'spr_big':'blo_big',region:native?'millwood':'blossom',
      minY:native&&woods?woods.y0:undefined}));
  });
  const nativeRoads=roads.filter(r=>r.region==='millwood');
  const rings=list.filter(f=>f.kind==='arena'||f.kind==='camp');
  const nativeArena=f=>f.style==='spruce'&&(inWoods(f.x,f.y)||
    nativeRoads.some(r=>blossomRoadDistance(f.x,f.y,r)<(f.r||6)+4));
  const arenas=rings.filter(f=>f.style==='blossom'||nativeArena(f)).map(f=>({...f,
    tree:nativeArena(f)?'spr_big':'blo_big',region:nativeArena(f)?'millwood':'blossom'}));
  const towns=list.filter(f=>['area','town'].includes(f.kind)&&!f.wild&&
    ((f.style==='blossom'&&f.label==='Coralmere')||
     (f.style==='spruce'&&(f.label==='Millwood'||(woods&&f.label==='Elders Home')))))
    .map(f=>({...f,tree:f.style==='spruce'?'spr_big':'blo_big',region:f.style==='spruce'?'millwood':'blossom',
      // Millwood's upper house roofs reach into the usual border. Shift the
      // complete northern rows back, keeping the same stagger across roofs.
      northInset:f.label==='Millwood'?2.5:undefined}));
  return {roads,arenas,towns,rings};
}

function rebuildBlossomRoutes({inTownArea,onBuilding}) {
  if(MAPID!=='world')return;
  const {roads,arenas,towns,rings}=treeBorderScope(features,routeLegs);
  const legs=roads.filter(r=>r.blossom);
  if(!legs.length&&!arenas.length&&!towns.length)return;
  const arenaIds=new Set(arenas.map(a=>a.id));
  const otherRings=rings.filter(f=>!arenaIds.has(f.id));
  const townBorder=(x,y)=>towns.some(t=>blossomInsideBox(x,y,
    {left:t.x0,right:t.x1,top:t.y0,bottom:t.y1},7)&&
    !blossomInsideBox(x,y,blossomTownBox({...t,northInset:undefined}),-2));
  const atArena=(x,y)=>arenas.some(a=>Math.hypot(x-a.x,y-a.y)<(a.r||ARENA_R)+11);
  const protectedPlace=(x,y)=>inClearing(x,y)||
    otherRings.some(f=>Math.hypot(x-f.x,y-f.y)<(f.r||ARENA_R)+3.5);
  const inBand=(x,y)=>atArena(x,y)||townBorder(x,y)||
    (!protectedPlace(x,y)&&!inTownArea(x,y)&&legs.some(r=>{
      const reach=Math.max(14,r.band)+r.half+2;
      return (r.minY===undefined||y>=r.minY)&&
        x>=Math.min(r.a[0],r.b[0])-reach&&x<=Math.max(r.a[0],r.b[0])+reach&&
        y>=Math.min(r.a[1],r.b[1])-reach&&y<=Math.max(r.a[1],r.b[1])+reach;
    }));
  const tree=o=>BLOSSOM_ROUTE_TREES.test(NAMES[o.s]||'');
  const replace=o=>tree(o)&&inBand(o.x/TS-.5,o.y/TS-1);
  // Explicit tree-line strokes and moved trees remain editable after a rebuild
  // or publication. Only old, untouched planting is replaced.
  const edited=new Set(added.map(o=>o.id)),publishedTrees=new Set();
  for(let layout=publishedEditorLayouts.maps.world;layout;layout=layout.build?.previous) {
    for(const op of Object.values(layout)) {
      if(op.kind==='object-add')publishedTrees.add([op.sprite,op.x,op.y].join(':'));
      if(op.kind==='object'&&!op.deleted)edited.add(Number(op.key));
    }
  }
  for(const o of objs)if(publishedTrees.has([o.s,o.x,o.y].join(':'))||
    (ORIG[o.id]&&(o.x!==ORIG[o.id].x||o.y!==ORIG[o.id].y)))edited.add(o.id);
  for(const o of objs)if(!edited.has(o.id)&&replace(o))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!replace(o));
  const living=objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs);
  const neighbors=living.filter(tree).map(o=>({x:o.x/TS-.5,y:o.y/TS-1})).filter(o=>
    atArena(o.x,o.y)||townBorder(o.x,o.y)||legs.some(r=>
      o.x>=Math.min(r.a[0],r.b[0])-30&&o.x<=Math.max(r.a[0],r.b[0])+30&&
      o.y>=Math.min(r.a[1],r.b[1])-30&&o.y<=Math.max(r.a[1],r.b[1])+30));
  const props=living.filter(o=>!tree(o)&&SPR[NAMES[o.s]]&&DEFS[o.s]?.c);
  const buildings=new Set(living.filter(o=>SPR[NAMES[o.s]]&&
    /^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower|rt_|wt_)/.test(NAMES[o.s])));
  const backsRoof=(px,py,sp)=>{
    let overlaps=false;
    for(const o of buildings) {
      const q=SPR[NAMES[o.s]];
      if(Math.abs(o.x-px)>=(sp[2]+q[2])/2+2||py<=o.y-q[3]-2||py-sp[3]>=o.y+2)continue;
      overlaps=true;
      // This extra row may tuck beneath the top of a roof, but stays north
      // of the house body. Normal depth sorting draws the house over it.
      if(py>o.y-q[3]+Math.min(TS*2,q[3]/3))return false;
    }
    return overlaps;
  };
  const cell=p=>[Math.floor(p.x+.5),Math.floor(p.y+1-1/TS)];
  const plan=planBlossomLayout(roads,arenas,towns,p=>{
    const nm=p.tree||'blo_big',sp=SPR[nm];if(NAME2I[nm]===undefined||!sp)return false;
    const {x,y}=p,[tx,ty]=cell(p),k=tx+','+ty;
    if(tx<1||ty<1||tx>=MW-1||ty>=MH-1||protectedPlace(x,y))return false;
    if(inTownArea(x,y)&&!townBorder(x,y))return false;
    if(![GRASS,WALL].includes(terr[ty*MW+tx])||rockTiles.has(k)||SCENE_WALL?.has(ty*MW+tx)||felled.has(k))return false;
    const px=x*TS+TS/2,py=(y+1)*TS;
    if(onBuilding(px,py,sp)&&!(p.roofBacking&&backsRoof(px,py,sp)))return false;
    if(neighbors.some(o=>Math.hypot(x-o.x,y-o.y)<treeBorderSpacing(p).clearance))return false;
    const behindHouses=p.roofBacking||p.kind==='town'&&!p.vertical&&towns.some(t=>
      t.id===p.source&&t.northInset!==undefined&&y===blossomTownBox(t,p.row).top);
    if(props.some(o=>{
      if(p.roofBacking&&buildings.has(o))return false;
      if(!behindHouses)return Math.abs(o.x-px)<TS*2&&Math.abs(o.y-py)<TS*3;
      // Small garden rocks below the border should not punch tree-sized holes
      // above the roofs. Still leave space around each prop's actual artwork.
      const q=SPR[NAMES[o.s]];
      return Math.abs(o.x-px)<(sp[2]+q[2])/2+4&&py>o.y-q[3]-4&&py-sp[3]<o.y+4;
    }))return false;
    if(npcs.some(n=>!n.editorDeleted&&Math.hypot(n.x-px,n.y-py)<TS*3))return false;
    return true;
  });
  let id=fobjs.reduce((n,o)=>Math.min(n,o.id||0),-1)-1;
  for(const p of plan) {
    const [tx,ty]=cell(p);
    fobjs.push({id:id--,s:NAME2I[p.tree||'blo_big'],x:p.x*TS+TS/2,y:(p.y+1)*TS,feat:1,
      blossomRow:p.row,blossomKind:p.kind,blossomFeature:p.source,blossomVertical:p.vertical,borderRegion:p.region||'blossom'});
    terr[ty*MW+tx]=WALL;
  }
}
