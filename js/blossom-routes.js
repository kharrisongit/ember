/* Blossom avenues have one planting pass. The old map trees and generic
   forest passes must not add a second, jittered row between these trees. */
const BLOSSOM_TREE_STEP = 6;
const BLOSSOM_BAND_STEP = 5;
const BLOSSOM_ROUTE_TREES = /^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;

function blossomRoadDistance(x,y,{a,b}) {
  const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
  const t=l2?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l2)):0;
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}

// A shared world-grid phase keeps adjoining legs aligned even when a route is
// reversed or split in the editor. Place every first row before the outer bands
// so the latter never displace the path's clean border at bends or junctions.
function planBlossomRows(roads,allowed=()=>true) {
  const legs=roads.filter(r=>r.blossom).map(r=>({...r,
    vert:r.a[0]===r.b[0],lo:Math.min(r.a[0]===r.b[0]?r.a[1]:r.a[0],r.a[0]===r.b[0]?r.b[1]:r.b[0]),
    hi:Math.max(r.a[0]===r.b[0]?r.a[1]:r.a[0],r.a[0]===r.b[0]?r.b[1]:r.b[0])}));
  const result=[];
  for(let row=0;row<3;row++) {
    const candidates=[],phase=(row%2)*BLOSSOM_TREE_STEP/2;
    for(const leg of legs) {
      const off=leg.half+2+row*BLOSSOM_BAND_STEP,axis=leg.vert?leg.a[0]:leg.a[1];
      const start=Math.ceil((leg.lo-off-phase)/BLOSSOM_TREE_STEP)*BLOSSOM_TREE_STEP+phase;
      for(const side of [-1,1])for(let v=start;v<=leg.hi+off;v+=BLOSSOM_TREE_STEP) {
        const x=leg.vert?axis+side*off:v,y=leg.vert?v:axis+side*off;
        // Trim intersecting bands against every path, including other biomes.
        if(roads.some(r=>blossomRoadDistance(x,y,r)<r.half+2+(r.blossom?row*BLOSSOM_BAND_STEP:0)-.01))continue;
        candidates.push({x,y,row,vertical:leg.vert});
      }
    }
    candidates.sort((a,b)=>a.y-b.y||a.x-b.x);
    for(const p of candidates) {
      if(!allowed(p)||result.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<5))continue;
      result.push(p);
    }
  }
  return result;
}

function rebuildBlossomRoutes({inTownArea,onBuilding}) {
  if(MAPID!=='world')return;
  const roads=features.filter(f=>f.kind==='route').flatMap(f=>routeLegs(f).map(([a,b])=>
    ({a,b,half:(f.w||5)>>1,band:f.band||20,blossom:f.style==='blossom'})));
  const legs=roads.filter(r=>r.blossom);if(!legs.length)return;
  const rings=features.filter(f=>f.kind==='arena'||f.kind==='camp');
  const protectedPlace=(x,y)=>inTownArea(x,y)||inClearing(x,y)||
    rings.some(f=>Math.hypot(x-f.x,y-f.y)<(f.r||ARENA_R)+3.5);
  const inBand=(x,y)=>legs.some(r=>{
    const reach=Math.max(14,r.band)+r.half+2;
    return x>=Math.min(r.a[0],r.b[0])-reach&&x<=Math.max(r.a[0],r.b[0])+reach&&
      y>=Math.min(r.a[1],r.b[1])-reach&&y<=Math.max(r.a[1],r.b[1])+reach;
  })&&!protectedPlace(x,y);
  const tree=o=>BLOSSOM_ROUTE_TREES.test(NAMES[o.s]||'');
  const replace=o=>tree(o)&&inBand(o.x/TS-.5,o.y/TS-1);
  // Explicit tree-line strokes and moved trees remain editable after a rebuild
  // or publication. Only the old, untouched planting is replaced.
  const edited=new Set(added.map(o=>o.id)),publishedTrees=new Set();
  for(let layout=publishedEditorLayouts.maps.world;layout;layout=layout.build?.previous) {
    for(const op of Object.values(layout)) {
      if(op.kind==='object-add')publishedTrees.add([op.sprite,op.x,op.y].join(':'));
      if(op.kind==='object'&&!op.deleted)edited.add(Number(op.key));
    }
  }
  for(const o of objs)if(publishedTrees.has([o.s,o.x,o.y].join(':'))||
    (ORIG[o.id]&&(o.x!==ORIG[o.id].x||o.y!==ORIG[o.id].y)))edited.add(o.id);
  // Hide authored trees rather than deleting their editor identities. Town and
  // encounter planting stays intact; route vegetation gets exactly one owner.
  for(const o of objs)if(!edited.has(o.id)&&replace(o))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!replace(o));
  const living=objs.filter(o=>!hidden.has(o.id)&&!deleted.has(o.id)).concat(fobjs);
  const neighbors=living.filter(tree).map(o=>({x:o.x/TS-.5,y:o.y/TS-1})).filter(o=>legs.some(r=>
    o.x>=Math.min(r.a[0],r.b[0])-30&&o.x<=Math.max(r.a[0],r.b[0])+30&&
    o.y>=Math.min(r.a[1],r.b[1])-30&&o.y<=Math.max(r.a[1],r.b[1])+30));
  const props=living.filter(o=>!tree(o)&&SPR[NAMES[o.s]]&&DEFS[o.s]?.c);
  const si=NAME2I.blo_big,sp=SPR.blo_big;if(si===undefined||!sp)return;
  const plan=planBlossomRows(roads,p=>{
    const {x,y}=p,k=x+','+y;
    if(x<1||y<1||x>=MW-1||y>=MH-1||protectedPlace(x,y))return false;
    if(![GRASS,WALL].includes(terr[y*MW+x])||rockTiles.has(k)||SCENE_WALL?.has(y*MW+x)||felled.has(k))return false;
    const px=x*TS+TS/2,py=(y+1)*TS;
    if(onBuilding(px,py,sp)||neighbors.some(o=>Math.hypot(x-o.x,y-o.y)<5))return false;
    if(props.some(o=>Math.abs(o.x-px)<TS*2&&Math.abs(o.y-py)<TS*3))return false;
    if(npcs.some(n=>!n.editorDeleted&&Math.hypot(n.x-px,n.y-py)<TS*3))return false;
    return true;
  });
  let id=fobjs.reduce((n,o)=>Math.min(n,o.id||0),-1)-1;
  for(const p of plan) {
    fobjs.push({id:id--,s:si,x:p.x*TS+TS/2,y:(p.y+1)*TS,feat:1,
      blossomRow:p.row,blossomVertical:p.vertical});
    terr[p.y*MW+p.x]=WALL;
  }
}
