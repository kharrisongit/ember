/* Session-only dragon attack anchors. Exported deltas use world pixels, +x right, +y down. */
(()=>{
  const directions=['n','ne','e','se','s','sw','w','nw'];
  const kinds=['slash','fire','ice','bolt','shadow'];
  const offsets={ground:{},air:{}};
  let opened=false,dir='s',air=false,kind='slash',playing=true,flight=false,phase=0,last=0,drag=null;
  const key=(k,d)=>k+':'+d;
  const get=(k,d,a)=>offsets[a?'air':'ground'][key(k,d)]||[0,0];
  const set=(k,d,a,x,y)=>{
    if(!kinds.includes(k)||!directions.includes(d)||![x,y].every(Number.isFinite))return;
    const value=[x,y].map(v=>Math.max(-160,Math.min(160,Math.round(v))));
    const group=offsets[a?'air':'ground'];
    if(value.some(Boolean))group[key(k,d)]=value;else delete group[key(k,d)];
  };
  const snapshot=()=>({format:'emberfell-dragon-attack-alignment',version:1,units:'world pixels; +x right, +y down',offsets:JSON.parse(JSON.stringify(offsets))});
  const api=window.EmberAttackAlign={offset:get,set,isOpen:()=>opened,export:snapshot};
  if(typeof document==='undefined')return;
  const style=document.createElement('style');style.textContent=`
  #dragonAlign{position:fixed;inset:0;z-index:2147483000;background:#080b10e8;display:none;place-items:center;padding:10px;box-sizing:border-box;touch-action:pan-y}
  #dragonAlign.open{display:grid}#dragonAlign *{box-sizing:border-box}
  #dragonAlign .daPanel{width:min(100%,560px);max-height:calc(100dvh - 20px);overflow:auto;background:#18212a;color:#f4efe1;border:2px solid #a88a51;border-radius:12px;padding:14px;font:14px system-ui,sans-serif;box-shadow:0 20px 80px #000}
  #dragonAlign h2{font-size:19px;margin:0}#dragonAlign p{font-size:12px;color:#c3c9ce;margin:8px 0;line-height:1.4}
  #dragonAlign .daRow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0}#dragonAlign .daHead{justify-content:space-between}
  #dragonAlign button,#dragonAlign select,#dragonAlign input[type=number]{font:inherit;background:#2b3945;color:#fff;border:1px solid #687988;border-radius:6px;min-height:38px;padding:7px 10px}
  #dragonAlign button{cursor:pointer}#dragonAlign button:focus-visible,#dragonAlign select:focus-visible{outline:2px solid #ffd585}#dragonAlign label{display:flex;gap:5px;align-items:center;font-size:12px}
  #dragonAlign select{max-width:150px}#dragonAlign canvas{display:block;width:100%;height:auto;background:#111820;border:1px solid #52616c;border-radius:6px;touch-action:none;image-rendering:pixelated;cursor:grab}
  #dragonAlign canvas:active{cursor:grabbing}#dragonAlign input[type=range]{flex:1;min-width:100px}#dragonAlign input[type=number]{width:72px}
  #dragonAlign textarea{width:100%;min-height:100px;background:#0d141b;color:#e5f0f5;padding:8px;border:1px solid #687988;font:11px monospace;user-select:text;-webkit-user-select:text}
  #dragonAlign .daPrimary{background:#a67b39;color:#fff}#dragonAlign #daStatus{min-height:18px;color:#f6dba2;font-size:12px}
  `;document.head.append(style);
  const root=document.createElement('div');root.id='dragonAlign';root.innerHTML=`
  <section class="daPanel scrolls" role="dialog" aria-modal="true" aria-labelledby="daTitle">
    <div class="daRow daHead"><h2 id="daTitle">Dragon attack alignment</h2><button id="daClose" aria-label="Close attack alignment">Close</button></div>
    <p>Drag the slash or glowing origin onto the dragon. Each direction and stance has its own offsets. The game pauses while you align.</p>
    <div class="daRow"><label>Stance <select id="daStance"><option value="ground">Ground</option><option value="air">Flying</option></select></label>
    <label>Direction <select id="daDirection">${directions.map(d=>`<option value="${d}" ${d==='s'?'selected':''}>${({n:'North',ne:'Northeast',e:'East',se:'Southeast',s:'South',sw:'Southwest',w:'West',nw:'Northwest'})[d]}</option>`).join('')}</select></label>
    <label>Attack <select id="daKind"><option value="slash">Slash</option><option value="fire">Fire</option><option value="ice">Ice</option><option value="bolt">Lightning</option><option value="shadow">Shadow</option></select></label></div>
    <canvas id="daCanvas" width="480" height="360" aria-label="Drag attack artwork to align it with the dragon"></canvas>
    <div class="daRow"><button id="daPlay">Pause</button><label for="daFrame">Frame</label><input id="daFrame" aria-label="Animation frame" type="range" min="0" max="1000" value="0"><button id="daFlight">Test shot</button></div>
    <div class="daRow"><label>X <input id="daX" type="number" min="-160" max="160" step="1"></label><label>Y <input id="daY" type="number" min="-160" max="160" step="1"></label><button id="daReset">Reset this</button><button id="daResetAll">Reset all</button></div>
    <div class="daRow"><button id="daCopy" class="daPrimary">Copy alignment</button><button id="daExport">Show alignment</button></div>
    <div id="daStatus" role="status">Changes preview in-game until you refresh. Copy them and send them to me to keep them.</div>
    <textarea id="daOutput" readonly hidden aria-label="Alignment settings to copy"></textarea>
  </section>`;document.body.append(root);
  const $=id=>root.querySelector('#'+id),canvas=$('daCanvas'),g=canvas.getContext('2d');
  const zoom=3,origin=[240,274];
  let returnFocus=null;
  function refresh(){const [x,y]=get(kind,dir,air);$('daX').value=x;$('daY').value=y;$('daPlay').textContent=playing?'Pause':'Play';$('daFlight').disabled=kind==='slash';$('daFlight').textContent=flight?'Pin origin':'Test shot';$('daOutput').hidden=true;}
  function pose(){
    const cardinal=cardinalDirection(dir),d=cardinal==='w'&&!SPR.dr5_idle_w?'e':cardinal;
    const sp=kind==='slash'?(air?(SPR['dr5_hover_'+d]||SPR['drf_'+d]):SPR['dr5_idle_'+d]):
      (air?(SPR['drf_fire_'+d]||SPR['drf_'+d]):SPR['dr5_fire_'+d]);
    return sp||SPR['dr5_idle_'+d]||SPR.dr5_idle_s;
  }
  function position(sp){
    const off=get(kind,dir,air),scale=DRAGON_DRAW_SCALE,flip=dragonFlip(dir)?-1:1,[vx,vy]=directionVector(dir);
    if(kind!=='slash'){
      const diagonal={ne:[.76,.32],nw:[.24,.32],se:[.77,.69],sw:[.23,.69]};
      const table=air?MOUTH:MOUTH_GND,m=diagonal[dir]||table[dir]||table.s;
      return [(-sp[2]/2+sp[2]*m[0])*scale*flip-vx*3+off[0],(-sp[3]+sp[3]*m[1])*scale-vy*3+off[1]];
    }
    const effect=SPR['claw_'+(dir.length===2?'e':dir)];if(!effect)return off;
    if(dir.length===2)return [vx*(23+effect[2]/2)+off[0],-20+vy*(23+effect[2]/2)+off[1]];
    const table=air?CLAW_AIR:CLAW_GND,m=table[dir]||CLAW_GND.s;
    return [(-sp[2]/2+sp[2]*m[0])*scale*flip+(dir==='e'?effect[2]/2:dir==='w'?-effect[2]/2:0)+off[0],
      -8+(-sp[3]+sp[3]*m[1])*scale+(dir==='n'?-effect[3]/2:dir==='s'?effect[3]/2:0)+off[1]];
  }
  function render(ms){
    if(!opened)return;
    const dt=last?Math.min(.1,(ms-last)/1000):0;last=ms;if(playing&&!drag)phase=(phase+dt*.8)%1;
    $('daFrame').value=Math.round(phase*1000);g.clearRect(0,0,480,360);g.fillStyle='#111820';g.fillRect(0,0,480,360);
    g.strokeStyle='#263541';g.lineWidth=1;for(let x=0;x<480;x+=48){g.beginPath();g.moveTo(x,0);g.lineTo(x,360);g.stroke();}for(let y=34;y<360;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(480,y);g.stroke();}
    try{
      const sp=pose();if(!sp)throw Error('Dragon art is still loading.');const scale=DRAGON_DRAW_SCALE,fr=Math.min(sp[4]-1,Math.floor(phase*sp[4]));
      g.save();g.translate(...origin);g.scale(zoom,zoom);g.imageSmoothingEnabled=false;
      g.fillStyle='#0007';g.beginPath();g.ellipse(0,3,22,4,0,0,Math.PI*2);g.fill();
      g.save();if(dragonFlip(dir))g.scale(-1,1);drawGameImage(g,sheetOf(sp),sp[0]+fr*sp[2],sp[1],sp[2],sp[3],-sp[2]*scale/2,-sp[3]*scale,sp[2]*scale,sp[3]*scale);g.restore();
      const [x,y]=position(sp),[vx,vy]=directionVector(dir);
      if(kind==='slash'){
        const ef=SPR['claw_'+(dir.length===2?'e':dir)];if(ef){const f=Math.min(ef[4]-1,Math.floor(phase*ef[4]));g.save();g.translate(x,y);if(dir.length===2)g.rotate(Math.atan2(vy,vx));drawGameImage(g,atlasImg,ef[0]+f*ef[2],ef[1],ef[2],ef[3],-ef[2]/2,-ef[3]/2,ef[2],ef[3]);g.restore();}
      }else{
        g.strokeStyle='#f2c46d88';g.setLineDash([2,3]);g.beginPath();g.moveTo(x,y);g.lineTo(x+vx*70,y+vy*70);g.stroke();g.setLineDash([]);
        const count=DRAGON_PROJECTILE[kind],ef=SPR['fx_attack_'+kind+'_'+Math.floor(phase*count)];
        if(ef){const size=kind==='fire'?54:46,travel=flight?phase*65:0;g.save();g.translate(x+vx*travel,y+vy*travel);g.rotate(Math.atan2(vy,vx));g.globalAlpha=.8;drawGameImage(g,atlasImg,ef[0],ef[1],ef[2],ef[3],-size/2,-size/2,size,size);g.restore();}
      }
      g.strokeStyle='#ffe094';g.lineWidth=.65;g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.moveTo(x-6,y);g.lineTo(x+6,y);g.moveTo(x,y-6);g.lineTo(x,y+6);g.stroke();
      g.strokeStyle='#9cb6c6';g.beginPath();g.moveTo(-3,0);g.lineTo(3,0);g.moveTo(0,-3);g.lineTo(0,3);g.stroke();g.restore();
      g.fillStyle='#c5d4dc';g.font='12px system-ui';g.fillText('1 grid square = 16 game pixels · 3× preview',12,20);
    }catch(e){g.setTransform(1,0,0,1,0,0);g.fillStyle='#ffd88c';g.font='14px system-ui';g.fillText('Dragon art is loading. Try opening again in a moment.',12,35);}
    requestAnimationFrame(render);
  }
  function close(){opened=false;root.classList.remove('open');drag=null;clearPadInputs();returnFocus?.focus?.();}
  api.open=()=>{
    if(typeof SPR==='undefined'||!SPR.dr5_idle_s){toast('Wait for the dragon art to finish loading.');return;}
    if(opened)return;
    returnFocus=document.activeElement;exitTools();clearPadInputs();P.moving=false;opened=true;last=0;root.classList.add('open');refresh();$('daClose').focus();requestAnimationFrame(render);
  };
  $('daClose').onclick=close;
  $('daStance').onchange=e=>{air=e.target.value==='air';phase=0;refresh();};
  $('daDirection').onchange=e=>{dir=e.target.value;phase=0;refresh();};
  $('daKind').onchange=e=>{kind=e.target.value;phase=0;flight=false;refresh();};
  $('daPlay').onclick=()=>{playing=!playing;refresh();};
  $('daFrame').oninput=e=>{phase=Math.min(.999,Number(e.target.value)/1000);playing=false;refresh();};
  $('daFlight').onclick=()=>{flight=!flight;playing=true;phase=0;refresh();};
  for(const id of ['daX','daY'])$(id).onchange=()=>{set(kind,dir,air,Number($('daX').value),Number($('daY').value));refresh();};
  $('daReset').onclick=()=>{set(kind,dir,air,0,0);refresh();};
  $('daResetAll').onclick=()=>{offsets.ground={};offsets.air={};refresh();};
  const show=()=>{const text=JSON.stringify(snapshot(),null,2);$('daOutput').value=text;$('daOutput').hidden=false;return text;};
  $('daExport').onclick=()=>{show();$('daOutput').focus();$('daOutput').select();};
  $('daCopy').onclick=async()=>{const text=show();try{await navigator.clipboard.writeText(text);$('daStatus').textContent='Copied. Paste this alignment into our chat.';}catch(e){$('daOutput').focus();$('daOutput').select();$('daStatus').textContent='Select and copy the settings below, then paste them into our chat.';}};
  canvas.onpointerdown=e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,offset:[...get(kind,dir,air)]};flight=false;playing=false;refresh();};
  canvas.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const rect=canvas.getBoundingClientRect();set(kind,dir,air,drag.offset[0]+(e.clientX-drag.x)*480/rect.width/zoom,drag.offset[1]+(e.clientY-drag.y)*360/rect.height/zoom);refresh();};
  canvas.onpointerup=canvas.onpointercancel=e=>{if(drag?.id===e.pointerId)drag=null;};
  root.addEventListener('touchmove',e=>e.stopPropagation(),{passive:true});
  root.addEventListener('pointerdown',e=>e.stopPropagation());root.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});root.addEventListener('click',e=>e.stopPropagation());
  window.addEventListener('keydown',e=>{if(!opened)return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const els=[...root.querySelectorAll('button,select,input,textarea')].filter(el=>!el.disabled&&!el.hidden);const i=els.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&i===els.length-1){e.preventDefault();els[0].focus();}}},true);
  document.getElementById('bAttackAlign')?.addEventListener('click',()=>api.open());
})();
