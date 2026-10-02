/* Coralmere's shore beacon, beside the eastern fishing dock. */
const CoralmereLighthouse=(()=>{
  const X=2053*16+8,Y=516*16+16;
  let ready=false;
  async function prepare(){
    if(ready)return;
    const image=await loadStartupImage('assets/buildings/coralmere-lighthouse.webp?v=20261002-lighthouse');
    const crop=await loadStartupJSON('assets/buildings/coralmere-lighthouse.json?v=20261002-lighthouse');
    const canvas=document.createElement('canvas');canvas.height=144;canvas.width=Math.round(144*crop.w/crop.h);
    const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
    g.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,canvas.width,canvas.height);
    canvas.pixelLocked=true;animalSheets.coralmere_lighthouse=canvas;
    SPR.coralmere_lighthouse=[0,0,canvas.width,canvas.height,1,'coralmere_lighthouse'];ready=true;
  }
  function installWorld(m){
    if(!ready||m.roomActors?.some(a=>a.coralmereLighthouse))return;
    m.roomActors||=[];m.roomBlocks||=[];
    const moveBlocks=[m.roomBlocks.push([X-21,Y-25,X+21,Y-2])-1];
    m.roomActors.push({spr:'coralmere_lighthouse',x:X,y:Y,schoolArt:true,
      editKey:'coralmere:lighthouse',coralmereLighthouse:true,moveBlocks});
  }
  return {prepare,installWorld};
})();
