/* Sela's desert storefront; the existing shop and workshop stay intact. */
const SandspireGlassworks=(()=>{
  const X=480,Y=432,ENTRY_X=472,ENTRY_Y=410;
  const props=[
    {id:'oven',n:'Covered glass furnace',w:64,h:72,x:392,y:440,block:[-22,-30,22,-3]},
    {id:'stall',n:'Glassware display stall',w:64,h:72,x:554,y:446,block:[-26,-15,26,-1]},
    {id:'workbench',n:'Glassblower’s workbench',w:48,h:32,x:392,y:476,block:[-23,-14,23,-1]},
    {id:'crate',n:'Crate of glass panes',w:26,h:26,x:555,y:477,block:[-12,-12,12,0]},
    {id:'barrel',n:'Barrel of glass rods',w:20,h:34,x:430,y:447,block:[-9,-12,9,0]},
    {id:'sand',n:'Sack of glassmaking sand',w:24,h:24,x:438,y:477,block:[-10,-9,10,0]}];
  const referralLines=[
    'Dunstan: My brother Sela keeps a glass shop in Sandspire. He has made a shield that could help you on the road.',
    'Corin: A glass shield? Wouldn’t it shatter?',
    'Dunstan: His glass does more than keep the wind out. I trust his work, even if I will never hear the end of saying so.',
    'Dunstan: His shop is in the middle of Sandspire’s caravan court, beside the outdoor furnace. You’ll find him through the back.',
    'Corin: I’ll go and see him.'];
  async function prepare(){
    await Promise.all([{id:'building',w:192,h:208},...props].map(async({id,w,h})=>{
      const key=id==='building'?'sandspire_glass_shop':'sandspire_glass_'+id;
      const img=await loadStartupImage('assets/buildings/glassworks/'+id+'.webp?v=20261001-props');
      img.pixelLocked=true;animalSheets[key]=img;SPR[key]=[0,0,w,h,1,key];
    }));
    const court=W.maps.sandspire_court;
    if(!court.roomActors.some(a=>a.sandspireGlassShop)){
      // Replace the court's central decorative house, keeping its clear lanes.
      const house=court.roomActors.find(a=>a.spr==='dd_house44'&&a.x===X&&a.y===Y);
      if(house){house.editorDeleted=true;for(const index of house.moveBlocks||[])court.roomBlocks[index]=[-99999,-99999,-99999,-99999];}
      const blocks=[[X-68,Y-171,X+72,ENTRY_Y-15],
        [X-74,ENTRY_Y-15,ENTRY_X-18,ENTRY_Y+5],
        [ENTRY_X+18,ENTRY_Y-15,X+72,ENTRY_Y+5]];
      const moveBlocks=blocks.map(box=>court.roomBlocks.push(box)-1);
      court.roomActors.push({spr:'sandspire_glass_shop',x:X,y:Y,schoolArt:true,
        editKey:'sandspire:glass-shop',sandspireGlassShop:true,moveBlocks});
      court.doors.push({x:(ENTRY_X-8)/16,y:(ENTRY_Y-16)/16,to:'glasshouse',tx:6,ty:9,
        dir:'u',explicitDir:true,triggerRect:{x:ENTRY_X-12,y:ENTRY_Y-8,w:24,h:14}});
    }
    // Separate actors and collision boxes let the editor move each prop on its own.
    for(const {id,n,x,y,block}of props){
      if(court.roomActors.some(a=>a.editKey==='sandspire:glass-'+id))continue;
      const [l,t,r,b]=block,moveBlocks=[court.roomBlocks.push([x+l,y+t,x+r,y+b])-1];
      court.roomActors.push({spr:'sandspire_glass_'+id,n,x,y,schoolArt:true,
        editKey:'sandspire:glass-'+id,sandspireGlassProp:id,moveBlocks});
    }
    W.maps.glasshouse.title='Sandspire — Glass Shop';
    W.maps.glasswork.title='Sandspire — Glassblowing Workshop';
    const exit=W.maps.glasshouse.doors.find(d=>d.to==='world'||d.to==='sandspire_court');
    Object.assign(exit,{to:'sandspire_court',tx:(ENTRY_X-8)/16,ty:(ENTRY_Y+32-16)/16});
  }
  function installWorld(m){
    if(m.sandspireGlassMoved)return;
    m.sandspireGlassMoved=true;
    m.doors=m.doors.filter(d=>d.to!=='glasshouse');
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='it_glass'){
      const id=i/3;if(!(m.editorDeletedObjects||=[]).includes(id))m.editorDeletedObjects.push(id);
    }
    // Retire the old door/window overlays without changing other actor indices.
    for(const actor of m.roomActors||[])if(/^glassout_/.test(actor.spr||''))actor.editorDeleted=true;
    for(let i=0;i<m.roomBlocks.length;i++){
      const [l,t,r,b]=m.roomBlocks[i];
      if(l>=12376&&r<=12568&&t>=2160&&b<=2368)m.roomBlocks[i]=[-99999,-99999,-99999,-99999];
    }
  }
  const fireFrame=(t,offset=0)=>(Math.floor(t*8)+offset)%6;
  function draw(actor,t){
    const sprite=SPR[actor.spr],fire=SPR.dfire,w=sprite[2],h=sprite[3],x=actor.x-w/2,y=actor.y-h;
    drawGameImage(ctx,sheetOf(sprite),sprite[0],sprite[1],w,h,x,y,w,h);
    // Reuse the game's six actual flame frames, cropped above their logs.
    // Each opening has its own phase; the building and furnace stone stay still.
    const openings=actor.sandspireGlassShop?[[134,24,15,6,3]]:
      actor.sandspireGlassProp==='oven'?[[26,50,13,12,0]]:[];
    for(const [dx,dy,w,h,phase]of openings){
      const frame=fireFrame(t,phase);
      drawGameImage(ctx,sheetOf(fire),fire[0]+frame*fire[2]+4,fire[1],8,9,x+dx,y+dy,w,h);
    }
  }
  return {prepare,installWorld,referralLines,draw,fireFrame};
})();
