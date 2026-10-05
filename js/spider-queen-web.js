/* Generated silk/net and consuming-fire poses, packed once for crisp game pixels. */
const SpiderQueenWeb=(()=>{
  const SIZE=96,frames=[],shapes=[];let loading=null;
  async function sheet(file,rows,output){
    const source=await loadStartupImage('assets/sprites/spider-queen/'+file+'?v=20260930-web2');
    const matte=document.createElement('canvas');matte.width=source.width;matte.height=source.height;
    const mg=matte.getContext('2d',{willReadFrequently:true});mg.drawImage(source,0,0);
    const raw=mg.getImageData(0,0,matte.width,matte.height),rgba=raw.data;
    // Remove the generated translucent matte while retaining silk and flame pixels.
    for(let i=0;i<rgba.length;i+=4){
      const r=rgba[i],g=rgba[i+1],b=rgba[i+2],a=rgba[i+3],silk=r>185&&g>180&&b>145,fire=r>195&&g>60&&r>b*1.4&&g>b*1.15;
      if(a<120||!silk&&!fire){rgba.fill(0,i,i+4);continue;}
      rgba[i]=silk?233:g>125?255:233;rgba[i+1]=silk?231:g>200?227:g>125?164:85;
      rgba[i+2]=silk?212:g>200?115:g>125?49:34;rgba[i+3]=255;
    }
    mg.putImageData(raw,0,0);
    for(let row=0;row<rows;row++)for(let col=0;col<4;col++){
      const c=document.createElement('canvas');c.width=SIZE;c.height=SIZE;c.pixelLocked=true;
      const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      const x=Math.round(col*source.width/4),y=Math.round(row*source.height/rows);
      const w=Math.round((col+1)*source.width/4)-x,h=Math.round((row+1)*source.height/rows)-y;
      g.drawImage(matte,x,y,w,h,2,2,SIZE-4,SIZE-4);
      const im=g.getImageData(0,0,SIZE,SIZE),p=im.data;
      for(let i=0;i<p.length;i+=4){if(p[i+3]<90)p.fill(0,i,i+4);else p[i+3]=255;}
      g.putImageData(im,0,0);output.push(c);
    }
  }
  function ensureArt(){return loading||(loading=Promise.all([
    sheet('web-effects-v2.png',4,frames),sheet('web-shapes-v2.png',5,shapes)
  ]).catch(error=>{loading=null;frames.length=shapes.length=0;throw error;}));}
  function frame(phase,time,variant=0){
    if(!ready())return null;
    if(variant&&phase!=='casting'){
      const row=phase==='burning'?1+Math.min(3,Math.floor(Math.max(0,time)/1.1*4)):0;
      return shapes[row*4+(variant-1)%4];
    }
    const index=phase==='casting'?Math.min(3,Math.floor(Math.max(0,time)*4))
      :phase==='burning'?8+Math.min(7,Math.floor(Math.max(0,time)/1.1*8))
      :4+Math.floor(time*3)%4;
    return frames[index];
  }
  function ready(){return frames.length===16&&shapes.length===20;}
  return {ensureArt,frame,ready};
})();
