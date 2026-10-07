/* Per-viewer presentation only: the network profile and the owner's choices stay intact. */
(() => {
  'use strict';
  const contrast={dark:'silver',brown:'blond',copper:'dark',blond:'dark',silver:'dark'};
  function forViewer(member,viewer){
    const other=!!viewer&&member.id!==viewer.id;
    return {hair:other&&member.hair===viewer.hair?(contrast[viewer.hair]||'silver'):member.hair,dragon:other?'purple':'red'};
  }
  function purpleDragon(data){
    let changed=0;
    for(let i=0;i<data.length;i+=4){
      const r=data[i],g=data[i+1],b=data[i+2];
      // Red scales and wing membranes only. Keep the gold belly, claws,
      // eyes, highlights and black outlines in their original palette.
      if(!data[i+3]||r<32||r-g<35||g>r*.48||r-b<22)continue;
      const light=r;
      data[i]=Math.round(light*.69+g*.14);data[i+1]=Math.round(light*.24+g*.26);data[i+2]=Math.min(255,Math.round(light*.96+b*.1));
      changed++;
    }
    return changed;
  }
  window.LDRCoopAppearance={forViewer,purpleDragon};
})();
