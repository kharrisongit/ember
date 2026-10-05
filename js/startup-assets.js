/* Keep town, temple and cave image requests bounded, and recover transient failures.
   Use the load event, as the atlas loader does: a separate decode() rejection
   must not discard an image that the browser has already loaded successfully. */
// These room PNGs are byte-identical. The room-art test verifies every alias.
const STARTUP_ROOM_ALIASES={
  "assets/interiors/sandspire-temple/ds_deepworks.png": "assets/interiors/sandspire-temple/ds_foundry.png",
  "assets/interiors/sandspire-temple/ds_approach.png": "assets/interiors/first-temple/tp1_crypt.png",
  "assets/interiors/sandspire-temple/ds_sanctum.png": "assets/interiors/first-temple/tp1_sanctum.png",
  "assets/interiors/sandspire-temple/ds_archive.png": "assets/interiors/first-temple/tp1_reliquary.png",
  "assets/interiors/sandspire-temple/ds_cells.png": "assets/interiors/first-temple/tp1_reliquary.png",
  "assets/interiors/hollybeck-temple/sn_banners.png": "assets/interiors/hollybeck-temple/sn1.png",
  "assets/interiors/hollybeck-temple/sn_east.png": "assets/interiors/hollybeck-temple/sn_west.png",
  "assets/interiors/hollybeck-temple/sn_furnaces.png": "assets/interiors/hollybeck-temple/sn1.png",
  "assets/interiors/hollybeck-temple/sn_crossing.png": "assets/interiors/hollybeck-temple/sn_west.png",
  "assets/interiors/hollybeck-temple/sn_saws.png": "assets/interiors/hollybeck-temple/sn1.png",
  "assets/interiors/hollybeck-temple/sn_return.png": "assets/interiors/hollybeck-temple/sn_west.png",
  "assets/interiors/hollybeck-temple/sn_vigil.png": "assets/interiors/hollybeck-temple/sn1.png",
  "assets/interiors/hollybeck-temple/sn_ascent.png": "assets/interiors/hollybeck-temple/sn_west.png",
  "assets/interiors/hollybeck-temple/sn_archive.png": "assets/interiors/hollybeck-temple/sn_offerings.png",
  "assets/interiors/hollybeck-temple/sn_bells.png": "assets/interiors/hollybeck-temple/sn_crypts.png",
  "assets/interiors/hollybeck-temple/sn_ashes.png": "assets/interiors/hollybeck-temple/sn_offerings.png",
  "assets/interiors/hollybeck-temple/sn_reliquary.png": "assets/interiors/hollybeck-temple/sn_crypts.png",
  "assets/interiors/hollybeck-temple/sn_tombs.png": "assets/interiors/hollybeck-temple/sn_offerings.png",
  "assets/interiors/hollybeck-temple/sn_watch.png": "assets/interiors/hollybeck-temple/sn_crypts.png",
  "assets/interiors/hollybeck-temple/sn_treasury.png": "assets/interiors/hollybeck-temple/sn_offerings.png",
  "assets/interiors/mountain-passage/passage_well.png": "assets/interiors/mountain-passage/passage_drift.png",
  "assets/interiors/mountain-passage/passage_stores.png": "assets/interiors/mountain-passage/passage_cache.png",
  "assets/interiors/mountain-passage/passage_burrows.png": "assets/interiors/mountain-passage/passage_drift.png",
  "assets/interiors/mountain-passage/passage_gallery.png": "assets/interiors/mountain-passage/passage_cache.png",
  "assets/interiors/mountain-passage/passage_hollow.png": "assets/interiors/mountain-passage/passage_cache.png"
};
const startupRoomImages=new Map();
const startupImageQueue=[];
let startupImagesActive=0;
function loadStartupImage(src,label=src.split('?')[0]){
  const path=src.split('?')[0];
  const room=/^assets\/interiors\/(?:first-temple|sandspire-temple|hollybeck-temple|mountain-passage)\/[^/]+\.png$/.test(path);
  if(room){
    const canonical=STARTUP_ROOM_ALIASES[path]||path;
    src=canonical+src.slice(path.length);
    if(label===path)label=canonical;
    if(startupRoomImages.has(src))return startupRoomImages.get(src);
  }
  const request=new Promise((resolve,reject)=>{
    startupImageQueue.push({src,label,resolve,reject});
    pumpStartupImages();
  });
  if(!room)return request;
  const shared=request.catch(error=>{startupRoomImages.delete(src);throw error;});
  startupRoomImages.set(src,shared);
  return shared;
}
function pumpStartupImages(){
  while(startupImagesActive<3&&startupImageQueue.length){
    const job=startupImageQueue.shift();startupImagesActive++;
    requestStartupImage(job.src,job.label).then(job.resolve,job.reject).finally(()=>{
      startupImagesActive--;pumpStartupImages();
    });
  }
}
async function requestStartupImage(src,label){
  const attempts=src.startsWith('data:')?1:3;
  for(let attempt=0;attempt<attempts;attempt++){
    try{
      return await new Promise((resolve,reject)=>{
        const image=new Image();let settled=false;
        const timer=setTimeout(()=>finish(new Error('image request timed out')),15000);
        function finish(error){
          if(settled)return;settled=true;
          clearTimeout(timer);image.onload=image.onerror=null;
          if(error){image.src='';reject(error);}else resolve(image);
        }
        image.onload=()=>finish(image.naturalWidth===0?new Error('image is empty'):null);
        image.onerror=()=>finish(new Error('image request failed'));
        image.src=attempt?src+(src.includes('?')?'&':'?')+'retry='+attempt+'-'+Date.now():src;
      });
    }catch(error){
      if(attempt===attempts-1)throw new Error(label+': '+error.message+' after '+attempts+' attempt'+(attempts===1?'':'s'));
    }
  }
}
async function loadStartupJSON(src){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(src,attempt?{cache:'reload'}:undefined);
      if(!response.ok)throw new Error('HTTP '+response.status);
      return await response.json();
    }catch(error){
      if(attempt===2)throw new Error(src.split('?')[0]+': '+error.message+' after 3 attempts');
    }
  }
}
