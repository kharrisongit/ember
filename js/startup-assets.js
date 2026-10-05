/* Keep town, temple and cave image requests bounded, and recover transient failures.
   Use the load event, as the atlas loader does: a separate decode() rejection
   must not discard an image that the browser has already loaded successfully. */
const startupImageQueue=[];
let startupImagesActive=0;
function loadStartupImage(src,label=src.split('?')[0]){
  return new Promise((resolve,reject)=>{
    startupImageQueue.push({src,label,resolve,reject});
    pumpStartupImages();
  });
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
