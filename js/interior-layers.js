/* Household furniture layers: recover original i* sprites from baked room paintings. */
(()=>{
const STRUCT=/^(?:house|room|floor|wall|roof|door|stair|window|ground|terrain|water|shore|cliff|path|road|bridge|fence|swall|white|pale|sett|rail|mtn|npc|pc_|player|corin|dr\d|ride_|sm_|fm_|sd_|kg_|br_|lg_|it_|temple|first_temple|scientist|dragon7|wall7|wall8|flame7|royal_|school|school2|library_|witchmoor)/;
function furnitureNames(rw,rh){return Object.keys(SPR).filter(n=>{const s=SPR[n];if(!s||!Array.isArray(s)||s.length<4||STRUCT.test(n))return false;const w=s[2],h=s[3],frames=s[4]||1;if(frames!==1||w<4||h<4||w>rw*.75||h>rh*.75)return false;return true})}
function fc(n){const s=SPR[n];if(!s)return null;const c=document.createElement("canvas");c.width=s[2];c.height=s[3];const g=c.getContext("2d",{willReadFrequently:true});g.imageSmoothingEnabled=false;drawGameImage(g,atlasImg,s[0],s[1],s[2],s[3],0,0,s[2],s[3]);return c}
function match(rd,rw,rh,sd,sw,sh,x0,y0){if(x0<0||y0<0||x0+sw>rw||y0+sh>rh)return 0;let h=0,g=0,st=Math.max(1,Math.floor(Math.min(sw,sh)/7));for(let y=0;y<sh;y+=st)for(let x=0;x<sw;x+=st){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;h++;let ri=((y0+y)*rw+x0+x)*4,d=Math.abs(rd[ri]-sd[si])+Math.abs(rd[ri+1]-sd[si+1])+Math.abs(rd[ri+2]-sd[si+2]);if(d<28)g++}if(h<3||g/h<.72)return 0;h=g=0;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;h++;let ri=((y0+y)*rw+x0+x)*4,d=Math.abs(rd[ri]-sd[si])+Math.abs(rd[ri+1]-sd[si+1])+Math.abs(rd[ri+2]-sd[si+2]);if(d<36)g++}return h>8?g/h:0}
function erase(base,rw,rh,sd,sw,sh,x0,y0){const src=new Uint8ClampedArray(base.data),out=base.data;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;let rx=x0+x,ry=y0+y;if(rx<1||ry<1||rx>=rw-1||ry>=rh-1)continue;let b=-1;for(let d=1;d<=Math.max(sw,sh)+4&&b<0;d++)for(const xx of [rx-d,rx+d])if(xx>=0&&xx<rw){let lx=xx-x0,ly=ry-y0;if(lx<0||ly<0||lx>=sw||ly>=sh||sd[(ly*sw+lx)*4+3]<80){b=(ry*rw+xx)*4;break}}if(b<0)for(let d=1;d<=Math.max(sw,sh)+4&&b<0;d++)for(const yy of [ry-d,ry+d])if(yy>=0&&yy<rh){let lx=rx-x0,ly=yy-y0;if(lx<0||ly<0||lx>=sw||ly>=sh||sd[(ly*sw+lx)*4+3]<80){b=(yy*rw+rx)*4;break}}if(b>=0){let oi=(ry*rw+rx)*4;out[oi]=src[b];out[oi+1]=src[b+1];out[oi+2]=src[b+2];out[oi+3]=src[b+3]}}}
function prep(){
 /* Convert every collision-backed painted furnishing in houses into one independent crop actor.
    This is exhaustive with respect to roomBlocks and does not need to know the prop's sprite name. */
 for(const [id,m] of Object.entries(W.maps||{})){
  if(!m.roomArt||!/^house\\d+(?:_bedroom\\d*)?$/.test(id))continue;
  const rs=SPR[m.roomArt];if(!rs)continue;
  const rw=rs[2],rh=rs[3],room=document.createElement("canvas");room.width=rw;room.height=rh;
  const rg=room.getContext("2d",{willReadFrequently:true});rg.imageSmoothingEnabled=false;
  drawGameImage(rg,atlasImg,rs[0],rs[1],rw,rh,0,0,rw,rh);
  m.roomActors||=[];m.roomBlocks||=[];
  const actors=m.roomActors, blocks=m.roomBlocks;
  for(let i=0;i<blocks.length;i++){
   const b=blocks[i]; if(!b||b.length<4)continue;
   const [l,t,r,bot]=b, bw=r-l,bh=bot-t;
   /* structural perimeter / doorway strips stay structural */
   if(bw>=rw*.72||bh>=rh*.72||l<=2||r>=rw-2||t<=2||bot>=rh-2)continue;
   /* If an explicit actor already owns this block, don't duplicate it. */
   if(actors.some(a=>a.spr&&!a.editorDeleted&&Math.abs(a.x-(l+r)/2)<=Math.max(10,bw/2)&&Math.abs((a.y||0)-bot)<=Math.max(12,bh)))continue;
   const padX=Math.max(3,Math.min(14,Math.round(bw*.18))), padTop=Math.max(8,Math.min(30,Math.round(bh*.9)));
   const x0=Math.max(0,Math.floor(l-padX)), y0=Math.max(0,Math.floor(t-padTop));
   const x1=Math.min(rw,Math.ceil(r+padX)), y1=Math.min(rh,Math.ceil(bot+3));
   const key="furniture:block:"+i+":"+x0+":"+y0+":"+x1+":"+y1;
   actors.push({roomCrop:[x0,y0,x1-x0,y1-y0],editKey:key,x:(x0+x1)/2,y:y1,sy:y1,schoolArt:true,interiorFurniture:true,moveBlocks:[i],sourceBlock:i});
  }
  m._layeredFurniture=true;
 }
}
const ready=atlasImg.onload;atlasImg.onload=()=>{try{prep()}catch(e){console.error("interior layer prep failed",e)}if(typeof ready==="function")ready.call(atlasImg)};
const rc=renderChunk;renderChunk=function(cx,cy){if((MAPID==="witchmoor"||MD.roomArt)&&MD._roomBaseCanvas){const c=document.createElement("canvas");c.width=CHUNK;c.height=CHUNK;const g=c.getContext("2d");g.imageSmoothingEnabled=false;g.fillStyle=MD.bg;g.fillRect(0,0,CHUNK,CHUNK);g.drawImage(MD._roomBaseCanvas,-cx*CHUNK,-cy*CHUNK);return c}return rc(cx,cy)};
try{localStorage.removeItem("emberfell.actor-layout.v1")}catch(e){};for(const k of Object.keys(actorLayouts))delete actorLayouts[k];
moveEditorActor=function(o,x,y,save=false){const info=editorActorInfo(o);if(!info)return false;x=Math.max(0,Math.min(PXW,x));y=Math.max(0,Math.min(PXH,y));if(info.kind==="npc"){shiftActorData(MD,info.source,x,y,false);o.x=x;o.y=y;o.px=x;o.py=y;o.goto=null;o.restUntil=Date.now()+5000;for(const k of ["talkX","talkY","patrol","sy"])o[k]=info.source[k]}else shiftActorData(MD,o,x,y,true);if(save)(actorLayouts[MAPID]||={})[info.key]={x,y};rebuildSolid();mapDirty=true;return true};
const remove=()=>{if(!selected||!selected.interiorFurniture)return false;const info=editorActorInfo(selected);if(!info)return false;selected.editorDeleted=true;(actorLayouts[MAPID]||={})[info.key]={x:selected.x,y:selected.y,deleted:true};selected=null;dragObj=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return true};
for(const id of ["nDel","xdel"]){const e=document.getElementById(id);if(e)for(const ev of ["click","touchstart"])e.addEventListener(ev,x=>{if((id!=="xdel"||editing)&&remove()){x.preventDefault();x.stopImmediatePropagation()}},true)}
const reset=document.getElementById("bReset");if(reset)for(const ev of ["click","touchstart"])reset.addEventListener(ev,()=>{if(typeof resetArmed!=="undefined"&&resetArmed)delete actorLayouts[MAPID]},true);
})();