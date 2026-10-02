/* Thin redundant Shroom Pass dressing after the final tree-border pass.
   Keep authored positions and stable object/scatter IDs for saves and editors. */
const SHROOM_SCENERY = /^sh_(big|wall|med|sml|fat|stalk|glow)/;

function planShroomThinning(items, sprites, names, area, tileSize=16) {
  const mushrooms=[], buckets=new Map(), removed=new Set(), cellSize=64;
  function add(item) {
    const x=Math.floor(item.x/cellSize),y=Math.floor(item.y/cellSize),key=x+','+y;
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(item);
  }
  function neighbors(item) {
    const found=[],x=Math.floor(item.x/cellSize),y=Math.floor(item.y/cellSize);
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)found.push(...(buckets.get((x+dx)+','+(y+dy))||[]));
    return found;
  }
  for(const item of items) {
    const name=names[item.s]||'',sp=sprites[name];
    if(!sp)continue;
    const p={...item,w:sp[2],h:sp[3],tree:name==='mw_tree'};
    if(p.tree)add(p);
    else if(SHROOM_SCENERY.test(name)&&item.x/tileSize>=area.x0&&item.x/tileSize<=area.x1&&
      item.y/tileSize>=area.y0&&item.y/tileSize<=area.y1)mushrooms.push(p);
  }
  // Foreground caps win. At the same depth prefer the larger silhouette, then
  // the stable layer/ID key, so loading or rebuilding never shuffles the grove.
  mushrooms.sort((a,b)=>b.y-a.y||b.h-a.h||a.x-b.x||a.key.localeCompare(b.key));
  for(const p of mushrooms) {
    const nearby=neighbors(p);
    // Leave room between stems; small mushrooms can still nestle beside adults.
    const crowded=nearby.some(q=>!q.tree&&Math.abs(q.x-p.x)<(p.w+q.w)*.36&&
      Math.abs(q.y-p.y)<Math.min(p.h,q.h)*.58);
    let covered=0;
    // Sample the cap, not the transparent corners or thin stalk. Trees use a
    // rounded canopy; mushrooms use their upper body. Lower stems stay airy.
    for(const fx of [.25,.375,.5,.625,.75])for(const fy of [.16,.28,.4,.52]) {
      const x=p.x+(fx-.5)*p.w,y=p.y-p.h+fy*p.h;
      if(nearby.some(q=>{
        if(q.y<p.y)return false;
        if(q.tree)return ((x-q.x)/(q.w*.48))**2+((y-(q.y-q.h*.65))/(q.h*.34))**2<1;
        return Math.abs(x-q.x)<q.w*.44&&y>q.y-q.h*.92&&y<q.y-q.h*.35;
      }))covered++;
    }
    if(crowded||covered>=11)removed.add(p.key);
    else add(p);
  }
  return removed;
}

function thinShroomPass() {
  if(MAPID!=='world')return;
  const area=features.find(f=>f.kind==='area'&&f.label==='Shroom Pass');
  if(!area)return;
  const items=[];
  for(const o of objs)if(!hidden.has(o.id)&&!deleted.has(o.id))items.push({...o,key:'o'+o.id});
  for(const o of fobjs)items.push({...o,key:'f'+o.id});
  for(const [tag,arr]of [['s',scat],['a',sanm]])for(let i=0;i<arr.length;i+=3)
    if(!decorGone.has(tag+i))items.push({key:tag+i,s:arr[i],x:arr[i+1],y:arr[i+2]});
  const removed=planShroomThinning(items,SPR,NAMES,area,TS);
  for(const o of objs)if(removed.has('o'+o.id))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!removed.has('f'+o.id));
  for(const key of removed)if(key[0]==='s'||key[0]==='a')decorGone.add(key);
}
