/* Compile approved source sheets into foot-anchored engine atlases.
   Usage: node tools/pack-frosthorn.mjs /path/to/original-sheets
   Requires @napi-rs/canvas and sharp; original filenames: south/east/north/ice-spikes.png. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas');
const sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp':'sharp');
const input=process.argv[2];if(!input)throw Error('Supply the source-sheet directory');
const output='assets/sprites/frosthorn/',CELL=128,HEIGHT=112,FOOT=104;
const document={createElement:()=>createCanvas(1,1)};
const manifest=JSON.parse(fs.readFileSync(output+'frames.json','utf8'));
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function hardAlpha(c){
    const g=c.getContext('2d',{willReadFrequently:true}),im=g.getImageData(0,0,c.width,c.height),p=im.data;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<190)p.fill(0,i,i+4);else p[i+3]=255;}
    g.putImageData(im,0,0);c.pixelLocked=true;return c;
  }
  function cell(source,row,col,rows,box){
    const x=box?.[0]??Math.round(col*source.width/6),x1=box?x+box[2]:Math.round((col+1)*source.width/6);
    const y=box?.[1]??Math.round(row*source.height/rows),y1=box?y+box[3]:Math.round((row+1)*source.height/rows);
    const c=canvas(x1-x,y1-y),g=c.getContext('2d',{willReadFrequently:true});
    g.drawImage(source,x,y,c.width,c.height,0,0,c.width,c.height);
    for(const [l,t,r,b]of box?.[4]||[])g.clearRect(l-x,t-y,r-l,b-t);
    hardAlpha(c);
    // Keep the central actor; reject disconnected fragments of adjacent poses.
    if(rows===7){
      const im=g.getImageData(0,0,c.width,c.height),p=im.data,seen=new Uint8Array(c.width*c.height);
      let largest=[];
      for(let q=0;q<seen.length;q++){
        if(seen[q]||!p[q*4+3])continue;
        const group=[q];seen[q]=1;
        for(let at=0;at<group.length;at++){
          const v=group[at],vx=v%c.width,vy=Math.floor(v/c.width);
          for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){
            const xx=vx+dx,yy=vy+dy,n=yy*c.width+xx;
            if(xx<0||yy<0||xx>=c.width||yy>=c.height||seen[n]||!p[n*4+3])continue;
            seen[n]=1;group.push(n);
          }
        }
        if(group.length>largest.length)largest=group;
      }
      const keep=new Uint8Array(seen.length);for(const q of largest)keep[q]=1;
      for(let q=0;q<keep.length;q++)if(!keep[q])p.fill(0,q*4,q*4+4);
      g.putImageData(im,0,0);
    }
    return c;
  }
  function pack(c,scale,w=CELL,h=HEIGHT,foot=FOOT){
    const out=canvas(w,h),g=out.getContext('2d');g.imageSmoothingEnabled=false;
    const dw=Math.round(c.width*scale),dh=Math.round(c.height*scale);
    g.drawImage(c,0,0,c.width,c.height,Math.round((w-dw)/2),foot-dh,dw,dh);
    return hardAlpha(out);
  }

for(const name of ['south','east','north']){
 const source=await loadImage(path.join(input,name+'.png'));
 const scale=88/manifest[name][0].map(b=>b[3]).sort((a,b)=>a-b)[2];
 const atlas=canvas(CELL*6,HEIGHT*7),g=atlas.getContext('2d');
 for(let row=0;row<7;row++)for(let col=0;col<6;col++)g.drawImage(pack(cell(source,row,col,7,manifest[name][row][col]),scale),col*CELL,row*HEIGHT);
 await sharp(atlas.toBuffer('image/png')).png({palette:true,colours:32,dither:0}).toFile(output+name+'-packed.png');
}
const ice=await loadImage(path.join(input,'ice-spikes.png')),atlas=canvas(72*6,72*2),g=atlas.getContext('2d');
for(let row=0;row<2;row++)for(let col=0;col<6;col++)g.drawImage(pack(cell(ice,row,col,2),60/(ice.height/2),72,72,68),col*72,row*72);
await sharp(atlas.toBuffer('image/png')).png({palette:true,colours:32,dither:0}).toFile(output+'ice-spikes-packed.png');
console.log('Compiled Frosthorn: three directional atlases and 12 ice eruption frames.');
