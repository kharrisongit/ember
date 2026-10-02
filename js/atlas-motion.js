/* The full downloadable illustration stays intact; this layer only animates scenery. */
const EmberAtlasMotion=(()=>{
  let layer;
  const wave=(x,y,w,i)=>`<path class="atlas-water-wave" style="--delay:-${i%9}s" d="M${x} ${y}q${w/4} -2 ${w/2} 0t${w/2} 0"/>`;
  function build(){
    layer=document.createElement('div');layer.id='atlasAnimation';layer.setAttribute('aria-hidden','true');
    const sea=Array.from({length:65},(_,i)=>wave(746+(i*47)%335,463+(i*17)%50,7+i%8,i)).join('');
    const oasis=Array.from({length:14},(_,i)=>wave(581+(i*17)%103,282+(i*7)%32,6+i%5,i)).join('');
    const fall=(x,y,h,i)=>`<path class="atlas-fall-stream" style="--delay:-${i*.19}s" d="M${x} ${y}q-1 ${h*.35} 0 ${h*.6}t0 ${h*.4}"/>`;
    layer.innerHTML=`<svg viewBox="0 0 1536 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="atlasSeaClip"><path d="M736 512L753 491L777 484L799 473L817 476L834 461L854 456L882 464L906 462L927 472L948 459L977 467L1002 465L1024 477L1053 477L1081 494L1077 512Z"/></clipPath>
        <clipPath id="atlasOasisClip"><path d="M575 290Q590 277 621 278L650 281L679 288L690 300L674 312L639 317L606 309L582 305Z"/></clipPath>
        <clipPath id="atlasFallsClip"><path d="M313 109L345 111L342 187L336 207L320 208L315 191Z"/></clipPath>
        <clipPath id="atlasMillClip"><rect x="31" y="289" width="69" height="85"/></clipPath>
        <g id="atlasWindmillSail"><path d="M-1 0V-22H1V0Z" fill="#594026"/><path d="M-1-7H-6V-21H-1Z" fill="#dfc795" stroke="#79542c" stroke-width=".55"/><path d="M-6-10H-1M-6-13H-1M-6-16H-1M-6-19H-1M-3.5-7V-21" fill="none" stroke="#997644" stroke-width=".45"/></g>
      </defs>
      <g clip-path="url(#atlasSeaClip)" class="atlas-sea">${sea}</g>
      <g clip-path="url(#atlasOasisClip)" class="atlas-oasis">${oasis}</g>
      <path class="atlas-river-current" d="M312 57Q300 76 315 90L327 106M327 214Q337 236 319 258M324 287Q340 306 333 329Q328 350 309 366Q314 381 295 404Q266 418 278 436Q282 447 306 451Q330 464 325 496"/>
      <g clip-path="url(#atlasFallsClip)">${Array.from({length:12},(_,i)=>fall(315+i*2.4,106,104,i)).join('')}</g>
      <g class="atlas-fall-mist"><ellipse cx="330" cy="211" rx="18" ry="3"/></g>
      <g class="atlas-mill-motion" visibility="hidden">
        <image class="atlas-mill-background" href="assets/maps/emberfell-windmill-base.webp?v=20261002-living-map" width="1536" height="512" clip-path="url(#atlasMillClip)"/>
        <g transform="translate(64 322)"><g class="atlas-windmill-rotor"><use href="#atlasWindmillSail"/><use href="#atlasWindmillSail" transform="rotate(90)"/><use href="#atlasWindmillSail" transform="rotate(180)"/><use href="#atlasWindmillSail" transform="rotate(270)"/></g><circle r="2" fill="#6d482a" stroke="#c3a068" stroke-width=".7"/></g>
      </g>
      <g class="atlas-lava"><path d="M1368 0L1382 20L1407 29L1395 56L1388 78L1390 104L1410 139L1442 154L1427 180L1430 212M1485 0L1479 34L1505 45L1493 75L1519 100L1508 135L1530 150M1490 360L1465 376L1470 401L1488 411L1472 431L1479 452L1455 471L1466 493L1457 512M1529 369L1517 403L1530 438L1516 462L1535 491"/></g>
    </svg>`;
    // If the optional motion texture fails to load, the complete still stays visible.
    const patch=layer.querySelector?.('.atlas-mill-background');
    patch?.addEventListener('load',()=>layer.querySelector('.atlas-mill-motion').setAttribute('visibility','visible'));
    document.getElementById('atlasSurface').appendChild(layer);
  }
  function start(){if(!layer)build();layer.classList.add('active');}
  function stop(){layer?.classList.remove('active');}
  return {start,stop};
})();
