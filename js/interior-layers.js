/* Household furniture layers: recover original i* sprites from baked room paintings. */
(()=>{
const F=/^(?:ibed|ichair|ifire|ilamp|iplant|irug|ishelf|istove|itable)\d+$/;
function fc(n){const s=SPR[n];if(!s)return null;const c=document.createElement("canvas");c.width=s[2];c.height=s[3];const g=c.getContext("2d",{willReadFrequently:true});g.imageSmoothingEnabled=false;drawGameImage(g,atlasImg,s[0],s[1],s[2],s[3],0,0,s[2],s[3]);return c}
function match(rd,rw,rh,sd,sw,sh,x0,y0){if(x0<0||y0<0||x0+sw>rw||y0+sh>rh)return 0;let h=0,g=0,st=Math.max(1,Math.floor(Math.min(sw,sh)/7));for(let y=0;y<sh;y+=st)for(let x=0;x<sw;x+=st){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;h++;let ri=((y0+y)*rw+x0+x)*4,d=Math.abs(rd[ri]-sd[si])+Math.abs(rd[ri+1]-sd[si+1])+Math.abs(rd[ri+2]-sd[si+2]);if(d<28)g++}if(h<3||g/h<.72)return 0;h=g=0;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;h++;let ri=((y0+y)*rw+x0+x)*4,d=Math.abs(rd[ri]-sd[si])+Math.abs(rd[ri+1]-sd[si+1])+Math.abs(rd[ri+2]-sd[si+2]);if(d<36)g++}return h>8?g/h:0}
function erase(base,rw,rh,sd,sw,sh,x0,y0){const src=new Uint8ClampedArray(base.data),out=base.data;for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let si=(y*sw+x)*4;if(sd[si+3]<80)continue;let rx=x0+x,ry=y0+y;if(rx<1||ry<1||rx>=rw-1||ry>=rh-1)continue;let b=-1;for(let d=1;d<=Math.max(sw,sh)+4&&b<0;d++)for(const xx of [rx-d,rx+d])if(xx>=0&&xx<rw){let lx=xx-x0,ly=ry-y0;if(lx<0||ly<0||lx>=sw||ly>=sh||sd[(ly*sw+lx)*4+3]<80){b=(ry*rw+xx)*4;break}}if(b<0)for(let d=1;d<=Math.max(sw,sh)+4&&b<0;d++)for(const yy of [ry-d,ry+d])if(yy>=0&&yy<rh){let lx=rx-x0,ly=yy-y0;if(lx<0||ly<0||lx>=sw||ly>=sh||sd[(ly*sw+lx)*4+3]<80){b=(yy*rw+rx)*4;break}}if(b>=0){let oi=(ry*rw+rx)*4;out[oi]=src[b];out[oi+1]=src[b+1];out[oi+2]=src[b+2];out[oi+3]=src[b+3]}}}
function prep(){
 const names=Object.keys(SPR).filter(n=>F.test(n)),ss=new Map();
 for(const n of names){const c=fc(n);if(c)ss.set(n,c.getContext("2d",{willReadFrequently:true}).getImageData(0,0,c.width,c.height))}
 for(const [id,m] of Object.entries(W.maps||{})){
  if(!m.roomArt||!/^house\d+(?:_bedroom\d*)?$/.test(id))continue;
  const rs=SPR[m.roomArt];if(!rs)continue;const rw=rs[2],rh=rs[3],room=document.createElement("canvas");room.width=rw;room.height=rh;
  const rg=room.getContext("2d",{willReadFrequently:true});rg.imageSmoothingEnabled=false;drawGameImage(rg,atlasImg,rs[0],rs[1],rw,rh,0,0,rw,rh);
  const rd=rg.getImageData(0,0,rw,rh),found=[],occ=[];
  const add=(n,x,y,sc)=>{const s=SPR[n],key="furniture:"+n+":"+x+":"+y;if((m.roomActors||[]).some(a=>a.editKey===key))return;const a={spr:n,editKey:key,x:x+s[2]/2,y:y+s[3],sy:y+s[3],schoolArt:true,interiorFurniture:true,moveBlocks:[]};(m.roomBlocks||[]).forEach((b,i)=>{let cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;if(cx>=x&&cx<=x+s[2]&&cy>=y&&cy<=y+s[3])a.moveBlocks.push(i)});(m.roomActors||=[]).push(a);found.push({n,x,y,sc});occ.push([x,y,x+s[2],y+s[3]])};
  for(const b of m.roomBlocks||[]){let cx=(b[0]+b[2])/2,bot=b[3],best=null;for(const n of names){if(/^irug/.test(n))continue;let s=SPR[n],d=ss.get(n)?.data;if(!d)continue;for(let ox=-4;ox<=4;ox++)for(let oy=-5;oy<=5;oy++){let x=Math.round(cx-s[2]/2)+ox,y=Math.round(bot-s[3])+oy,sc=match(rd.data,rw,rh,d,s[2],s[3],x,y);if(sc>.72&&(!best||sc>best.sc))best={n,x,y,sc}}}if(best&&!occ.some(r=>best.x<r[2]&&best.x+SPR[best.n][2]>r[0]&&best.y<r[3]&&best.y+SPR[best.n][3]>r[1]))add(best.n,best.x,best.y,best.sc)}
  for(const n of names.filter(n=>/^irug/.test(n))){let s=SPR[n],d=ss.get(n)?.data;if(!d)continue;for(let y=40;y<=rh-s[3]-8;y+=2)for(let x=16;x<=rw-s[2]-16;x+=2){if(occ.some(r=>x<r[2]&&x+s[2]>r[0]&&y<r[3]&&y+s[3]>r[1]))continue;let sc=match(rd.data,rw,rh,d,s[2],s[3],x,y);if(sc>.96){add(n,x,y,sc);x+=s[2]-2}}}
  if(found.length){const clean=rg.getImageData(0,0,rw,rh);found.sort((a,b)=>SPR[b.n][2]*SPR[b.n][3]-SPR[a.n][2]*SPR[a.n][3]);for(const f of found){let s=SPR[f.n],d=ss.get(f.n).data;erase(clean,rw,rh,d,s[2],s[3],f.x,f.y)}rg.putImageData(clean,0,0);m._roomBaseCanvas=room;m._layeredFurniture=true}
 }
}
/* applyWorld deliberately strips roomCrop actors after using them for seated-NPC clipping.
   Run furniture extraction after that world patching is complete, not during atlas.onload. */
