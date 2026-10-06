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
  const cleanName = value => Array.from(String(value ?? '').normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N} '\u2019-]/gu,'').replace(/\s+/g,' ').trim()).slice(0,16).join('');
  const normalize = value => ({name:cleanName(value?.name)||'Corin',hair:colors.some(c=>c.id===value?.hair)?value.hair:'dark'});
  let profile=normalize(null), choosing=null, pageKeys=null, bytes=0;
  const cache=new Map(),hairSource='assets/portraits/corin-hair.webp?v=20261006-player';
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
  function portrait(hair=profile.hair,armored=false){
    const column=colors.findIndex(c=>c.id===hair)-1;
    return column<0?null:{id:250+column+(armored?4:0),src:hairSource,cell:column+(armored?4:0),cols:4,rows:2};
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
  function spritePage(page){
    if(profile.hair==='dark')return page.img;
    if(!pageKeys){
      if(typeof SPR==='undefined')return page.img;
      pageKeys=new Set(Object.entries(SPR).filter(([key])=>/^corin(?:_|ride_)/.test(key)).map(([,rect])=>rect[1]));
    }
    if(!pageKeys.has(page.y))return page.img;
    const old=cache.get(page.img);if(old){cache.delete(page.img);cache.set(page.img,old);return old.canvas;}
    const canvas=document.createElement('canvas');canvas.width=page.w;canvas.height=page.h;
    const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(page.img,0,0);
    const pixels=g.getImageData(0,0,page.w,page.h);recolorPixels(pixels.data,profile.hair,page.h>64);g.putImageData(pixels,0,0);
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
        <div class="playerCreatorActions"><button type="button" data-cancel>Back</button><button type="submit" class="playerCreatorBegin">Begin adventure →</button></div>
      </form>`;
      const form=root.querySelector('form'),input=root.querySelector('input'),preview=root.querySelector('.playerCreatorPreview'),choices=root.querySelector('.playerHairChoices');
      let alive=true;
      function paint(){
        const p=portrait(draft.hair)||((typeof DIALOGUE_PORTRAITS!=='undefined'&&DIALOGUE_PORTRAITS.Corin)||null);
        const color=colors.find(c=>c.id===draft.hair);preview.setAttribute('aria-label',color.label+' hair preview');
        const apply=src=>{if(!alive||draft.hair!==color.id||!src)return;preview.style.backgroundImage='url("'+src+'")';const cols=p.cols||5,rows=p.rows||4;preview.style.backgroundSize=cols*100+'% '+rows*100+'%';preview.style.backgroundPosition=(p.cell%cols)*100/(cols-1)+'% '+Math.floor(p.cell/cols)*100/(rows-1)+'%';};
        if(p?.src)apply(p.src);else if(p&&typeof loadPortraitPack==='function')loadPortraitPack(p.pack).then(apply);
        for(const b of choices.children)b.setAttribute('aria-pressed',String(b.dataset.hair===draft.hair));
      }
      for(const color of colors){const b=document.createElement('button');b.type='button';b.dataset.hair=color.id;b.style.setProperty('--hair',color.swatch);b.textContent=color.label;b.addEventListener('click',()=>{draft.hair=color.id;paint();});choices.appendChild(b);}
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
      form.addEventListener('submit',e=>{e.preventDefault();const name=cleanName(input.value);if(!name){input.setCustomValidity('Please enter a name.');input.reportValidity();return;}finish({name,hair:draft.hair});});
      input.addEventListener('input',()=>input.setCustomValidity(''));
      window.addEventListener('keydown',key,true);window.addEventListener('keyup',key,true);
      document.body.appendChild(root);paint();root.querySelector('.playerCreatorBegin').focus();
    });
    return choosing;
  }
  window.EmberPlayerIdentity={colors,cleanName,normalize,capture:()=>({...profile}),restore,text,portrait,spritePage,recolorPixels,choose,active:()=>!!choosing};
})();
