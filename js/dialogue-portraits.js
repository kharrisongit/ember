/* Speaker identities are independent of editor keys and map coordinates. */
const FACE_OF=Object.fromEntries(Object.entries(DIALOGUE_PORTRAITS).map(([name,p])=>[name,p.id]));
const PORTRAIT_ALIASES = {
  Maddock:'Elder Maddock', Elder:'Elder Maddock', Nan:'Nan Ferrow',
  Halvard:'King Halvard', King:'King Halvard', Rowan:'Rowan the Hunter',
  Iven:'Master Iven', Elowen:'Archivist Elowen', 'Shroom King':'The Shroom King',
  Dragon:'Aurelius', Knight:'Doran', 'Royal Guard':'Serjeant Bram'
};
const PORTRAIT_RENAMES = {
  'glasshouse:npc:Maren':'Meriel', 'school:npc:Tessa':'Tamsin',
  'school2:npc:Bram':'Brin', 'tavern:npc:Pip':'Puck',
  'npc:placed:f30b6b62-a107-47b7-95ad-7cc27ab5c605':'Eira',
  'npc:placed:4448128f-6fca-4e17-88f9-389ee42251f7':'Fenton',
  'npc:placed:627dc59a-0b1b-4fba-a947-39f09f5987d2':'Tallis',
  'npc:placed:6a8e054e-f933-4e1e-9327-bcb79ae59cfb':'Kip'
};
function prepareDialoguePortraitCast(m,id) {
  for(const n of m.npcs||[]) {
    const key=editorNpcKey(n), name=PORTRAIT_RENAMES[id+':'+key]||PORTRAIT_RENAMES[key];
    if(name && n.n!==name) {
      n.editKey=key; // Old published moves continue to address this same person.
      n.portraitOriginalName ||= n.n;
      const old=n.n;
      for(const field of ['d','d2','dd','dd2','dv','dv2','dragonNear','dragonRumor','dragonRumor2','said'])
        if(Array.isArray(n[field]))n[field]=n[field].map(line=>line.startsWith(old+':')?name+line.slice(old.length):line);
      n.n=name;
    }
    if(n.n==='Chanter'||n.n==='Morel') {
      // Preserve stable source slots for editor history; these humans are retired.
      n.editorDeleted=n.publishedDeleted=true;
      n.noTalk=true;
    }
    if(n.n==='Colm' && n.lookId==='pack_eater' && !SPR.pack_eater) {
      n.lookId=npcSingleSprite('tavern_src_Eater');
      const actor=(m.roomActors||[]).find(a=>a.spr==='pack_eater');
      if(actor)actor.spr=n.lookId;
    }
  }
}
const portraitPackPromises=new Map(), portraitPackImages=new Map();
const portraitPackSources=new Map();
let portraitRequest=0;
window.EmberPortraits={
  register(pack,source) { portraitPackSources.set(pack,source); }
};
function loadPortraitPack(pack) {
  if(!document.head?.appendChild)return Promise.resolve(null);
  if(portraitPackPromises.has(pack))return portraitPackPromises.get(pack);
  const promise=new Promise(resolve=>{
    const script=document.createElement('script');
    script.src='assets/portraits/pack-'+pack+'.js?v=20260926-portraits2';
    script.async=true;
    script.onerror=()=>{portraitPackPromises.delete(pack);script.remove();resolve(null);};
    script.onload=()=>{
      const source=portraitPackSources.get(pack);
      if(!source){portraitPackPromises.delete(pack);resolve(null);return;}
      const img=new Image();
      img.onload=()=>{portraitPackImages.set(pack,img);resolve(source);};
      img.onerror=()=>{portraitPackPromises.delete(pack);resolve(null);};
      img.src=source;
    };
    document.head.appendChild(script);
  });
  portraitPackPromises.set(pack,promise);
  return promise;
}
function portraitFor(who) {
  if(!who)return null;
  const name=PORTRAIT_ALIASES[who]||who;
  return DIALOGUE_PORTRAITS[name]||null;
}
function showDialoguePortrait(who) {
  const request=++portraitRequest, portrait=portraitFor(who);
  faceEl.style.display='none';
  faceEl.style.backgroundImage='none';
  faceEl.className=who==='Corin'?'right':'left';
  nameEl.className=(typeWho?'on ':'')+(who==='Corin'?'left':'right');
  shownFace=portrait?portrait.id:-1;
  if(!portrait){faceEl.removeAttribute('data-speaker');return;}
  faceEl.dataset.speaker=PORTRAIT_ALIASES[who]||who;
  const paint=source=>{
    if(!source||request!==portraitRequest)return;
    faceEl.style.backgroundImage='url("'+source+'")';
    faceEl.style.backgroundSize='500% 400%';
    faceEl.style.backgroundPosition=(portrait.cell%5)*25+'% '+Math.floor(portrait.cell/5)*(100/3)+'%';
    faceEl.style.display='block';
  };
  const cached=portraitPackImages.get(portrait.pack);
  if(cached)paint(cached.src);else loadPortraitPack(portrait.pack).then(paint);
}
// Decode the starting cast while the existing boot screen is already visible.
if(document.head?.appendChild)loadPortraitPack(1);
