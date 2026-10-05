/* Shared planting for forest, cactus and biome-transition borders.
   Match spacing to each region's native tree artwork. */
const BLOSSOM_TREE_STEP = 91 / 16;
const BLOSSOM_BAND_STEP = 3;
const BLOSSOM_TREE_CLEARANCE = 4;
const BLOSSOM_ROUTE_TREES = /^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;

// A pass-local broad phase: retain input order and exact geometry tests, but
// only visit shapes whose bounds reach this cell. Never retained across edits.
function treeBorderLookup(items,bounds,cell=32) {
  const rows=new Map(),empty=[];
  for(const item of items) {
    const [x0,y0,x1,y1]=bounds(item);
    for(let y=Math.floor(y0/cell);y<=Math.floor(y1/cell);y++) {
      let row=rows.get(y);if(!row)rows.set(y,row=new Map());
      for(let x=Math.floor(x0/cell);x<=Math.floor(x1/cell);x++) {
        let bucket=row.get(x);if(!bucket)row.set(x,bucket=[]);
        bucket.push(item);
      }
    }
  }
  return (x,y)=>rows.get(Math.floor(y/cell))?.get(Math.floor(x/cell))||empty;
}

function treeBorderSpacing(feature) {
  if(feature.kind==='scenery')return {step:64/16,band:2.5,clearance:42/16};
  if(feature.region==='oak')return {step:64/16,band:2.5,clearance:3};
  if(feature.region==='birch')return {step:70/16,band:2,clearance:36/16};
  if(feature.region==='forgewick-temple')return {step:72/16,band:3.5,clearance:4};
  if(feature.region==='shroom')return {step:66/16,band:2.5,clearance:3};
  if(feature.region==='dying')return {step:72/16,band:2.5,clearance:3};
  if(feature.region==='desert')return {step:48/16,band:1.5,clearance:1.5};
  if(feature.region==='swamp')return {step:72/16,band:2.5,clearance:3};
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
function blossomRoadJoinCaps(roads){
  return roads.map(r=>{
    const vertical=r.a[0]===r.b[0],axis=vertical?1:0,across=1-axis;
    const direction=Math.sign(r.b[axis]-r.a[axis]),length=Math.abs(r.b[axis]-r.a[axis]);
    const caps={...r,capAxis:axis,capDirection:direction};
    for(const [end,p] of [['capStart',r.a],['capEnd',r.b]])for(const other of roads){
      if(r.id===other.id||vertical===(other.a[0]===other.b[0]))continue;
      // Only a T-junction: the endpoint meets the interior of another leg.
      // Its clearance ends on that road's centreline, not across its far verge.
      const lo=Math.min(other.a[across],other.b[across]),hi=Math.max(other.a[across],other.b[across]);
      const join=other.a[axis];
      if(p[across]<=lo+other.half+1||p[across]>=hi-other.half-1||Math.abs(p[axis]-join)>other.half+1)continue;
      const at=(join-r.a[axis])*direction;
      if(end==='capStart'&&Math.abs(at)<=other.half+1)caps.capStart=at;
      if(end==='capEnd'&&Math.abs(at-length)<=other.half+1)caps.capEnd=at;
    }
    return caps;
  });
}
function blossomWithinRoadCaps(x,y,r){
  const along=((r.capAxis===0?x:y)-r.a[r.capAxis])*r.capDirection;
  return !(r.capStart!==undefined&&along<r.capStart-.04||r.capEnd!==undefined&&along>r.capEnd+.04);
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
function treeBorderInBounds(x,y,bounds) {
  return !bounds||(x>=bounds.x0&&x<=bounds.x1&&y>=bounds.y0&&y<=bounds.y1);
}
function treeBorderClipRoad(r,bounds) {
  const vertical=r.a[0]===r.b[0],axis=vertical?r.a[0]:r.a[1];
  if(vertical?(axis<bounds.x0||axis>bounds.x1):(axis<bounds.y0||axis>bounds.y1))return null;
  const i=vertical?1:0,lo=Math.max(Math.min(r.a[i],r.b[i]),vertical?bounds.y0:bounds.x0);
  const hi=Math.min(Math.max(r.a[i],r.b[i]),vertical?bounds.y1:bounds.x1);
  if(hi<=lo)return null;
  return {...r,a:vertical?[axis,lo]:[lo,axis],b:vertical?[axis,hi]:[hi,axis],bounds};
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
      p.transition=(r.joinXs||[r.joinX]).some(x=>x!==undefined&&Math.abs(p.x-x)<14);
      if(r.minY!==undefined&&p.y<r.minY)continue;
      if(r.minX!==undefined&&p.x<r.minX||r.maxX!==undefined&&p.x>=r.maxX)continue;
      if(!blossomWithinRoadCaps(p.x,p.y,r))continue;
      if(!treeBorderInBounds(p.x,p.y,r.bounds))continue;
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
function planBlossomLayout(roads,arenas,towns,allowed=()=>true,scenery=[],extraCandidates=()=>[]) {
  roads=blossomRoadJoinCaps(roads);
  const roadsAt=treeBorderLookup(roads,r=>{
    const pad=r.half+2+3*treeBorderSpacing(r).band;
    return [Math.min(r.a[0],r.b[0])-pad,Math.min(r.a[1],r.b[1])-pad,
      Math.max(r.a[0],r.b[0])+pad,Math.max(r.a[1],r.b[1])+pad];
  });
  const arenasAt=treeBorderLookup(arenas,a=>{
    const pad=(a.r||6)+Math.max(11,2.5+3*treeBorderSpacing(a).band);
    return [a.x-pad,a.y-pad,a.x+pad,a.y+pad];
  });
  const result=[];
  const occupied=new Map(),gridKey=(x,y)=>Math.floor(x/4)+','+Math.floor(y/4);
  const crowded=(p,clearance)=>{
    for(let y=Math.floor((p.y-4)/4);y<=Math.floor((p.y+4)/4);y++)
      for(let x=Math.floor((p.x-4)/4);x<=Math.floor((p.x+4)/4);x++)
        if((occupied.get(x+','+y)||[]).some(q=>Math.hypot(p.x-q.x,p.y-q.y)<
          Math.max(clearance,treeBorderSpacing(q).clearance)-.04))return true;
    return false;
  };
  for(let row=0;row<4;row++) {
    // Arena and town borders own their junctions with routes. All inner rows
    // precede the outer bands, which cannot displace those clean borders.
    const groups=row===3?[towns.flatMap(t=>blossomTownCandidates(t,row))]:
      [row===0?scenery:[],arenas.flatMap(a=>blossomArenaCandidates(a,row)),
       towns.flatMap(t=>blossomTownCandidates(t,row)),extraCandidates(row),blossomDesertJoinCandidates(roads,row),blossomRouteCandidates(roads,row)];
    for(const group of groups)for(const p of group.sort((a,b)=>a.y-b.y||a.x-b.x)) {
      const localArenas=arenasAt(p.x,p.y);
      const owner=localArenas.filter(a=>Math.hypot(p.x-a.x,p.y-a.y)<(a.r||6)+11)
        .sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
      if(owner&&p.kind!=='scenery'){
        p.tree=owner.northTree&&p.y<owner.y?owner.northTree:owner.tree;
        p.region=owner.northTree&&p.y<owner.y?'birch':owner.region;
      }
      // At this short offset join, preserve the outer rows across the bend.
      // Physical road clearance and the spacing grid still keep it open.
      const borderRow=p.roofBacking||p.transition?0:row;
      const roadMargin=p.kind==='scenery'&&p.source==='falls'?1:2;
      if(roadsAt(p.x,p.y).some(r=>blossomWithinRoadCaps(p.x,p.y,r)&&blossomRoadDistance(p.x,p.y,r)<r.half+roadMargin+(r.blossom?borderRow*treeBorderSpacing(r).band:0)-.04))continue;
      if(localArenas.some(a=>!(p.kind==='arena'&&p.source===a.id)&&
        Math.hypot(p.x-a.x,p.y-a.y)<(a.r||6)+2.5+borderRow*treeBorderSpacing(a).band-.04))continue;
      if(towns.some(t=>!(p.kind==='town'&&p.source===t.id)&&blossomInsideBox(p.x,p.y,blossomTownBox(t,borderRow))))continue;
      const clearance=treeBorderSpacing(p).clearance;
      if(!allowed(p)||crowded(p,clearance))continue;
      result.push(p);
      const key=gridKey(p.x,p.y);if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(p);
    }
  }
  return result;
}
function blossomDesertJoinCandidates(roads,row){
  if(!roads.some(r=>r.joinX===1046&&r.region==='dying')||!roads.some(r=>r.joinX===1046&&r.region==='desert'))return [];
  // The road rises two tiles here. Fill the south-side bend before the
  // regular grids, so inner and middle bands turn instead of stopping short.
  const points=row===0?[[1047,144],[1050,143]]:
    row===1?[[1042.25,147.5],[1047,145.5],[1050,144.5]]:
    row===2?[[1047,148]]:[];
  return points.map(([x,y])=>blossomPoint(x,y,{row,kind:'route',source:x<1046?32:33,
    tree:x<1046?'deadtree0':'cactus1',region:x<1046?'dying':'desert',transition:true}));
}
function planBlossomRows(roads,allowed=()=>true) {
  return planBlossomLayout(roads,[],[],allowed);
}

function treeBorderScope(list,legsFor) {
  normalizeWesternTreeFeatures(list);
  const woods=list.find(f=>f.label==='Northern Woods');
  const shrooms=list.find(f=>f.wild&&f.style==='mystic'&&/shroom|spore/i.test(f.label||f.place||''));
  const millwood=list.find(f=>f.label==='Millwood');
  const inWoods=(x,y)=>woods&&x>=woods.x0&&x<=woods.x1&&y>=woods.y0&&y<=woods.y1;
  const nativeRoute=f=>f.style==='spruce'&&((millwood&&(f.joins||[]).includes('Millwood'))||
    (woods&&((f.joins||[]).includes('Elders Home')||legsFor(f).some(([a,b])=>inWoods(a[0],a[1])||inWoods(b[0],b[1])))));
  const templeRoots=list.filter(f=>f.kind==='route'&&f.style==='temple'&&
    (f.joins||[]).includes('Forgewick Temple')).flatMap(f=>legsFor(f).map(([a,b])=>({a,b})));
  const templeRoute=f=>f.style==='temple'&&((f.joins||[]).includes('Forgewick Temple')||
    legsFor(f).some(([a,b])=>templeRoots.some(r=>
      blossomRoadDistance(...a,r)<6||blossomRoadDistance(...b,r)<6)));
  const roads=list.filter(f=>f.kind==='route').flatMap(f=>{
    const native=nativeRoute(f),oak=f.style==='oak',birch=f.style==='birch',dying=f.style==='dying';
    const temple=templeRoute(f);
    // Own the full desert avenues and their hunting loops. Managing only
    // the first horizontal leg left its north bend bare and let saved temple
    // trees survive in the cactus line beside the eastern hunting turnoff.
    const desert=f.style==='desert';
    const managed=f.style==='blossom'||native||oak||birch||temple||dying||desert;
    return legsFor(f).flatMap(([a,b])=>{
      const road={a,b,id:f.id,half:(f.w||5)>>1,band:f.band||20,
      blossom:managed,tree:temple?'kt_tree_a':oak?'oak_big':birch?'bir_big':native?'spr_big':dying?'deadtree0':desert?'cactus1':'blo_big',
      region:temple?'forgewick-temple':oak?'oak':birch?'birch':native?'millwood':dying?'dying':desert?'desert':'blossom',
      minY:native&&woods?woods.y0:undefined};
      const joins={32:{maxX:1046,joinX:1046},33:{minX:1046,joinX:1046},
        44:{maxX:1824,joinX:1824},45:{minX:1824,maxX:1887,joinXs:[1824,1887]},
        46:{minX:1887,joinX:1887},58:{maxX:2144,joinX:2144}};
      Object.assign(road,joins[f.id]);
      // Replant both sides of the blossom/swamp seam. Keep the rest of the
      // swamp and the first ent arena's existing vegetation outside this scope.
      if(f.id===61&&a[1]===449&&b[1]===449){
        const entry=treeBorderClipRoad(road,{x0:2144,x1:2168,y0:428,y1:470});
        if(entry)return [road,{...entry,blossom:true,tree:'sw_tree3_3',region:'swamp',minX:2144,joinX:2144}];
      }
      // The original unstyled road spans both woods. Keep its full path as an
      // obstacle, but only take ownership of planting inside Shroom Pass.
      const clipped=shrooms&&(!f.style||f.style==='mystic')&&treeBorderClipRoad(road,shrooms);
      // The birch avenue ends at the arena at (412,119). The saved route
      // continues as oak from there; use a single, explicit transition.
      if(f.id===193&&a[0]===412&&b[0]===412&&Math.min(a[1],b[1])<119)
        return [{...road,a:[412,Math.min(a[1],b[1])],b:[412,119],tree:'bir_big',region:'birch'},
          {...road,a:[412,119],b:[412,Math.max(a[1],b[1])]}];
      if(f.id===13&&a[0]===98&&b[0]===98&&Math.max(a[1],b[1])>=367)
        return [{...road,a:[98,Math.min(a[1],b[1])],b:[98,336]},
          {...road,a:[98,336],b:[98,Math.max(a[1],b[1])],tree:'spr_big',region:'millwood'}];
      return clipped?[road,{...clipped,blossom:true,tree:'mw_tree',region:'shroom'}]:[road];
    });
  });
  const nativeRoads=roads.filter(r=>r.region==='millwood');
  const rings=list.filter(f=>f.kind==='arena'||f.kind==='camp');
  const nativeArena=f=>f.style==='spruce'&&(inWoods(f.x,f.y)||
    nativeRoads.some(r=>blossomRoadDistance(f.x,f.y,r)<(f.r||6)+4));
  const shroomArena=f=>shrooms&&f.style==='mystic'&&treeBorderInBounds(f.x,f.y,shrooms);
  const templeArena=f=>roads.some(r=>
    r.region==='forgewick-temple'&&blossomRoadDistance(f.x,f.y,r)<(f.r||6)+4);
  // Published IDs survive hunting-area additions; display numbers do not.
  const desertArena=f=>f.style==='desert'&&roads.some(r=>r.blossom&&r.region==='desert'&&
    blossomRoadDistance(f.x,f.y,r)<(f.r||6)+4);
  const oakArena=f=>!templeArena(f)&&(f.style==='oak'||[175,177,178].includes(f.id));
  const birchArena=f=>f.style==='birch'&&!oakArena(f);
  const arenas=rings.filter(f=>f.style==='blossom'||desertArena(f)||oakArena(f)||birchArena(f)||templeArena(f)||nativeArena(f)||shroomArena(f)).map(f=>({...f,
    northTree:f.id===175?'bir_big':undefined,
    tree:desertArena(f)?'cactus1':oakArena(f)?'oak_big':templeArena(f)?'kt_tree_a':birchArena(f)?'bir_big':shroomArena(f)?'mw_tree':nativeArena(f)?'spr_big':'blo_big',
    region:desertArena(f)?'desert':oakArena(f)?'oak':templeArena(f)?'forgewick-temple':birchArena(f)?'birch':shroomArena(f)?'shroom':nativeArena(f)?'millwood':'blossom'}));
  const towns=list.filter(f=>['area','town'].includes(f.kind)&&!f.wild&&
    ((f.style==='blossom'&&f.label==='Coralmere')||
     (f.style==='spruce'&&(f.label==='Millwood'||(woods&&f.label==='Elders Home')))))
    .map(f=>({...f,tree:f.style==='spruce'?'spr_big':'blo_big',region:f.style==='spruce'?'millwood':'blossom',
      // Millwood's upper house roofs reach into the usual border. Shift the
      // complete northern rows back, keeping the same stagger across roofs.
      northInset:f.label==='Millwood'?2.5:undefined}));
  return {roads,arenas,towns,rings};
}

function normalizeWesternTreeFeatures(list) {
  const styles={175:'birch',177:'oak',178:'oak',180:'temple',169:'temple',
    170:'temple',171:'temple',172:'temple',161:'desert',9147:'birch'};
  for(const f of list)if(f.kind==='arena'&&styles[f.id])f.style=styles[f.id];
  const dying=list.find(f=>f.kind==='route'&&f.id===32),desert=list.find(f=>f.kind==='route'&&f.id===33);
  const end=dying?.pts?.at(-1),start=desert?.pts?.[0];
  if(end?.[0]===1045&&end[1]===140&&start?.[0]===1047&&start[1]===138){
    dying.pts=dying.pts.concat([[1047,140],[1047,138]]);
    dying.x1=1047;dying.y1=138;
  }
  const blossoms=list.find(f=>f.kind==='route'&&f.id===58);
  const blossomEnd=blossoms?.pts?.at(-1);
  const swampStart=list.find(f=>f.kind==='route'&&f.id===61)?.pts?.[0];
  if(blossomEnd?.[0]===2144&&blossomEnd[1]===450&&swampStart?.[0]===2143&&swampStart[1]===449){
    blossoms.pts=blossoms.pts.slice(0,-1).concat([[2143,450],[2143,449]]);
    blossoms.x1=2143;blossoms.y1=449;
  }
}

function rebuildBlossomRoutes({inTownArea,onBuilding}) {
  if(MAPID!=='world')return;
  clearCrashFieldMushrooms();
  if(typeof restoreShroomEntranceTrees==='function')restoreShroomEntranceTrees();
  const {roads,arenas,towns,rings}=treeBorderScope(features,routeLegs);
  const legs=roads.filter(r=>r.blossom);
  if(!legs.length&&!arenas.length&&!towns.length)return;
  // Remove the abandoned prop cluster west of the second campsite.
  const strayCampProp=o=>/^(campfire|rock\d|sh_rock)/.test(NAMES[o.s]||'')&&
    o.x/TS>=295&&o.x/TS<=309&&o.y/TS>=167&&o.y/TS<=175;
  for(const o of objs)if(strayCampProp(o))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!strayCampProp(o));
  const arenaIds=new Set(arenas.map(a=>a.id));
  const otherRings=rings.filter(f=>!arenaIds.has(f.id));
  const scenery=[];
  const sceneryRow=(lo,hi,y,source)=>{
    for(const x of blossomRowValues(lo,hi,0,42/16))scenery.push(blossomPoint(x,y,
      {row:0,kind:'scenery',source,tree:'oak_big',region:'oak'}));
  };
  // Read the complete mountain artwork, including the last eastern column.
  if(Array.isArray(MD.scatter)){
    for(const belt of [{x0:679,x1:840,y0:118,y1:152,source:'mine'},
      {x0:330,x1:520,y0:300,y1:334,source:'falls-mountain'}]){
    const columns=new Map();
    for(let i=0;i<MD.scatter.length;i+=3){
      if(!/^mtn/.test(NAMES[MD.scatter[i]]||''))continue;
      const x=MD.scatter[i+1]/TS-.5,y=MD.scatter[i+2]/TS;
      if(x<belt.x0||x>belt.x1||y<belt.y0||y>belt.y1)continue;
      columns.set(x,Math.max(columns.get(x)||0,y));
    }
    const xs=[...columns.keys()].sort((a,b)=>a-b);
    if(xs.length)for(const x of blossomRowValues(xs[0],xs.at(-1),0,42/16)){
      const near=xs.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
      scenery.push(blossomPoint(x,columns.get(near)+1,{row:0,kind:'scenery',source:belt.source,tree:'oak_big',region:'oak'}));
    }
    }
  }
  const falls=features.find(f=>f.kind==='landmark'&&f.label==='Forgefalls');
  const cliff=falls&&objs.find(o=>NAMES[o.s]==='cliff_fall'&&Math.abs(o.x/TS-falls.x)<2&&Math.abs(o.y/TS-falls.y)<2);
  if(cliff&&SPR.cliff_fall)sceneryRow((cliff.x-SPR.cliff_fall[2]/2)/TS,
    (cliff.x+SPR.cliff_fall[2]/2)/TS,cliff.y/TS,'falls');
  const sceneryBand=(x,y)=>scenery.some(p=>Math.abs(p.x-x)<3&&Math.abs(p.y-y)<2.5);
  const townBorder=(x,y)=>towns.some(t=>blossomInsideBox(x,y,
    {left:t.x0,right:t.x1,top:t.y0,bottom:t.y1},7)&&
    !blossomInsideBox(x,y,blossomTownBox({...t,northInset:undefined}),-2));
  const arenaNeighbors=treeBorderLookup(arenas,a=>{
    const pad=(a.r||ARENA_R)+11;return [a.x-pad,a.y-pad,a.x+pad,a.y+pad];
  });
  const ringNeighbors=treeBorderLookup(otherRings,a=>{
    const pad=(a.r||ARENA_R)+3.5;return [a.x-pad,a.y-pad,a.x+pad,a.y+pad];
  });
  const atArena=(x,y)=>arenaNeighbors(x,y).some(a=>Math.hypot(x-a.x,y-a.y)<(a.r||ARENA_R)+11);
  const protectedPlace=(x,y,region)=>
    (region==='shroom'?features.some(a=>{
      if(!['area','town'].includes(a.kind)||a.wild)return false;
      // The meadow's extra scatter buffer must not break the managed path
      // rows. Keep its actual ground open and retain other clearing bounds.
      const inset=a.meadow?0:(a.band||6);
      return x>=a.x0+inset&&x<=a.x1-inset&&y>=a.y0+inset&&y<=a.y1-inset;
    }):inClearing(x,y))||
    ringNeighbors(x,y).some(f=>Math.hypot(x-f.x,y-f.y)<(f.r||ARENA_R)+3.5);
  const inBand=(x,y)=>sceneryBand(x,y)||atArena(x,y)||townBorder(x,y)||
    (!inTownArea(x,y)&&legs.some(r=>{
      const reach=Math.max(14,r.band)+r.half+2;
      // Clear old route trees out of the northern meadow's buffer too;
      // managed rows connect to the meadow's actual edge.
      return (r.minY===undefined||y>=r.minY)&&treeBorderInBounds(x,y,r.bounds)&&
        x>=Math.min(r.a[0],r.b[0])-reach&&x<=Math.max(r.a[0],r.b[0])+reach&&
        y>=Math.min(r.a[1],r.b[1])-reach&&y<=Math.max(r.a[1],r.b[1])+reach&&
        (r.region==='shroom'||!protectedPlace(x,y));
    }));
  const tree=o=>BLOSSOM_ROUTE_TREES.test(NAMES[o.s]||'');
  const replace=o=>tree(o)&&!(typeof isShroomEntranceTree==='function'&&isShroomEntranceTree(o))&&inBand(o.x/TS-.5,o.y/TS-1);
  // Managed borders own their species and spacing, including trees inserted
  // by old published Move/Add operations. Off-border trees stay authored.
  for(const o of objs)if(replace(o))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!replace(o));
  const living=objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs);
  const neighbors=living.filter(tree).map(o=>({x:o.x/TS-.5,y:o.y/TS-1})).filter(o=>
    sceneryBand(o.x,o.y)||atArena(o.x,o.y)||townBorder(o.x,o.y)||legs.some(r=>
      o.x>=Math.min(r.a[0],r.b[0])-30&&o.x<=Math.max(r.a[0],r.b[0])+30&&
      o.y>=Math.min(r.a[1],r.b[1])-30&&o.y<=Math.max(r.a[1],r.b[1])+30));
  const props=living.filter(o=>!tree(o)&&SPR[NAMES[o.s]]&&DEFS[o.s]?.c);
  const treeSprites=Object.entries(SPR).filter(([name])=>BLOSSOM_ROUTE_TREES.test(name)).map(([,sp])=>sp);
  const maxTreeWidth=Math.max(TS,...treeSprites.map(sp=>sp[2]));
  const maxTreeHeight=Math.max(TS,...treeSprites.map(sp=>sp[3]));
  const nearbyProps=treeBorderLookup(props,o=>{
    const sp=SPR[NAMES[o.s]],foot=DEFS[o.s].c;
    const reach=Math.max((maxTreeWidth+sp[2])/2+4,(TS+(foot[0]||TS))/2+2);
    return [o.x-reach,o.y-Math.max(sp[3],foot[1]||TS)-4,
      o.x+reach,o.y+Math.max(maxTreeHeight+4,TS)];
  },TS*8);
  // Four tiles covers the largest clearance returned by treeBorderSpacing.
  const nearbyTrees=treeBorderLookup(neighbors,o=>[o.x-4,o.y-4,o.x+4,o.y+4],8);
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
    if(tx<1||ty<1||tx>=MW-1||ty>=MH-1||protectedPlace(x,y,p.region))return false;
    if(inTownArea(x,y)&&!townBorder(x,y)&&p.kind!=='scenery')return false;
    const sandy=(p.region==='dying'||p.region==='desert'||p.transition&&p.region==='blossom')&&
      typeof SAND!=='undefined'&&terr[ty*MW+tx]===SAND;
    // Forgefalls' road is directly below the cliff. Put this row at the
    // grass verge one tile ahead of the rock, keeping the road below open.
    const cliffFoot=p.kind==='scenery'&&p.source==='falls'&&cliff&&(y+1)*TS===cliff.y+TS;
    if(!sandy&&![GRASS,WALL].includes(terr[ty*MW+tx])||!cliffFoot&&(rockTiles.has(k)||SCENE_WALL?.has(ty*MW+tx))||
      (typeof felledNew!=='undefined'&&felledNew.includes(k)))return false;
    const px=x*TS+TS/2,py=(y+1)*TS;
    if(p.kind==='scenery'&&(MD.doors||[]).some(d=>{
      if(d.to!=='mine')return false;
      const r=doorRect(d);
      return px>r.x-sp[2]/2-4&&px<r.x+r.w+sp[2]/2+4&&Math.abs(py-(r.y+r.h))<TS*3;
    }))return false;
    if(onBuilding(px,py,sp)&&!(p.roofBacking&&backsRoof(px,py,sp)))return false;
    if(nearbyTrees(x,y).some(o=>Math.hypot(x-o.x,y-o.y)<treeBorderSpacing(p).clearance))return false;
    const behindHouses=p.roofBacking||p.kind==='town'&&!p.vertical&&towns.some(t=>
      t.id===p.source&&t.northInset!==undefined&&y===blossomTownBox(t,p.row).top);
    if(nearbyProps(px,py).some(o=>{
      if(p.kind==='scenery'&&/^(mtn|cliff_fall)/.test(NAMES[o.s]||''))return false;
      if(p.roofBacking&&buildings.has(o))return false;
      if(!behindHouses){
        const footprint=DEFS[o.s]?.c;
        return Math.abs(o.x-px)<(Math.min(sp[2],TS)+(footprint?.[0]||TS))/2+2&&
          py>o.y-(footprint?.[1]||TS)-4&&py<o.y+TS;
      }
      // Small garden rocks below the border should not punch tree-sized holes
      // above the roofs. Still leave space around each prop's actual artwork.
      const q=SPR[NAMES[o.s]];
      return Math.abs(o.x-px)<(sp[2]+q[2])/2+4&&py>o.y-q[3]-4&&py-sp[3]<o.y+4;
    }))return false;
    if(npcs.some(n=>!n.editorDeleted&&Math.hypot(n.x-px,n.y-py)<TS*3))return false;
    return true;
  },scenery);
  let id=fobjs.reduce((n,o)=>Math.min(n,o.id||0),-1)-1;
  for(const p of plan) {
    const [tx,ty]=cell(p);
    fobjs.push({id:id--,s:NAME2I[p.tree||'blo_big'],x:p.x*TS+TS/2,y:(p.y+1)*TS,feat:1,
      blossomRow:p.row,blossomKind:p.kind,blossomFeature:p.source,blossomVertical:p.vertical,borderRegion:p.region||'blossom',
      ...(p.kind==='scenery'&&p.source==='falls'?{sy:cliff.y+TS+1}: {})});
    terr[ty*MW+tx]=WALL;
  }
}

function clearCrashFieldMushrooms(){
  if(MAPID!=='world')return;
  const field=features.find(f=>f.kind==='area'&&f.label==='North Shroom Pass Field');
  if(!field)return;
  const removed=(s,px,py)=>/^sh_(big|wall|med|sml|fat|stalk|glow)/.test(NAMES[s]||'')&&
    px/TS>=field.x0-8&&px/TS<=field.x1+8&&py/TS>=field.y0-9&&py/TS<=field.y1+12;
  for(const o of objs)if(removed(o.s,o.x,o.y))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!removed(o.s,o.x,o.y));
  for(const [prefix,arr] of [['s',typeof scat==='undefined'?[]:scat],['a',typeof sanm==='undefined'?[]:sanm]])
    for(let i=0;i<arr.length;i+=3)if(removed(arr[i],arr[i+1],arr[i+2])&&typeof decorGone!=='undefined')decorGone.add(prefix+i);
}
