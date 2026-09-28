(()=>{
  const mix=window.EmberAudioMix,button=document.getElementById('bAudioMix');
  if(!mix||!button)return;
  let panel=null,preview=null;
  const stop=()=>{if(preview?.startsWith('sfx:'))window.EmberSfx?.stopPreview(preview.slice(4));window.EmberAudio?.stopPreview();preview=null;};
  const close=()=>{stop();panel.hidden=true;};
  button.addEventListener('click',()=>{
    if(panel){panel.hidden=!panel.hidden;if(panel.hidden)stop();return;}
    panel=document.createElement('section');panel.id='audioMixPanel';panel.setAttribute('aria-label','Audio mixer');
    panel.style.cssText='position:fixed;right:8px;top:max(8px,env(safe-area-inset-top));z-index:9998;width:min(370px,calc(100vw - 16px));max-height:72dvh;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;box-sizing:border-box;padding:12px;background:#17242bf5;color:#eee2c8;border:1px solid #ae9864;border-radius:10px;font:14px/1.4 sans-serif;box-shadow:0 4px 20px #0009;touch-action:pan-y';
    const heading=document.createElement('strong');heading.textContent='AUDIO MIXER';const header=document.createElement('div');header.style='position:sticky;top:-12px;background:#17242b;z-index:1;margin:-12px -12px 8px;padding:12px 12px 1px';header.append(heading);panel.append(header);
    const controls=document.createElement('div');controls.style='display:flex;gap:6px;flex-wrap:wrap;margin:10px 0';
    for(const [label,fn]of [['Close',close],['Stop preview',stop],['Reset unsent',()=>{stop();mix.reset();saveEditorDraft();}],['Send Changes',()=>sendEditorChanges()]]){
      const b=document.createElement('button');b.textContent=label;b.style='min-height:36px';b.onclick=fn;controls.append(b);
    }
    header.append(controls);
    const help=document.createElement('p');help.textContent='Hear changes live. 100% is the original mix. Send Changes publishes these levels for everyone.';help.style='font-size:12px;margin:8px 0';panel.append(help);
    for(const group of ['sfx:','music:']){
      const title=document.createElement('h3');title.textContent=group==='sfx:'?'Sound effects':'Songs';title.style='font-size:14px;margin:14px 0 6px';panel.append(title);
      const available=window.EmberAudio?.tracks()||[];
      for(const [key,name]of Object.entries(mix.catalog)){
        if(!key.startsWith(group)||(group==='music:'&&!available.includes(key.slice(6))))continue;
        const row=document.createElement('div');row.style='padding:7px 0;border-bottom:1px solid #ffffff20';
        const label=document.createElement('label'),value=document.createElement('output'),range=document.createElement('input');
        range.type='range';range.min=0;range.max=200;range.step=1;range.id='mix-'+key.replace(':','-');range.style='width:calc(100% - 72px);min-height:36px;vertical-align:middle';label.htmlFor=range.id;
        label.textContent=name;value.style='float:right';label.append(value);label.style='display:block';
        const update=()=>{range.value=Math.round(mix.level(key)*100);value.textContent=range.value+'%';};update();mix.subscribe(update);
        range.oninput=()=>mix.set(key,Number(range.value)/100);range.onchange=()=>saveEditorDraft();
        const play=document.createElement('button');play.textContent='Play';play.setAttribute('aria-label','Preview '+name);play.style='min-height:36px;width:62px;margin-left:6px';play.onclick=()=>{window.EmberAudio?.unlock();stop();preview=key;if(group==='sfx:')window.EmberSfx?.preview(key.slice(4));else window.EmberAudio?.preview(key.slice(6));};
        row.append(label,range,play);panel.append(row);
      }
    }
    for(const type of ['pointerdown','touchstart','keydown'])panel.addEventListener(type,e=>e.stopPropagation());
    document.body.append(panel);
  });
})();
