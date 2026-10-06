/* Generated frame art; lazy per-style loading, driven only by the crafting clock. */
(() => {
  const sheets=new Map(),icons=new Map(),FRAME_SIZE=192,FRAMES=9,FPS=8;
  const styles={
    potion:['brew','Stirring the potion…'],elixir:['brew','Mixing the elixir…'],
    bomb:['brew','Brewing Maelis’s Curse…'],saint:['brew','Mixing Saint’s Breath…'],
    dust:['powder','Grinding the powder…'],salt:['powder','Grinding the consecration…'],
    bell:['bell','Hammering the bell stake…'],mark:['marker','Chiseling the grave marker…'],
    stone:['crystal','Enchanting the stone…']
  };
  const style=r=>styles[r.id]||(r.raw==='dragonFish'?['fish','Baking the fish…']:['food','Roasting the meat…']);
  function prepare(r){
    const kind=style(r)[0];
    if(!sheets.has(kind)){
      const sheet=new Image();sheet.decoding='async';
      sheet.src='assets/crafting/animations/'+kind+'.webp?v=20261006-frames';sheets.set(kind,sheet);
    }
    // An icon remains available during decoding or a failed asset request.
    // Loading art never holds up an item award.
    if(!icons.has(r.id)){
      const icon=document.createElement('canvas');icon.width=icon.height=128;
      drawBagIcon(icon,BAG.find(i=>i.key===r.id)?.icon?.(),0);icons.set(r.id,icon);
    }
  }
  function draw(canvas,r,age){
    prepare(r);const g=canvas.getContext('2d'),sheet=sheets.get(style(r)[0]);
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const frame=reduced?0:Math.floor(Math.max(0,Number.isFinite(age)?age:0)*FPS)%FRAMES;
    g.clearRect(0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=false;
    if(sheet.complete&&sheet.naturalWidth){
      const size=Math.min(canvas.width,canvas.height);
      g.drawImage(sheet,(frame%3)*FRAME_SIZE,Math.floor(frame/3)*FRAME_SIZE,FRAME_SIZE,FRAME_SIZE,
        Math.floor((canvas.width-size)/2),Math.floor((canvas.height-size)/2),size,size);
    }else{
      g.drawImage(icons.get(r.id),Math.floor((canvas.width-128)/2),Math.floor((canvas.height-128)/2),128,128);
    }
  }
  window.CraftingAnimation={prepare,draw,label:r=>style(r)[1],kind:r=>style(r)[0]};
})();
