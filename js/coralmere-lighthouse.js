/* Coralmere's shore beacon, beside the eastern fishing dock. */
const CoralmereLighthouse=(()=>{
  const X=2053*16+8,Y=516*16+16;
  let ready=false;
  async function prepare(){
    if(ready)return;
    const image=await loadStartupImage('assets/buildings/coralmere-lighthouse.webp?v=20261006-timber');
    const crop=await loadStartupJSON('assets/buildings/coralmere-lighthouse.json?v=20261006-timber');
    const canvas=document.createElement('canvas');canvas.height=144;canvas.width=Math.round(144*crop.w/crop.h);
    const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
    g.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,canvas.width,canvas.height);
    canvas.pixelLocked=true;animalSheets.coralmere_lighthouse=canvas;
    SPR.coralmere_lighthouse=[0,0,canvas.width,canvas.height,1,'coralmere_lighthouse'];ready=true;
  }
  function installWorld(m){
    if(!ready||m.roomActors?.some(a=>a.coralmereLighthouse))return;
    m.roomActors||=[];m.roomBlocks||=[];
    const moveBlocks=[m.roomBlocks.push([X-28,Y-25,X+28,Y-2])-1];
    m.roomActors.push({spr:'coralmere_lighthouse',x:X,y:Y,schoolArt:true,
      editKey:'coralmere:lighthouse',coralmereLighthouse:true,moveBlocks});
    m.doors.push({x:2053,y:516,to:'coralmere_lighthouse',tx:7,ty:11,dir:'u',
      triggerRect:{x:X-10,y:Y-12,w:20,h:12}});
  }
  function installInteriors(){
    // Share immutable artwork, but never furniture, collision or editor state.
    for(const [source,id,title]of [
      ['millwood_mill','coralmere_lighthouse','Coralmere — Lighthouse'],
      ['millwood_mill_loft','coralmere_lighthouse_loft','Coralmere — Lighthouse Loft']
    ]){
      if(W.maps[id])continue;
      const original=W.maps[source],room={};
      for(const [key,value]of Object.entries(original)){
        if(key.startsWith('_'))continue;
        room[key]=value&&typeof value==='object'?JSON.parse(JSON.stringify(value)):value;
      }
      room._roomBaseCanvas=original._roomBaseCanvas;
      room.roomActors=(original.roomActors||[]).map((a,i)=>({...room.roomActors[i],
        extractedCanvas:a.extractedCanvas,editKey:id+':furniture:'+i}));
      room.title=title;room.travel_kind='Coralmere';room.npcs=[];
      for(const d of room.doors){
        if(d.to==='world'){d.tx=2053;d.ty=516.5;}
        else d.to=d.to.replace('millwood_mill','coralmere_lighthouse');
      }
      W.maps[id]=room;
    }
  }
  function repairPaths(){
    if(MAPID!=='world')return;
    // Replace the broken one-tile spurs with a continuous waterfront lane.
    // The fishmonger's house is on the dock; its wooden approach stays intact.
    for(let y=512;y<=517;y++)for(let x=2012;x<=2055;x++)
      if(terr[y*MW+x]===DIRT)terr[y*MW+x]=GRASS;
    const pave=(x,y)=>{
      const k=y*MW+x;
      if(terr[k]===GRASS||terr[k]===DIRT)terr[k]=DIRT;
    };
    for(let y=516;y<=517;y++)for(let x=2013;x<=2054;x++)pave(x,y);
    for(let y=512;y<=517;y++)for(let x=2019;x<=2021;x++)pave(x,y);
    for(const d of MD.doors||[]){
      if(!/^house4[2-5]$/.test(d.to))continue;
      const r=doorRect(d),cx=Math.floor((r.x+r.w/2)/TS);
      for(let y=Math.floor((r.y+r.h-1)/TS);y<=517;y++)
        for(let x=cx-1;x<=cx+1;x++)pave(x,y);
    }
    chunks.clear();
  }
  return {prepare,installWorld,installInteriors,repairPaths};
})();
