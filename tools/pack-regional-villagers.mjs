/* Register generated character sheets to the game's 2x pixel grid.
   Input is a JSON list with id and generatedPath. Source art remains untouched. */
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=await import(runtime?pathToFileURL(runtime+'/playwright/index.mjs').href:'playwright');
if(!process.argv[2])throw Error('Usage: node tools/pack-regional-villagers.mjs generated-cast.json [--replace]');
const specs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const browser=await chromium.launch({executablePath:process.env.EMBER_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process']});
try{
const page=await browser.newPage();const metadata=[];
for(const person of specs.filter(s=>s.generatedPath)){
 const target='assets/sprites/regional/'+person.id+'.png';
 if(fs.existsSync(target)&&!process.argv.includes('--replace'))continue;
 const result=await page.evaluate(async({src})=>{
  const im=new Image();im.src=src;await im.decode();
  const input=document.createElement('canvas');input.width=im.width;input.height=im.height;
  const g=input.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
  const raw=g.getImageData(0,0,im.width,im.height).data;
  const boxes=[];
  for(let row=0;row<8;row++){
   const line=[];
   for(let col=0;col<(row<4?4:6);col++){
    const x0=Math.floor(col*im.width/6),x1=Math.floor((col+1)*im.width/6);
    const y0=Math.floor(row*im.height/8),y1=Math.floor((row+1)*im.height/8),cw=x1-x0,ch=y1-y0;
    const seen=new Uint8Array(cw*ch);let largest=[];
    // A few generated cells include a detached sliver of the next pose.
    // Register the connected character, not that neighbouring frame fragment.
    for(let oy=0;oy<ch;oy++)for(let ox=0;ox<cw;ox++){
     const start=oy*cw+ox;if(seen[start]||raw[((y0+oy)*im.width+x0+ox)*4+3]<180)continue;
     const component=[start];seen[start]=1;
     for(let at=0;at<component.length;at++){
      const q=component[at],qx=q%cw,qy=Math.floor(q/cw);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
       const nx=qx+dx,ny=qy+dy,n=ny*cw+nx;
       if(nx<0||nx>=cw||ny<0||ny>=ch||seen[n]||raw[((y0+ny)*im.width+x0+nx)*4+3]<180)continue;
       seen[n]=1;component.push(n);
      }
     }
     if(component.length>largest.length)largest=component;
    }
    if(largest.length<100)throw Error('Missing frame '+row+'/'+col);
    const keep=new Set(largest);let l=im.width,t=im.height,r=-1,b=-1;
    for(let oy=0;oy<ch;oy++)for(let ox=0;ox<cw;ox++){
     const x=x0+ox,y=y0+oy;
     if(!keep.has(oy*cw+ox)){raw[(y*im.width+x)*4+3]=0;continue;}
     l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
    }
    line.push([l,t,r-l+1,b-t+1]);
   }
   boxes.push(line);
  }
  const isolated=new ImageData(raw,im.width,im.height);g.putImageData(isolated,0,0);
  const scale=54/Math.max(...boxes.flat().map(b=>b[3]));
  const out=document.createElement('canvas');out.width=384;out.height=512;
  const ctx=out.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
  for(let row=0;row<8;row++)for(let col=0;col<boxes[row].length;col++){
   const [x,y,w,h]=boxes[row][col],dw=Math.round(w*scale),dh=Math.round(h*scale);
   ctx.drawImage(input,x,y,w,h,col*64+Math.round((64-dw)/2),row*64+60-dh,dw,dh);
  }
  const pixels=ctx.getImageData(0,0,out.width,out.height);
  for(let i=0;i<pixels.data.length;i+=4){if(pixels.data[i+3]<180)pixels.data.fill(0,i,i+4);else pixels.data[i+3]=255;}
  ctx.putImageData(pixels,0,0);
  // Match the proven household/Hollybeck timing: fixed face and feet,
  // a one-pixel cloth inhale, then a brief blink at an individual phase.
  for(let row=0;row<4;row++){
   const neutral=ctx.getImageData(0,row*64,64,64),closed=ctx.getImageData(192,row*64,64,64);
   const eyes=row===0?[18,23,46,35]:row===2?[32,23,49,36]:[15,23,32,36];
   const tile=document.createElement('canvas');tile.width=64;tile.height=64;tile.getContext('2d').putImageData(neutral,0,0);
   for(let col=1;col<4;col++){
    ctx.putImageData(neutral,col*64,row*64);
    if(col===1){
     const top=37,bottom=53;ctx.clearRect(col*64,row*64+top,64,bottom-top);
     ctx.drawImage(tile,0,top+1,64,bottom-top-1,col*64,row*64+top,64,bottom-top-1);
     ctx.drawImage(tile,0,bottom-1,64,1,col*64,row*64+bottom-1,64,1);
    }else if(row!==1){
     // Both eyelids close together; never use an accidental generated wink.
     const patch=document.createElement('canvas');patch.width=64;patch.height=64;patch.getContext('2d').putImageData(closed,0,0);
     const [l,t,r,b]=eyes;ctx.clearRect(col*64+l,row*64+t,r-l,b-t);
     ctx.drawImage(patch,l,t,r-l,b-t,col*64+l,row*64+t,r-l,b-t);
    }
   }
  }
  // Walking changes the limbs, not the identity or blink cadence. Generated
  // sheets sometimes close one eye in every sixth step; retain the registered
  // neutral head and let the authored feet/arms perform the six-step cycle.
  for(let row=0;row<4;row++){
   const head=ctx.getImageData(0,row*64,64,37);
   for(let col=0;col<6;col++)ctx.putImageData(head,col*64,(row+4)*64);
  }
  return {data:out.toDataURL().split(',')[1],source:[im.width,im.height],boxes,scale};
 },{src:'data:image/png;base64,'+fs.readFileSync(person.generatedPath).toString('base64')});
 fs.writeFileSync(target,Buffer.from(result.data,'base64'));metadata.push({id:person.id,source:result.source,boxes:result.boxes,scale:result.scale});console.log('Packed',person.name);
}
const file='assets/sprites/regional/packing.json',old=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
fs.writeFileSync(file,JSON.stringify([...old.filter(o=>!metadata.some(m=>m.id===o.id)),...metadata],null,2)+'\n');
}finally{await browser.close();}
