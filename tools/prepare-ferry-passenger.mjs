/* Pack the generated sheet into crisp game-sized cells; retain the source art. */
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
// Preserve the original front poses; use the targeted hand correction behind.
const sources=await Promise.all(['corin-seated-source.png','corin-seated-rear-source.png'].map(async name=>{
 const source=await loadImage('assets/ferry/'+name),full=createCanvas(source.width,source.height),fg=full.getContext('2d');
 fg.drawImage(source,0,0);return {source,pixels:fg.getImageData(0,0,full.width,full.height)};
}));
const out=createCanvas(64,96),g=out.getContext('2d');g.imageSmoothingEnabled=false;
const hair=[0x211a1c,0x2b2023,0x3b2c33,0x4d3945,0x684f5a,0x876c7d].map(v=>[v>>16,(v>>8)&255,v&255]);
for(let row=0;row<3;row++)for(let col=0;col<2;col++){
 const {source,pixels}=sources[col];
 const left=col*source.width/2,top=row*source.height/3,w=source.width/2,h=source.height/3;
 let x0=w,y0=h,x1=0,y1=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels.data[((top+y)*source.width+left+x)*4+3]>=220){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const height=21,width=Math.round((x1-x0+1)/(y1-y0+1)*height);
 g.drawImage(source,left+x0,top+y0,x1-x0+1,y1-y0+1,col*32+Math.floor((32-width)/2),row*32+6,width,height);
}
const packed=g.getImageData(0,0,64,96),d=packed.data;
for(let y=0;y<96;y++)for(let x=0;x<64;x++){
 const i=(y*64+x)*4;
 if(d[i+3]<220){d[i]=d[i+1]=d[i+2]=d[i+3]=0;continue;}d[i+3]=255;
 // Match the existing exact hair ramp, within the head only. This allows
 // the same identity recolorer to change hair without touching trousers.
 const [r,bg,b]=d.slice(i,i+3);
 if(y%32<19&&r>20&&bg<r*.90&&b>r*.80&&b<r*1.25){
  const p=hair.reduce((a,c)=>c.reduce((s,n,k)=>s+(n-d[i+k])**2,0)<a.reduce((s,n,k)=>s+(n-d[i+k])**2,0)?c:a);
  d.set(p,i);
 }
}
g.putImageData(packed,0,0);fs.writeFileSync('assets/ferry/corin-seated.png',out.toBuffer('image/png'));
console.log('Packed six 32×32 seated poses with hard alpha and the shared hair palette.');
