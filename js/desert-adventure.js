/* Shared optional pyramid quest, native desert cast, and caravan-court dressing. */
const DesertAdventure=(()=>{
  const BASE='assets/interiors/desert-pyramid/',VERSION='20260930-desert4';
  const REWARD='pyramid_queen:emberheart';let source=null,ready=false;
  const owned=()=>houseLootTaken.has(REWARD);
  const won=()=>!!bossGone['pyramid_queen:0'];
  const arenas=[
    [9220,1392,68,['mummy','mummy']],
    [9221,1287,85,['mummy','mummy','mummy']],
    [9222,1288,144,['mummy','mummy','mummy']],
    [9223,1217,87,['mummy','mummy','mummy']],
    [9224,1105,83,['mummy','mummy','mummy','mummy']]
  ];
  function prop(m,spr,x,y,{solid=false,floor=false,frame,...rest}={}){
    const a={spr,x,y,schoolArt:true,editKey:'desert:'+m.roomActors.length+':'+spr,...rest};
    if(floor)a.sy=-10000;if(frame!==undefined)a.stillFrame=frame;
    if(solid)a.moveBlocks=[m.roomBlocks.push([x-6,y-10,x+6,y])-1];
    m.roomActors.push(a);return a;
  }
  async function prepare(){
    if(ready)return;
    const img=await loadStartupImage(BASE+'dressing.png?v='+VERSION);img.pixelLocked=true;animalSheets.desert_dressing=img;
    Object.assign(SPR,await loadStartupJSON(BASE+'dressing.json?v='+VERSION));
    const school=W.maps.school2;
    if(!school.npcs.some(n=>n.n==='Scholar Ilyan'))school.npcs.push({n:'Scholar Ilyan',sk:'desert1',desertNative:true,stationary:true,x:200,y:136,f:'d',editKey:'pyramid:scholar',d:['The old desert records are incomplete.']});
    dressPyramid();await court();ready=true;
  }
  function dressPyramid(){
    const themes={
      pyramid_entry:['dd_pots4','dd_watersack','dd_mat','dd_pots0','dd_pots1','dd_campfire'],
      pyramid_cache:['dd_gold0','dd_gold1','dd_gold2','dd_pots3','dd_pots4'],
      pyramid_halls:['dd_bones0','dd_bones1','dd_watersack','dd_mat','dd_pots2','dd_pots3','dd_pots4'],
      pyramid_armoury:['dd_pots2','dd_pots3','dd_firepit','dd_ladder','dd_watersack','dd_pots1'],
      pyramid_crypt:['dd_mummy','dd_bones0','dd_bones1','dd_bones2','dd_bones3','dd_scarabBlack','dd_scarabBrown','dd_flies'],
      pyramid_vault:['dd_pots3','dd_pots4','dd_scarabGreen','dd_scarabYellow','dd_gold0','dd_gold1','dd_gold2'],
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
    const img=await loadStartupImage(BASE+'sandspire_court.png?v='+VERSION);img.pixelLocked=true;
    const floors=[[32,48,928,768]],m=W.maps.sandspire_court={w:60,h:50,ts:16,title:'Sandspire — Caravan Court',templeExpanded:true,caravanCourt:true,templePlan:{chambers:[],floors,hazards:[]},templeFloors:floors,templeGateOpen:0,roomArt:'pyramid_tiles',_roomBaseCanvas:img,bg:'#000000',floorbg:'#daa16e',spawn:[480,728],terr:terrRLE(Array(3000).fill(SAND)),objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],npcs:[],roomActors:[],roomBlocks:[],doors:[],foes:[],collisionOverrides:{}};
    m.base_terr=m.terr;
    m.doors.push({x:29.5,y:46,to:'world',tx:1536,ty:97,dir:'d',explicitDir:true,triggerRect:{x:464,y:746,w:32,h:20}});
    const houses=[['43',112,224],['14',96,432],['23',96,656],['24',864,224],['33',864,432],['34',864,656],['44',480,432]];
    for(const [name,x,y]of houses){const a=prop(m,'dd_house'+name,x,y,{frame:0});const s=SPR[a.spr];a.moveBlocks=[m.roomBlocks.push([x-s[2]/2+4,y-s[3]+12,x+s[2]/2-4,y-12])-1];}
    for(const [i,x]of [208,432,656].entries()){
      m.roomBlocks.push([x,64,x+144,184],[x,224,x+144,240],[x,184,x+24,224],[x+120,184,x+144,224]);
      prop(m,'dd_fall'+(i+1),x+72,160,{sy:160});prop(m,'dd_foam',x+72,182,{floor:true});
    }
    // Market on the cross-street; camels and shade in the southeast stable.
    // Keep the central entrance-to-reservoir promenade free of furnishings.
    prop(m,'dd_camp',416,608);prop(m,'dd_pergola',816,752,{frame:0});
    for(let i=1;i<=3;i++)prop(m,'dd_camel'+i,736+(i-1)*64,704);
    for(let i=0;i<5;i++)prop(m,'dd_fence0',720+i*40,744,{frame:0});
    [[224,480],[288,480],[352,480],[608,480],[672,480],[736,480]].forEach(([x,y],i)=>prop(m,'dd_rug'+i,x,y,{floor:true,frame:0}));
    for(let i=1;i<=4;i++)prop(m,'dd_vulture'+i,i%2?96:864,i<3?288:496);
    const gardens=[
      ['dd_palm0',244,380],['dd_smallpalm0',316,380],['dd_fern',272,408],['dd_plant0',320,416],
      ['dd_palm1',628,380],['dd_smallpalm1',700,380],['dd_plant1',624,416],['dd_plant2',696,416],
      ['dd_acacia0',280,604],['dd_grass1',232,624],['dd_grassprop0',312,624],['dd_leaves',272,632],
      ['dd_acacia1',664,604],['dd_grass2',624,624],['dd_grass3',704,624],['dd_grassprop1',640,640],['dd_grassprop2',688,640]
    ];
    for(const [name,x,y]of gardens)prop(m,name,x,y,{floor:/leaves|grassprop/.test(name),frame:/palm|acacia/.test(name)?0:undefined});
    // Dry plants and stones form one border garden, rather than a display down the lanes.
    const dry=['dd_dead_tree','dd_half_tree','dd_bush0','dd_bush1','dd_cactus0','dd_cactus1','dd_cactus2','dd_rock0','dd_rock1','dd_rock2','dd_dead_fern','dd_dead_leaves'];
    dry.forEach((name,i)=>prop(m,name,64+(i%6)*48,712+Math.floor(i/6)*32,{frame:0,floor:/leaves/.test(name)}));
    for(const [name,x,y,spr]of [['Caravaneer Dalia',400,640,'desert_trader1'],['Waterkeeper Nuri',568,272,'desert_trader2'],['Weaver Hanan',672,512,'desert_trader3']])m.npcs.push({n:name,x,y,packSpr:spr,desertNative:true,stationary:true,d:[name+': The reservoirs keep our caravans watered. The western road is less kind; take care among the burial guards.']});
  }
  function organizeTown(m){
    // Keep house/door anchors intact. Group supplies beside homes and the market,
    // and move the caravan animals out of the middle of the square.
    const groups={dpot1:[[24144,1408],[24464,1680]],dpot4:[[24216,1584],[24216,1600],[24352,1648]],
      dgold0:[[24232,1584],[24232,1600],[24352,1680],[24368,1680]],dgold2:[[24384,1680]],
      dmat0:[[24432,1488],[24432,1520]],dfire:[[24448,1504]],drug0:[],
      camel:[[24144,1456],[24208,1480],[24336,1480],[24448,1480]],camel_sit:[[24120,1480]]};
    const counts={};
    for(let i=0;i<m.objs.length;i+=3){
      const name=W.names[m.objs[i]],x=m.objs[i+1],y=m.objs[i+2];
      if(x<24080||x>24536||y<1200||y>1824)continue;
      if(/^(dobelisk|dobsmall)/.test(name)){(m.editorDeletedObjects||=[]).push(i/3);continue;}
      if(!groups[name])continue;
      const pos=groups[name][counts[name]||0];counts[name]=(counts[name]||0)+1;
      if(pos){m.objs[i+1]=pos[0];m.objs[i+2]=pos[1];}
      else (m.editorDeletedObjects||=[]).push(i/3);
    }
  }
  function installWorld(m){
    // The next editor patch uses 9185–9189 for routes. Migrate arena IDs only;
    // enemy keys and array slots remain stable for existing save files.
    for(const f of m.features)if(f.pyramidApproach&&f.id>=9185&&f.id<=9189)f.id+=35;
    for(const [id,x,y,kinds]of arenas){
      if(!m.features.some(f=>f.id===id))m.features.push({id,kind:'arena',x,y,r:8,style:'desert',pyramidApproach:true});
      kinds.forEach((k,i)=>{const key=(id-35)+':'+i,existing=m.foes.find(f=>f.desertEncounter===key);if(existing)existing.k=k;else m.foes.push({k,x:x+[-3,3,-3,3][i],y:y+[-2,-2,3,3][i],desertEncounter:key});});
    }
    if(m.npcs.some(n=>n.n==='Sahir'))return;
    organizeTown(m);
    m.npcs.push({n:'Sahir',sk:'desert3',desertNative:true,stationary:true,x:24248,y:1568,f:'d',editKey:'pyramid:sahir',d:['The pyramid road has grown dangerous.']});
    // The pack's nine complementary house colours preserve the original door positions.
    m.desertHouseSprites={};
    for(const [name,x,y]of [['11',24168,1264],['12',24168,1664],['13',24232,1264],['21',24376,1344],['22',24376,1664],['31',24232,1392],['32',24488,1632],['41',24456,1808],['42',24504,1392]]){
      const index=m.objs.findIndex((s,i)=>i%3===0&&m.objs[i+1]===x&&m.objs[i+2]===y&&/^dhouse/.test(W.names[s]||''));
      if(index>=0)m.desertHouseSprites[index/3]='dd_house'+name;
    }
    prop(m,'dd_pergola',24584,1552,{frame:0});
    m.doors.push({x:1536,y:96,to:'sandspire_court',tx:29.5,ty:44.5,dir:'u',explicitDir:true,triggerRect:{x:24570,y:1537,w:28,h:12}});
    for(const [name,x,y]of [['dd_plant0',24144,1360],['dd_plant1',24144,1536],['dd_plant2',24432,1712],['dd_fern',24168,1712],['dd_smallpalm1',24464,1552],['dd_rug1',24248,1584]])prop(m,name,x,y,{floor:/rug/.test(name),frame:0});
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
