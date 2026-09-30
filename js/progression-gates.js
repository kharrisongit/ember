/* Local roadworks change with story progress; temple approaches and return roads remain open. */
const JOURNEY_GATES = {
  thornwell:{x:320*16,y:100*16,rect:[320*16-32,100*16-50,320*16+32,100*16+54],open:()=>wonAll||brambleQuest>=2,
    inside:(x,y)=>x>=320*16},
  forgewick:{x:815*16,y:140*16,rect:[815*16-24,140*16-50,815*16+24,140*16+54],open:()=>wonAll||(breathHas.lightning&&smithUpgrade&&charm.edge&&glassShield),
    inside:(x,y)=>(x>=815*16&&y<220*16)||x>=1080*16},
  sandspire:{x:1518*16+8,y:73*16,rect:[1518*16+8-46,73*16-14,1518*16+8+46,73*16+10],open:()=>wonAll||breathHas.ice,
    inside:(x,y)=>(x>=1490*16&&y<=73*16)||x>=1870*16},
  hollybeck:{x:2727*16,y:215*16,rect:[2727*16-15,215*16-64,2727*16+15,215*16+56],open:()=>wonAll||breathHas.shadow,
    inside:(x,y)=>(x>=2727*16&&y>=211*16)||x>=2840*16}
};
const journeyWagon={spr:'story_broken_wagon',home:[12410,3374],scale:.85,sourceId:null};
const brokenWagonImage=new Image();brokenWagonImage.src='assets/props/broken-wagon.png?v=20260928-vertical';
const miningCartsImage=new Image();miningCartsImage.src='assets/props/forgewick-mine-carts.png?v=20260929';
// Crop only transparent padding at draw time; preserve the generated source artwork.
const miningCartsSprite={source:[17,23,830,1693],width:64,height:128};
const caravanImage=new Image();caravanImage.src='assets/props/sandspire-caravan.png?v=20260930';
const caravanSprite={source:[76,138,1390,746],width:96,height:52};
const tobinSheets={};
for(const action of ['idle','walk']){
  const image=new Image();image.src='assets/sprites/hollybeck-tobin-'+action+'.png?v=20260930-animated';tobinSheets[action]=image;
}
let snowChildPortrait=null;
async function prepareJourneyArt(){
  if(SPR.journey_tobin_idle_d)return;
  for(const [action,image]of Object.entries(tobinSheets)){
    await image.decode();
    for(const [row,dir]of ['d','u','e','w'].entries()){
      const key='journey_tobin_'+action+'_'+dir;
      const strip=document.createElement('canvas');strip.width=24*6;strip.height=30;
      const g=strip.getContext('2d');g.imageSmoothingEnabled=false;
      for(let frame=0;frame<6;frame++)g.drawImage(image,frame*32+4,row*32+2,24,30,frame*24,0,24,30);
      animalSheets[key]=strip;SPR[key]=[0,0,24,30,6,key];
    }
  }
  const face=document.createElement('canvas');face.width=96;face.height=112;
  const f=face.getContext('2d');f.imageSmoothingEnabled=false;
  f.drawImage(tobinSheets.idle,7,3,18,21,0,0,96,112);snowChildPortrait=face.toDataURL('image/png');
}
function tobinNpcFrame(t,action){
  if(action==='walk')return Math.floor(t*8)%6;
  if(t%3.8<.15)return 3;
  return [0,1,2,4,5][Math.floor(t*4)%5];
}
// The camels lead from the south/front of the wagon, clear of the rock and houses.
const caravanCamels=[[-6,42],[42,42],[6,70]];
function journeyGateClosed(key){return MAPID==='world'&&!JOURNEY_GATES[key].open();}
function progressionSolid(x,y){
  if(MAPID!=='world')return false;
  const gate=JOURNEY_GATES.sandspire;
  if(!gate.open()&&caravanCamels.some(([dx,dy])=>Math.abs(x-gate.x-dx)<21&&y>=gate.y+dy-10&&y<gate.y+dy))return true;
  return Object.values(JOURNEY_GATES).some(g=>!g.open()&&x>=g.rect[0]&&x<g.rect[2]&&y>=g.rect[1]&&y<g.rect[3]);
}
function progressionMoveAllowed(x,y){
  if(MAPID!=='world'||editing||mode!=='play')return true;
  return Object.values(JOURNEY_GATES).every(g=>{
    if(g.open()||g.inside(P.x,P.y)||!g.inside(x,y))return true;
    // A gate is local roadwork, not a wall spanning every road at this longitude.
    // Test the travel segment against the visible obstruction, preserving return travel.
    let enter=0,leave=1;
    for(const [from,to,lo,hi] of [[P.x,x,g.rect[0],g.rect[2]],[P.y,y,g.rect[1],g.rect[3]]]){
      const delta=to-from;
      if(!delta){if(from<lo||from>=hi)return true;continue;}
      const a=(lo-from)/delta,b=(hi-from)/delta;
      enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
      if(enter>leave)return true;
    }
    return false;
  });
}
function journeyWorker(name,sprite,key,x,y,lines,portrait){
  return {n:name,packSpr:sprite,packDirections:false,packWalk:false,stationary:true,serviceAppearance:true,
    x,y,f:'d',kf:'d',flip:false,t:0,progressionWorker:key,d:lines,d2:lines,dd:lines,dd2:lines,dragonRumor:lines,dragonRumor2:lines,
    noTalk:false,portraitAlias:portrait,editKey:'journey-worker:'+name};
}
function prepareJourneyGates(){
  if(MAPID!=='world')return;
  if(npcs.some(n=>n.progressionWorker))return;
  const th=JOURNEY_GATES.thornwell,fw=JOURNEY_GATES.forgewick,ss=JOURNEY_GATES.sandspire,hb=JOURNEY_GATES.hollybeck;
  npcs.push(journeyWorker('Cartwright Oswin','market_citizen1_idle_d','thornwell',th.x-62,th.y-8,[
    'Cartwright Oswin: The wheel broke just as I was turning out of Thornwell. Could not have picked a worse spot.',
    "Cartwright Oswin: I'll have it fixed soon. Best give me a little room to work."
  ],'Bevan'));
  npcs.push(journeyWorker('Miner Marn','npc_miner_mike_d','forgewick',fw.x-42,fw.y+29,[
    'Miner Marn: A cart tipped across the road and brought half the bank down with it. We are clearing it now.',
    'Miner Marn: Dunstan and Sela can see to your gear while we finish here. Mind the old temple road, though.'
  ]));
  npcs.push(journeyWorker('Miner Nerik','npc_miner_mike_d','forgewick',fw.x-40,fw.y-31,[
    'Miner Nerik: One stone at a time. Pull the wrong one and we start all over.',
    'Miner Nerik: We will have the carts shifted before long.'
  ]));
  npcs.push(journeyWorker('Caravanner Sami','desert_trader1','sandspire',ss.x,ss.y+120,[
    "Caravanner Sami: Easy there! The caravan is staying put, and the camels aren't taking another step.",
    "Caravanner Sami: Something in Sandspire Temple has them spooked. Clear the temple and claim its Heartstone, and we'll get this wagon moving."
  ],'Bilal'));
  const tobin=journeyWorker('Tobin','journey_tobin','hollybeck',hb.x-50,hb.y+8,[
    "Tobin: I'm building snowmen! This one's the captain, and those are his snow guards.",
    "Tobin: I'm not finished yet, so you'll have to come back later. They still need noses!"
  ]);
  Object.assign(tobin,{packDirections:true,packWalk:true,stationary:false,patrol:true,patrolSpeed:22,patrolRest:2200,idleFps:4,
    patrolPoints:[[hb.x-50,hb.y+8],[hb.x-34,hb.y+8],[hb.x-34,hb.y-20],[hb.x-62,hb.y-20]]});
  npcs.push(tobin);
}
function progressionProp(spr,x,y,scale=1,phase=0){return {progressionProp:true,spr,x,y,scale,phase};}
function journeyGateProps(){
  if(MAPID!=='world')return [];
  const out=[],th=JOURNEY_GATES.thornwell,fw=JOURNEY_GATES.forgewick,ss=JOURNEY_GATES.sandspire,hb=JOURNEY_GATES.hollybeck;
  if(!th.open())out.push(progressionProp(journeyWagon.spr,th.x,th.y+56,journeyWagon.scale));

  if(!fw.open()){
    out.push(progressionProp('story_mining_carts',fw.x,fw.y+56,.85));
  }
  if(!ss.open()){
    // The wagon fills the mountain opening; its camels wait out front in the street.
    out.push(progressionProp('story_caravan',ss.x,ss.y+10));
    for(const [i,[dx,dy]]of caravanCamels.entries())
      out.push(progressionProp('camel_sit',ss.x+dx,ss.y+dy,1,i));
  }
  if(!hb.open())for(let i=-2;i<=2;i++)out.push(progressionProp('wf_snowman',hb.x+(i%2)*4,hb.y+i*25+6));
  return out;
}
function drawJourneyProp(o,t){
  if(o.spr==='story_mining_carts'){
    if(miningCartsImage.complete&&miningCartsImage.naturalWidth!==0){
      const {source}=miningCartsSprite,width=miningCartsSprite.width*o.scale,height=miningCartsSprite.height*o.scale;
      drawGameImage(ctx,miningCartsImage,...source,Math.round(o.x-width/2),Math.round(o.y-height),width,height);
    }
    return;
  }
  if(o.spr==='story_caravan'){
    if(caravanImage.complete&&caravanImage.naturalWidth!==0){
      const {source,width,height}=caravanSprite;
      drawGameImage(ctx,caravanImage,...source,Math.round(o.x-width/2),Math.round(o.y-height),width,height);
    }
    return;
  }
  if(o.spr==='story_broken_wagon'){
    const width=80*o.scale,height=128*o.scale;
    if(brokenWagonImage.complete&&brokenWagonImage.naturalWidth!==0)
      drawGameImage(ctx,brokenWagonImage,0,0,brokenWagonImage.naturalWidth,brokenWagonImage.naturalHeight,Math.round(o.x-width/2),Math.round(o.y-height),width,height);
    return;
  }
  const s=SPR[o.spr];if(!s)return;
  const frame=o.spr==='camel_sit'?Math.floor(t*2.2+o.phase)%s[4]:0;
  const width=s[2]*o.scale,height=s[3]*o.scale;
  drawGameImage(ctx,sheetOf(s),s[0]+frame*s[2],s[1],s[2],s[3],Math.round(o.x-width/2),Math.round(o.y-height),width,height);
}
function journeyObjectHidden(o){return MAPID==='world'&&o.id===journeyWagon.sourceId&&!JOURNEY_GATES.thornwell.open();}
