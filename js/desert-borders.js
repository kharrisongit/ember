/* Final authored desert borders, applied after procedural planting and Build. */
const DesertBorders=(()=>{
  function plan(all,actors,width,height){
    const scope=new Set(),walls=new Set(),points=[];let palmBounds=null;
    const mark=(x0,y0,x1,y1,inside,solid)=>{
      for(let y=Math.max(0,Math.floor(y0));y<=Math.min(height-1,Math.ceil(y1));y++)
        for(let x=Math.max(0,Math.floor(x0));x<=Math.min(width-1,Math.ceil(x1));x++)if(inside(x,y)){
          const key=y*width+x;scope.add(key);if(solid(x,y))walls.add(key);
        }
    };
    const oasis=all.find(f=>f.kind==='area'&&f.label==='The Oasis');
    if(oasis){
      // One 48px grid, including corners, eliminates the old overlapping palms.
      const left=oasis.x0-1,top=oasis.y0+1;
      const right=left+Math.round((oasis.x1-left)/3)*3,bottom=top+Math.ceil((oasis.y1+1-top)/3)*3;
      palmBounds={left:left-7,right:right+7,top:top-7,bottom:bottom+7};
      const roads=all.filter(f=>f.kind==='route').flatMap(f=>routeLegs(f).map(([a,b])=>({a,b,half:(f.w||5)/2})));
      const gate=(x,y,margin)=>roads.some(r=>blossomRoadDistance(x,y,r)<=r.half+margin);
      const inBox=(x,y,pad)=>x>=left-pad&&x<=right+pad&&y>=top-pad&&y<=bottom+pad;
      mark(left-7,top-7,right+7,bottom+7,(x,y)=>inBox(x,y,7)&&!inBox(x,y,-4),
        (x,y)=>!inBox(x,y,-1)&&!gate(x,y,0));
      // The oasis has one palm band at the grass edge; road verges keep three.
      const add=(x,y)=>{if(!gate(x,y,2))points.push({x,y,row:0,tree:'palm0',border:'oasis'});};
      for(let x=left;x<=right;x+=3){add(x,top);add(x,bottom);}
      for(let y=top+3;y<bottom;y+=3){add(left,y);add(right,y);}
    }
    // Extend each road's three staggered cactus rows right to the settlement edge.
    // Own the short join so procedural clipping cannot leave a walk-through gap.
    const town=all.find(f=>f.kind==='area'&&f.label==='Sandspire');
    const joins=[];
    if(town)joins.push({axis:'x',edge:town.x0-1,dir:-1,center:95,border:'sandspire-entry'},
      {axis:'y',edge:town.y0-1,dir:-1,center:1518,border:'sandspire-entry'},
      {axis:'y',edge:town.y1+2,dir:1,center:1515,border:'sandspire-entry'});
    if(oasis)joins.push({axis:'x',edge:oasis.x0-1,dir:-1,center:242,border:'oasis-entry'},
      {axis:'x',edge:oasis.x1+1,dir:1,center:242,border:'oasis-entry'},
      {axis:'y',edge:oasis.y1+2,dir:1,center:1287,border:'oasis-entry'});
    for(const j of joins){
      const end=j.edge+j.dir*12,lo=Math.min(j.edge,end),hi=Math.max(j.edge,end);
      const box=j.axis==='x'?[lo,j.center-10,hi,j.center+10]:[j.center-10,lo,j.center+10,hi];
      mark(...box,()=>true,(x,y)=>Math.abs((j.axis==='x'?y:x)-j.center)>=3);
      for(let row=0;row<3;row++)for(let step=0;step<=12;step+=3)for(const side of [-1,1]){
        const along=j.edge+j.dir*step,across=j.center+side*(4.5+row*1.5);
        points.push({x:j.axis==='x'?along:across,y:j.axis==='x'?across:along,row,tree:'cactus1',border:j.border});
      }
    }
    const shrines=[
      {actor:actors.find(a=>a.editKey==='pyramid:exterior'),rear:7,border:'pyramid'},
      {actor:actors.find(a=>a.editKey==='desert:chapel_ext_house0'),rear:14,border:'church'}
    ];
    for(const {actor,rear,border}of shrines){
      if(!actor)continue;
      const x=(actor.x-8)/16,y=actor.y/16;
      // Both buildings use the same three staggered cactus rows and solid cap.
      // The taller church gets more room behind its roof and dragon statue.
      mark(x-11,y-rear-8,x+11,y+7,(tx,ty)=>ty<=y-rear||Math.abs(tx-x)>=6,
        (tx,ty)=>ty<=y-rear||Math.abs(tx-x)>=6);
      for(let row=0;row<3;row++){
        const offset=6+row*1.5,top=y-rear-2-row*1.5;
        for(let tx=x-offset;tx<=x+offset;tx+=3)points.push({x:tx,y:top,row,tree:'cactus1',border});
        for(let ty=top+3;ty<=y+6;ty+=3)for(const tx of [x-offset,x+offset])points.push({x:tx,y:ty,row,tree:'cactus1',border});
      }
    }
    return {scope,walls,points,palmBounds,oasis};
  }
  function finishWorld(){
    if(MAPID!=='world')return;
    const {scope,walls,points,palmBounds,oasis}=plan(features,MD.roomActors||[],MW,MH);
    const debris=/^(oak_|bir_|spr_|fru_|mw_|kt_tree|kt_bush|blo_|sw_tree|wf_|cactus|drock|rock|palm|acacia|dacacia|deadtree|halfdead|deadbush|bush|fern|grass|mt|stump|log)/i;
    const inside=(s,x,y)=>{
      const name=NAMES[s]||'',tx=Math.floor(x/TS),ty=Math.floor((y-1)/TS);
      if(/^cactus/.test(name)&&oasis&&tx>=oasis.x0&&tx<=oasis.x1&&ty>=oasis.y0&&ty<=oasis.y1)return true;
      if(/^palm/.test(name)&&palmBounds&&tx>=palmBounds.left&&tx<=palmBounds.right&&ty>=palmBounds.top&&ty<=palmBounds.bottom)return true;
      return debris.test(name)&&scope.has(ty*MW+tx);
    };
    for(const o of objs)if(inside(o.s,o.x,o.y))hidden.add(o.id);
    fobjs=fobjs.filter(o=>!o.desertBorder&&!inside(o.s,o.x,o.y));
    for(const [tag,arr]of [['s',scat],['a',sanm]])for(let i=0;i<arr.length;i+=3)if(inside(arr[i],arr[i+1],arr[i+2]))decorGone.add(tag+i);
    const blocks=new Set(blockTiles.filter(k=>!scope.has(k)));
    for(const key of scope){
      const x=key%MW,y=Math.floor(key/MW);
      if(terr[key]===WALL)terr[key]=SAND;
      SCENE_WALL?.delete(key);rockTiles.delete(x+','+y);
      for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
        const cell=(x*2+dx)+','+(y*2+dy);
        if(MD.collisionOverrides&&(walls.has(key)||MD.collisionOverrides[cell]===true))delete MD.collisionOverrides[cell];
      }
    }
    MD.fence=(MD.fence||[]).filter(([x,y])=>!scope.has(y*MW+x));
    for(const key of walls)blocks.add(key);
    blockTiles=[...blocks];
    let id=fobjs.reduce((n,o)=>Math.min(n,o.id||0),-1)-1;
    for(const p of points){const s=NAME2I[p.tree];if(s!==undefined&&SPR[p.tree])fobjs.push({id:id--,s,x:p.x*TS+TS/2,y:(p.y+1)*TS,feat:1,desertBorder:p.border,borderRow:p.row});}
  }
  return {plan,finishWorld};
})();
