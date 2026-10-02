/* Edwin tends the crop field, leaving the egg basket and coop approach clear. */
async function prepareFarmResidentArt(){
  if(SPR.farm_edwin_idle_d)return;
  const image=await loadStartupImage('assets/sprites/farm/edwin.png?v=20260930-farm');
  for(const [row,dir]of ['d','u','e','w'].entries()){
    const key='farm_edwin_idle_'+dir,strip=document.createElement('canvas');
    strip.width=256;strip.height=64;strip.spriteScale=2;strip.pixelLocked=true;
    const g=strip.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,row*64,256,64,0,0,256,64);
    animalSheets[key]=strip;SPR[key]=[0,0,32,32,4,key];
  }
}
function prepareFarmResident(map,id){
  if(id!=='world')return;
  const woodcutter=map.npcs.find(n=>n.n==='Gwil');
  if(woodcutter&&woodcutter.townPlacementVersion!==2){
    Object.assign(woodcutter,{x:584,y:6960,patrolPoints:[[584,6960],[584,6928]],route:null,leg:0,goto:null,patrolFrom:undefined,townPlacementVersion:2,loc:'Millwood — village square'});
  }
  const tilda=map.npcs.find(n=>n.n==='Tilda');
  if(tilda&&tilda.townPlacementVersion!==2)Object.assign(tilda,{x:536,y:6784,patrolPoints:[[536,6784],[536,6808]],route:null,leg:0,goto:null,regionalPlaced:true,townPlacementVersion:2});
  const farmer=map.npcs.find(n=>n.editKey==='npc:farm:edwin');
  if(farmer){Object.assign(farmer,{x:338,y:6992,goto:null,patrol:false,stationary:true});return;}
  map.npcs.push({n:'Edwin',editKey:'npc:farm:edwin',x:338,y:6992,packSpr:'farm_edwin',packDirections:true,packWalk:false,
    stationary:true,f:'d',kf:'d',idleFps:4,loc:'Millwood — farm',
    d:['Edwin: Morning, Corin. Mind the latch; the hens have been watching me open it.'],
    dd:['Edwin: That dragon may watch, but the hens insist on keeping their breakfast.']});
}
