/* Reuse spatial biome boundaries while playing. Previously every animated
   grass sprite and ground tile scanned every feature in the entire world. */
(function(){
  const originalWinter=inWinter,originalSwamp=inSwamp;
  let snapshot=null;
  function query(style,x,y,original){
    // Editor previews read live, including a route still being dragged.
    if(editing||building){snapshot=null;return original(x,y);}
    const source=features.length?features:MD.features;
    if(!snapshot||snapshot.map!==MD||snapshot.source!==source||
       snapshot.count!==source?.length||snapshot.stamp!==editStamp||
       snapshot.winter!==MD.winter_regions||snapshot.swamp!==MD.swamp_regions){
      snapshot={map:MD,source,count:source?.length,stamp:editStamp,
        winter:MD.winter_regions,swamp:MD.swamp_regions,queries:{}};
    }
    const prepared=snapshot.queries[style]||=createBiomeQuery(style);
    return prepared(x,y);
  }
  inWinter=(x,y)=>query('winter',x,y,originalWinter);
  inSwamp=(x,y)=>query('swamp',x,y,originalSwamp);
  // Terrain rebuilding and retained-world returns may reuse map objects.
  const oldReindex=reindex,oldLoadMap=loadMap;
  reindex=function(...args){snapshot=null;return oldReindex(...args);};
  loadMap=function(...args){snapshot=null;return oldLoadMap(...args);};
})();