let _interiorPrepared=false;
function ensureInteriorLayers(){
 if(_interiorPrepared||!globalThis.W||!W.maps)return;
 _interiorPrepared=true;
 try{
  prep();
  let maps=0,actors=0;
  for(const m of Object.values(W.maps||{})){const n=(m.roomActors||[]).filter(a=>a.interiorFurniture).length;if(n){maps++;actors+=n}}
  globalThis.__interiorLayerDiag={prepared:true,maps,actors,atlas:[atlasImg.width,atlasImg.height]};
  console.log("INTERIOR LAYERS",globalThis.__interiorLayerDiag);
 }catch(e){
  _interiorPrepared=false;
  globalThis.__interiorLayerDiag={prepared:false,error:String(e&&e.stack||e)};
  console.error("interior layer prep failed",e);
 }
}
/* This companion is injected from audio.js while game.js is still executing.
   At that moment applyWorld may not exist yet, so neither wrapping it nor a zero-delay
   callback is reliable. Poll cheaply until BOTH the world and the editor functions exist,
   then prepare exactly once. */
(function waitForInteriorWorld(){
 if(_interiorPrepared)return;
 let state=[];
 try{state.push("W:"+(typeof W),typeof W!=="undefined"&&W?"maps:"+!!W.maps:"")}
 catch(e){state.push("WERR:"+e.name)}
 try{state.push("EA:"+(typeof editorActorInfo),"ME:"+(typeof moveEditorActor))}
 catch(e){state.push("EDERR:"+e.name)}
 try{state.push("AT:"+(typeof atlasImg),typeof atlasImg!=="undefined"&&atlasImg?("c:"+atlasImg.complete+",nw:"+atlasImg.naturalWidth+",w:"+atlasImg.width):"")}
 catch(e){state.push("ATERR:"+e.name)}
 globalThis.__interiorWaitState=state.join(" ");
 if(typeof W!=="undefined"&&W&&W.maps&&typeof editorActorInfo==="function"&&typeof moveEditorActor==="function"&&
    typeof atlasImg!=="undefined"&&atlasImg&&Number(atlasImg.width)>0){
  ensureInteriorLayers();return;
 }
 setTimeout(waitForInteriorWorld,250);
})();
/* Native editor integration for crop-backed furnishings.
   game.js pickEditorActor only accepts actors with editorSprite(), so teach that path
   about roomCrop dimensions instead of replacing the renderer/editor wholesale. */
