/* Local roadworks change with story progress; temple approaches and return roads remain open. */
const JOURNEY_GATES = {
  thornwell:{x:320*16,y:102*16,rect:[320*16-32,102*16-58,320*16+32,102*16+38],open:()=>wonAll||brambleQuest>=2,
    inside:(x,y)=>x>=320*16},
  forgewick:{x:815*16,y:140*16,rect:[815*16-17,140*16-62,815*16+18,140*16+54],open:()=>wonAll||(breathHas.lightning&&smithUpgrade&&charm.edge&&glassShield),
    inside:(x,y)=>(x>=815*16&&y<220*16)||x>=1080*16},
  sandspire:{x:1518*16,y:73*16,rect:[1518*16-72,73*16-14,1518*16+72,73*16+14],open:()=>wonAll||breathHas.shadow,
    inside:(x,y)=>(x>=1490*16&&y<=73*16)||x>=1870*16},
  hollybeck:{x:2727*16,y:215*16,rect:[2727*16-15,215*16-64,2727*16+15,215*16+56],open:()=>wonAll||breathHas.ice,
    inside:(x,y)=>(x>=2727*16&&y>=211*16)||x>=2840*16}
};
const journeyWagon={spr:'gw_cart',home:[12410,3374],scale:2.5,sourceId:null};
function journeyGateClosed(key){return MAPID==='world'&&!JOURNEY_GATES[key].open();}
function progressionSolid(x,y){
  if(MAPID!=='world')return false;
  if(JOURNEY_GATES.thornwell.open()){const [wx,wy]=journeyWagon.home;if(Math.abs(x-wx)<26&&y>=wy-23&&y<wy)return true;}
  return Object.values(JOURNEY_GATES).some(g=>!g.open()&&x>=g.rect[0]&&x<g.rect[2]&&y>=g.rect[1]&&y<g.rect[3]);
}
function progressionMoveAllowed(x,y){
  if(MAPID!=='world'||editing||mode!=='play')return true;
  return Object.values(JOURNEY_GATES).every(g=>g.open()||g.inside(P.x,P.y)||!g.inside(x,y));
}
function journeyWorker(name,sprite,key,x,y,lines,portrait){
  return {n:name,packSpr:sprite,packDirections:false,packWalk:false,stationary:true,serviceAppearance:true,
    x,y,f:'d',kf:'d',flip:false,t:0,progressionWorker:key,d:lines,d2:lines,dd:lines,dd2:lines,dragonRumor:lines,dragonRumor2:lines,
    noTalk:false,portraitAlias:portrait,editKey:'journey-worker:'+name};
}
function prepareJourneyGates(){
  if(MAPID!=='world')return;
  if(!MD._journeyWagonLocated){
    MD._journeyWagonLocated=true;
    const cart=objs.find(o=>/cart|wagon/.test(NAMES[o.s]||'')&&o.x>12200&&o.x<12800&&o.y>3100&&o.y<3500);
    if(cart){journeyWagon.sourceId=cart.id;journeyWagon.spr=NAMES[cart.s];journeyWagon.home=[cart.x,cart.y];journeyWagon.scale=1;rebuildSolid();}
  }
  if(npcs.some(n=>n.progressionWorker))return;
  const th=JOURNEY_GATES.thornwell,fw=JOURNEY_GATES.forgewick,hb=JOURNEY_GATES.hollybeck;
  npcs.push(journeyWorker('Cartwright Oswin','market_citizen1_idle_d','thornwell',th.x-62,th.y-8,[
    'Cartwright Oswin: The wheel broke just as I was turning out of Thornwell. Could not have picked a worse spot.',
    "Cartwright Oswin: I'll have it fixed soon. Best give me a little room to work."
  ],'Bevan'));
  npcs.push(journeyWorker('Miner Marn','npc_miner_mike_d','forgewick',fw.x-42,fw.y+29,[
    'Miner Marn: A cart tipped across the road and brought half the bank down with it. We are clearing it now.',
    'Miner Marn: Dunstan and Sela can see to your gear while we finish here. Mind the old temple road, though.'
  ],'Toft'));
  npcs.push(journeyWorker('Miner Nerik','npc_miner_mike_d','forgewick',fw.x-40,fw.y-31,[
    'Miner Nerik: One stone at a time. Pull the wrong one and we start all over.',
    'Miner Nerik: We will have the carts shifted before long.'
  ],'Toft'));
  npcs.push(journeyWorker('Snowbuilder Nessa','winter_npc_1','hollybeck',hb.x-50,hb.y+8,[
    'Snowbuilder Nessa: I meant to build one. Then it looked lonely.',
    'Snowbuilder Nessa: Now there is a whole family in the road. Let me finish their faces and I will move them to the square.'
  ],'Runa'));
  const winter=npcs.find(n=>n.n==='Runa');const builder=npcs.at(-1);
  builder.f='s';builder.kf='e';
  if(winter){for(const key of ['packSpr','packDirections','packWalk','sk','body','lookId','s'])if(winter[key]!==undefined)builder[key]=winter[key];}
}
function progressionProp(spr,x,y,scale=1,phase=0){return {progressionProp:true,spr,x,y,scale,phase};}
function journeyGateProps(){
  if(MAPID!=='world')return [];
  const out=[],th=JOURNEY_GATES.thornwell,fw=JOURNEY_GATES.forgewick,ss=JOURNEY_GATES.sandspire,hb=JOURNEY_GATES.hollybeck;
  if(!th.open())out.push(progressionProp(journeyWagon.spr,th.x,th.y+28,journeyWagon.scale));
  else if(journeyWagon.sourceId===null)out.push(progressionProp(journeyWagon.spr,...journeyWagon.home,journeyWagon.scale));
  if(!fw.open()){
    out.push(progressionProp('rp_carts_0_14_2',fw.x-2,fw.y-25,2),progressionProp('rp_carts_1_6_2',fw.x+3,fw.y+27,2));
    for(const [dx,dy] of [[-5,-54],[8,-4],[-8,47],[11,56]])out.push(progressionProp('rc_cavedec_0_0',fw.x+dx,fw.y+dy,2));
  }
  if(!ss.open())for(let i=-1;i<=1;i++)out.push(progressionProp('camel_sit',ss.x+i*46,ss.y+10,1,i+1));
  if(!hb.open())for(let i=-2;i<=2;i++)out.push(progressionProp('wf_snowman',hb.x+(i%2)*4,hb.y+i*25+6));
  return out;
}
function drawJourneyProp(o,t){
  const s=SPR[o.spr];if(!s)return;
  const frame=o.spr==='camel_sit'?Math.floor(t*2.2+o.phase)%s[4]:0;
  const width=s[2]*o.scale,height=s[3]*o.scale;
  drawGameImage(ctx,sheetOf(s),s[0]+frame*s[2],s[1],s[2],s[3],Math.round(o.x-width/2),Math.round(o.y-height),width,height);
}
function journeyObjectHidden(o){return MAPID==='world'&&o.id===journeyWagon.sourceId&&!JOURNEY_GATES.thornwell.open();}
