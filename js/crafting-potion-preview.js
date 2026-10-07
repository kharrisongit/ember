/* Potion motion study: one fixed illustration, continuous layered animation.
   Deliberately separate from the live crafting renderer while the look is reviewed. */
(() => {
  const TAU = Math.PI * 2;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => { x = clamp(x); return x*x*(3-2*x); };
  const seeded=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
  const DURATION=5.8, FINISH_HOLD=.7, LOOP=DURATION+FINISH_HOLD;
  const geometry = {hearth:[20,64,152,121.07],liquid:[95.9,83.3,52,9.5],fire:[39,138,155,184]};
  // Nan's potion recipe: two healing herbs and one bitterroot.
  const drops = [
    {cell:0,start:.08,fall:.47,fromX:57,x:76,y:83,size:22,angle:-.65,spin:1.15},
    {cell:0,start:.50,fall:.48,fromX:137,x:112,y:81,size:20,angle:.65,spin:-1.1},
    {cell:2,start:.95,fall:.49,fromX:87,x:94,y:86,size:23,angle:-.35,spin:.8}
  ];

  function reaction(time) {
    let calm=1;
    for(const d of drops) {
      const elapsed=time-d.start-d.fall;
      const pulse=smooth(elapsed/.14)*(1-smooth((elapsed-.24)/.85));
      calm*=1-.94*pulse;
    }
    return 1-calm;
  }

  function motion(age) {
    const t = Math.max(0, Math.min(DURATION, age));
    const duration = 3.27, ramp = .32;
    const e = Math.max(0, Math.min(duration, t-1.82));
    // Integrate a trapezoidal velocity profile: no position or speed jumps.
    const distance = e < ramp ? e*e/(2*ramp)
      : e > duration-ramp ? duration-ramp-(duration-e)**2/(2*ramp)
      : e-ramp/2;
    const phase = -.7 + TAU*2*distance/(duration-ramp);
    const lift = 16*(1-smooth((t-1.50)/.32)) + 22*smooth((t-5.12)/.55);
    return {t,phase,lift,alpha:smooth((t-1.50)/.18)*(1-smooth((t-5.35)/.35)),energy:smooth((t-1.58)/.55)*(1-.7*smooth((t-4.9)/.9))};
  }

  function make({hearth,spoon,flameCurl,flameFork,smoke,ingredients,createCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;}}) {
    const paintedFire=CraftingHearthMotion.make({image:hearth,rect:geometry.hearth,createCanvas,flameCurl,flameFork,loopSeconds:LOOP});
    // Seed whole flight paths once. The sparks change direction sharply but
    // always travel through their bends, rather than jumping between frames.
    const sparks=drops.map((d,index)=>Array.from({length:21},(_,j)=>{
      const id=1+index*71+j*19,r=n=>seeded(id+n*43);
      const endX=(r(1)-.5)*122,endY=-25-r(2)*37,distance=Math.hypot(endX,endY);
      const steps=7+Math.floor(r(3)*3),points=[{t:0,x:0,y:0}];
      let total=0;
      for(let k=1;k<=steps;k++) {
        const v=k/steps,side=(k%2?1:-1)*(4+r(k+10)*7)*Math.sqrt(Math.sin(Math.PI*v));
        total+=.7+r(k+30);
        points.push({t:total,x:endX*v-endY/distance*side,y:Math.min(-2,endY*v+endX/distance*side)});
      }
      for(const p of points)p.t/=total;
      const color=r(5),palette=color<.5?['238,153,39','255,216,112']
        :color<.83?['142,77,224','211,176,255']:['64,155,224','179,229,255'];
      return {points,delay:r(6)*.18,life:1.05+r(7)*.45,trail:.20+r(8)*.10,
        star:j%3===0,radius:(j%3===0?4.3:2.05)*(.85+r(9)*.3),palette,spin:r(4)*TAU};
    }));
    function sparkPoint(spark,t) {
      const points=spark.points;
      for(let k=1;k<points.length;k++)if(t<=points[k].t) {
        const a=points[k-1],b=points[k],u=clamp((t-a.t)/(b.t-a.t));
        return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
      }
      return points[points.length-1];
    }
    function drawSmoke(g,time,front) {
      // Overlapping painted wisps expand into the updraft. Birth/death happen
      // at zero opacity; the full cycle also runs through the finish hold.
      const count=front?26:18;
      for(let i=0;i<count;i++) {
        const lane=i%3,life=front?2.5:2.9;
        const elapsed=((time-i*LOOP/count)%LOOP+LOOP)%LOOP,u=elapsed/life;
        if(u>=1)continue;
        const alpha=smooth(u/.17)*(1-smooth((u-.36)/.64))*(front?.54:.30);
        const x=front?96+(lane-1)*22+Math.sin(u*2.5+i)*8
          :96+(i%2?1:-1)*(47+u*10);
        // Broad plumes fill the space over the cauldron. Fade before the top
        // edge, so their larger silhouettes never end in a hard cropped line.
        const y=front?82-u*25:159-u*70;
        const w=(front?28:25)+u*(front?34:29),h=(front?40:39)+u*22;
        g.save();g.globalAlpha=alpha;g.translate(x,y);g.rotate(Math.sin(i*2.1)*.12*u);
        g.scale(i%2?-1:1,1);g.drawImage(smoke,-w/2,-h,w,h);g.restore();
      }
      if(front)for(const [index,d] of drops.entries()) {
        const u=(time-d.start-d.fall)/1.25;
        if(u<0||u>=1)continue;
        // Each ingredient releases a fresh billow as well as the steady steam.
        const alpha=smooth(u/.13)*(1-smooth((u-.26)/.74))*.58;
        const w=24+35*smooth(u),h=31+26*u;
        g.save();g.globalAlpha=alpha;g.translate(d.x+(index-1)*u*7,d.y-u*24);
        g.scale(index%2?-1:1,1);g.drawImage(smoke,-w/2,-h,w,h);g.restore();
      }
    }
    function drawIngredients(g,time) {
      for(const d of drops) {
        const elapsed=time-d.start,u=elapsed/d.fall,sink=(elapsed-d.fall)/.2;
        if(u<0||sink>=1)continue;
        const f=clamp(u),x=d.fromX+(d.x-d.fromX)*f;
        const y=10+(d.y-10)*f*f+Math.max(0,sink)*d.size*.95;
        g.save();
        // Sink through the waterline instead of fading in front of the pot.
        g.beginPath();g.rect(0,-30,192,d.y+31);g.clip();
        g.globalAlpha=smooth(elapsed/.08);g.translate(x,y);g.rotate(d.angle+d.spin*f);
        const size=d.size*(1-.15*clamp(sink));
        g.drawImage(ingredients,d.cell*200,0,200,200,-size/2,-size/2,size,size);g.restore();
      }
    }
    function drawSplashes(g,time) {
      for(const d of drops) {
        const elapsed=time-d.start-d.fall,u=elapsed/.52;
        if(u<0||u>1)continue;
        g.save();g.beginPath();g.ellipse(...geometry.liquid,0,0,TAU);g.clip();
        g.strokeStyle=`rgba(255,192,191,${.65*(1-smooth(u))})`;g.lineWidth=.8;
        g.beginPath();g.ellipse(d.x,d.y,2+u*18,.7+u*3.6,0,0,TAU);g.stroke();g.restore();
        // Small droplets leave the contact point and fall back into the brew.
        for(let j=0;j<5;j++) {
          const v=elapsed/(.28+j*.025);if(v>1)continue;
          const x=d.x+(j-2)*4*v,y=d.y-Math.sin(Math.PI*v)*(5+(j%3)*2);
          g.fillStyle=`rgba(246,126,149,${.85*(1-smooth((v-.7)/.3))})`;
          g.beginPath();g.ellipse(x,y,.65,.9+Math.sin(Math.PI*v)*.35,0,0,TAU);g.fill();
        }
      }
    }
    function drawMagic(g,time,surface) {
      for(const [index,d] of drops.entries()) {
        const elapsed=time-d.start-d.fall;
        if(elapsed<0||elapsed>1.7)continue;
        if(surface) {
          // A local glow blooms under the ingredient, bounded by the liquid.
          const pulse=smooth(elapsed/.07)*(1-smooth((elapsed-.1)/.42));
          if(!pulse)continue;
          g.save();g.beginPath();g.ellipse(...geometry.liquid,0,0,TAU);g.clip();
          g.translate(d.x,d.y);g.scale(1,.3);
          const halo=g.createRadialGradient(0,0,0,0,0,34);
          halo.addColorStop(0,`rgba(255,244,193,${pulse*.88})`);
          halo.addColorStop(.4,`rgba(255,144,209,${pulse*.62})`);halo.addColorStop(1,'rgba(255,144,209,0)');
          g.fillStyle=halo;g.fillRect(-34,-34,68,68);g.restore();
          continue;
        }
        // Independent jagged flights with irregular delays, speeds and bends.
        // Trace the actual recent turns so the trails also read as zigzags.
        for(const spark of sparks[index]) {
          const u=(elapsed-spark.delay)/spark.life;
          if(u<0||u>=1)continue;
          const alpha=smooth(u/.06)*(1-smooth((u-.53)/.47));
          const point=sparkPoint(spark,u),tailTime=Math.max(0,u-spark.trail),tail=sparkPoint(spark,tailTime);
          const x=d.x+point.x,y=d.y+point.y,[tint,core]=spark.palette;
          const radius=spark.radius*(1-.4*smooth(u));
          g.save();g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(d.x+tail.x,d.y+tail.y);
          for(const p of spark.points)if(p.t>tailTime&&p.t<u)g.lineTo(d.x+p.x,d.y+p.y);
          g.lineTo(x,y);
          g.strokeStyle=`rgba(${tint},${alpha*.16})`;g.lineWidth=3.4;g.stroke();
          g.strokeStyle=`rgba(${tint},${alpha*.92})`;g.lineWidth=spark.star?1.2:.85;g.stroke();
          g.strokeStyle=`rgba(${core},${alpha*.84})`;g.lineWidth=.38;g.stroke();
          const glow=g.createRadialGradient(x,y,0,x,y,radius*2.7);
          glow.addColorStop(0,`rgba(${tint},${alpha*.52})`);glow.addColorStop(1,`rgba(${tint},0)`);
          g.fillStyle=glow;g.fillRect(x-radius*2.7,y-radius*2.7,radius*5.4,radius*5.4);
          g.translate(x,y);g.rotate(u*.65+spark.spin);g.fillStyle=`rgba(${core},${alpha})`;
          if(spark.star) {
            g.beginPath();g.moveTo(-radius,0);g.quadraticCurveTo(0,0,0,-radius*1.4);
            g.quadraticCurveTo(0,0,radius,0);g.quadraticCurveTo(0,0,0,radius*1.4);
            g.quadraticCurveTo(0,0,-radius,0);g.fill();
          } else {g.beginPath();g.ellipse(0,0,radius*.62,radius,0,0,TAU);g.fill();}
          g.fillStyle=`rgba(255,248,218,${alpha})`;g.beginPath();g.arc(0,0,radius*.3,0,TAU);g.fill();g.restore();
        }
      }
    }
    function draw(canvas,age) {
      const g=canvas.getContext('2d'),s=motion(age),[cx,cy,rx,ry]=geometry.liquid;
      const time=Math.max(0,Number.isFinite(age)?age:0);
      g.clearRect(0,0,canvas.width,canvas.height);
      g.save();
      const scale=Math.min(canvas.width,canvas.height)/192;
      g.translate((canvas.width-192*scale)/2,(canvas.height-192*scale)/2);
      g.scale(scale,scale);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      drawSmoke(g,time,false);
      paintedFire.draw(g,time,reaction(s.t));

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
      for(const [start,x,y] of [[1.95,cx-27,cy-3],[2.92,cx+22,cy+4],[4.12,cx-7,cy-6]]) {
        const u=(s.t-start)/.6;if(u<0||u>1)continue;
        const r=.6+1.9*smooth(u/.65),alpha=Math.sin(Math.PI*u)*.65;
        g.strokeStyle=`rgba(255,206,202,${alpha})`;g.lineWidth=.65;
        g.beginPath();g.ellipse(x,y,r,r*.63,0,0,TAU);g.stroke();
        if(u<.65){g.fillStyle=`rgba(248,150,159,${alpha*.5})`;g.fill();}
      }
      g.restore();
      // Keep the enlarged smoke behind the ingredients and spoon so the
      // brewing action stays readable through the denser plumes.
      drawSmoke(g,time,true);
      drawMagic(g,s.t,true);
      drawIngredients(g,s.t);
      drawSplashes(g,s.t);

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

      drawMagic(g,s.t,false);
      // A restrained final glint marks completion before the reward appears.
      const finish=Math.sin(Math.PI*clamp((s.t-5.25)/.55));
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
  globalThis.PotionMotionPreview={make,motion,geometry,reaction,duration:DURATION,finishHold:FINISH_HOLD,loopDuration:LOOP};
})();
