/* Nan's first batch is ready when she returns home. Each gift starts one new
   ten-minute batch; a saved timestamp also covers time away from the game. */
let nanElixirReadyAt=0;
async function prepareNanCookingArt(){
  if(SPR.nan_cooking)return;
  const data=window.NAN_COOKING_DATA,image=await loadStartupImage(data.image,'Nan cooking artwork');
  animalSheets.nan_cooking=image;SPR.nan_cooking=[0,0,data.width,data.height,data.frames,'nan_cooking'];
}
function restoreNanCooking(saved){nanElixirReadyAt=Number.isFinite(saved)&&saved>0?saved:0;}
function prepareNanCooking(map,id){
  if(id!=='house26')return;
  const n=map.npcs.find(n=>n.n==='Nan Ferrow');if(!n)return;
  if(!n._beforeCooking)n._beforeCooking={x:n.x,y:n.y,packSpr:n.packSpr,packDirections:n.packDirections,packWalk:n.packWalk,stationary:n.stationary,patrol:n.patrol,idleFps:n.idleFps};
  if(nanGiftPending()){
    if(n.nanCooking){Object.assign(n,n._beforeCooking);delete n.nanCooking;}
    return;
  }
  if(!n.nanCooking||(n.x===182&&n.y===160))Object.assign(n,{x:173,y:157,nanCooking:true});
  Object.assign(n,{packSpr:'nan_cooking',packDirections:false,packWalk:false,stationary:true,patrol:null,goto:null,idleFps:1000/window.NAN_COOKING_DATA.durations[0]});
}
function nanCookingHere(n){return MAPID==='house26'&&n?.n==='Nan Ferrow'&&!nanGiftPending();}
function giveNanElixir(n){
  if(!nanCookingHere(n))return false;
  if(Date.now()<nanElixirReadyAt){
    const minutes=Math.max(1,Math.ceil((nanElixirReadyAt-Date.now())/60000));
    playScene([`Nan Ferrow: This batch needs about ${minutes===1?'another minute':minutes+' more minutes'}, love. Good medicine cannot be hurried.`],{npcActor:n,after:()=>openNpcTopics(n)});
    return true;
  }
  playScene(['Nan Ferrow: Just in time, love. I have an elixir ready for you. Take it with you—there is no charge for keeping my boy well.',
    'Corin: Thank you, Nan.',
    'Nan Ferrow: I will have another bottle in ten minutes. Come and see me when you need it.'],{npcActor:n,after:()=>{
      const now=Date.now();if(now<nanElixirReadyAt)return;
      nanElixirReadyAt=now+10*60*1000;elixirs++;saveGame();
      showReveal('inventory_elixir','Nan gave Corin an Elixir.',1,false,()=>openNpcTopics(n));
    }});
  return true;
}