const _editorSprite=editorSprite;
editorSprite=function(o){
 if(o&&o.roomCrop)return [0,0,o.roomCrop[2],o.roomCrop[3],1,0];
 return _editorSprite(o);
};
function updateInteriorBadge(){
 let el=document.getElementById("interiorDiagBadge");
 if(!el){el=document.createElement("div");el.id="interiorDiagBadge";el.style.cssText="position:fixed;left:8px;bottom:8px;z-index:99999;background:#111;color:#fff;padding:6px 8px;font:12px monospace;border:1px solid #fff;pointer-events:none";document.body.appendChild(el)}
 const here=(globalThis.MD?.roomActors||[]).filter(a=>a.interiorFurniture&&!a.editorDeleted).length,d=globalThis.__interiorLayerDiag||{};
 el.textContent="FURN "+here+" / "+(d.actors??"?")+" prep:"+(d.prepared===false?"ERR":d.prepared?"YES":"WAIT")+" "+(globalThis.__interiorWaitState||"")+(d.error?" "+d.error.slice(0,70):"");
}
setInterval(updateInteriorBadge,500);
/* Visible diagnostic: when MOVE is enabled inside a house, report generated layer count once.
   This tells us whether failure is generation or hit-testing, instead of guessing. */
let _diagMap="";
function reportInteriorDiag(){
 if(!globalThis.MAPID||MAPID===_diagMap||!/^house\d/.test(MAPID))return;
 _diagMap=MAPID;
 const n=(MD.roomActors||[]).filter(a=>a.interiorFurniture&&!a.editorDeleted).length;
 const d=globalThis.__interiorLayerDiag||{};
 toast("Furniture layers: "+n+" here / "+(d.actors??"?")+" total");
}
const _pickEditorActor=pickEditorActor;
pickEditorActor=function(wx,wy){
 reportInteriorDiag();
 let best=_pickEditorActor(wx,wy),area=Infinity;
 if(best){const s=editorSprite(best);if(s)area=s[2]*s[3]}
 for(const o of MD.roomActors||[]){
  if(o.editorDeleted||!o.roomCrop)continue;
  const q=o.roomCrop,w=q[2],h=q[3];
  if(wx<o.x-w/2||wx>o.x+w/2||wy<o.y-h||wy>o.y)continue;
  if(w*h<area){best=o;area=w*h}
 }
 return best;
};
/* game.js renders roomCrop at its ORIGINAL source x/y, which makes MOVE appear to do nothing.
   Keep the source rectangle fixed, but draw it at the actor's current editor position. */
function drawMovedRoomCrop(g,o){
 if(!o||!o.roomCrop||!MD?.roomArt)return false;
 const [sx,sy,w,h]=o.roomCrop,s=SPR[MD.roomArt];if(!s)return false;
 const dx=Math.round(o.x-w/2),dy=Math.round(o.y-h);
 drawGameImage(g,atlasImg,s[0]+sx,s[1]+sy,w,h,dx,dy,w,h);return true;
}
/* Patch the main room-actor draw loop at the lowest shared primitive: when game.js asks
   for the roomArt crop at its baked source destination, redirect only that exact crop draw. */
