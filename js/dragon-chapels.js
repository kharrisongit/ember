/* Two chapels share the pack's authored interior; only the desert has the
   interior dragon statues and the permanent mounted-flight blessing. */
const DragonChapels=(()=>{
  const BASE='assets/interiors/chapel/',VERSION='20261002-chapels2';
  const X=1486*16+8,Y=347*16+16;
  const routes=[
    [9370,[[1745,241],[1745,340],[1704,340],[1704,380]]],
    [9371,[[1706,378],[1706,406],[1660,406],[1660,379],[1627,379],[1627,389],[1627,399],[1627,409],[1627,419],[1627,437],[1664,437],[1664,471],[1610,471]]],
    [9372,[[1613,471],[1572,471],[1572,513],[1529,513],[1529,435],[1565,435],[1565,410]]],
    [9373,[[1564,411],[1564,385],[1513,385],[1497,385],[1497,372],[1486,372],[1486,347]]]
  ].map(([id,pts])=>({id,kind:'route',x0:pts[0][0],y0:pts[0][1],x1:pts.at(-1)[0],y1:pts.at(-1)[1],pts,w:5,band:20,style:'desert',a0:null,a1:null}));
  const approaches=[[9380,1745,292],[9381,1682,406],[9382,1646,471],[9383,1529,480],[9384,1528,385]];
  const moves=[[7257,27864,3920],[7258,27830,3920],[7259,27864,3936],[7260,27992,3936],[7261,28021,3936],[7262,27992,3952],[7263,27864,3968],[7264,28023,3968],[7265,27864,3984],[7266,27829,3984],[7267,27864,4000],[7268,27992,4000],[7269,28025,4000],[7270,27864,4016],[7271,27992,4016],[7272,27831,4016],[7273,27864,4032],[7274,27992,4032],[7275,28021,4032],[7276,27864,4048],[7277,27992,4048],[7278,27830,4048],[7279,27864,4064],[7280,27992,4064],[7281,28024,4064],[7282,27864,4080],[7283,27992,4080],[7284,27834,4080],[7285,27864,4096]];
  let plan,ready=false,blessed=false,known=false,found=false,ritual=null,graveSource=null,graveObjects=[];
  const sprintSpeed=()=>blessed?285:228; // 285 × .8; walking and ordinary flight keep their speeds.
  function restore(value,state){blessed=value===true;known=state?.known===true||blessed;found=state?.found===true||blessed;ritual=null;}
  const guestNames=["Brother Oswin", "Brother Ansel", "Mara Bell", "Teren Vale", "Nessa Flint", "Orris Reed", "Elva Moss", "Brennor Ash", "Sera Penn", "Halen Birch", "Iria Dawn", "Davin Rook", "Mina Thorne", "Perrin Clay", "Brother Orenfold", "Brother Selwyn"];
  const isGuest=n=>/^chapel_(parishioners|monks)/.test(n?.packSpr||'');
  function learnChurch(){
    if(known)return;known=true;atlasSyncJournal();
    if(!found)atlasTrackedQuest='desert-church';
    saveGame();
  }
  async function prepare(){
    if(ready)return;
    plan=await loadStartupJSON(BASE+'layout.json?v='+VERSION);
    const base=await loadStartupImage(BASE+'interior.png?v='+VERSION);base.pixelLocked=true;
    const forgewickBase=await loadStartupImage(BASE+'forgewick-interior.png?v='+VERSION);forgewickBase.pixelLocked=true;
    const image=await loadStartupImage(BASE+'sprites.png?v='+VERSION);image.pixelLocked=true;
    animalSheets.chapel_art=image;
    for(const [name,s]of Object.entries(plan.sprites))SPR[name]=[s.x,s.y,s.w,s.h,s.durations.length,'chapel_art'];
    for(const [id,desert,title,priest]of [
      ['desert_chapel',true,'Desert — Chapel of the Sky','Brother Cael'],
      ['forgewick_chapel',false,'Forgewick — Chapel','Brother Edrin']
    ]){
      const map=W.maps[id]={w:22,h:17,ts:16,title,chapel:true,desertChapel:desert,travel:desert,travel_kind:'Church',
        roomArt:'chapel_altar0',_roomBaseCanvas:desert?base:forgewickBase,bg:'#2e2928',floorbg:'#7e93a7',spawn:[176,216],
        terr:terrRLE(Array(22*17).fill(DIRT)),objs:[],scatter:[],sanim:[],fsanim:[],fobjs:[],features:[],hidden:[],regions:[],places:[],foes:[],
        npcs:[],roomActors:[],roomBlocks:[],doors:[],collisionOverrides:{}};
      map.base_terr=map.terr;
      let guestIndex=0;
      for(const source of plan.interior){
        const a={...source};
        if(desert&&(a.congregation||a.layer==='benches'))continue;
        if(a.layer==='Statues'){
          if(!desert)continue;
          a.spr='chapel_statues1';a.x=source.x<176?128:224;a.chapelMirror=source.x<176;
        }
        if(a.congregation){
          const name=guestNames[guestIndex++],line=DIALOGUE_CHURCH_LINES[name][0];
          // Bring the pack's stray bottom-row sitter onto the last visible pew.
          if(a.y>224){a.x=128;a.y=224;}
          const monk=a.layer.startsWith('Monks');
          const talkX=monk?(a.x<176?80:272):a.x<176?(a.x<=128?96:168):(a.x<=208?184:256);
          map.npcs.push({n:name,packSpr:a.spr,x:a.x,y:a.y,sy:a.y+.1,f:'u',stationary:true,sceneReserved:true,
            talkX,talkY:Math.min(214,a.y+6),editKey:id+':'+a.spr,d:[name+': '+line]});
          continue;
        }
        const actor={...a,schoolArt:true,chapelArt:true,editKey:id+':'+a.spr};
        if(a.congregation)actor.sy=a.y+.1;
        // Small bases keep the central aisle and the foot of every pew clear.
        let box;
        if(a.layer==='benches'&&a.y<=208)box=[a.x-23,a.y-9,a.x+23,a.y-1];
        if(a.layer==='Statues')box=[a.x-11,a.y-17,a.x+11,a.y-4];
        if(a.layer==='Altar')box=[a.x-17,a.y-18,a.x+17,a.y-3];
        if(a.layer==='Fence')box=[a.x-31,a.y-15,a.x+31,a.y-8];
        if(a.layer.startsWith('Monks'))box=[a.x-6,a.y-10,a.x+6,a.y-2];
        if(box)actor.moveBlocks=[map.roomBlocks.push(box)-1];
        map.roomActors.push(actor);
      }
      map.npcs.push({n:priest,packSpr:'chapel_priest',packDirections:true,packWalk:true,
        x:176,y:112,f:'d',stationary:true,sceneReserved:true,editKey:id+':preacher',
        talkX:176,talkY:139,d:[desert?'Come out of the heat. There is a place to sit beside the window.':'Find yourself a seat. You can join us without knowing the words.']});
      map.doors.push({x:10.5,y:13.5,to:'world',tx:0,ty:0,dir:'d',explicitDir:true,triggerRect:{x:162,y:225,w:28,h:14}});
    }
    ready=true;
  }
  function installWorld(m){
    if(!ready||m.dragonChapelsInstalled)return;
    m.dragonChapelsInstalled=true;
    for(const route of routes){
      const i=m.features.findIndex(f=>f.id===route.id);
      if(i<0)m.features.push(JSON.parse(JSON.stringify(route)));
    }
    for(const [id,x,y]of moves){const i=id*3;if(i+2<m.objs.length){m.objs[i+1]=x;m.objs[i+2]=y;}}
    for(const [i,[id,x,y]]of approaches.entries()){
      if(!m.features.some(f=>f.id===id))m.features.push({id,kind:'arena',x,y,r:6.3,style:'desert',churchApproach:true});
      const roster=i<2?['reptile','reptile2','reptile']:['reptile2','reptile3','reptile2'];
      roster.forEach((k,j)=>{const key=id+':'+j;if(!m.foes.some(f=>f.churchEncounter===key))
        m.foes.push({k,x:x+[-2,2,0][j],y:y+[-2,-2,2][j],churchEncounter:key});});
    }
    const blocks=[[X-55,Y-130,X+55,Y-20],[X-55,Y-20,X-14,Y],[X+14,Y-20,X+55,Y]];
    for(const a of plan.exterior){
      if(a.layer==='Wings'||a.layer==='Dragon_body_head')continue;
      const actor={...a,x:X+a.x,y:Y+a.y,sy:Y-18+(a.layer==='Wings'?-.3:a.layer==='House'?0:.1),schoolArt:true,chapelArt:true,editKey:'desert:'+a.spr};
      if(a.spirit)actor.stillFrame=0;
      if(a.layer==='House')actor.moveBlocks=blocks.map(b=>m.roomBlocks.push(b)-1);
      m.roomActors.push(actor);
    }
    const door={x:(X-8)/16,y:(Y-16)/16,to:'desert_chapel',tx:10.5,ty:12.5,dir:'u',explicitDir:true,triggerRect:{x:X-12,y:Y-17,w:24,h:15}};
    m.doors.push(door);
    Object.assign(W.maps.desert_chapel.doors[0],{tx:(X-8)/16,ty:(Y+24-16)/16});
    // Use the player's current published church placement, not an old coordinate.
    let church;
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='church_blue'){church={x:m.objs[i+1],y:m.objs[i+2]};break;}
    if(church){
      const old=m.doors.find(d=>d.to==='forgewick_chapel');
      if(!old)m.doors.push({x:(church.x-8)/16,y:(church.y-16)/16,to:'forgewick_chapel',tx:10.5,ty:12.5,dir:'u',explicitDir:true,
        triggerRect:{x:church.x-12,y:church.y-19,w:24,h:17}});
      Object.assign(W.maps.forgewick_chapel.doors[0],{tx:(church.x-8)/16,ty:(church.y+24-16)/16});
    }
  }
  function clearForecourt(){
    if(MAPID!=='world'||!ready)return;
    const inside=(x,y)=>(x>X-154&&x<X+154&&y>Y-234&&y<Y+52)||approaches.some(([,ax,ay])=>Math.hypot(x/16-ax,(y-8)/16-ay)<7.5);
    const remove=(s,x,y)=>inside(x,y)&&/tree|cactus|rock|bush|fern|grass/i.test(NAMES[s]||'');
    for(const o of objs)if(remove(o.s,o.x,o.y))hidden.add(o.id);
    fobjs=fobjs.filter(o=>!remove(o.s,o.x,o.y));
    for(const [tag,arr]of [['s',scat],['a',sanm]])for(let i=0;i<arr.length;i+=3)if(remove(arr[i],arr[i+1],arr[i+2]))decorGone.add(tag+i);
    for(let y=Math.floor((Y-236)/16);y<=Math.ceil((Y+48)/16);y++)for(let x=Math.floor((X-152)/16);x<=Math.ceil((X+152)/16);x++){
      terr[y*MW+x]=SAND;SCENE_WALL?.delete(y*MW+x);rockTiles.delete(x+','+y);
    }
    const cleared=new Set();
    for(const [,ax,ay]of approaches)for(let y=ay-7;y<=ay+7;y++)for(let x=ax-7;x<=ax+7;x++)if(Math.hypot(x-ax,y-ay)<=6.7){
      const key=y*MW+x;terr[key]=PAVING2;SCENE_WALL?.delete(key);rockTiles.delete(x+','+y);cleared.add(key);
      for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)if(MD.collisionOverrides?.[(x*2+dx)+','+(y*2+dy)]===true)delete MD.collisionOverrides[(x*2+dx)+','+(y*2+dy)];
    }
    blockTiles=blockTiles.filter(k=>!cleared.has(k));
    MD.fence=(MD.fence||[]).filter(([x,y])=>!cleared.has(y*MW+x));
    finishGraveyard();
    rebuildBuckets();rebuildSolid();chunks.clear();
  }
  function finishGraveyard(){
    const yard=features.find(f=>f.label==='Hollybeck Graveyard');if(!yard)return;
    // The snow-country arena preserved an old cobbled strip through this clearing.
    // Replace its floor, keeping the surrounding forest and encounter intact.
    const r=features.find(f=>f.kind==='arena'&&f.x===yard.x&&f.y===yard.y)?.r||12;
    for(let y=yard.y-r-1;y<=yard.y+r+1;y++)for(let x=yard.x-r-1;x<=yard.x+r+1;x++)
      if(Math.hypot(x-yard.x,y-yard.y)<=r+.5)terr[y*MW+x]=DIRT;
  }
  function solidAt(x,y){
    if(MD.chapel)return !plan.floors.some(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b);
    if(MAPID!=='world'||x<41900||x>42400||y<2200||y>2650)return false;
    // Test live objects so editor moves/deletions and save-state removals stay in sync.
    if(graveSource!==objs){graveSource=objs;graveObjects=objs.filter(o=>/^wf_grave[123]$/.test(NAMES[o.s]||''));}
    return graveObjects.some(o=>!hidden.has(o.id)&&!deleted.has(o.id)&&graveSprite(o)&&
      x>=o.x-12&&x<o.x+12&&y>=o.y-32&&y<o.y);
  }
  function frame(name,time){
    const ds=plan.sprites[name].durations,total=ds.reduce((a,b)=>a+b,0);let tick=((time*1000)%total+total)%total;
    for(let i=0;i<ds.length;i++){if(tick<ds[i])return i;tick-=ds[i];}return 0;
  }
  function graveSprite(o){
    // Retain the placed object IDs, feet, collision and graveyard quest anchors.
    // Summoned grave markers elsewhere keep their original artwork.
    if(!ready||MAPID!=='world'||o.s===undefined||!/^wf_grave[123]$/.test(NAMES[o.s]||''))return null;
    if(o.x<41900||o.x>42400||o.y<2250||o.y>2650)return null;
    return 'chapel_grave'+((o.id||0)%12);
  }
  function draw(o,t){
    const grave=graveSprite(o);
    if(grave){const s=SPR[grave];drawGameImage(ctx,sheetOf(s),s[0],s[1],s[2],s[3],o.x-s[2]/2,o.y-s[3],s[2],s[3]);return true;}
    if(!o.chapelArt&&o.packSpr!=='chapel_priest'&&!isGuest(o))return false;
    let name=isGuest(o)?o.packSpr:o.spr,time=t;
    if(o.packSpr==='chapel_priest'){
      if(ritual?.npc===o&&ritual.phase==='cast'){name='chapel_priest_cast';time=ritual.time;}
      else if(o.scriptWalking)name='chapel_priest_walk_'+(o.f==='s'?(o.flip?'w':'e'):o.f||'d');
      else name=(sayNpc===o||scene?.npcActor===o)&&!ritual?'chapel_priest_speech':'chapel_priest_idle_d';
    }
    const s=SPR[name];if(!s)return false;
    const f=o.stillFrame??frame(name,time);
    const bottom=o.y;
    if(o.chapelMirror){
      ctx.save();ctx.translate(o.x,0);ctx.scale(-1,1);
      drawGameImage(ctx,sheetOf(s),s[0]+f*s[2],s[1],s[2],s[3],-s[2]/2,Math.round(bottom-s[3]),s[2],s[3]);ctx.restore();
    }else drawGameImage(ctx,sheetOf(s),s[0]+f*s[2],s[1],s[2],s[3],Math.round(o.x-s[2]/2),Math.round(bottom-s[3]),s[2],s[3]);
    if(name==='chapel_priest_cast'){
      const fx=SPR.chapel_priest_spell,f=frame('chapel_priest_spell',time);
      drawGameImage(ctx,sheetOf(fx),fx[0]+f*fx[2],fx[1],fx[2],fx[3],o.x-fx[2]/2,o.y-112,fx[2],fx[3]);
    }
    return true;
  }
  function talk(n){
    if(typeof ForgewickDialogue!=='undefined'&&ForgewickDialogue.profile(n))return false;
    if(isGuest(n)||MAPID==='forgewick_chapel')return false;
    if(n?.packSpr!=='chapel_priest')return false;
    ask=null;sayNpc=null;clearPadInputs();running=false;P.act=null;
    const lesson="Brother Cael: I'll write our consecration recipe for you: one measure of mineral dust, two of sunblooms. Scatter the mixture on cleared ground to keep enemies from returning.";
    const teach=()=>{if(typeof Crafting!=='undefined')Crafting.learn('chapel',true);};
    if(blessed){playScene(["Brother Cael: The Sky Blessing stays with you. A second ceremony would add nothing except time on your feet.",
      "Brother Cael: Mount Aurelius, take flight, then hold the sprint control. You'll feel the speed the blessing restored.",lesson],{who:n.n,npcActor:n,after:teach});return true;}
    if(!hasDragon()||!dragonIntroDone){playScene(["Brother Cael: I'm Cael. There hasn't been much company here lately. Sit wherever the light suits you.",
      "Brother Cael: Travellers need no special reason to rest in a chapel.",lesson],{who:n.n,npcActor:n,after:teach});return true;}
    playScene([
      "Corin: I've never seen a chapel keep statues of dragons. Who made these?",
      "Brother Cael: People grateful to the old riders and their companions. They came here before a journey to ask for clear skies, and afterward to give thanks for returning.",
      lesson,"Corin: Would you bless our journey too?",
      "Brother Cael: With pleasure. Stand near me. Your bond will carry the blessing to Aurelius wherever he waits."],
      {who:n.n,npcActor:n,after:()=>{teach();beginBlessing(n);}});
    return true;
  }
  function beginBlessing(n){
    if(blessed||MAPID!=='desert_chapel'||ritual)return false;
    ritual={npc:n,phase:'cast',time:0};n.scriptWalking=false;n.f='d';n.flip=false;
    playScene(["Brother Cael: May your wings find clear air, and your journey find its way home."],{who:n.n,npcActor:n,hold:()=>!ritual,
      after:()=>playScene(["Corin: Something changed. I can feel him wanting to rise.",
        "Brother Cael: Then take him flying. Some gifts are best understood in use.",
        'Sky Blessing received! Sprinting in flight now uses Aurelius’s full speed.'],{who:n.n,npcActor:n})});
    return true;
  }
  function step(dt){
    if(MAPID==='desert_chapel'&&!found&&gameplayStarted&&mode==='play'){
      found=true;
      if(known){atlasSyncJournal();toast('Quest complete: The Secret Dragon Church');}
      saveGame();
    }
    if(!ritual)return;
    const r=ritual,n=r.npc;
    if(MAPID!=='desert_chapel'){n.scriptWalking=false;ritual=null;return;}
    r.time+=dt;
    if(r.time<1.8)return;
    blessed=true;ritual=null;n.scriptWalking=false;n.f='d';n.flip=false;
    saveGame();window.EmberSfx?.keyItem?.();
  }
  return {prepare,installWorld,clearForecourt,solidAt,draw,talk,step,beginBlessing,frame,sprintSpeed,routes,moves,approaches,
    graveSprite,isGuest,learnChurch,known:()=>known,found:()=>found,capture:()=>blessed,captureQuest:()=>({known,found}),restore,inspect:()=>({ready,blessed,known,found,ritual:ritual?.phase||null,location:[X,Y]})};
})();
