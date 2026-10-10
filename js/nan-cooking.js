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
    playScene([`Nan Ferrow: Not quite ready, love. Another ${minutes===1?'minute':minutes+' minutes'} should do it. Pull up a chair; watching won't cool it faster, but I like the company.`],{npcActor:n,after:()=>openNpcTopics(n)});
    return true;
  }
  playScene(["Nan Ferrow: There. Take this elixir before I fuss over it any more. Cork's tight, cloth round the bottle. It can survive your bag.",
    "Corin: My bag isn't that bad. Thank you, Nan.",
    "Nan Ferrow: I've seen inside it, love. Give me ten minutes for the next batch. You're welcome to stay for those ten minutes, you know."],{npcActor:n,after:()=>{
      const now=Date.now();if(now<nanElixirReadyAt)return;
      nanElixirReadyAt=now+10*60*1000;elixirs++;saveGame();
      showReveal('inventory_elixir','Nan gave Corin an Elixir.',1,false,()=>openNpcTopics(n));
    }});
  return true;
}
