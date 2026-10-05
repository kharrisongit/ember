/* The authored desert detour and sandstone pyramid. */
const DesertPyramid = (()=>{
  const BASE='assets/interiors/desert-pyramid/', VERSION='20261001-sideroutes1';
  const X=1069*16+8,Y=30*16+16;
  const routes=[
    {id:9182,x0:1392,y0:93,x1:1294,y1:41,pts:[[1392,93],[1392,41],[1294,41]]},
    {id:9183,x0:1298,y0:40,x1:1175,y1:53,pts:[[1298,40],[1254,40],[1254,85],[1320,85],[1320,144],[1253,144],[1253,119],[1217,119],[1217,53],[1175,53]]},
    {id:9184,x0:1177,y0:51,x1:1069,y1:30,pts:[[1177,51],[1129,51],[1129,83],[1082,83],[1069,83],[1069,30]]}
  ].map(f=>({...f,kind:'route',w:5,band:20,style:'desert',a0:null,a1:null}));
  let ready=false;
  const stoneFrames=new Map();
  function stoneFrame(name){
    if(stoneFrames.has(name))return stoneFrames.get(name);
    const s=SPR[name],c=document.createElement('canvas');c.width=s[2];c.height=s[3];c.pixelLocked=true;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    drawGameImage(g,sheetOf(s),s[0],s[1],s[2],s[3],0,0,s[2],s[3]);
    g.globalCompositeOperation='source-atop';g.fillStyle='rgba(38,24,29,.30)';g.fillRect(0,0,c.width,c.height);
    stoneFrames.set(name,c);return c;
  }
  async function sprite(name,file,w,h,frames=1){
    const img=await loadStartupImage(BASE+file+'?v='+VERSION);img.pixelLocked=true;
    animalSheets[name]=img;SPR[name]=[0,0,w,h,frames,name];return img;
  }
  async function prepare(){
    if(ready)return;
    const plans=await loadStartupJSON(BASE+'layout.json?v='+VERSION);
    await sprite('pyramid_exterior','pyramid.png',128,128);
    await sprite('pyramid_tiles','tiles.png',160,128);
    SPR.pyramid_pillar=[0,80,16,48,1,'pyramid_tiles'];SPR.pyramid_broken=[16,80,16,48,1,'pyramid_tiles'];
    await sprite('pyramid_pots','pots.png',16,16,5);
    await sprite('pyramid_goldpots','gold-pots.png',16,16,3);
    const mummy=await sprite('pyramid_mummy_sheet','mummy.png',32,25,6);
    for(const [action,start,count] of [['idle',0,6],['walk',3,6],['atk',6,6],['hurt',10,4],['die',9,4]]){
      for(const [dir,row] of [['d',0],['e',1],['u',2],['w',1]]){
        const sourceRow=action==='die'?9:start+row,key='pyramid_mummy_'+action+'_'+dir;
        const strip=document.createElement('canvas');strip.width=count*32;strip.height=25;strip.pixelLocked=true;
        const g=strip.getContext('2d');g.imageSmoothingEnabled=false;
        for(let i=0;i<count;i++){
          g.save();if(dir==='w'){g.translate((i+1)*32,0);g.scale(-1,1);}else g.translate(i*32,0);
          g.drawImage(mummy,i*32,sourceRow*32,32,25,0,0,32,25);g.restore();
        }
        animalSheets[key]=strip;SPR[key]=[0,0,32,25,count,key];
      }
    }
    FOE.mummy={hp:6,speed:23,sight:240,reach:25,ring:42,dmg:2,swingT:1.05,hitAt:.52,rest:1.1,groupRest:1.5,wind:.5};
    FOE_ART.mummy='pyramid_mummy';WORTH.mummy=10;
    FOE.spiderqueen={hp:60,speed:44,sight:999,reach:48,ring:56,dmg:2,swingT:1.5,hitAt:.82,rest:.9,groupRest:1,wind:.45};
    WORTH.spiderqueen=65;
    for(const [id,plan]of Object.entries(plans)){
      const img=await loadStartupImage(BASE+id+'.png?v='+VERSION);
      const [width,height]=plan.size;
      const m=W.maps[id]={w:width/16,h:height/16,ts:16,title:'Sunken Pyramid',pyramid:true,
        templeExpanded:true,templePlan:plan,templeFloors:plan.floors,templeGateOpen:0,
        travel:id==='pyramid_entry'||id==='pyramid_queen',travel_kind:id==='pyramid_queen'?'Boss':'Dungeon',
        roomArt:'pyramid_tiles',_roomBaseCanvas:img,bg:'#000000',floorbg:'#daa16e',spawn:plan.spawn,
        terr:terrRLE(Array(width*height/256).fill(DIRT)),objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{}};
      if(id==='pyramid_queen')m.title='Sunken Pyramid — Spider Queen';
      m.base_terr=m.terr;
      for(const d of plan.doors)m.doors.push({x:(d.x-8)/16,y:(d.y-16)/16,to:d.to,tx:(d.arrival[0]-8)/16,ty:(d.arrival[1]-16)/16,dir:d.dir,explicitDir:true,
        triggerRect:{x:d.x-14,y:d.dir==='u'?d.y-8:d.y+32,w:28,h:d.dir==='u'?8:16}});
      for(const [k,x,y,room]of plan.enemies)m.foes.push({k,x:(x-8)/16,y:(y-16)/16,expandedRoom:room});
      for(const [i,[x,y,gold,item]]of plan.chests.entries()){
        if(item==='emberheart')continue; // The Queen now leaves this chest where she falls.
        const block=m.roomBlocks.push([x-14,y-12,x+14,y+10])-1;
        m.roomActors.push({spr:'temple71_chest',schoolArt:true,x,y,editKey:id+':loot:'+i,moveBlocks:[block],
          houseLoot:{id:item==='emberheart'?DesertAdventure.rewardId:id+':loot:'+i,gold,item,templeReward:true}});
      }
      for(const [j,[l,t,r,b]]of plan.chambers.entries()){
        for(const x of [l+32,r-32])m.roomActors.push({spr:'first_temple_torch',x,y:t+3,schoolArt:true});
        for(const [i,x]of [l+20,r-20].entries()){
          const y=b-32,block=m.roomBlocks.push([x-6,y-10,x+6,y])-1;
          m.roomActors.push({spr:j%2?'pyramid_goldpots':'pyramid_pots',x,y,schoolArt:true,stillFrame:(j+i)%3,moveBlocks:[block]});
        }
        if(id!=='pyramid_queen'){
          const x=l+24,y=t+64,block=m.roomBlocks.push([x-7,y-12,x+7,y])-1;
          m.roomActors.push({spr:'pyramid_broken',x,y,schoolArt:true,stillFrame:0,moveBlocks:[block]});
        }
      }
      addSandspireCobwebs(m);
      for(const h of plan.hazards){
        m.roomActors.push({spr:'temple71_lever',x:h.lever[0],y:h.lever[1],schoolArt:true,expandedLever:h.id});
        h.lines.forEach((y,i)=>{for(let x=h.cross[0]+8;x<h.cross[1];x+=16)m.roomActors.push({spr:'temple71_spikes',x,y,sy:-100,schoolArt:true,expandedSpike:{id:h.id,phase:i*.55}});});
      }
    }
    await DesertAdventure.prepare();
    ready=true;
  }
  function installWorld(m){
    if(!ready||m.pyramidInstalled)return;
    DesertAdventure.installWorld(m);
    // After the published Build snapshot, before the editor captures its baseline.
    for(const f of routes){const i=m.features.findIndex(q=>q.id===f.id);const value=JSON.parse(JSON.stringify(f));if(i<0)m.features.push(value);}
    if(m.roomActors.some(a=>a.editKey==='pyramid:exterior')){m.pyramidInstalled=true;return;}
    const block=m.roomBlocks.push([X-58,Y-108,X+58,Y-20])-1;
    const sides=[m.roomBlocks.push([X-58,Y-20,X-12,Y])-1,m.roomBlocks.push([X+12,Y-20,X+58,Y])-1];
    m.roomActors.push({spr:'pyramid_exterior',x:X,y:Y,sy:Y-20,schoolArt:true,stillFrame:0,moveBlocks:[block,...sides],editKey:'pyramid:exterior'});
    m.doors.push({x:(X-8)/16,y:(Y-16)/16,to:'pyramid_entry',tx:9.5,ty:33.5,dir:'u',explicitDir:true,triggerRect:{x:X-12,y:Y-15,w:24,h:12}});
    
    m.pyramidInstalled=true;
  }
  function clearForecourt(){
    if(MAPID!=='world')return;
    const inCourt=(x,y)=>(x>X-100&&x<X+100&&y>Y-145&&y<Y+50)||(x>24552&&x<24616&&y>1512&&y<1600);
    const remove=(s,x,y)=>inCourt(x,y)&&/tree|cactus|rock|bush|fern|grass/i.test(NAMES[s]||'');
    for(const o of objs)if(remove(o.s,o.x,o.y))hidden.add(o.id);
    fobjs=fobjs.filter(o=>!remove(o.s,o.x,o.y));
    for(const [tag,arr]of [['s',scat],['a',sanm]])for(let i=0;i<arr.length;i+=3)if(remove(arr[i],arr[i+1],arr[i+2]))decorGone.add(tag+i);
    for(let y=Math.floor((Y-144)/16);y<=Math.ceil((Y+48)/16);y++)for(let x=Math.floor((X-96)/16);x<=Math.ceil((X+96)/16);x++){
      terr[y*MW+x]=SAND;SCENE_WALL?.delete(y*MW+x);rockTiles.delete(x+','+y);
    }
    for(let y=95;y<=99;y++)for(let x=1534;x<=1538;x++){terr[y*MW+x]=SAND;SCENE_WALL?.delete(y*MW+x);rockTiles.delete(x+','+y);}
    DesertAdventure.clearApproach();
    rebuildBuckets();rebuildSolid();chunks.clear();
  }
  async function prepareSpiderArt(){
    await Promise.all([SpiderQueenDemo.ensureArt(),SpiderQueenWeb.ensureArt()]);
    if(!SpiderQueenDemo.inspect().ready||SPR.pyramid_spider_idle_d)return;
    for(const dir of ['d','u','e','w']){
      const frame=SpiderQueenDemo.frame(dir,'idle',0),detail=frame.width/128;
      const key='pyramid_spider_idle_'+dir,c=document.createElement('canvas');c.width=frame.width*4;c.height=90*detail;c.pixelLocked=true;c.spriteScale=detail;
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      for(let i=0;i<4;i++)g.drawImage(SpiderQueenDemo.frame(dir,'idle',i/3),i*frame.width,0);
      animalSheets[key]=c;SPR[key]=[0,0,frame.width,c.height,4,key];
    }
    FOE_ART.spiderqueen='pyramid_spider';
  }
  return {prepare,prepareSpiderArt,installWorld,clearForecourt,stoneFrame,routes};
})();
