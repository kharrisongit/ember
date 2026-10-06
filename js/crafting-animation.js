/* Small recipe illustrations, driven by the existing paused-world crafting clock. */
(() => {
  let tools=null,item=null,recipeId='';
  const styles={
    potion:['brew','Stirring the potion…','#76bb85'],elixir:['brew','Mixing the elixir…','#e5bd62'],
    bomb:['brew','Brewing Maelis’s Curse…','#ae7acf'],saint:['brew','Mixing Saint’s Breath…','#91cbdc'],
    dust:['powder','Grinding the powder…','#b197c9'],salt:['powder','Grinding the consecration…','#dfc57e'],
    bell:['bell','Hammering the bell stake…','#efc56b'],mark:['marker','Chiseling the grave marker…','#a7b4bf'],
    stone:['crystal','Enchanting the stone…','#85cdbf']
  };
  const style=r=>styles[r.id]||['food',r.raw==='dragonFish'?'Baking the fish…':'Roasting the meat…','#d49b62'];
  function prepare(r){
    if(!tools){tools=new Image();tools.src='assets/crafting/camp-tools.webp?v=20261006-hands';}
    if(recipeId!==r.id){
      recipeId=r.id;item=document.createElement('canvas');item.width=item.height=96;
      const id=r.raw||r.id;drawBagIcon(item,BAG.find(i=>i.key===id)?.icon?.(),0);
    }
  }
  function draw(canvas,r,age){
    prepare(r);const g=canvas.getContext('2d'),[kind,,color]=style(r);
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const t=reduced?0:age,x=96,y=91,size=118;
    g.clearRect(0,0,192,160);g.imageSmoothingEnabled=false;
    const ellipse=(xx,yy,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(xx,yy,rx,ry,0,0,Math.PI*2);g.fill();};
    const sprite=(cell,xx,yy,w,h,angle=0)=>{
      if(!tools?.complete||!tools.naturalWidth)return false;
      g.save();g.translate(Math.round(xx),Math.round(yy));g.rotate(angle);
      const sw=tools.width/3,sh=tools.height/2;
      g.drawImage(tools,cell%3*sw,Math.floor(cell/3)*sh,sw,sh,-w/2,-h/2,w,h);g.restore();return true;
    };
    const icon=(xx,yy,w,angle=0)=>{g.save();g.translate(xx,yy);g.rotate(angle);g.drawImage(item,-w/2,-w/2,w,w);g.restore();};
    const chips=(c,cx,cy)=>{if(reduced)return;for(let i=0;i<5;i++){
      const p=(t*2.5+i*.19)%1;g.fillStyle=c;g.globalAlpha=1-p;g.fillRect(Math.round(cx+(i-2)*p*13),Math.round(cy-22*Math.sin(p*Math.PI)),3,3);
    }g.globalAlpha=1;};
    ellipse(x,139,48,5,'#72583920');
    if(kind==='brew'||kind==='powder'){
      if(!sprite(kind==='brew'?1:0,x,y,size,106)){
        g.fillStyle=kind==='brew'?'#34323c':'#969084';g.fillRect(54,78,84,40);ellipse(x,78,42,15,'#34323c');
      }
      ellipse(x,y-2,29,13,color);
      if(kind==='brew'){
        for(let i=0;i<4;i++){const p=(t*.8+i/4)%1;ellipse(x+Math.sin(i*7)*19,y-5-p*17,2,2,'#f7efd8');}
        const sx=x+Math.cos(t*9)*9,sy=y-24;
        if(!sprite(4,sx,sy,62,72,Math.PI+Math.sin(t*9)*.25)){
          g.fillStyle='#956132';g.fillRect(sx,sy-20,5,42);
        }
      }else{
        const lift=Math.abs(Math.sin(t*10))*15;
        if(!sprite(3,x+4,y-22-lift,62,70,.35)){
          g.fillStyle='#9d7344';g.fillRect(x-3,y-46-lift,10,40);
        }
        chips('#e6d7ab',x,y-6);
      }
    }else if(kind==='bell'){
      // A metal stake rests on a small anvil while the hammer strikes its top.
      g.fillStyle='#3b3d44';g.fillRect(48,110,96,9);g.fillRect(71,117,47,14);g.fillRect(63,130,64,7);
      icon(88,92,82);
      g.save();g.translate(124,52);g.rotate(-.8+Math.abs(Math.sin(t*9))*.9);
      g.fillStyle='#81542f';g.fillRect(-3,-7,7,42);g.fillStyle='#30353c';g.fillRect(-16,27,32,13);
      g.fillStyle='#b6bfc3';g.fillRect(-14,28,28,9);g.fillStyle='#e1e5d6';g.fillRect(-12,28,24,2);g.restore();
      chips(color,109,88);
    }else if(kind==='marker'){
      icon(x,97,102);
      g.save();g.translate(117,83-Math.abs(Math.sin(t*11))*7);g.rotate(.52);
      g.fillStyle='#46525a';g.fillRect(-4,-36,8,41);g.fillStyle='#d7dfd8';g.fillRect(-3,-34,3,37);
      g.fillStyle='#96723e';g.fillRect(-5,-44,10,16);g.restore();chips('#b6b3a6',111,94);
    }else if(kind==='crystal'){
      ellipse(x,94,42,23,'#6aabac20');icon(x,y,93);
      for(let i=0;i<6;i++){const a=t*3+i*Math.PI/3,cx=x+Math.cos(a)*45,cy=y+Math.sin(a)*27;
        g.fillStyle=color;g.fillRect(Math.round(cx)-1,Math.round(cy)-4,3,9);g.fillRect(Math.round(cx)-4,Math.round(cy)-1,9,3);}
    }else{
      g.fillStyle='#61402d';g.fillRect(50,126,89,8);
      for(let i=0;i<6;i++){const h=8+Math.round((1+Math.sin(t*10+i))*5);g.fillStyle=i%2?'#eeaf44':'#ce6235';g.fillRect(59+i*13,126-h,8,h);}
      g.fillStyle='#30383b';g.fillRect(43,95,108,8);g.fillRect(50,103,5,27);g.fillRect(137,103,5,27);
      icon(x,81-Math.abs(Math.sin(t*3))*3,89,Math.sin(t*3)*.04);
      if(!reduced)for(let i=0;i<3;i++){const p=(t*.9+i/3)%1;g.globalAlpha=(1-p)*.6;g.fillStyle='#e6d7bd';g.fillRect(x-20+i*18+Math.sin(t*3+i)*3,51-p*22,3,8);}g.globalAlpha=1;
    }
  }
  window.CraftingAnimation={prepare,draw,label:r=>style(r)[1],kind:r=>style(r)[0]};
})();
