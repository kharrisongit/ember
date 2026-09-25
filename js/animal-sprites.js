/* Uploaded farm sheets stay separate from the atlas. Pack their transparent
   frame margins at runtime so the visible feet keep the old map anchors. */
const FARM_ANIMAL_ART = {"bull":{"file":"Bull_animation_without_shadow.png","cell":64,"crop":[10,14,44,30]},"calf":{"file":"Calf_animation_without_shadow.png","cell":64,"crop":[16,23,32,20]},"chick":{"file":"Chick_animation_without_shadow.png","cell":16,"crop":[3,3,10,10]},"lamb":{"file":"Lamb_animation_without_shadow.png","cell":32,"crop":[3,8,26,18]},"piglet":{"file":"Piglet_animation_without_shadow.png","cell":32,"crop":[6,11,20,15]},"rooster":{"file":"Rooster_animation_without_shadow.png","cell":32,"crop":[7,8,18,17]},"sheep":{"file":"Sheep_animation_without_shadow.png","cell":32,"crop":[2,4,28,22]},"turkey":{"file":"Turkey_animation_without_shadow.png","cell":32,"crop":[5,6,22,19]}};
const animalSheets = Object.create(null), animalStrips = [];
function registerAnimalSprites() {
  animalStrips.length=0;
  const add=(name,file,cell,row,frames,crop)=>{
    const [x,y,w,h]=crop;
    SPR[name]=[0,0,w,h,frames,name];
    animalStrips.push({name,file,cell,row,frames,crop});
  };
  const dirs=['d','u','w','e'];
  for(const [kind,a] of Object.entries(FARM_ANIMAL_ART))dirs.forEach((dir,row)=>
    add('farm_'+kind+'_'+dir,a.file,a.cell,row+4,4,a.crop));
  for(const [action,file,frames] of [['idle','Idle',4],['walk','Walk',5],['run','Run',6],['hurt','Hurt',4],['die','Death',6]])
    dirs.forEach((dir,row)=>{
      const name='hare_'+action+'_'+dir;
      add(name,'Hare_'+file+'.png',32,row,frames,[0,0,32,32]);
      FOE_ATTACK_OFFSETS[name]=[0,4];
    });
}
async function loadAnimalSprites() {
  const files=new Map();
  await Promise.all([...new Set(animalStrips.map(s=>s.file))].map(file=>new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>{files.set(file,img);resolve();};
    img.onerror=()=>reject(new Error('Animal artwork failed to load: '+file));
    img.src='assets/sprites/'+file;
  })));
  for(const s of animalStrips){
    const [x,y,w,h]=s.crop,c=document.createElement('canvas');c.width=w*s.frames;c.height=h;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    for(let f=0;f<s.frames;f++)g.drawImage(files.get(s.file),f*s.cell+x,s.row*s.cell+y,w,h,f*w,0,w,h);
    animalSheets[s.name]=c;
  }
}
function installFarmAnimals() {
  const m=W.maps.world;if(!m||m._newFarmAnimals)return;
  m._newFarmAnimals=true;
  const replacements={cow_graze:['bull'],cow2_graze:['calf'],cow:['bull'],pig_graze:['piglet'],
    sheep:['sheep'],sheep2:['lamb'],chicken:['chick'],rooster:['rooster','turkey','rooster']};
  const seen={};
  for(let i=0;i<m.objs.length;i+=3){
    const old=W.names[m.objs[i]],choices=replacements[old];
    if(!choices)continue;
    const n=seen[old]||0;seen[old]=n+1;
    const name='farm_'+choices[n%choices.length]+'_'+(n%2?'e':'w');
    let id=W.names.indexOf(name);
    if(id<0){id=W.names.length;W.names.push(name);}
    W.defs[id]={...W.defs[m.objs[i]],o:0,wd:Math.max(18,W.defs[m.objs[i]]?.wd||0),ws:W.defs[m.objs[i]]?.ws||7,wp:W.defs[m.objs[i]]?.wp||2.8};
    m.objs[i]=id;
  }
}

function farmAnimalDrawName(name,o){
  if(!/^farm_(bull|calf|chick|lamb|piglet|rooster|sheep|turkey)_[duwe]$/.test(name))return name;
  const base=name.replace(/_[duwe]$/,'');
  if(o&&o.moving){
    const dx=(o.tx||0)-(o.wx||0),dy=(o.ty||0)-(o.wy||0);
    if(Math.abs(dy)>Math.abs(dx)*0.8)return base+'_'+(dy<0?'u':'d');
    return base+'_'+(dx<0?'w':'e');
  }
  return base+'_'+(o&&o.face===-1?'w':'e');
}
