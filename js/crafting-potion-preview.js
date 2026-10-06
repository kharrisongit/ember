/* Potion motion study: one fixed illustration, continuous layered animation.
   Deliberately separate from the live crafting renderer while the look is reviewed. */
(() => {
  const TAU = Math.PI * 2;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
  const geometry = {pot:[27,75,138,105.8],liquid:[96,92.7,48.5,8.7]};

  function motion(age) {
    const t = Math.max(0, Math.min(4.5, age));
    const duration = 3.35, ramp = .4;
    const e = Math.max(0, Math.min(duration, t-.4));
    // Integrate a trapezoidal velocity profile: no position or speed jumps.
    const distance = e < ramp ? e*e/(2*ramp)
      : e > duration-ramp ? duration-ramp-(duration-e)**2/(2*ramp)
      : e-ramp/2;
    const phase = -.7 + TAU*2*distance/(duration-ramp);
    const lift = 16*(1-smooth(t/.4)) + 22*smooth((t-3.82)/.55);
    return {t,phase,lift,alpha:smooth(t/.18)*(1-smooth((t-4.05)/.35)),energy:smooth(t/.75)*(1-.7*smooth((t-3.6)/.9))};
  }

  function make({pot,spoon}) {
    function draw(canvas,age) {
      const g=canvas.getContext('2d'),s=motion(age),[cx,cy,rx,ry]=geometry.liquid;
      g.clearRect(0,0,canvas.width,canvas.height);
      g.save();
      const scale=Math.min(canvas.width,canvas.height)/192;
      g.translate((canvas.width-192*scale)/2,(canvas.height-192*scale)/2);
      g.scale(scale,scale);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(pot,...geometry.pot);

      g.save();g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.clip();
      const liquid=g.createLinearGradient(0,cy-ry,0,cy+ry);
      liquid.addColorStop(0,'#6f1029');liquid.addColorStop(.45,'#a92142');liquid.addColorStop(1,'#d23e57');
      g.fillStyle=liquid;g.fillRect(cx-rx,cy-ry,rx*2,ry*2);
      // Two curved highlights travel with the stir, without rotating the pot.
      g.lineCap='round';
      for(let j=0;j<2;j++) {
        g.beginPath();
        for(let k=0;k<=44;k++) {
          const u=k/44,a=s.phase+j*Math.PI-.3-u*2.3,r=12+u*(rx-19);
          const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*ry/rx;
          if(!k)g.moveTo(x,y);else g.lineTo(x,y);
        }
        g.strokeStyle=`rgba(255,160,168,${.12+.16*s.energy})`;g.lineWidth=1.25;g.stroke();
      }
      // Each bubble grows, breaks, and fades once; no random per-frame changes.
      for(const [start,x,y] of [[1.0,cx-27,cy-3],[2.02,cx+22,cy+4],[2.95,cx-7,cy-6]]) {
        const u=(s.t-start)/.6;if(u<0||u>1)continue;
        const r=.6+1.9*smooth(u/.65),alpha=Math.sin(Math.PI*u)*.65;
        g.strokeStyle=`rgba(255,206,202,${alpha})`;g.lineWidth=.65;
        g.beginPath();g.ellipse(x,y,r,r*.63,0,0,TAU);g.stroke();
        if(u<.65){g.fillStyle=`rgba(248,150,159,${alpha*.5})`;g.fill();}
      }
      g.restore();

      const tipX=cx+Math.cos(s.phase)*19,tipY=cy+Math.sin(s.phase)*3.8;
      g.save();
      // The near rim masks the spoon. Its submerged end cannot cross the pot.
      g.beginPath();g.moveTo(-30,-60);g.lineTo(222,-60);g.lineTo(222,cy);
      g.lineTo(cx+rx,cy);g.ellipse(cx,cy,rx,ry,0,0,Math.PI);
      g.lineTo(-30,cy);g.closePath();g.clip();
      g.beginPath();g.rect(-30,-100,252,tipY+101);g.clip();
      g.globalAlpha=s.alpha;g.translate(tipX,tipY-s.lift);
      g.rotate(.17+Math.cos(s.phase)*.12);
      g.drawImage(spoon,-7,-50,14,64);g.restore();

      // A little liquid passes over the spoon bowl to establish immersion.
      if(s.lift<5) {
        g.save();g.beginPath();g.ellipse(cx,cy,rx-.5,ry-.4,0,0,TAU);g.clip();
        g.globalAlpha=(1-s.lift/5)*s.alpha;
        g.fillStyle='#bd304dc0';g.beginPath();g.ellipse(tipX,tipY+2,4.3,2.5,0,0,TAU);g.fill();
        g.strokeStyle='#f19ba47a';g.lineWidth=.7;g.beginPath();
        g.ellipse(tipX,tipY+2,5.4,1.7,0,.1,Math.PI*.85);g.stroke();g.restore();
      }

      // Soft coherent steam, with a continuous path and a zero-alpha reset.
      for(let j=0;j<3;j++) {
        const u=((s.t+j*.79)%2.45)/2.45;
        const alpha=Math.sin(Math.PI*u)**2*.18*smooth(s.t/.45);
        const x=cx+(j-1)*18+Math.sin(s.t*.9+j)*3,y=cy-7-u*30;
        g.strokeStyle=`rgba(150,132,118,${alpha})`;g.lineWidth=2.1;g.lineCap='round';
        g.beginPath();g.moveTo(x,y);
        g.bezierCurveTo(x-7,y-9,x+8,y-13,x+2,y-23);g.stroke();
      }
      // A restrained final glint marks completion before the reward appears.
      const finish=Math.sin(Math.PI*clamp((s.t-3.95)/.55));
      if(finish>0)for(const [x,y] of [[cx-27,cy-5],[cx+18,cy+1]]) {
        const r=2.2*finish;g.fillStyle=`rgba(255,227,197,${finish*.7})`;
        g.beginPath();g.moveTo(x-r,y);g.quadraticCurveTo(x,y,x,y-r*1.5);
        g.quadraticCurveTo(x,y,x+r,y);g.quadraticCurveTo(x,y,x,y+r*1.5);
        g.quadraticCurveTo(x,y,x-r,y);g.fill();
      }
      g.restore();
    }
    return {draw};
  }
  globalThis.PotionMotionPreview={make,motion,geometry,duration:4.5};
})();
