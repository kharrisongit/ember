/* Corin remains the story actor's internal key. Only presentation uses this profile. */
(() => {
  'use strict';
  const colors = [
    {id:'dark',label:'Dark',swatch:'#51404b'},
    {id:'brown',label:'Brown',swatch:'#795039',rgb:[108,68,43]},
    {id:'copper',label:'Copper',swatch:'#bb5a30',rgb:[180,78,36]},
    {id:'blond',label:'Blond',swatch:'#dab76a',rgb:[215,173,87]},
    {id:'silver',label:'Silver',swatch:'#c4c2cf',rgb:[186,186,201]}
  ];
  const eyeColors=[{id:'blue',label:'Blue',swatch:'#548fc3',rgb:[66,132,189]},{id:'green',label:'Green',swatch:'#729951',rgb:[92,139,63]},{id:'brown',label:'Brown',swatch:'#936345',rgb:[125,78,44]},{id:'hazel',label:'Hazel',swatch:'#b29c53',rgb:[161,131,57]},{id:'gray',label:'Gray',swatch:'#9dabb5',rgb:[139,157,170]}];
  const cleanName = value => Array.from(String(value ?? '').normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N} '\u2019-]/gu,'').replace(/\s+/g,' ').trim()).slice(0,16).join('');
  const normalize = value => ({name:cleanName(value?.name)||'Corin',hair:colors.some(c=>c.id===value?.hair)?value.hair:'dark',eyes:eyeColors.some(c=>c.id===value?.eyes)?value.eyes:'blue'});
  let profile=normalize(null), choosing=null, pageKeys=null, bytes=0;
  const cache=new Map();
  function restore(value){
    profile=normalize(value);cache.clear();bytes=0;
    const hud=document.getElementById('playerHudName'),death=document.getElementById('playerDeathTitle');
    if(hud){hud.textContent=profile.name.toUpperCase();hud.title=profile.name;}
    if(death)death.textContent=profile.name.toUpperCase()+' FALLS';
  }
  function text(value){
    // Protect the chosen name on repeated display passes (e.g. “Corin Junior”).
    const escaped=profile.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return String(value??'').replace(new RegExp('(?<![\\p{L}\\p{N}_])(?:'+escaped+'|Corin)(?![\\p{L}\\p{N}_])','gu'),match=>match==='Corin'?profile.name:match);
  }
  const portraitColors=new Map();
  function portrait(hair=profile.hair,armored=false,eyes=profile.eyes){
    const column=Math.max(0,colors.findIndex(c=>c.id===hair)),eye=Math.max(0,eyeColors.findIndex(c=>c.id===eyes));
    return {id:250+column+eye*5+(armored?25:0),pack:armored?8:1,cell:0,cols:1,rows:1,hair,eyes,armored};
  }
  function portraitSource(p,source){
    if(!source||!p.hair)return Promise.resolve(source);
    const key=p.hair+':'+p.eyes+':'+p.armored;if(portraitColors.has(key))return portraitColors.get(key);
    const promise=new Promise(resolve=>{
      const image=new Image();image.onerror=()=>{portraitColors.delete(key);resolve(null);};
      image.onload=()=>{
        const w=image.width/5,h=image.height/4,c=document.createElement('canvas');c.width=w;c.height=h;
        const g=c.getContext('2d');g.drawImage(image,0,0,w,h,0,0,w,h);
        const pixels=g.getImageData(0,0,w,h),data=pixels.data,base=colors.find(c=>c.id===p.hair).rgb;
        // Both outfits use their exact original portrait. Only the cool plum
        // hair pixels above the face/ears change; geometry and alpha never do.
        const bounds=p.armored?{x0:.29,x1:.73,y0:.14,y1:.53}:{x0:.28,x1:.81,y0:.025,y1:.50};
        const back=p.armored?[[67,57],[81,62],[81,72],[85,82],[82,91],[69,93],[64,83]]:[[63,53],[77,53],[79,67],[83,75],[74,83],[63,81]];
        const inBack=(x,y)=>{x=x*192/w;y=y*192/h;let inside=false;for(let i=0,j=back.length-1;i<back.length;j=i++){const [a,b]=back[i],[c,d]=back[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;};
        if(base)for(let y=Math.floor(h*bounds.y0);y<h*bounds.y1;y++)for(let x=Math.floor(w*bounds.x0);x<w*bounds.x1;x++){
          const i=(y*w+x)*4,r=data[i],green=data[i+1],b=data[i+2];
          if(!data[i+3]||r<8||(!inBack(x,y)&&(b<green*1.05||r<green*1.06||b<r*.70||b>r*1.32)))continue;
          const light=(r*.28+green*.5+b*.22)/74;
          for(let n=0;n<3;n++)data[i+n]=Math.min(255,Math.round(base[n]*light));
        }
        const eye=eyeColors.find(c=>c.id===p.eyes)||eyeColors[0];
        const irises=p.armored?[[104.5,64.5],[115.5,67]]:[[115,53.5],[128,55.5]];
        for(const [ex,ey]of irises)for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){
          const x=Math.round((ex+xx)*w/192),y=Math.round((ey+yy)*h/192),radius=(xx/1.7)**2+(yy/1.15)**2;if(radius>1)continue;
          const i=(y*w+x)*4,light=(data[i]+data[i+1]+data[i+2])/3;if(!data[i+3]||light>185)continue;
          const shade=xx===0&&yy===0?.32:.72;
          for(let n=0;n<3;n++)data[i+n]=Math.round(data[i+n]*.28+eye.rgb[n]*shade);
        }
        g.putImageData(pixels,0,0);resolve(c.toDataURL('image/png'));
      };image.src=source;
    });portraitColors.set(key,promise);return promise;
  }
  const footPalette=new Map([0x211a1c,0x2b2023,0x3b2c33,0x4d3945,0x684f5a,0x876c7d].map((rgb,i)=>[rgb,i]));
  // The on-foot source has an exact six-color hair ramp. Mounted sheets are
  // compressed: accept only the muted plum hair ramp, preserving skin, clothes,
  // armor, red dragon scales, alpha and every animation frame.
  function hairLevel(r,g,b,mounted){
    if(!mounted)return footPalette.get((r<<16)|(g<<8)|b)??-1;
    if(r<26||r>160||g<r*.60||g>r*.85||b<r*.80||b>r*1.12)return -1;
    return Math.max(0,Math.min(5,Math.round((r-28)/22)));
  }
  function recolorPixels(data,hair,mounted=false){
    const base=colors.find(c=>c.id===hair)?.rgb;if(!base)return 0;
    const ramp=[.29,.39,.53,.70,.88,1.15].map(v=>base.map(c=>Math.min(255,Math.round(c*v))));
    let changed=0;
    for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const level=hairLevel(data[i],data[i+1],data[i+2],mounted);if(level<0)continue;
      [data[i],data[i+1],data[i+2]]=ramp[level];changed++;
    }
    return changed;
  }
  function recolorEyes(data,eyes,mounted=false,width=0){
    if(eyes==='blue')return 0;const color=eyeColors.find(c=>c.id===eyes)?.rgb;if(!color)return 0;let changed=0;
    for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];
      // Saturated blue iris ramp; armor and steel use neutral low-saturation ramps.
      if(!data[i+3]||b<90||b<r*1.65||b<g*1.12||g<r*1.25||g>b*.9)continue;
      if(width){
        const pixel=i/4,x=pixel%width,y=Math.floor(pixel/width);let skin=0;
        for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]]){if(x+dx<0||x+dx>=width||y+dy<0)continue;const j=((y+dy)*width+x+dx)*4;if(data[j+3]&&data[j]>100&&data[j]>data[j+1]*1.1&&data[j+1]>data[j+2]*1.15)skin++;}
        if(skin<2)continue;
      }
      const light=Math.min(1.3,b/190);for(let n=0;n<3;n++)data[i+n]=Math.round(Math.min(255,color[n]*light));changed++;
    }return changed;
  }
  function spritePage(page){
    if(profile.hair==='dark'&&profile.eyes==='blue')return page.img;
    if(!pageKeys){
      if(typeof SPR==='undefined')return page.img;
      pageKeys=new Set(Object.entries(SPR).filter(([key])=>/^corin(?:_|ride_)/.test(key)).map(([,rect])=>rect[1]));
    }
    if(!pageKeys.has(page.y))return page.img;
    const old=cache.get(page.img);if(old){cache.delete(page.img);cache.set(page.img,old);return old.canvas;}
    const canvas=document.createElement('canvas');canvas.width=page.w;canvas.height=page.h;
    const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(page.img,0,0);
    const pixels=g.getImageData(0,0,page.w,page.h);recolorPixels(pixels.data,profile.hair,page.h>64);recolorEyes(pixels.data,profile.eyes,page.h>64,page.w);g.putImageData(pixels,0,0);
    const cost=page.w*page.h*4;
    while(bytes+cost>4*1024*1024&&cache.size){const key=cache.keys().next().value;bytes-=cache.get(key).cost;cache.delete(key);}
    cache.set(page.img,{canvas,cost});bytes+=cost;return canvas;
  }
  function choose(){
    if(choosing)return choosing;
    choosing=new Promise(resolve=>{
      const previous=document.activeElement,draft=normalize(null);
      if(typeof clearPadInputs==='function')clearPadInputs();
      const root=document.createElement('div');root.id='playerCreator';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','playerCreatorTitle');
      root.innerHTML=`<form class="playerCreatorCard">
        <p class="playerCreatorEyebrow">A new journey</p><h2 id="playerCreatorTitle">Your Dragonrider</h2>
        <div class="playerCreatorPreview" role="img" aria-label="Your character"></div>
        <label for="playerName">What is your name?</label>
        <input id="playerName" name="playerName" type="text" value="Corin" maxlength="32" autocomplete="off" autocapitalize="words" spellcheck="false" aria-describedby="playerNameHelp">
        <p id="playerNameHelp">Up to 16 letters, numbers, spaces, or hyphens.</p>
        <fieldset><legend>Hair color</legend><div class="playerHairChoices"></div></fieldset>
        <fieldset><legend>Eye color</legend><div class="playerEyeChoices"></div></fieldset>
        <div class="playerCreatorActions"><button type="button" data-cancel>Back</button><button type="submit" class="playerCreatorBegin">Begin adventure →</button></div>
      </form>`;
      const form=root.querySelector('form'),input=root.querySelector('input'),preview=root.querySelector('.playerCreatorPreview'),choices=root.querySelector('.playerHairChoices'),eyeChoices=root.querySelector('.playerEyeChoices');
      let alive=true;
      function paint(){
        const p=portrait(draft.hair,false,draft.eyes)||((typeof DIALOGUE_PORTRAITS!=='undefined'&&DIALOGUE_PORTRAITS.Corin)||null);
        const color=colors.find(c=>c.id===draft.hair),eyes=draft.eyes;preview.setAttribute('aria-label',color.label+' hair and '+eyes+' eyes preview');
        const apply=src=>{if(!alive||draft.hair!==color.id||draft.eyes!==eyes||!src)return;preview.style.backgroundImage='url("'+src+'")';const frame=portraitBackground(p);preview.style.backgroundSize=frame.size;preview.style.backgroundPosition=frame.position;};
        if(p?.src)apply(p.src);else if(p&&typeof loadPortraitPack==='function')loadPortraitPack(p.pack).then(src=>portraitSource(p,src)).then(apply);
        for(const b of eyeChoices.children)b.setAttribute('aria-pressed',String(b.dataset.eyes===draft.eyes));
        for(const b of choices.children)b.setAttribute('aria-pressed',String(b.dataset.hair===draft.hair));
      }
      for(const color of colors){const b=document.createElement('button');b.type='button';b.dataset.hair=color.id;b.style.setProperty('--hair',color.swatch);b.textContent=color.label;b.addEventListener('click',()=>{draft.hair=color.id;paint();});choices.appendChild(b);}
      for(const color of eyeColors){const b=document.createElement('button');b.type='button';b.dataset.eyes=color.id;b.style.setProperty('--hair',color.swatch);b.textContent=color.label;b.addEventListener('click',()=>{draft.eyes=color.id;paint();});eyeChoices.appendChild(b);}
      function finish(value){alive=false;window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',key,true);root.remove();choosing=null;if(typeof clearPadInputs==='function')clearPadInputs();previous?.focus?.();resolve(value);}
      function key(e){
        e.stopImmediatePropagation();
        if(e.type==='keyup')return;
        if(e.key==='Escape'){e.preventDefault();finish(null);}
        else if(e.key==='Tab'){
          const nodes=[...root.querySelectorAll('input,button')],first=nodes[0],last=nodes[nodes.length-1];
          if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
          else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        }
      }
      root.querySelector('[data-cancel]').addEventListener('click',()=>finish(null));
      form.addEventListener('submit',e=>{e.preventDefault();const name=cleanName(input.value);if(!name){input.setCustomValidity('Please enter a name.');input.reportValidity();return;}finish({name,hair:draft.hair,eyes:draft.eyes});});
      input.addEventListener('input',()=>input.setCustomValidity(''));
      window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);
      document.body.appendChild(root);paint();root.querySelector('.playerCreatorBegin').focus();
    });
    return choosing;
  }
  window.EmberPlayerIdentity={colors,eyeColors,cleanName,normalize,capture:()=>({...profile}),restore,text,portrait,portraitSource,spritePage,recolorPixels,recolorEyes,choose,active:()=>!!choosing};
})();
