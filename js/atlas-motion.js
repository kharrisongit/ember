/* The full downloadable illustration stays intact; this layer only animates scenery. */
const EmberAtlasMotion=(()=>{
  let layer,gestureTimer;
  const wave=(x,y,w,i)=>`<path class="atlas-water-wave" style="--delay:-${(i*.73)%7}s;--speed:${4+i%4}s" d="M${x} ${y}q${w/4} -2 ${w/2} 0t${w/2} 0"/>`;
  const art='assets/maps/emberfell-realm-v3.webp?v=20261006-cows';
  const texture=cls=>`<image class="${cls}" href="${art}" width="1536" height="512"/>`;
  const lavaPath='M1387 0L1399 18L1438 25L1434 56L1451 83L1440 108L1448 132L1490 148L1510 132L1535 145M1497 0L1509 35L1531 46M1515 211L1510 239L1527 264L1510 290L1530 317M1462 351L1446 380L1435 405L1441 430L1427 464L1430 488L1419 512M1520 350L1514 380L1494 402L1515 423L1505 444L1522 470L1508 489L1511 512';
  function build(){
    layer=document.createElement('div');layer.id='atlasAnimation';layer.setAttribute('aria-hidden','true');
    const sea=Array.from({length:90},(_,i)=>wave(849+(i*47)%322,458+(i*17)%54,7+i%8,i)).join('');
    const oasis=Array.from({length:24},(_,i)=>wave(718+(i*17)%114,293+(i*7)%42,6+i%5,i)).join('');
    const fall=(x,y,h,i)=>`<path class="atlas-fall-stream" style="--delay:-${i*.19}s" d="M${x} ${y}q-1 ${h*.35} 0 ${h*.6}t0 ${h*.4}"/>`;
    layer.innerHTML=`<svg viewBox="0 0 1536 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="atlasSeaClip"><path d="M835 512L873 491L900 476L928 458L950 464L974 476L999 479L1028 475L1054 480L1080 473L1102 479L1123 475L1147 489L1170 512Z"/></clipPath>
        <clipPath id="atlasOasisClip"><path d="M718 305Q736 293 756 295L780 295L807 302L828 310L816 324L787 336L755 334L730 320Z"/></clipPath>
        <clipPath id="atlasFallsClip"><path d="M382 105L414 105L413 167L408 190L390 192L383 179Z"/></clipPath>
        <clipPath id="atlasMillClip"><rect x="83" y="310" width="71" height="70"/></clipPath>
        <g id="atlasWindmillSail"><path d="M-1 0V-35H1V0Z" fill="#594026"/><path d="M-1-9H-9V-34H-1Z" fill="#dfc795" stroke="#79542c" stroke-width=".55"/><path d="M-9-13H-1M-9-18H-1M-9-23H-1M-9-28H-1M-9-33H-1M-5-9V-34" fill="none" stroke="#997644" stroke-width=".45"/></g>
      </defs>
      <g clip-path="url(#atlasSeaClip)" class="atlas-sea">
        ${texture('atlas-sea-texture')}${sea}
        <g class="atlas-shore-foam"><path d="M864 502Q903 477 928 465Q951 470 977 483T1031 483T1086 482T1148 496"/><path d="M876 506Q908 486 931 476Q959 481 978 490T1030 491T1085 490T1144 505"/></g>
      </g>
      <g clip-path="url(#atlasOasisClip)" class="atlas-oasis">
        ${texture('atlas-oasis-texture')}${oasis}
        ${[0,1,2].map(i=>`<ellipse class="atlas-oasis-ripple" style="--delay:-${i*1.7}s" cx="772" cy="310" rx="13" ry="3"/>`).join('')}
      </g>
      <path class="atlas-river-current" d="M328 0Q312 19 338 38Q350 48 368 57L374 84L394 101M400 196L397 210L415 227L412 235M408 261L402 282L409 300Q399 316 394 338Q383 351 393 365Q411 379 392 395Q366 404 357 425L329 445L340 470Q358 487 379 509"/>
      <g clip-path="url(#atlasFallsClip)">
        ${texture('atlas-fall-texture')}${texture('atlas-fall-texture atlas-fall-second')}
        <path class="atlas-fall-body" d="M389 105Q395 139 394 178M402 105Q407 148 402 184"/>
        ${Array.from({length:16},(_,i)=>fall(383+i*1.9,103,93,i)).join('')}
      </g>
      <g class="atlas-fall-mist"><ellipse cx="400" cy="195" rx="17" ry="4"/><ellipse cx="392" cy="192" rx="8" ry="5"/><ellipse cx="408" cy="192" rx="9" ry="5"/></g>
      ${[0,1,2].map(i=>`<ellipse class="atlas-fall-splash" style="--delay:-${i*.7}s" cx="400" cy="197" rx="9" ry="2"/>`).join('')}
      <g class="atlas-mill-motion" visibility="hidden">
        <image class="atlas-mill-background" href="assets/maps/emberfell-windmill-base.webp?v=20261002-millwood-clarity" width="1536" height="512" clip-path="url(#atlasMillClip)"/>
        <g transform="translate(117.6 342.5)"><g class="atlas-windmill-rotor"><use href="#atlasWindmillSail"/><use href="#atlasWindmillSail" transform="rotate(90)"/><use href="#atlasWindmillSail" transform="rotate(180)"/><use href="#atlasWindmillSail" transform="rotate(270)"/></g><circle r="2" fill="#6d482a" stroke="#c3a068" stroke-width=".7"/></g>
      </g>
      <g class="atlas-lava">
        <path class="atlas-lava-glow" d="${lavaPath}"/>
        <path class="atlas-lava-flow" d="${lavaPath}"/>
        <path class="atlas-lava-core" d="${lavaPath}"/>
        ${[[1442,77],[1482,146],[1517,264],[1443,400],[1513,437],[1430,482]].map(([x,y],i)=>`<circle class="atlas-lava-bubble" style="--delay:-${i*.9}s" cx="${x}" cy="${y}" r="1.6"/>`).join('')}
      </g>
    </svg>`;
    // If the optional motion texture fails to load, the complete still stays visible.
    const patch=layer.querySelector?.('.atlas-mill-background');
    patch?.addEventListener('load',()=>layer.querySelector('.atlas-mill-motion').setAttribute('visibility','visible'));
    document.getElementById('atlasSurface').appendChild(layer);
  }
  function start(){if(!layer)build();layer.classList.add('active');}
  function stop(){layer?.classList.remove('active');}
  function gesture(active){
    clearTimeout(gestureTimer);layer?.classList.toggle('interacting',active);
    if(active)gestureTimer=setTimeout(()=>layer?.classList.remove('interacting'),180);
  }
  return {start,stop,gesture};
})();