const _drawGameImage=drawGameImage;
drawGameImage=function(g,img,sx,sy,sw,sh,dx,dy,dw,dh,...rest){
 if(MD?.roomArt&&img===atlasImg){
  const rs=SPR[MD.roomArt];
  if(rs)for(const o of MD.roomActors||[]){
   if(!o.roomCrop||o.editorDeleted)continue;
   const q=o.roomCrop;
   if(sx===rs[0]+q[0]&&sy===rs[1]+q[1]&&sw===q[2]&&sh===q[3]&&dx===q[0]&&dy===q[1]){
    dx=Math.round(o.x-q[2]/2);dy=Math.round(o.y-q[3]);break;
   }
  }
 }
 return _drawGameImage(g,img,sx,sy,sw,sh,dx,dy,dw,dh,...rest);
};
const rc=renderChunk;renderChunk=function(cx,cy){if((MAPID==="witchmoor"||MD.roomArt)&&MD._roomBaseCanvas){const c=document.createElement("canvas");c.width=CHUNK;c.height=CHUNK;const g=c.getContext("2d");g.imageSmoothingEnabled=false;g.fillStyle=MD.bg;g.fillRect(0,0,CHUNK,CHUNK);g.drawImage(MD._roomBaseCanvas,-cx*CHUNK,-cy*CHUNK);return c}return rc(cx,cy)};
try{localStorage.removeItem("emberfell.actor-layout.v1")}catch(e){};for(const k of Object.keys(actorLayouts))delete actorLayouts[k];
moveEditorActor=function(o,x,y,save=false){const info=editorActorInfo(o);if(!info)return false;x=Math.max(0,Math.min(PXW,x));y=Math.max(0,Math.min(PXH,y));if(info.kind==="npc"){shiftActorData(MD,info.source,x,y,false);o.x=x;o.y=y;o.px=x;o.py=y;o.goto=null;o.restUntil=Date.now()+5000;for(const k of ["talkX","talkY","patrol","sy"])o[k]=info.source[k]}else shiftActorData(MD,o,x,y,true);if(save)(actorLayouts[MAPID]||={})[info.key]={x,y};rebuildSolid();mapDirty=true;return true};
const remove=()=>{if(!selected||!selected.interiorFurniture)return false;const info=editorActorInfo(selected);if(!info)return false;selected.editorDeleted=true;(actorLayouts[MAPID]||={})[info.key]={x:selected.x,y:selected.y,deleted:true};selected=null;dragObj=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return true};
for(const id of ["nDel","xdel"]){const e=document.getElementById(id);if(e)for(const ev of ["click","touchstart"])e.addEventListener(ev,x=>{if((id!=="xdel"||editing)&&remove()){x.preventDefault();x.stopImmediatePropagation()}},true)}
/* Furniture deletion: physically park its collision rectangles outside the map.
   isSolid() reads MD.roomBlocks directly, so rebuildSolid alone cannot hide them. */
function setFurnitureBlocksDeleted(m,o,deleted){
 for(const i of o.moveBlocks||[]){
  const b=m.roomBlocks?.[i];if(!b)continue;
  if(deleted){
   if(!b._furnitureHome)b._furnitureHome=b.slice(0,4);
   b[0]=b[1]=b[2]=b[3]=-99999;
  }else if(b._furnitureHome){
   for(let k=0;k<4;k++)b[k]=b._furnitureHome[k];
   delete b._furnitureHome;
  }
 }
}
const _deleteSelected=deleteSelected;
deleteSelected=function(){
 if(selected&&selected.interiorFurniture){
  const o=selected,info=editorActorInfo(o);if(!info)return;
  o.editorDeleted=true;setFurnitureBlocksDeleted(MD,o,true);
  (actorLayouts[MAPID]||={})[info.key]={x:o.x,y:o.y,deleted:true};
  selected=null;dragObj=null;rebuildSolid();mapDirty=true;refreshSel();refreshHandle();return;
 }
 return _deleteSelected();
};
const _applyActorLayout=applyActorLayout;
applyActorLayout=function(m,id){
 _applyActorLayout(m,id);
 const saved=actorLayouts[id]||{};
 for(const o of m.roomActors||[]){
  if(!o.interiorFurniture)continue;
  const key=o.editKey||'actor:'+(m.roomActors||[]).indexOf(o)+':'+o.spr,v=saved[key];
  o.editorDeleted=!!v?.deleted;setFurnitureBlocksDeleted(m,o,o.editorDeleted);
 }
};
/* Generated furniture is added after applyWorld, but loadMap immediately calls
   applyActorLayout. Reapply saved layouts after generation so exported ACTOR edits
   also work after refresh/map re-entry. */
const _ensureInteriorLayers=ensureInteriorLayers;
ensureInteriorLayers=function(){
 const was=_interiorPrepared;_ensureInteriorLayers();
 if(!was&&_interiorPrepared)for(const [id,m] of Object.entries(W.maps||{}))if(m._layeredFurniture)applyActorLayout(m,id);
};
/* RESET must truly discard actor edits before native loadMap() reapplies actorLayouts.
   Do this only on the confirmed second RESET tap. */
const reset=document.getElementById("bReset");
if(reset)reset.addEventListener("click",()=>{
 if(typeof resetArmed!=="undefined"&&resetArmed){
  delete actorLayouts[MAPID];
  try{localStorage.setItem("emberfell.actor-layout.v1",JSON.stringify(actorLayouts))}catch(e){}
  for(const o of MD.roomActors||[])if(o.interiorFurniture){o.editorDeleted=false;setFurnitureBlocksDeleted(MD,o,false)}
 }
},true);
})();