/* Layered generated art: continuous tools, palette-specific contents, blended fire. */
(() => {
  const sheets=new Map(),palettes=new Map(),icons=new Map(),SIZE=192;
  const assets={
    brew:{file:'brew-base-v2',columns:4,frames:16,fps:16,blend:true},
    powder:{file:'powder-base-v2',columns:4,frames:16,fps:16,blend:true},
    bell:{file:'bell-v2',columns:4,frames:16,fps:16},
    marker:{file:'marker-base-v2',columns:1,frames:1,fps:0},
    crystal:{file:'crystal',columns:3,frames:9,fps:8},
    food:{file:'food-v2',columns:4,frames:16,fps:16,blend:true},
    fish:{file:'fish-v2',columns:4,frames:16,fps:16,blend:true}
  };
  const styles={
    potion:['brew','Stirring the potion…'],elixir:['brew','Mixing the elixir…'],
    bomb:['brew','Brewing Maelis’s Curse…'],saint:['brew','Mixing Saint’s Breath…'],
    dust:['powder','Grinding the powder…'],salt:['powder','Grinding the consecration…'],
    bell:['bell','Hammering the bell stake…'],mark:['marker','Chiseling the grave marker…'],
    stone:['crystal','Enchanting the stone…']
  };
  // Hue, saturation multiplier, brightness floor. Only the magenta ingredient
  // layer changes; tools, containers, neutral steam and orange fire retain their art.
  const colors={potion:[350,.90,0],elixir:[40,.94,0],bomb:[120,.82,0],saint:[182,.38,.10],dust:[287,.80,0],salt:[43,.12,.40]};
  const style=r=>styles[r.id]||(r.raw==='dragonFish'?['fish','Baking the fish…']:['food','Roasting the meat…']);
  function canvas(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  let blendCanvas=null;
  function load(file){
    if(!sheets.has(file)){
      const img=new Image();img.decoding='async';sheets.set(file,img);
      img.src='assets/crafting/animations/'+file+'.webp?v=20261006-smooth-colors';
    }
    return sheets.get(file);
  }
  function prepare(r){
    const kind=style(r)[0];load(assets[kind].file);
    if(['brew','powder','marker'].includes(kind))load('tools-v2');
    if(!icons.has(r.id)){
      const icon=canvas(128);drawBagIcon(icon,BAG.find(i=>i.key===r.id)?.icon?.(),0);icons.set(r.id,icon);
    }
  }
  function colored(sheet,id){
    if(!colors[id])return sheet;
    if(palettes.has(id))return palettes.get(id);
    const output=canvas(sheet.naturalWidth,sheet.naturalHeight),g=output.getContext('2d',{willReadFrequently:true});
    g.drawImage(sheet,0,0);const data=g.getImageData(0,0,output.width,output.height),p=data.data;
    const [hue,saturation,floor]=colors[id],h=hue/60,x=1-Math.abs(h%2-1);
    const rgb=h<1?[1,x,0]:h<2?[x,1,0]:h<3?[0,1,x]:h<4?[0,x,1]:h<5?[x,0,1]:[1,0,x];
    for(let i=0;i<p.length;i+=4){
      const red=p[i],green=p[i+1],blue=p[i+2];
      if(!p[i+3]||Math.min(red,blue)-green<8||red<green*1.08||blue<green*1.08)continue;
      const max=Math.max(red,green,blue)/255,min=Math.min(red,green,blue)/255;
      const value=floor+(1-floor)*max,s=max?(max-min)/max*saturation:0,chroma=value*s,m=value-chroma;
      for(let k=0;k<3;k++)p[i+k]=Math.round((rgb[k]*chroma+m)*255);
    }
    g.putImageData(data,0,0);palettes.set(id,output);return output;
  }
  function frame(g,sheet,spec,index){
    g.drawImage(sheet,index%spec.columns*SIZE,Math.floor(index/spec.columns)*SIZE,SIZE,SIZE,0,0,SIZE,SIZE);
  }
  function background(g,sheet,spec,time){
    const position=time*spec.fps,index=Math.floor(position)%spec.frames,mix=position%1;
    if(!spec.blend||!mix){frame(g,sheet,spec,index);return;}
    if(!blendCanvas)blendCanvas=canvas(SIZE);
    const b=blendCanvas.getContext('2d');b.clearRect(0,0,SIZE,SIZE);b.imageSmoothingEnabled=false;
    // Add premultiplied frames for a true dissolve; source-over would dim edges.
    b.globalCompositeOperation='source-over';b.globalAlpha=1-mix;frame(b,sheet,spec,index);
    b.globalCompositeOperation='lighter';b.globalAlpha=mix;frame(b,sheet,spec,(index+1)%spec.frames);
    b.globalAlpha=1;b.globalCompositeOperation='source-over';g.drawImage(blendCanvas,0,0);
  }
  function tool(g,image,index,x,y,anchorX,anchorY,scale,angle=0){
    g.save();g.translate(x,y);g.rotate(angle);g.scale(scale,scale);
    g.drawImage(image,index*128,0,128,128,-anchorX,-anchorY,128,128);g.restore();
  }
  const ease=x=>x*x*(3-2*x);
  function draw(canvas,r,age){
    prepare(r);const g=canvas.getContext('2d'),kind=style(r)[0],spec=assets[kind],image=sheets.get(spec.file);
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const t=reduced?0:Math.max(0,Number.isFinite(age)?age:0);
    g.clearRect(0,0,canvas.width,canvas.height);g.imageSmoothingEnabled=false;
    if(!image.complete||!image.naturalWidth){
      g.drawImage(icons.get(r.id),(canvas.width-128)/2,(canvas.height-128)/2,128,128);return;
    }
    g.save();const scale=Math.min(canvas.width,canvas.height)/SIZE;
    g.translate((canvas.width-SIZE*scale)/2,(canvas.height-SIZE*scale)/2);g.scale(scale,scale);
    const sheet=colored(image,r.id);
    if(kind==='marker')g.drawImage(sheet,0,0,SIZE,SIZE,-48,-25,221,221);
    else background(g,sheet,spec,t);
    const tools=sheets.get('tools-v2');
    if(tools?.complete&&tools.naturalWidth){
      if(kind==='brew'){
        const phase=t*Math.PI*2/1.35;
        tool(g,tools,0,96+Math.cos(phase)*13,86+Math.sin(phase)*5,64,116,.70,Math.sin(phase)*.18-.12);
      }else if(kind==='powder'){
        const phase=t%1;
        // Raise slowly, descend into contact at 0.5s, then settle; aligns with the puff.
        const lift=phase<.30?ease(phase/.30)*22:phase<.50?(1-ease((phase-.30)/.20))*22:phase<.65?Math.sin((phase-.50)/.15*Math.PI)*3:0;
        tool(g,tools,1,96,98-lift,64,116,.66);
      }else if(kind==='marker'){
        const phase=t%1.05/1.05;
        const lift=phase<.42?(1-ease(phase/.42))*22:phase<.52?0:ease((phase-.52)/.48)*22;
        // The mallet's lower-left striking face meets the exposed chisel cap.
        // Both contact coordinates are measured from the packed generated layers.
        tool(g,tools,2,135+lift*.66,76-lift*.75,18,104,.40);
      }
    }
    g.restore();
  }
  window.CraftingAnimation={prepare,draw,label:r=>style(r)[1],kind:r=>style(r)[0]};
})();
