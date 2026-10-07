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
  window.LDRCoopEvents={types:node=>handlers.get(node)||new Set()};
})();
