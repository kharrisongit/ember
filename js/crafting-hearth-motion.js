/* Animate painted fire inside one coherent cauldron/hearth illustration.
   No generated frame swaps: the vessel, supports and fuel stay registered. */
(() => {
  function make({image,rect,fireRect,createCanvas}) {
    const scale=2,size=192*scale,base=createCanvas(size,size),g=base.getContext('2d');
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(image,...rect.map(v=>v*scale));
    const original=g.getImageData(0,0,size,size),source=original.data;
    const output=g.createImageData(size,size);output.data.set(source);
    const [left,top,right,bottom]=fireRect.map(v=>Math.round(v*scale));
    const width=right-left,height=bottom-top,seed=new Float32Array(width*height);
    const horizontal=new Float32Array(seed.length),mask=new Float32Array(seed.length);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const p=((y+top)*size+x+left)*4,r=source[p],green=source[p+1],b=source[p+2];
      seed[y*width+x]=source[p+3]>80&&r>175&&green>75&&r-b>65&&green-b>22?1:0;
    }
    // Feather the fire's own painted boundary, never shifting the entire hearth.
    const radius=2*scale;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      let sum=0;for(let k=-radius;k<=radius;k++)sum+=seed[y*width+Math.max(0,Math.min(width-1,x+k))];
      horizontal[y*width+x]=sum/(radius*2+1);
    }
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      let sum=0;for(let k=-radius;k<=radius;k++)sum+=horizontal[Math.max(0,Math.min(height-1,y+k))*width+x];
      const p=((y+top)*size+x+left)*4;
      const neutral=source[p+3]>180&&(source[p]<135||source[p]-source[p+2]<40);
      const edge=Math.min(1,x/(3*scale),(width-1-x)/(3*scale),y/(3*scale),(height-1-y)/(3*scale));
      mask[y*width+x]=neutral?0:Math.min(1,sum/(radius*2+1)*2.4)*Math.max(0,edge);
    }
    // Precompute the spatial waves and visit only active fire pixels. This avoids
    // per-pixel trigonometry and allocations in the phone's animation loop.
    const points=[];
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const strength=mask[y*width+x];if(strength===0)continue;
      const wx=(x+left)/scale,wy=(y+top)/scale;
      const a=-wy*.34+wx*.075,b=wy*.22,c=-wy*.39+wx*.09,d=wx*.11-wy*.08;
      points.push(x+left,y+top,strength,Math.cos(a),Math.sin(a),Math.cos(b),Math.sin(b),Math.cos(c),Math.sin(c),Math.cos(d),Math.sin(d),((y+top)*size+x+left)*4);
    }
    const active=new Float32Array(points);
    function draw(target,time) {
      const phase=time*Math.PI*2/5.2,pixels=output.data;
      const s5=Math.sin(phase*5),c5=Math.cos(phase*5),s3=Math.sin(phase*3),c3=Math.cos(phase*3);
      const s7=Math.sin(phase*7),c7=Math.cos(phase*7),s4=Math.sin(phase*4),c4=Math.cos(phase*4);
      for(let i=0;i<active.length;i+=12){
        const strength=active[i+2];
        const dx=strength*scale*(.8*(s5*active[i+3]+c5*active[i+4])+.25*(s3*active[i+5]+c3*active[i+6]));
        const dy=strength*scale*.7*(s7*active[i+7]+c7*active[i+8]);
        const sx=active[i]+dx,sy=active[i+1]+dy,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
        const destination=active[i+11],q=(iy*size+ix)*4;
        const q1=q+4,q2=q+size*4,q3=q2+4;
        const a0=source[q+3]*(1-fx)*(1-fy),a1=source[q1+3]*fx*(1-fy),a2=source[q2+3]*(1-fx)*fy,a3=source[q3+3]*fx*fy;
        const alpha=a0+a1+a2+a3;
        const red=source[q]*a0+source[q1]*a1+source[q2]*a2+source[q3]*a3;
        const green=source[q+1]*a0+source[q1+1]*a1+source[q2+1]*a2+source[q3+1]*a3;
        const blue=source[q+2]*a0+source[q1+2]*a1+source[q2+2]*a2+source[q3+2]*a3;
        // Premultiplied interpolation preserves the painted transparent edges.
        const light=1+strength*.045*(s4*active[i+9]+c4*active[i+10]);
        pixels[destination]=alpha?Math.min(255,red/alpha*light):0;
        pixels[destination+1]=alpha?Math.min(255,green/alpha*light):0;
        pixels[destination+2]=alpha?blue/alpha:0;pixels[destination+3]=alpha;
      }
      g.putImageData(output,0,0);target.drawImage(base,0,0,192,192);
    }
    return {draw};
  }
  globalThis.CraftingHearthMotion={make};
})();
