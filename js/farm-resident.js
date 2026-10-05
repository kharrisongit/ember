/* Edwin tends the crop field, leaving the egg basket and coop approach clear. */
async function prepareFarmResidentArt(){
  if(SPR.farm_edwin_idle_d)return;
  const image=await loadStartupImage('assets/sprites/farm/edwin.png?v=20260930-farm');
  for(const [row,dir]of ['d','u','e','w'].entries()){
    const key='farm_edwin_idle_'+dir,strip=document.createElement('canvas');
    strip.width=256;strip.height=64;strip.spriteScale=2;strip.pixelLocked=true;
    const g=strip.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(image,0,row*64,256,64,0,0,256,64);
    // Match the regional cast's registered idle poses. Generated variations
    // must not move the whole face/hat/boots while the chest breathes.
    const neutral=document.createElement('canvas');neutral.width=64;neutral.height=64;
    neutral.getContext('2d').drawImage(image,0,row*64,64,64,0,0,64,64);
    const eyes={d:[18,23,46,35],e:[32,23,49,36],w:[15,23,32,36]}[dir];
    for(let frame=1;frame<4;frame++){
      const x=frame*64;g.clearRect(x,0,64,64);g.drawImage(neutral,x,0);
      if(frame===1){
        // One source pixel of cloth/hand movement; head and feet stay fixed.
        const top=37,bottom=53;g.clearRect(x,top,64,bottom-top);
        g.drawImage(neutral,0,top+1,64,bottom-top-1,x,top,64,bottom-top-1);
        g.drawImage(neutral,0,bottom-1,64,1,x,bottom-1,64,1);
      }else if(eyes){
        const [l,t,r,b]=eyes;g.clearRect(x+l,t,r-l,b-t);
        g.drawImage(image,frame*64+l,row*64+t,r-l,b-t,x+l,t,r-l,b-t);
      }
    }
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
  if(farmer){Object.assign(farmer,{x:338,y:6992,goto:null,patrol:false,stationary:true,
    packSpr:'farm_edwin',packDirections:true,packWalk:false,idleFps:4,idleFrame:undefined,
    sk:undefined,body:undefined,seatSpr:undefined,seated:false});return;}
  map.npcs.push({n:'Edwin',editKey:'npc:farm:edwin',x:338,y:6992,packSpr:'farm_edwin',packDirections:true,packWalk:false,
    stationary:true,f:'d',kf:'d',idleFps:4,loc:'Millwood — farm',
    d:['Edwin: Morning, Corin. Mind the latch; the hens have been watching me open it.'],
    dd:['Edwin: That dragon may watch, but the hens insist on keeping their breakfast.']});
}
