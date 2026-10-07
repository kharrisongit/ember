/* A bounded canvas display list. The companion renders the host's actual world
 * locally, including every boss/cutscene effect, without a second simulation.
 * Immutable sprite crops are sent once; mutable canvases have explicit versions.
 * No executable code, HTML, URLs, selectors or arbitrary methods cross the wire. */
(() => {
  'use strict';
  if(typeof CanvasRenderingContext2D==='undefined')return;
  const methods=new Set(['save','restore','scale','rotate','translate','transform','setTransform','resetTransform','clearRect','fillRect','strokeRect','beginPath','closePath','moveTo','lineTo','bezierCurveTo','quadraticCurveTo','arc','arcTo','ellipse','rect','roundRect','fill','stroke','clip','fillText','strokeText','setLineDash']);
  const properties=new Set(['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','lineWidth','lineCap','lineJoin','miterLimit','lineDashOffset','font','textAlign','textBaseline','direction','imageSmoothingEnabled','imageSmoothingQuality','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY','filter']);
  const versions=new WeakMap(),sourceIds=new WeakMap();let nextSource=0,tracking=false;
  for(const key of ['drawImage','fill','stroke','fillRect','clearRect','strokeRect','fillText','strokeText','putImageData']){
    const original=CanvasRenderingContext2D.prototype[key];
    CanvasRenderingContext2D.prototype[key]=function(...args){if(tracking)versions.set(this.canvas,(versions.get(this.canvas)||0)+1);return original.apply(this,args);};
  }
  const round=n=>typeof n==='number'?Math.round(n*1000)/1000:n;
  function recorder(send){
    let sent=new Set(),sourceCache=new Map(),serial=0,ack=0,lastAt=0,packet=null,uploads=[];
    const surface=document.createElement('canvas'),g=surface.getContext('2d');
    const crop=document.createElement('canvas'),cg=crop.getContext('2d');
    function texture(source,args){
      let [sx,sy,sw,sh,dx,dy,dw,dh]=args;
      if(args.length===2){[dx,dy]=args;sx=sy=0;sw=dw=source.width;sh=dh=source.height;}
      else if(args.length===4){[dx,dy,dw,dh]=args;sx=sy=0;sw=source.width;sh=source.height;}
      if(![sx,sy,sw,sh,dx,dy,dw,dh].every(Number.isFinite)||sw<=0||sh<=0||sw>4096||sh>4096)return;
      let id=sourceIds.get(source);if(!id){id=++nextSource;sourceIds.set(source,id);}
      const key=[id,versions.get(source)||0,source.width,source.height,sx,sy,sw,sh].join(':');
      let entry=sourceCache.get(key);
      if(!entry){
        crop.width=Math.ceil(sw);crop.height=Math.ceil(sh);cg.clearRect(0,0,crop.width,crop.height);cg.drawImage(source,sx,sy,sw,sh,0,0,sw,sh);
        let data=crop.toDataURL('image/png');if(data.length>320000)data=crop.toDataURL('image/webp',.95);if(data.length>320000)data=crop.toDataURL('image/webp',.65);
        if(data.length>320000)return;
        entry={id:key,data};sourceCache.set(key,entry);
        if(sourceCache.size>1600)sourceCache.delete(sourceCache.keys().next().value);
      }
      if(!sent.has(key)){uploads.push(entry);sent.add(key);}
      packet.ops.push(['image',key,...[dx,dy,dw,dh].map(round)]);
    }
    const gradientIds=new WeakMap();
    const proxy=new Proxy(g,{
      get(target,key){
        if(key==='drawImage')return (source,...args)=>texture(source,args);
        if(key==='createLinearGradient'||key==='createRadialGradient'||key==='createConicGradient')return (...args)=>{
          const value=target[key](...args),id=packet.gradients.length;packet.gradients.push({kind:key,args,transform:Array.from([target.getTransform().a,target.getTransform().b,target.getTransform().c,target.getTransform().d,target.getTransform().e,target.getTransform().f]),stops:[]});gradientIds.set(value,id);
          const add=value.addColorStop.bind(value);value.addColorStop=(offset,color)=>{packet.gradients[id].stops.push([offset,color]);add(offset,color);};return value;
        };
        if(methods.has(key))return (...args)=>{packet.ops.push([key,...args.map(round)]);return target[key](...args);};
        const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
      },
      set(target,key,value){
        if(properties.has(key))packet.ops.push(['set',key,gradientIds.has(value)?{gradient:gradientIds.get(value)}:value]);
        Reflect.set(target,key,value,target);return true;
      }
    });
    return {
      reset(){sent.clear();serial=ack=0;},needs(ids){for(const id of ids)sent.delete(id);ack=serial;},ack(n){ack=Math.max(ack,n);},
      ready(now){return now-lastAt>=66&&(serial-ack<3||now-lastAt>1500);},
      capture(width,height,draw,now){
        tracking=true;lastAt=now;uploads=[];surface.width=width;surface.height=height;packet={seq:++serial,width,height,ops:[],gradients:[]};
        draw(proxy);const out=packet;packet=null;
        // Pack sprite crops together so a new area cannot exhaust the room's
        // message budget. Each batch stays below the transport payload limit.
        let batch=[],bytes=2;for(const entry of uploads){const n=JSON.stringify(entry).length+1;if(batch.length&&bytes+n>340000){send('texture',{items:batch});batch=[];bytes=2;}batch.push(entry);bytes+=n;}if(batch.length)send('texture',{items:batch});
        if(out.ops.length<18000)send('frame',out);
      },get pending(){return serial-ack;}
    };
  }
  function player(canvas,onFrame,onMissing){
    const textures=new Map();let latest=null,drawn=0,missingAt=0;
    async function add(value={}){
      if(Array.isArray(value.items)){if(value.items.length<=1600)await Promise.all(value.items.map(add));return;}
      const {id,data}=value;
      if(typeof id!=='string'||id.length>180||typeof data!=='string'||data.length>350000||!/^data:image\/(png|webp);base64,/.test(data))return;
      const img=new Image();img.src=data;try{await img.decode();}catch{return;}
      if(img.width>4096||img.height>4096)return;
      textures.set(id,{img,used:performance.now()});paint();
    }
    function frame(value){if(!value||!Number.isSafeInteger(value.seq)||value.seq<=drawn||!Array.isArray(value.ops)||value.ops.length>18000||value.width<200||value.height<150||value.width>1920||value.height>1440)return;latest=value;paint();}
    function paint(){
      const p=latest;if(!p||p.seq<=drawn)return;
      const missing=[...new Set(p.ops.filter(op=>op[0]==='image'&&!textures.has(op[1])).map(op=>op[1]))];if(missing.length){if(performance.now()-missingAt>500){missingAt=performance.now();onMissing?.(missing.slice(0,100));}return;}
      canvas.width=p.width;canvas.height=p.height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
      const gradients=[];
      try{
        for(const item of p.gradients||[]){if(!['createLinearGradient','createRadialGradient','createConicGradient'].includes(item.kind))throw Error('Invalid paint');c.save();if(item.transform?.length===6)c.setTransform(...item.transform);const value=c[item.kind](...item.args);c.restore();for(const stop of item.stops)value.addColorStop(...stop);gradients.push(value);}
        for(const [op,...args]of p.ops){
          if(op==='image'){const t=textures.get(args[0]);t.used=performance.now();c.drawImage(t.img,...args.slice(1));}
          else if(op==='set'&&properties.has(args[0]))c[args[0]]=args[1]&&typeof args[1]==='object'?gradients[args[1].gradient]:args[1];
          else if(methods.has(op))c[op](...args);
        }
        drawn=p.seq;onFrame(p.seq);
      }catch(e){console.warn('Co-op frame rejected',e.message);}
      let bytes=[...textures.values()].reduce((sum,t)=>sum+t.img.width*t.img.height*4,0);if(textures.size>1800||bytes>48*1024*1024){const keep=new Set(p.ops.filter(op=>op[0]==='image').map(op=>op[1]));for(const [id]of [...textures.entries()].sort((a,b)=>a[1].used-b[1].used)){if(!keep.has(id)){const item=textures.get(id);bytes-=item.img.width*item.img.height*4;textures.delete(id);}if(textures.size<=1400&&bytes<=40*1024*1024)break;}}
    }
    return {add,frame,reset(){textures.clear();latest=null;drawn=0;}};
  }
  window.LDRCoopRender={recorder,player,enable:()=>{tracking=true;}};
})();
