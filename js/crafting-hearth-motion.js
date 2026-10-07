/* Living painted fire: new flame tongues grow out of the fuel, rise, curl,
   narrow and extinguish. The background illustration is never displaced. */
(() => {
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  function make({image,rect,createCanvas,flameCurl,flameFork,loopSeconds=5.2}) {
    const LOOP=loopSeconds;
    const base=createCanvas(768,768),bg=base.getContext('2d');
    bg.imageSmoothingEnabled=true;bg.imageSmoothingQuality='high';
    bg.drawImage(image,...rect.map(v=>v*4));
    const brushes=[flameCurl,flameFork];
    const particles=[];
    const emitters=[[59,173,10,23],[77,177,15,30],[96,175,14,29],[116,176,15,30],[133,172,10,22]];
    emitters.forEach(([x,y,w,h],emitter)=>{
      const count=Math.round(24*LOOP/5.2);
      for(let k=0;k<count;k++){
        const id=emitter*count+k+1;
        particles.push({
          birth:(k+emitter*.37)*LOOP/count%LOOP,
          life:.57+random(id)*.28,
          x:x+(random(id+201)-.5)*4,y:y+(random(id+301)-.5)*2,
          width:w*(.82+random(id+401)*.3),height:h*(.84+random(id+501)*.24),
          drift:(random(id+601)-.5)*10,bend:(random(id+701)-.5)*.42,
          strength:.52+random(id+801)*.16,brush:id%2,flip:random(id+901)>.5?-1:1
        });
      }
    });
    function draw(g,time,reaction=0) {
      const flare=clamp(reaction);
      g.drawImage(base,0,0,192,192);
      g.save();
      // Keep combustion in the hearth, between the supports.
      g.beginPath();g.moveTo(47,183);g.lineTo(50,158);g.lineTo(57,141-9*flare);
      g.lineTo(72,135-16*flare);g.lineTo(125,135-16*flare);g.lineTo(143,146-9*flare);
      g.lineTo(149,170);g.lineTo(148,185);g.closePath();g.clip();
      g.globalCompositeOperation='lighter';
      for(const p of particles){
        const elapsed=((time-p.birth)%LOOP+LOOP)%LOOP,u=elapsed/p.life;
        if(u>=1)continue;
        const alpha=ease(u/.16)*(1-ease((u-.56)/.44))*p.strength*(1+.12*flare);
        if(alpha<.002)continue;
        // The tip keeps rising while the sides taper and finally disappear.
        // Each tongue responds to the brew; logs, feet, and pot remain fixed.
        const height=p.height*(.3+.7*(1-Math.exp(-4*u)))*(1+.62*flare);
        const width=p.width*(.85+.3*ease(u/.3))*(1-.7*ease((u-.4)/.6))*(1+.12*flare);
        const x=p.x+p.drift*ease(u),y=p.y-u*8;
        g.save();g.globalAlpha=alpha;g.translate(x,y);g.rotate(p.bend*ease(u));
        g.scale(p.flip,1);g.drawImage(brushes[p.brush],-width*(p.brush===0?.4935:.4141),-height,width,height);g.restore();
      }
      // Sparks detach from the fuel and expire in the updraft.
      for(let i=0;i<3;i++){
        const u=((time/1.3+i*.31)%1+1)%1;
        g.globalAlpha=ease(u/.12)*(1-ease((u-.55)/.45))*.55;
        g.fillStyle='#ffe2a0';g.beginPath();
        g.ellipse(69+i*25+(i-1)*u*4,174-u*32,.42,.75,0,0,Math.PI*2);g.fill();
      }
      g.restore();
      // Original foreground wood and iron occlude the fire at the ground.
      g.save();g.beginPath();
      g.moveTo(44,190);g.lineTo(47,181);g.lineTo(58,178);g.lineTo(64,177);
      g.lineTo(82,177);g.lineTo(91,181);g.lineTo(106,180);g.lineTo(115,176);
      g.lineTo(128,178);g.lineTo(146,183);g.lineTo(150,190);g.closePath();
      g.clip();g.drawImage(base,0,0,192,192);g.restore();
    }
    return {draw};
  }
  globalThis.CraftingHearthMotion={make};
})();
