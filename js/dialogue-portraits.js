/* Speaker identities are independent of editor keys and map coordinates. */
const FACE_OF=Object.fromEntries(Object.entries(DIALOGUE_PORTRAITS).map(([name,p])=>[name,p.id]));
const PORTRAIT_ALIASES = {
  Bram:'Serjeant Bram', Maddock:'Elder Maddock', Elder:'Elder Maddock', Nan:'Nan Ferrow',
  Halvard:'King Halvard', King:'King Halvard', Rowan:'Rowan the Hunter',
  Iven:'Master Iven', Elowen:'Archivist Elowen', 'Shroom King':'The Shroom King',
  Mattock:'Bors','Caravanner Sami':'Bilal',
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
    const key=editorNpcKey(n), name=n.n==='Mattock'?'Bors':PORTRAIT_RENAMES[id+':'+key]||PORTRAIT_RENAMES[key];
    if(name && n.n!==name) {
      n.editKey=key; // Old published moves continue to address this same person.
      n.portraitOriginalName ||= n.n;
      const old=n.n;
      for(const field of ['d','d2','dd','dd2','dv','dv2','dragonNear','dragonRumor','dragonRumor2','said'])
        if(Array.isArray(n[field]))n[field]=n[field].map(line=>line.startsWith(old+':')?name+line.slice(old.length):line);
      n.n=name;
    }
    if(n.n==='Wren'){
      if(n.charm==='twin')delete n.charm;
      n.d=['Wren: Comfrey, feverfew, and salves for the road. What do you need?'];
      n.dd=['Wren: Let me know if your dragon needs tending.'];
      n.dragonRumor=['Wren: Look after your companion, Corin.'];
    }
    if(n.n==='Fen')n.charm='twin';
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
FACE_OF.Edwin=184;
const PORTRAIT_FILES={Edwin:'edwin',Dunstan:'dunstan','Elder Maddock':'maddock',Sverre:'hollybeck-sverre',Runa:'hollybeck-runa',Tobin:'hollybeck-tobin',Aurelius:'aurelius',Fen:'fen','Rowan the Hunter':'rowan',Isolde:'isolde',Linna:'linna',Bevan:'bevan',Ovid:'ovid',Prue:'prue','Cartwright Oswin':'oswin'};
for(const [index,person]of (typeof REGIONAL_VILLAGERS==='undefined'?[]:REGIONAL_VILLAGERS).entries()){
  PORTRAIT_FILES[person.name]='regional/'+person.id;
  FACE_OF[person.name]=160+index;
}
const portraitFileImages=new Map();
// One small, lazy atlas covers both preachers and all sixteen parishioners.
const CHAPEL_PORTRAITS=Object.fromEntries(['Brother Oswin','Brother Ansel','Mara Bell','Teren Vale','Nessa Flint','Orris Reed','Elva Moss','Brennor Ash','Sera Penn','Halen Birch','Iria Dawn','Davin Rook','Mina Thorne','Perrin Clay','Brother Orenfold','Brother Selwyn','Brother Edrin','Brother Cael'].map((name,cell)=>[name,{id:220+cell,src:'assets/portraits/chapel.webp?v=20261006',cell,cols:6,rows:3}]));
for(const [name,p]of Object.entries(CHAPEL_PORTRAITS))FACE_OF[name]=p.id;
function portraitBackground(p){
  if(p.cols===1||p.src&&!p.cols)return {size:'contain',position:'center bottom'};
  const cols=p.cols||5,rows=p.rows||4;
  return {size:cols*100+'% '+rows*100+'%',position:(p.cell%cols)*100/(cols-1)+'% '+Math.floor(p.cell/cols)*100/(rows-1)+'%'};
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
    script.src='assets/portraits/pack-'+pack+'.js?v=20260927-cast-final';
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
  if(CHAPEL_PORTRAITS[name])return CHAPEL_PORTRAITS[name];
  if(name==='Corin'){const custom=window.EmberPlayerIdentity?.portrait(undefined,typeof smithUpgrade!=='undefined'&&!!smithUpgrade);if(custom)return custom;}
  if(name==='Corin'&&typeof smithUpgrade!=='undefined'&&smithUpgrade)return {id:133,pack:8,cell:0};
  const portrait=DIALOGUE_PORTRAITS[name];
  if(PORTRAIT_FILES[name])return {...(portrait||{id:FACE_OF[name]??(name==='Tobin'?135:134)}),src:'assets/portraits/'+PORTRAIT_FILES[name]+'.webp?v=20260930-hatless-farmer'};
  return portrait||null;
}
function showDialoguePortrait(who) {
  const request=++portraitRequest;
  const portrait=typeof scene!=='undefined'&&scene?.hatch?null:portraitFor(who);
  faceEl.style.display='none';
  faceEl.style.backgroundImage='none';
  faceEl.className=who==='Corin'?'right':'left';
  nameEl.className=who?(typeWho?'on ':'')+(who==='Corin'?'left':'right'):'';
  shownFace=portrait?portrait.id:-1;
  if(!portrait){faceEl.removeAttribute('data-speaker');return;}
  faceEl.dataset.speaker=PORTRAIT_ALIASES[who]||who;
  const paint=source=>{
    if(!source||request!==portraitRequest)return;
    faceEl.style.backgroundImage='url("'+source+'")';
    const frame=portraitBackground(portrait);faceEl.style.backgroundSize=frame.size;
    faceEl.style.backgroundPosition=frame.position;
    faceEl.style.display='block';
  };
  if(portrait.src){paint(portrait.src);return;}
  const cached=portraitPackImages.get(portrait.pack);
  const source=cached?Promise.resolve(cached.src):loadPortraitPack(portrait.pack);source.then(src=>portrait.hair?window.EmberPlayerIdentity.portraitSource(portrait,src):src).then(paint);
}
// Warm the full cast during the existing loading/title screens. Conversation
// should never be the first time we fetch a portrait's script and decode it.
if(document.head?.appendChild){
  for(let pack=1;pack<=8;pack++)loadPortraitPack(pack);
  for(const file of Object.values(PORTRAIT_FILES)){
    const img=new Image();img.src='assets/portraits/'+file+'.webp?v=20260930-hatless-farmer';
    portraitFileImages.set(file,img);
  }
}

// Small telepathy portraits reuse the same cast and decoded atlas as dialogue.
function paintSmallPortrait(el,who){
  const portrait=portraitFor(who);el.dataset.speaker=who;el.dataset.missing=String(!portrait);el.style.backgroundImage='none';
  if(!portrait)return;
  const paint=source=>{
    if(!source||el.dataset.speaker!==who)return;
    el.style.backgroundImage='url("'+source+'")';
    const frame=portraitBackground(portrait);el.style.backgroundSize=frame.size;
    el.style.backgroundPosition=frame.position;
  };
  if(portrait.src){paint(portrait.src);return;}
  const cached=portraitPackImages.get(portrait.pack);
  const source=cached?Promise.resolve(cached.src):loadPortraitPack(portrait.pack);source.then(src=>portrait.hair?window.EmberPlayerIdentity.portraitSource(portrait,src):src).then(paint);
}
