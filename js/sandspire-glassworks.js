/* Sela's desert storefront; the existing shop and workshop stay intact. */
const SandspireGlassworks=(()=>{
  const SCALE=.5,X=24096,Y=1384,ENTRY_X=X-4,ENTRY_Y=Y-11;
  const referralLines=[
    'Dunstan: My brother Sela keeps a glass shop in Sandspire. He has made a shield that could help you on the road.',
    'Corin: A glass shield? Wouldn’t it shatter?',
    'Dunstan: His glass does more than keep the wind out. I trust his work, even if I will never hear the end of saying so.',
    'Dunstan: His shop is in the northwest corner of Sandspire. Look for the tall chimney. You’ll find him through the back.',
    'Corin: I’ll go and see him.'];
  async function prepare(){
    await Promise.all([{id:'building',w:192,h:208}].map(async({id,w,h})=>{
      const key=id==='building'?'sandspire_glass_shop':'sandspire_glass_'+id;
      const img=await loadStartupImage('assets/buildings/glassworks/'+id+'.webp?v=20261001-props');
      // Resample once with nearest-neighbour pixels so drawing and editor bounds agree.
      const small=document.createElement('canvas');small.width=w*SCALE;small.height=h*SCALE;
      const g=small.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(img,0,0,small.width,small.height);
      small.pixelLocked=true;animalSheets[key]=small;SPR[key]=[0,0,small.width,small.height,1,key];
    }));
    W.maps.glasshouse.title='Sandspire — Glass Shop';
    W.maps.glasswork.title='Sandspire — Glassblowing Workshop';
    const exit=W.maps.glasshouse.doors.find(d=>d.to==='world'||d.to==='sandspire_court');
    Object.assign(exit,{to:'world',tx:(ENTRY_X-8)/16,ty:(ENTRY_Y+24-16)/16});
  }
  function installWorld(m){
    if(m.sandspireGlassMoved)return;
    m.sandspireGlassMoved=true;
    m.doors=m.doors.filter(d=>d.to!=='glasshouse'&&d.to!=='sandspire_court');
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='it_glass'){
      const id=i/3;if(!(m.editorDeletedObjects||=[]).includes(id))m.editorDeletedObjects.push(id);
    }
    // Retire the old door/window overlays without changing other actor indices.
    for(const actor of m.roomActors||[])if(/^glassout_/.test(actor.spr||''))actor.editorDeleted=true;
    for(let i=0;i<m.roomBlocks.length;i++){
      const [l,t,r,b]=m.roomBlocks[i];
      if(l>=12376&&r<=12568&&t>=2160&&b<=2368)m.roomBlocks[i]=[-99999,-99999,-99999,-99999];
    }
    const blocks=[[X-34,Y-86,X+36,ENTRY_Y-8],
      [X-37,ENTRY_Y-8,ENTRY_X-9,ENTRY_Y+3],
      [ENTRY_X+9,ENTRY_Y-8,X+36,ENTRY_Y+3]];
    const moveBlocks=blocks.map(box=>m.roomBlocks.push(box)-1);
    m.roomActors.push({spr:'sandspire_glass_shop',x:X,y:Y,schoolArt:true,
      editKey:'sandspire:glass-shop',sandspireGlassShop:true,moveBlocks});
    m.doors.push({x:(ENTRY_X-8)/16,y:(ENTRY_Y-16)/16,to:'glasshouse',tx:6,ty:9,
      dir:'u',explicitDir:true,triggerRect:{x:ENTRY_X-8,y:ENTRY_Y-4,w:16,h:10}});

  }
  const fireFrame=(t,offset=0)=>(Math.floor(t*8)+offset)%6;
  function draw(actor,t){
    const sprite=SPR[actor.spr],fire=SPR.dfire,w=sprite[2],h=sprite[3],x=actor.x-w/2,y=actor.y-h;
    drawGameImage(ctx,sheetOf(sprite),sprite[0],sprite[1],w,h,x,y,w,h);
    // Reuse the game's six actual flame frames, cropped above their logs.
    // Each opening has its own phase; the building and furnace stone stay still.
    const openings=actor.sandspireGlassShop?[[134,24,15,6,3]]:[];
    for(const [dx,dy,w,h,phase]of openings){
      const frame=fireFrame(t,phase);
      drawGameImage(ctx,sheetOf(fire),fire[0]+frame*fire[2]+4,fire[1],8,9,x+dx*SCALE,y+dy*SCALE,w*SCALE,h*SCALE);
    }
  }
  return {prepare,installWorld,referralLines,draw,fireFrame};
})();
