/* Record native game controls for the co-op companion's accessible menu view.
 * Only explicit game panel roots are exposed by coop-campaign.js. */
(() => {
  if(typeof EventTarget==='undefined')return;
  const handlers=new WeakMap(),original=EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener=function(type,fn,options){
    if(['click','mousedown','pointerdown','touchstart','input','change'].includes(type)){
      const types=handlers.get(this)||new Set();types.add(type);handlers.set(this,types);
    }
    return original.call(this,type,fn,options);
  };
  let replaying=false;
  for(const type of ['keydown','keyup'])window.addEventListener(type,event=>{
    if(!replaying)window.LDRCoopCampaign?.keyboard(event);
  },true);
  window.LDRCoopEvents={types:node=>handlers.get(node)||new Set(),get replaying(){return replaying;},replayKey(data){
    replaying=true;
    try{window.dispatchEvent(new KeyboardEvent(data.down?'keydown':'keyup',{key:data.key,repeat:!!data.repeat,bubbles:true,cancelable:true}));}
    finally{replaying=false;}
  }};
})();
