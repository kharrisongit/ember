/* Seated ferry passengers share the saved player identity and outfit. */
const FerryPassenger=(()=>{
  let image=null,ready=false;
  const variants=new Map();
  function prepare(){
    if(image)return;
    image=new Image();image.onload=()=>{ready=true;variants.clear();};image.onerror=()=>{image=null;};
    image.src='assets/ferry/corin-seated.png?v=20261006-centered-rear';
  }
  function sheet(){
    const identity=window.EmberPlayerIdentity,profile=identity?.capture()||{hair:'dark',eyes:'blue'};
    const key=profile.hair+':'+profile.eyes;
    if(variants.has(key))return variants.get(key);
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=96;
    const g=canvas.getContext('2d');g.drawImage(image,0,0);
    for(let row=0;row<3;row++)for(let col=0;col<2;col++){
      const head=g.getImageData(col*32,row*32,32,19);
      identity?.recolorPixels(head.data,profile.hair);
      identity?.recolorEyes(head.data,profile.eyes,false,32);
      g.putImageData(head,col*32,row*32);
    }
    variants.set(key,canvas);return canvas;
  }
  function draw(g){
    if(!ride||ride.turn>0||ride.board>0||ride.land>0)return false;
    prepare();if(!ready)return false;
    const row=!hasSword()?0:smithUpgrade?2:1,col=P.dir==='u'?1:0;
    g.drawImage(sheet(),col*32,row*32,32,32,Math.round(P.x)-16,Math.round(P.y)-27,32,32);
    return true;
  }
  return {prepare,draw};
})();

function clearFerrySignTrees(){
  if(MAPID!=='world'||!MD.ferry)return;
  const signs=(MD.roomActors||[]).filter(o=>o.ferrySign&&!o.editorDeleted),opened=new Set();
  const obscures=o=>{
    if(!/^sw_tree/.test(NAMES[o.s]||''))return false;
    const sp=SPR[NAMES[o.s]];if(!sp)return false;
    return signs.some(p=>o.x+sp[2]/2>p.x-22&&o.x-sp[2]/2<p.x+22&&o.y>p.y-28&&o.y-sp[3]<p.y+18);
  };
  for(const o of objs)if(obscures(o))hidden.add(o.id);
  fobjs=fobjs.filter(o=>!obscures(o));
  // Only the small bank beside each post is opened; water and docks keep
  // their authored terrain. The surrounding forest still bounds the shore.
  for(const p of signs){
    const tx=Math.floor(p.x/TS),ty=Math.floor((p.y-1)/TS);
    for(let y=ty-1;y<=ty+1;y++)for(let x=tx-1;x<=tx+1;x++){
      const i=y*MW+x;if(baseTerr[i]!==GRASS)continue;
      if(terr[i]===WALL)terr[i]=GRASS;
      opened.add(i);
    }
  }
  blockTiles=blockTiles.filter(i=>!opened.has(i));
}
