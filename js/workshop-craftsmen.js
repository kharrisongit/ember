/* Keep workshop props/editor identities in place while their owners stop to talk. */
const WORKSHOP_CRAFTSMEN={
  smithy_anim_8:{name:'Dunstan',map:'smithy',frames:42,idle:[0,1,0,2,3,2,0]},
  // These are Sela's authored resting/breathing/blinking poses, without the
  // furnace walk, blowing pipe or hot glass. His table stays in every frame.
  glassnew_anim_4:{name:'Sela',map:'glasswork',frames:45,idle:[0,1,2,3,39,40,0]}
};
const workshopAnimationState=new WeakMap();
const workshopImages={};
async function loadWorkshopCraftsmen(){
  await Promise.all(['work','idle'].map(async action=>{
    const image=new Image();
    image.src='assets/sprites/workshops/dunstan-'+action+'.png?v=20260930-craftsmen-idle';
    await image.decode();workshopImages[action]=image;
  }));
}
function workshopIsTalking(name){
  return sayNpc?.n===name||scene?.npcActor?.n===name||scene?.who===name||
    ask?.npcActor?.n===name||ask?.npcConversation===name||
    window.EmberConversationFlow?.partner?.()===name;
}
function workshopAnimation(o,t,talking){
  const craft=WORKSHOP_CRAFTSMEN[o.spr];
  if(!craft)return null;
  let state=workshopAnimationState.get(o);
  if(!state){state={talking,start:talking?t:0};workshopAnimationState.set(o,state);}
  if(state.talking!==talking){state.talking=talking;state.start=t;}
  const elapsed=Math.max(0,t-state.start);
  if(!talking)return {action:'work',frame:Math.floor(elapsed/.15)%craft.frames};
  // A long relaxed hold, a small breath, then a quick blink. No whole-body bob.
  const phase=elapsed%3.6,ends=[1.5,2.4,3.05,3.15,3.25,3.35,3.6];
  return {action:'idle',frame:craft.idle[ends.findIndex(end=>phase<end)]};
}
function drawWorkshopCraftsman(o,t){
  const craft=WORKSHOP_CRAFTSMEN[o.spr];
  if(!craft||MAPID!==craft.map)return false;
  const pose=workshopAnimation(o,t,workshopIsTalking(craft.name));
  ctx.imageSmoothingEnabled=false;
  if(craft.name==='Dunstan'){
    const image=workshopImages[pose.action];
    if(!image)return false;
    drawGameImage(ctx,image,pose.frame*96,0,96,96,Math.round(o.x-24),Math.round(o.y-48),48,48);
  }else{
    const sp=SPR[o.spr];
    drawGameImage(ctx,sheetOf(sp),sp[0]+pose.frame*sp[2],sp[1],sp[2],sp[3],
      Math.round(o.x-sp[2]/2),Math.round(o.y-sp[3]),sp[2],sp[3]);
  }
  return true;
}
