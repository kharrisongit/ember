/* Sela's desert storefront; the existing shop and workshop stay intact. */
const SandspireGlassworks=(()=>{
  const X=480,Y=432,ENTRY_X=472,ENTRY_Y=410;
  const referralLines=[
    'Dunstan: My brother Sela keeps a glass shop in Sandspire. He has made a shield that could help you on the road.',
    'Corin: A glass shield? Wouldn’t it shatter?',
    'Dunstan: His glass does more than keep the wind out. I trust his work, even if I will never hear the end of saying so.',
    'Dunstan: His shop is in the middle of Sandspire’s caravan court, beside the outdoor furnace. You’ll find him through the back.',
    'Corin: I’ll go and see him.'];
  async function prepare(){
    const img=await loadStartupImage('assets/buildings/sandspire-glass-shop.webp?v=20261001-glassworks');
    img.pixelLocked=true;animalSheets.sandspire_glass_shop=img;
    SPR.sandspire_glass_shop=[0,0,192,208,1,'sandspire_glass_shop'];
    const court=W.maps.sandspire_court;
    if(!court.roomActors.some(a=>a.sandspireGlassShop)){
      // Replace the court's central decorative house, keeping its clear lanes.
      const house=court.roomActors.find(a=>a.spr==='dd_house44'&&a.x===X&&a.y===Y);
      if(house){house.editorDeleted=true;for(const index of house.moveBlocks||[])court.roomBlocks[index]=[-99999,-99999,-99999,-99999];}
      const blocks=[[X-68,Y-171,X+72,ENTRY_Y-15],
        [X-92,Y-63,ENTRY_X-20,Y],[ENTRY_X+20,Y-64,X+94,Y-5]];
      const moveBlocks=blocks.map(box=>court.roomBlocks.push(box)-1);
      court.roomActors.push({spr:'sandspire_glass_shop',x:X,y:Y,schoolArt:true,
        editKey:'sandspire:glass-shop',sandspireGlassShop:true,moveBlocks});
      court.doors.push({x:(ENTRY_X-8)/16,y:(ENTRY_Y-16)/16,to:'glasshouse',tx:6,ty:9,
        dir:'u',explicitDir:true,triggerRect:{x:ENTRY_X-12,y:ENTRY_Y-8,w:24,h:14}});
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
    const shop=SPR.sandspire_glass_shop,fire=SPR.dfire,x=actor.x-96,y=actor.y-208;
    drawGameImage(ctx,sheetOf(shop),0,0,192,208,x,y,192,208);
    // Reuse the game's six actual flame frames, cropped above their logs.
    // Each opening has its own phase; the building and furnace stone stay still.
    for(const [dx,dy,w,h,phase]of [[27,158,13,10,0],[134,24,15,6,3]]){
      const frame=fireFrame(t,phase);
      drawGameImage(ctx,sheetOf(fire),fire[0]+frame*fire[2]+4,fire[1],8,9,x+dx,y+dy,w,h);
    }
  }
  return {prepare,installWorld,referralLines,draw,fireFrame};
})();
