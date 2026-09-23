/* Authored source crops, never inferred from collision rectangles at runtime. */
let houseSeatedSheet=null;
async function prepareMillwoodInteriors() {
  if(!houseSeatedSheet){
    const image=new Image();image.src='assets/interiors/house-seated.png?v=20260923-forgewick1';
    await image.decode();houseSeatedSheet=image;
  }
  await prepareTownHouseInteriors('millwood', /^house2[2-7](?:_bedroom2?)?$/);
  await prepareTownHouseInteriors('thornwell', /^house(?:0[0-5]|3[01])(?:_bedroom2?)?$/);
  await prepareTownHouseInteriors('forgewick', /^house(?:0[679]|1[0-9]|2[01]|32)(?:_bedroom2?)?$/);
  window.__houseFurnitureCount=Object.values(W.maps).reduce((n,m)=>n+(m.roomActors||[]).filter(o=>o.exactFurniture).length,0);
}
async function prepareTownHouseInteriors(town, houseIds) {
  const root = 'assets/interiors/'+town+'/';
  const response = await fetch(root + 'layouts.json?v=20260923-forgewick1');
  if (!response.ok) throw new Error(town + ' layouts: ' + response.status);
  const layouts = await response.json();
  const sheet = new Image();
  sheet.src = root + 'layers.png?v=20260923-forgewick1';
  await sheet.decode();
  const cut = ([x,y,w,h]) => {
    const canvas = document.createElement('canvas');
    canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(sheet,x,y,w,h,0,0,w,h);
    return canvas;
  };
  let count=0;
  for (const [id,layout] of Object.entries(layouts)) {
    const map=W.maps[id];
    if (!map || !houseIds.test(id)) continue;
    if (map._millwoodLayers) continue;
    map._roomBaseCanvas=cut(layout.baseRect);
    // Remove the old baked-table foreground duplicates; keep independently placed props.
    map.roomActors=(map.roomActors||[]).filter(a=>!a.interiorFurniture &&
      !(a.castSeat && a.roomCrop) && a.spr!=='nan_table_front');
    const originalBlocks=(map.roomBlocks||[]).map(b=>b.slice());
    const furniture=layout.objects.map((o,index)=>({
      n:o.name.replace(/^pack_/, 'Furniture ').replaceAll('-', ' '),
      editKey:town+':'+id+':'+index,
      x:o.x+o.w/2, y:o.y+o.h,
      sy:o.flat?-1000:(o.sortY??o.y+o.h),
      extractedCanvas:cut(o.rect), interiorFurniture:true, exactFurniture:true,
      moveBlocks:[], flatFurniture:o.flat, sourceRect:[o.x,o.y,o.w,o.h]
    }));
    // Each collision belongs to exactly one furnishing; dragging never leaves it behind.
    map.roomBlocks=originalBlocks;
    for (let i=0;i<originalBlocks.length;i++) {
      const b=originalBlocks[i],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;
      const hits=furniture.filter(o=>!o.flatFurniture).map(o=>{
        const [x,y,w,h]=o.sourceRect;
        const overlap=Math.max(0,Math.min(b[2],x+w)-Math.max(b[0],x))*
          Math.max(0,Math.min(b[3],y+h)-Math.max(b[1],y));
        return {o,overlap,d:Math.hypot(cx-o.x,cy-(o.y-8))};
      }).filter(h=>h.overlap>0).sort((a,b)=>b.overlap-a.overlap||a.d-b.d);
      if(hits.length) hits[0].o.moveBlocks.push(i);
    }
    for(const o of furniture) {
      if(o.flatFurniture || o.moveBlocks.length || /hanging herbs/.test(o.n)) continue;
      const [x,y,w,h]=o.sourceRect;
      o.moveBlocks.push(map.roomBlocks.length);
      map.roomBlocks.push([x+2,y+h-Math.min(12,h),x+w-2,y+h-1]);
    }
    // Nan's existing seated pose needs the table in front of her, as before.
    if(id==='house26') {
      const table=furniture.find(o=>o.n==='dining table');
      if(table)table.sy=135;
    }
    map.roomActors.push(...furniture);
    map._millwoodLayers=true;
    map._layeredFurniture=true;
    count+=furniture.length;
  }
  window.__houseFurnitureCount=count;
}
