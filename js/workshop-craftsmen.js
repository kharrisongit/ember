/* Keep workshop props/editor identities in place while their owners stop to talk. */
const WORKSHOP_CRAFTSMEN={
  smithy_anim_8:{name:'Dunstan',map:'smithy',frames:42,workStart:3,workEnd:27,
    putDown:[27,40,41],pickUp:[0,1,2],idle:[0,1,0,2,3,2,0]},
  // These are Sela's authored resting/breathing/blinking poses, without the
  // furnace walk, blowing pipe or hot glass. His table stays in every frame.
  glassnew_anim_4:{name:'Sela',map:'glasswork',frames:45,idle:[0,1,2,3,39,40,0]}
};
const workshopAnimationState=new WeakMap();
const workshopImages={};
async function loadWorkshopCraftsmen(){
  await Promise.all(['work','idle'].map(async action=>{
    const image=new Image();
    image.src='assets/sprites/workshops/dunstan-'+action+'.png?v=20260930-complete-station';
    await image.decode();workshopImages[action]=image;
  }));
}
function prepareDunstanStation(map){
  const actors=map.roomActors||[],smith=actors.find(a=>a.spr==='smithy_anim_8');
  const bench=actors.find(a=>a.editKey==='remaining:smithy:16'||a.exactFurniture&&a.n==='workbench');
  if(!smith||!bench||smith.workshopStation)return;
  smith.workshopStation=true;
  smith.sy=smith.y+20;
  // One actor draws the full native assembly, including the bench front. Keep
  // its original slot/anchor for saved layouts, but never draw a duplicate base.
  bench.workshopBase=true;bench.editorLocked=true;
  smith.interiorChildren=[...new Set([...(smith.interiorChildren||[]),actors.indexOf(bench)])];
  const blocks=map.roomBlocks ||= [];
  const index=(bench.moveBlocks||[])[0]??blocks.length;
  for(const actor of actors)if(actor.moveBlocks)actor.moveBlocks=actor.moveBlocks.filter(i=>i!==index);
  blocks[index]=[smith.x-18,smith.y-16,smith.x+21,smith.y+20];
  (smith.moveBlocks ||= []).push(index);
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
  if(!state){state={talking,start:talking?t:0,transition:talking?craft.putDown||[]:[]};workshopAnimationState.set(o,state);}
  if(state.talking!==talking){
    if(craft.putDown){
      const frame=workshopWorkFrame(craft,state,Math.max(0,t-state.start));
      // Finish the current six-frame strike before lowering the hammer. The
      // long authored rest never interrupts the repeating hammer strokes.
      const last=craft.workStart+Math.floor((frame-craft.workStart)/6)*6+5;
      state.transition=talking ? (frame<craft.workStart
        ? Array.from({length:frame+1},(_,i)=>frame-i)
        : [...Array.from({length:last-frame+1},(_,i)=>frame+i),...craft.putDown]) : craft.pickUp;
    }
    state.talking=talking;state.start=t;
  }
  const elapsed=Math.max(0,t-state.start);
  if(!talking)return {action:'work',frame:workshopWorkFrame(craft,state,elapsed)};
  const transition=state.transition||[],tick=Math.floor(elapsed/.15);
  if(tick<transition.length)return {action:'work',frame:transition[tick]};
  // A long relaxed hold, a small breath, then a quick blink. No whole-body bob.
  const phase=(elapsed-transition.length*.15)%3.6,ends=[1.5,2.4,3.05,3.15,3.25,3.35,3.6];
  return {action:'idle',frame:craft.idle[ends.findIndex(end=>phase<end)]};
}
function workshopWorkFrame(craft,state,elapsed){
  const tick=Math.floor(elapsed/.15);
  if(craft.workStart===undefined)return tick%craft.frames;
  const pickup=state.transition||[];
  if(tick<pickup.length)return pickup[tick];
  return craft.workStart+(tick-pickup.length)%(craft.workEnd-craft.workStart);
}
function drawWorkshopCraftsman(o,t){
  const craft=WORKSHOP_CRAFTSMEN[o.spr];
  if(!craft||MAPID!==craft.map)return false;
  const pose=workshopAnimation(o,t,workshopIsTalking(craft.name));
  ctx.imageSmoothingEnabled=false;
  if(craft.name==='Dunstan'){
    const image=workshopImages[pose.action];
    if(!image)return false;
    drawGameImage(ctx,image,pose.frame*96,0,96,140,Math.round(o.x-24),Math.round(o.y-48),48,70);
  }else{
    const sp=SPR[o.spr];
    drawGameImage(ctx,sheetOf(sp),sp[0]+pose.frame*sp[2],sp[1],sp[2],sp[3],
      Math.round(o.x-sp[2]/2),Math.round(o.y-sp[3]),sp[2],sp[3]);
  }
  return true;
}
