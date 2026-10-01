/* Shared optional pyramid quest, native desert cast, and caravan-court dressing. */
const DesertAdventure=(()=>{
  const BASE='assets/interiors/desert-pyramid/',VERSION='20260930-desert4';
  const REWARD='pyramid_queen:emberheart';let source=null,ready=false;
  const owned=()=>houseLootTaken.has(REWARD);
  const won=()=>!!bossGone['pyramid_queen:0'];
  const arenas=[
    [9185,1392,68,['mummy','desertlancer1']],
    [9186,1287,85,['desertarcher1','desertlancer1','mummy']],
    [9187,1288,144,['desertlancer2','desertarcher1','mummy']],
    [9188,1217,87,['desertarcher2','desertlancer2','mummy']],
    [9189,1105,83,['desertarcher1','desertarcher2','desertlancer2','mummy']]
  ];
  function prop(m,spr,x,y,{solid=false,floor=false,frame,...rest}={}){
    const a={spr,x,y,schoolArt:true,editKey:'desert:'+m.roomActors.length+':'+spr,...rest};
    if(floor)a.sy=-10000;if(frame!==undefined)a.stillFrame=frame;
    if(solid)a.moveBlocks=[m.roomBlocks.push([x-6,y-10,x+6,y])-1];
    m.roomActors.push(a);return a;
  }
  async function prepare(){
    if(ready)return;
    const img=new Image();img.src=BASE+'dressing.png?v='+VERSION;await img.decode();img.pixelLocked=true;animalSheets.desert_dressing=img;
    const response=await fetch(BASE+'dressing.json?v='+VERSION);if(!response.ok)throw Error('Desert props could not load');Object.assign(SPR,await response.json());
    for(const [role,hp,speed]of [['archer1',6,29],['archer2',8,34],['lancer1',8,30],['lancer2',10,35]]){
      const sheet=new Image();sheet.src=BASE+role+'.png?v='+VERSION;await sheet.decode();
      const prefix='pyramid_'+role,kind='desert'+role;
      for(const [action,start,count]of [['idle',0,6],['walk',3,6],['atk',6,6],['hurt',10,4],['die',9,4]])for(const [dir,row]of [['d',0],['e',1],['u',2],['w',1]]){
        const key=prefix+'_'+action+'_'+dir,c=document.createElement('canvas');c.width=count*64;c.height=64;c.pixelLocked=true;
        const g=c.getContext('2d');g.imageSmoothingEnabled=false;
        for(let i=0;i<count;i++){g.save();g.translate((i+(dir==='w'?1:0))*64,0);if(dir==='w')g.scale(-1,1);g.drawImage(sheet,i*64,(action==='die'?9:start+row)*64,64,64,0,0,64,64);g.restore();}
        animalSheets[key]=c;SPR[key]=[0,0,64,64,count,key];FOE_ATTACK_OFFSETS[key]=[0,22];
      }
      const bow=role.startsWith('archer');
      FOE[kind]={hp,speed,sight:240,reach:bow?190:38,ring:bow?120:44,dmg:role.endsWith('2')?3:2,swingT:1.1,hitAt:.55,rest:bow?1.6:1.05,groupRest:1.25,wind:.5,...(bow?{cast:'desert_arrow',boltSp:150,standoff:112}:{})};
      FOE_ART[kind]=prefix;WORTH[kind]=role.endsWith('2')?16:12;
    }
    // Reuse the game's native arrow artwork, with cardinal rotations.
    for(const [dir,angle]of [['e',0],['d',Math.PI/2],['w',Math.PI],['u',-Math.PI/2]]){
      const s=SPR.scientist_arrow_r,c=document.createElement('canvas');c.width=32;c.height=32;c.pixelLocked=true;const g=c.getContext('2d');g.translate(16,16);g.rotate(angle);g.imageSmoothingEnabled=false;
      drawGameImage(g,sheetOf(s),s[0],s[1],s[2],s[3],-s[2]/2,-s[3]/2,s[2],s[3]);
      const key='desert_arrow_'+dir;animalSheets[key]=c;SPR[key]=[0,0,32,32,1,key];
    }
    const school=W.maps.school2;
    if(!school.npcs.some(n=>n.n==='Scholar Ilyan'))school.npcs.push({n:'Scholar Ilyan',sk:'desert1',desertNative:true,stationary:true,x:200,y:136,f:'d',editKey:'pyramid:scholar',d:['The old desert records are incomplete.']});
    dressPyramid();await court();ready=true;
  }
  function dressPyramid(){
    const themes={
      pyramid_entry:['dd_rug0','dd_watersack','dd_mat','dd_pots0','dd_pots1','dd_campfire'],
      pyramid_cache:['dd_gold0','dd_gold1','dd_gold2','dd_smallobelisk1','dd_smallobelisk2'],
      pyramid_halls:['dd_obelisk1','dd_obelisk2','dd_rug2','dd_rug3','dd_pots2','dd_pots3','dd_pots4'],
      pyramid_armoury:['dd_rug4','dd_rug5','dd_firepit','dd_ladder','dd_watersack','dd_pots1'],
      pyramid_crypt:['dd_mummy','dd_bones0','dd_bones1','dd_bones2','dd_bones3','dd_scarabBlack','dd_scarabBrown','dd_flies'],
      pyramid_vault:['dd_smallobelisk1','dd_smallobelisk2','dd_scarabGreen','dd_scarabYellow','dd_gold0','dd_gold1','dd_gold2'],
      pyramid_depths:['dd_mummy','dd_dead_fern','dd_dead_leaves','dd_bones2','dd_flies']
    };
    for(const [id,names]of Object.entries(themes)){
      const m=W.maps[id];m.templePlan.chambers.forEach(([l,t,r,b],room)=>{
        // Side-wall furnishings leave the middle and every door approach open.
        const spots=[[l+32,t+96],[r-32,t+96],[l+24,b-56],[r-24,b-56],[l+56,t+32],[r-56,t+32],[l+48,b-24],[r-48,b-24]];
        names.forEach((name,i)=>{const [x,y]=name==='dd_ladder'?[r-48,t+4]:spots[i];prop(m,name,x,y,{floor:/rug|bones|mat|leaves|scarab/.test(name)});});
      });
    }
  }
  async function court(){
    const img=new Image();img.src=BASE+'sandspire_court.png?v='+VERSION;await img.decode();img.pixelLocked=true;
    const floors=[[32,48,928,768]],m=W.maps.sandspire_court={w:60,h:50,ts:16,title:'Sandspire — Caravan Court',templeExpanded:true,caravanCourt:true,templePlan:{chambers:[],floors,hazards:[]},templeFloors:floors,templeGateOpen:0,roomArt:'pyramid_tiles',_roomBaseCanvas:img,bg:'#000000',floorbg:'#daa16e',spawn:[480,728],terr:terrRLE(Array(3000).fill(SAND)),objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{}};
    m.base_terr=m.terr;
    m.doors.push({x:29.5,y:46,to:'world',tx:1536,ty:97,dir:'d',explicitDir:true,triggerRect:{x:464,y:746,w:32,h:20}});
    const houses=[['43',112,224],['14',96,432],['23',96,656],['24',864,224],['33',864,432],['34',864,656],['44',480,432]];
    for(const [name,x,y]of houses){const a=prop(m,'dd_house'+name,x,y,{frame:0});const s=SPR[a.spr];a.moveBlocks=[m.roomBlocks.push([x-s[2]/2+4,y-s[3]+12,x+s[2]/2-4,y-12])-1];}
    for(const [i,x]of [208,432,656].entries()){
      m.roomBlocks.push([x,64,x+144,184],[x,224,x+144,240],[x,184,x+24,224],[x+120,184,x+144,224]);
      prop(m,'dd_fall'+(i+1),x+72,160,{sy:160});prop(m,'dd_foam',x+72,182,{floor:true});
    }
    prop(m,'dd_camp',480,600);prop(m,'dd_pergola',480,712,{frame:0});
    for(let i=1;i<=3;i++)prop(m,'dd_camel'+i,368+(i-1)*112,660);
    for(let i=1;i<=4;i++)prop(m,'dd_vulture'+i,i%2?96:864,i<3?288:496);
    const gardenProps=['dd_palm0','dd_palm1','dd_smallpalm0','dd_smallpalm1','dd_acacia0','dd_acacia1','dd_plant0','dd_plant1','dd_plant2','dd_fern','dd_leaves','dd_grass1','dd_grass2','dd_grass3','dd_grassprop0','dd_grassprop1','dd_grassprop2'];
    const gardens=[[208,320],[592,320],[208,528],[592,528]];
    gardenProps.forEach((name,i)=>{const [x,y]=gardens[i%4],row=Math.floor(i/4);prop(m,name,x+24+(row%3)*48,y+48+Math.floor(row/3)*40,{floor:/leaves|grassprop/.test(name),frame:/palm|acacia/.test(name)?0:undefined});});
    const dry=['dd_dead_tree','dd_half_tree','dd_bush0','dd_bush1','dd_cactus0','dd_cactus1','dd_cactus2','dd_rock0','dd_rock1','dd_rock2','dd_fence0','dd_dead_fern','dd_dead_leaves'];
    dry.forEach((name,i)=>prop(m,name,i%2?912:48,280+Math.floor(i/2)*64,{frame:0}));
    for(const [name,x,y,spr]of [['Caravaneer Dalia',360,608,'desert_trader1'],['Waterkeeper Nuri',568,272,'desert_trader2'],['Weaver Hanan',752,480,'desert_trader3']])m.npcs.push({n:name,x,y,packSpr:spr,desertNative:true,stationary:true,d:[name+': The reservoirs keep our caravans watered. The western road is less kind; take care among the burial guards.']});
  }
  function installWorld(m){
    for(const [id,x,y,kinds]of arenas){
      if(!m.features.some(f=>f.id===id))m.features.push({id,kind:'arena',x,y,r:8,style:'desert',pyramidApproach:true});
      kinds.forEach((k,i)=>{const key=id+':'+i;if(!m.foes.some(f=>f.desertEncounter===key))m.foes.push({k,x:x+[-3,3,-3,3][i],y:y+[-2,-2,3,3][i],desertEncounter:key});});
    }
    if(m.npcs.some(n=>n.n==='Sahir'))return;
    m.npcs.push({n:'Sahir',sk:'desert3',desertNative:true,stationary:true,x:24248,y:1568,f:'d',editKey:'pyramid:sahir',d:['The pyramid road has grown dangerous.']});
    // The pack's nine complementary house colours preserve the original door positions.
    m.desertHouseSprites={};
    for(const [name,x,y]of [['11',24168,1264],['12',24168,1664],['13',24232,1264],['21',24376,1344],['22',24376,1664],['31',24232,1392],['32',24488,1632],['41',24456,1808],['42',24504,1392]]){
      const index=m.objs.findIndex((s,i)=>i%3===0&&m.objs[i+1]===x&&m.objs[i+2]===y&&/^dhouse/.test(W.names[s]||''));
      if(index>=0)m.desertHouseSprites[index/3]='dd_house'+name;
    }
    prop(m,'dd_pergola',24584,1552,{frame:0});
    m.doors.push({x:1536,y:96,to:'sandspire_court',tx:29.5,ty:44.5,dir:'u',explicitDir:true,triggerRect:{x:24570,y:1537,w:28,h:12}});
    for(const [name,x,y]of [['dd_plant0',24144,1360],['dd_plant1',24304,1488],['dd_plant2',24432,1712],['dd_fern',24168,1712],['dd_smallpalm1',24416,1536],['dd_rug1',24248,1584]])prop(m,name,x,y,{floor:/rug/.test(name),frame:0});
  }
  function clearApproach(){
    if(MAPID!=='world')return;
    const inside=(x,y,pad=1)=>arenas.some(([,ax,ay])=>Math.hypot(x/16-ax,(y-8)/16-ay)<=8+pad);
    const debris=(s,x,y)=>inside(x,y)&&/tree|cactus|cact|rock|bush|fern|grass|^mt|^halfdead|^palm|^dacacia/i.test(NAMES[s]||'');
    for(const o of objs)if(debris(o.s,o.x,o.y))hidden.add(o.id);
    fobjs=fobjs.filter(o=>!debris(o.s,o.x,o.y));
    for(const [tag,arr]of [['s',scat],['a',sanm]])for(let i=0;i<arr.length;i+=3)if(debris(arr[i],arr[i+1],arr[i+2]))decorGone.add(tag+i);
    const cleared=new Set();
    for(const [,ax,ay]of arenas)for(let y=ay-9;y<=ay+9;y++)for(let x=ax-9;x<=ax+9;x++)if(Math.hypot(x-ax,y-ay)<=8.5){
      const key=y*MW+x;terr[key]=PAVING2;SCENE_WALL?.delete(key);rockTiles.delete(x+','+y);cleared.add(key);
    }
    blockTiles=blockTiles.filter(i=>!cleared.has(i));
  }
  function accept(from){if(source||owned())return false;source=from;atlasSyncJournal();atlasTrackedQuest='pyramid';saveGame();toast('Side quest: The Emberheart of the Sands');return true;}
  function talk(n){
    if(!['Scholar Ilyan','Sahir'].includes(n.n))return false;
    sayOff();P.moving=false;faceToward(n,P.x,P.y);if(n.goto)n.goto=null;
    const speak=(lines,after)=>playScene(lines.map(s=>n.n+': '+s),{who:n.n,npcActor:n,after});
    if(owned()){speak(['You recovered the Emberheart! Carry it with you and Aurelius’s Fire burns a quarter stronger. It needs no clasp or ritual.']);return true;}
    if(source){speak([won()?'The guardian has fallen. Open the chest in her chamber to claim the Emberheart.':'The Sunken Pyramid lies at the end of the winding western desert road. Its burial guards still walk. Take Aurelius; the relic was made for dragon fire.']);return true;}
    speak([n.n==='Scholar Ilyan'?'These old records describe an Emberheart hidden in a pyramid west of Sandspire.':'Caravans have stopped using the winding road west of Sandspire. The guards of the Sunken Pyramid have returned.',
      'An Emberheart rests beyond those burial chambers. Simply carrying it strengthens a dragon’s Fire by a quarter. Would you and Aurelius seek it?'],()=>{
        ask={quick:1,npcActor:n,opts:[
          {n:'We’ll investigate the pyramid.',go:()=>{accept(n.n==='Scholar Ilyan'?'school':'sandspire');speak(['Follow the western desert detour to its end. Search the chambers, defeat their guardian, and open the treasure chest. I have marked the pyramid on your map.']);}},
          {n:'Not right now.',go:()=>speak(['The record will be here when you are ready.'])}
        ]};askPick=0;askDraw();
      });return true;
  }
  return {prepare,installWorld,clearApproach,houseSprite:o=>MAPID==='world'&&MD.desertHouseSprites?.[o.id],talk,accept,owned,won,rewardId:REWARD,arenas,accepted:()=>!!source,capture:()=>source,restore:value=>{source=['school','sandspire'].includes(value)?value:null;},firePower:(el,power)=>el==='fire'&&owned()?power*1.25:power};
})();
