/* One-shot circular story/game transitions. No work runs during gameplay. */
(()=>{
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function animate(draw,duration=1100){
    const ms=reduced()?80:duration;
    return new Promise(resolve=>{
      let start;
      draw(0);
      function frame(now){
        start??=now;
        const t=Math.min(1,(now-start)/ms),ease=t*t*(3-2*t);
        draw(ease);
        if(t<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  const bounds=el=>{
    const b=el.getBoundingClientRect();
    return {width:b.width,height:b.height,radius:Math.hypot(b.width,b.height)/2+2};
  };
  async function close(surface){
    // BOOT's solid black shade is already behind the full-screen story.
    await animate(t=>{surface.style.clipPath=`circle(${bounds(surface).radius*(1-t)}px at 50% 50%)`;});
  }
  async function reveal(shade){
    const ns='http://www.w3.org/2000/svg';
    const make=(tag,attrs)=>{
      const el=document.createElementNS(ns,tag);
      for(const [name,value] of Object.entries(attrs))el.setAttribute(name,value);
      return el;
    };
    const svg=make('svg',{'aria-hidden':'true',width:'100%',height:'100%'});
    svg.style.display='block';
    const defs=make('defs',{}),mask=make('mask',{id:'gameIrisMask',maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:0,y:0});
    mask.style.maskType='luminance';
    const white=make('rect',{x:0,y:0,fill:'white'}),hole=make('circle',{r:0,fill:'black'}),cover=make('rect',{x:0,y:0,fill:'black',mask:'url(#gameIrisMask)'});
    mask.append(white,hole);defs.append(mask);svg.append(defs,cover);shade.append(svg);
    shade.style.transition='none';shade.style.opacity='1';
    function paint(t){
      const {width,height,radius}=bounds(shade);
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
      for(const el of [mask,white,cover]){el.setAttribute('width',width);el.setAttribute('height',height);}
      hole.setAttribute('cx',width/2);hole.setAttribute('cy',height/2);hole.setAttribute('r',radius*t);
    }
    paint(0);shade.style.background='transparent';
    try{await animate(paint);}finally{
      // Hide before removing the mask, so its cleanup cannot flash black.
      shade.hidden=true;svg.remove();shade.style.background='#000';shade.style.opacity='0';
    }
  }
  window.EmberIris={close,reveal};
})();
