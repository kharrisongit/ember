/* The same 2× source detail and four authored idle states as the house cast. */
async function prepareHollybeckArt(){
  if(SPR.hollybeck_sverre_idle_d)return;
  for(const person of ['sverre','runa','tobin'])for(const action of ['idle','walk']){
    const image=new Image();image.src=`assets/sprites/hollybeck-${person}-${action}-v2.png?v=20260930-house-style`;
    await image.decode();const frames=action==='idle'?4:6;
    for(const [row,dir]of ['d','u','e','w'].entries()){
      const key=`hollybeck_${person}_${action}_${dir}`,strip=document.createElement('canvas');
      strip.width=frames*64;strip.height=64;strip.spriteScale=2;strip.pixelLocked=true;
      const g=strip.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,row*64,frames*64,64,0,0,frames*64,64);
      animalSheets[key]=strip;SPR[key]=[0,0,32,32,frames,key];
    }
  }
}
function hollybeckNpcFrame(n,t,action){
  return action==='walk'?Math.floor(t*8)%6:villagerIdleFrame(n,t,4);
}
function prepareHollybeckVillagers(m,id){
  if(id!=='world')return;
  // Torvald was removed in the published layout; keep his lantern obtainable.
  const torvald=m.npcs.find(n=>n.n==='Torvald');
  if(torvald?.charm==='lamp')delete torvald.charm;
  for(const person of [
    {n:'Sverre',sprite:'sverre',x:43144,y:3280,routeSeed:0,charm:'lamp',
      d:['Sverre: Keep your scarf over your mouth on the north road. The wind steals your breath before your purse.',
        'Corin: Does it ever warm up here?', 'Sverre: Of course. Sometimes we only wear one pair of gloves.'],
      d2:['Sverre: I walk this stretch to keep the snow packed down.',
        'Sverre: Someone has to make a path before everyone starts saying there is no path.']},
    {n:'Runa',sprite:'runa',x:43304,y:3328,routeSeed:1,
      d:['Runa: Astrid says the soup is hot enough to thaw a boot.',
        'Corin: Have you tested that?', 'Runa: No. I want soup that tastes of soup.'],
      d2:['Runa: Two stitches for every tear. That is how a Hollybeck coat earns another winter.',
        'Runa: Yours could use three. Stand still a moment, Corin.']}
  ]){
    const editKey='npc:hollybeck:'+person.sprite;
    if(m.npcs.some(n=>n.editKey===editKey))continue;
    const {sprite,...npc}=person;
    m.npcs.push({...npc,editKey,packSpr:'hollybeck_'+sprite,packDirections:true,packWalk:true,
      loc:'Hollybeck',stationary:false,patrol:true,patrolSpeed:24,patrolRest:3500,
      idleFps:4,f:'d',noTalk:false});
  }
}
