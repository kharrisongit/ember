/* Compile the approved moth and projectile sheets without cutting at nominal
   grid lines: a complete connected wing/antenna belongs to its owning pose. */
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {createCanvas,loadImage}=require(root?root+'/@napi-rs/canvas':'@napi-rs/canvas');
const sharp=require(root?root+'/sharp':'sharp');
const dir='assets/sprites/ice-moth/';
const metadata={cell:144,height:144,foot:112,scale:.55,rows:['idle','fly','gust','shards','hurt','death'],directions:{}};

async function split(file,rows,minArea){
  const image=await loadImage(dir+'source/'+file+'.png'),c=createCanvas(image.width,image.height),g=c.getContext('2d');
  g.drawImage(image,0,0);const im=g.getImageData(0,0,c.width,c.height),p=im.data;
  const w=c.width,h=c.height,seen=new Uint8Array(w*h),cells=Array.from({length:rows},()=>Array.from({length:6},()=>[]));
  for(let i=0;i<w*h;i++){if(p[i*4+3]<190)p.fill(0,i*4,i*4+4);else p[i*4+3]=255;}
  for(let i=0;i<w*h;i++){
    if(seen[i]||!p[i*4+3])continue;
    const pixels=[i];seen[i]=1;let l=w,t=h,r=0,b=0,sx=0,sy=0;
    for(let j=0;j<pixels.length;j++){
      const at=pixels[j],x=at%w,y=Math.floor(at/w);l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);sx+=x;sy+=y;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const xx=x+dx,yy=y+dy,n=yy*w+xx;
        if(xx<0||yy<0||xx>=w||yy>=h||seen[n]||!p[n*4+3])continue;
        seen[n]=1;pixels.push(n);
      }
    }
    if(pixels.length<minArea)continue;
    const row=Math.min(rows-1,Math.floor(sy/pixels.length/h*rows));
    let col=Math.min(5,Math.floor(sx/pixels.length/w*6));
    // The middle crystal of the approved east volley crosses the nominal
    // fourth-cell boundary; retain that whole crystal with its casting pose.
    if(file==='east'&&row===3&&col===4&&pixels.length<1200&&l<855)col=3;
    cells[row][col].push({pixels,l,t,r:r+1,b:b+1});
  }
  for(const row of cells)for(const cell of row)cell.sort((a,b)=>b.pixels.length-a.pixels.length);
  return {cells,p,w,h};
}
function extract(source,groups){
  if(!groups.length)throw Error('Missing frame');
  const l=Math.min(...groups.map(v=>v.l)),t=Math.min(...groups.map(v=>v.t)),r=Math.max(...groups.map(v=>v.r)),b=Math.max(...groups.map(v=>v.b));
  const c=createCanvas(r-l,b-t),g=c.getContext('2d'),im=g.createImageData(c.width,c.height);
  for(const group of groups)for(const at of group.pixels){
    const x=at%source.w-l,y=Math.floor(at/source.w)-t,n=(y*c.width+x)*4;
    im.data.set(source.p.subarray(at*4,at*4+4),n);
  }
  g.putImageData(im,0,0);return {c,l,t,r,b};
}
function drawFrame(g,frame,anchor,scale,col,row,width,height,foot){
  const x=Math.round(width/2+(frame.l-anchor[0])*scale),y=Math.round(foot+(frame.t-anchor[1])*scale);
  const w=Math.round(frame.c.width*scale),h=Math.round(frame.c.height*scale);
  if(x<4||y<4||x+w>width-4||y+h>height-4)throw Error(`Unsafe crop ${col},${row}: ${[x,y,w,h]}`);
  g.drawImage(frame.c,col*width+x,row*height+y,w,h);
  return {source:[frame.l,frame.t,frame.r-frame.l,frame.b-frame.t],anchor,packed:[x,y,w,h]};
}
for(const name of ['south','east','north']){
  const source=await split(name,6,24),out=createCanvas(864,864),g=out.getContext('2d');g.imageSmoothingEnabled=false;
  const records=[];
  for(let row=0;row<6;row++){
    const baseline=[0,1,2,5].map(col=>source.cells[row][col][0].b).sort((a,b)=>a-b);
    const foot=(baseline[1]+baseline[2])/2;records[row]=[];
    for(let col=0;col<6;col++){
      const groups=source.cells[row][col],main=groups[0];
      // Retain separated projectiles and ice highlights near this pose, but
      // discard distant loose speckles from the generated transparent gutters.
      const kept=groups.filter(v=>v.r>=main.l-40&&v.l<=main.r+40&&v.b>=main.t-50&&v.t<=main.b+50);
      const frame=extract(source,kept),anchor=[130+201*col,foot];
      records[row][col]=drawFrame(g,frame,anchor,.55,col,row,144,144,112);
    }
  }
  await sharp(out.toBuffer('image/png')).png({palette:true,colours:48,dither:0}).toFile(dir+name+'-packed.png');
  metadata.directions[name]=records;
}
const source=await split('projectiles',4,8),out=createCanvas(96*6,96*4),g=out.getContext('2d');g.imageSmoothingEnabled=false;
metadata.projectiles={cell:96,rows:['gust','gustImpact','shard','shardImpact'],frames:[]};
for(let row=0;row<4;row++){
  metadata.projectiles.frames[row]=[];
  for(let col=0;col<6;col++){
    const groups=source.cells[row][col],frame=extract(source,groups),main=groups[0];
    const anchor=row%2===0?[(main.l+main.r)/2,(main.t+main.b)/2]:[(frame.l+frame.r)/2,(frame.t+frame.b)/2];
    metadata.projectiles.frames[row][col]=drawFrame(g,frame,anchor,.30,col,row,96,96,48);
  }
}
await sharp(out.toBuffer('image/png')).png({palette:true,colours:48,dither:0}).toFile(dir+'projectiles-packed.png');
fs.writeFileSync(dir+'frames.json',JSON.stringify(metadata)+'\n');
console.log('Packed 108 moth poses and 24 projectile/impact frames with safe transparent margins.');
