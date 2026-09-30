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
  // Generated sheets have consistent pose order, but not exact grid gutters.
  // Find each complete connected silhouette before arranging the runtime grid.
  const width=im.width,height=im.height,seen=new Uint8Array(width*height),poses=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const start=y*width+x;if(seen[start]||raw[start*4+3]<180)continue;
   const component=[start];seen[start]=1;let l=x,t=y,r=x,b=y;
   for(let at=0;at<component.length;at++){
    const q=component[at],qx=q%width,qy=Math.floor(q/width);
    l=Math.min(l,qx);r=Math.max(r,qx);t=Math.min(t,qy);b=Math.max(b,qy);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     const nx=qx+dx,ny=qy+dy,n=ny*width+nx;
     if(nx<0||nx>=width||ny<0||ny>=height||seen[n]||raw[n*4+3]<180)continue;
     seen[n]=1;component.push(n);
    }
   }
   if(component.length>=1000)poses.push({box:[l,t,r-l+1,b-t+1],pixels:component});
  }
  if(poses.length!==40)throw Error('Expected 40 complete poses, found '+poses.length);
  poses.sort((a,b)=>a.box[1]-b.box[1]);
  const boxes=[],ordered=[];let at=0;
  for(let row=0;row<8;row++){
   const count=row<4?4:6,line=poses.slice(at,at+count).sort((a,b)=>a.box[0]-b.box[0]);at+=count;
   boxes.push(line.map(p=>p.box));ordered.push(...line);
  }
  // Isolate only the selected silhouettes, preserving every boot and hem pixel.
  const kept=new Uint8Array(width*height);
  for(const pose of ordered)for(const pixel of pose.pixels)kept[pixel]=1;
  for(let i=0;i<kept.length;i++)if(!kept[i])raw[i*4+3]=0;
  g.putImageData(new ImageData(raw,width,height),0,0);
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
