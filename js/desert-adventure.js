/* Shared optional pyramid quest, native desert cast, and original Sandspire town dressing. */
const DesertAdventure=(()=>{
  const BASE='assets/interiors/desert-pyramid/',VERSION='20261001-town5';
  const REWARD='pyramid_queen:emberheart';let source=null,ready=false;
  let flightPaths=null,flightFeatures=null,flightCount=0,flightStamp=-1;
  const owned=()=>houseLootTaken.has(REWARD);
  const won=()=>!!bossGone['pyramid_queen:0'];
  const arenas=[
    [9220,1392,68,['reptile','reptile2']],
    [9221,1287,85,['reptile','reptile2','reptile']],
    [9222,1288,144,['reptile','reptile2','reptile']],
    [9223,1217,87,['reptile','reptile2','reptile']],
    [9224,1105,83,['reptile2','reptile','reptile2','reptile']]
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
    dressPyramid();await SandspireGlassworks.prepare();ready=true;
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
        names.forEach((name,i)=>{const [x,y]=name==='dd_ladder'?[r-48,t+4]:spots[i];
          const actor=prop(m,name,x,y,{floor:/rug|bones|mat|leaves|scarab/.test(name)});
          if(/^dd_scarab/.test(name)){
            const angle=(room*1.7+i*2.4),speed=13+i%3*3;
            actor.scarab={bounds:[l+16,t+24,r-16,b-16],vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed};
          }
        });
      });
      // Decorative standing mummies are not enemies and have no interaction.
      // Keep combat mummies in m.foes; discard only these dressing actors.
      m.roomActors=m.roomActors.filter(a=>a.spr!=='dd_mummy');
    }
  }
  function stepScarabs(dt,map=MD){
    if(!map?.pyramid||!(dt>0))return;
    const step=Math.min(dt,.05),radius=5;
    for(const actor of map.roomActors||[]){
      const crawl=actor.scarab;if(!crawl||actor.editorDeleted)continue;
      const [l,t,r,b]=crawl.bounds;
      const free=(x,y)=>x>=l&&x<=r&&y>=t&&y<=b&&!(map.roomBlocks||[]).some(([x0,y0,x1,y1])=>x+radius>x0&&x-radius<x1&&y+radius>y0&&y-radius<y1);
      let x=actor.x+crawl.vx*step,y=actor.y+crawl.vy*step;
      if(!free(x,actor.y)){crawl.vx=-crawl.vx;x=actor.x+crawl.vx*step;}
      if(free(x,actor.y))actor.x=x;
      if(!free(actor.x,y)){crawl.vy=-crawl.vy;y=actor.y+crawl.vy*step;}
      if(free(actor.x,y))actor.y=y;
    }
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
    SandspireGlassworks.installWorld(m);
    // The next editor patch uses 9185–9189 for routes. Migrate arena IDs only;
    // enemy keys and array slots remain stable for existing save files.
    for(const f of m.features)if(f.pyramidApproach&&f.id>=9185&&f.id<=9189)f.id+=35;
    for(const [id,x,y,kinds]of arenas){
      if(!m.features.some(f=>f.id===id))m.features.push({id,kind:'arena',x,y,r:8,style:'desert',pyramidApproach:true});
      kinds.forEach((k,i)=>{const key=(id-35)+':'+i,existing=m.foes.find(f=>f.desertEncounter===key);if(existing)existing.k=k;else m.foes.push({k,x:x+[-3,3,-3,3][i],y:y+[-2,-2,3,3][i],desertEncounter:key});});
    }
    if(m.npcs.some(n=>n.n==='Sahir'))return;
    organizeTown(m);
    // These grey Forgewick lamps were accidentally placed outside Sandspire's south wall.
    for(let i=0;i<m.objs.length;i+=3)if(W.names[m.objs[i]]==='lamp_grey'&&m.objs[i+1]>=24000&&m.objs[i+1]<=24600&&m.objs[i+2]>=1872&&m.objs[i+2]<=1936)
      (m.editorDeletedObjects||=[]).push(i/3);
    m.npcs.push({n:'Sahir',sk:'desert3',desertNative:true,stationary:true,x:24248,y:1568,f:'d',editKey:'pyramid:sahir',d:['The pyramid road has grown dangerous.']});
    // The pack's nine complementary house colours preserve the original door positions.
    m.desertHouseSprites={};
    for(const [name,x,y]of [['11',24168,1264],['12',24168,1664],['13',24232,1264],['21',24376,1344],['22',24376,1664],['31',24232,1392],['32',24488,1632],['41',24456,1808],['42',24504,1392]]){
      const index=m.objs.findIndex((s,i)=>i%3===0&&m.objs[i+1]===x&&m.objs[i+2]===y&&/^dhouse/.test(W.names[s]||''));
      if(index>=0)m.desertHouseSprites[index/3]='dd_house'+name;
    }
    for(const [name,x,y]of [['dd_plant0',24160,1416],['dd_plant1',24144,1536],['dd_plant2',24432,1712],['dd_fern',24168,1712],['dd_smallpalm1',24464,1552],['dd_rug1',24248,1584]])prop(m,name,x,y,{floor:/rug/.test(name),frame:0});
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
  function vulturePaths(){
    if(flightFeatures===features&&flightCount===features.length&&flightStamp===editStamp)return flightPaths;
    flightFeatures=features;flightCount=features.length;flightStamp=editStamp;flightPaths=[];
    const rings=features.filter(f=>f.kind==='arena'||f.kind==='camp');
    let ordinal=0;
    for(const f of features.filter(f=>f.kind==='route'&&f.style==='desert')){
      for(const [leg,[a,b]]of routeLegs(f).entries()){
        const slot=ordinal++;
        if(slot%6)continue; // Sparse wildlife: at most one bird per six authored road legs.
        const length=Math.hypot(b[0]-a[0],b[1]-a[1])*TS;
        if(length<8*TS)continue;
        const ax=a[0]*TS+8,ay=a[1]*TS+8,dx=(b[0]-a[0])*TS/length,dy=(b[1]-a[1])*TS/length;
        let spans=[[3*TS,length-3*TS]];
        // Subtract the whole arena plus room for wings, shadow and flight height.
        // Both routine flights and startled escapes stay in this same safe span.
        for(const ring of rings){
          const rx=ring.x*TS+8-ax,ry=ring.y*TS+8-ay,r=((ring.r||ARENA_R)+5)*TS;
          const along=rx*dx+ry*dy,across=rx*dy-ry*dx;
          if(Math.abs(across)>=r)continue;
          const reach=Math.sqrt(r*r-across*across),lo=along-reach,hi=along+reach;
          spans=spans.flatMap(([s,e])=>hi<=s||lo>=e?[[s,e]]:[[s,Math.min(e,lo)],[Math.max(s,hi),e]].filter(([s,e])=>e>s));
        }
        const span=spans.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];
        if(!span||span[1]-span[0]<2*TS)continue;
        const home=(span[0]+span[1])/2,hx=ax+dx*home,hy=ay+dy*home;
        if(flightPaths.some(p=>Math.hypot(p.hx-hx,p.hy-hy)<16*TS))continue;
        flightPaths.push({id:f.id+':'+leg,route:f.id,leg,slot,ax,ay,dx,dy,lo:span[0],hi:span[1],home,hx,hy,phase:slot*17.31});
      }
    }
    return flightPaths;
  }
  function vulturePose(p,t){
    let distance=p.home,lift=0,alpha=1,flip=!!(p.slot%4),state;
    if(p.flee){
      const age=t-p.flee.time;
      if(age>=1.8){
        if(t<p.flee.time+30||Math.hypot(P.x-p.hx,P.y-p.hy)<200)return null;
        p.flee=null;
      }else{
        state='flee';const u=Math.min(1,age/1.8);
        distance=p.flee.from+(p.flee.to-p.flee.from)*(1-(1-u)*(1-u));
        lift=p.flee.lift+(40-p.flee.lift)*Math.min(1,age*3);
        alpha=Math.min(1,(1.8-age)/.6);flip=p.dx*(p.flee.to-p.flee.from)<0;
      }
    }
    if(!state){
      const cycle=(t+p.phase)%60;
      state=cycle<22?'sit':cycle<40?'idle':'fly';
      if(state==='fly'){
        const u=(cycle-40)/20,reach=Math.min((p.hi-p.lo)/2,80);
        distance=p.home+Math.sin(u*Math.PI*2)*reach;
        lift=Math.sin(Math.PI*u)*28;
        flip=p.dx*Math.cos(u*Math.PI*2)<0;
      }
    }
    const gx=p.ax+p.dx*distance,gy=p.ay+p.dy*distance;
    return {id:p.id,route:p.route,leg:p.leg,state,x:gx,y:gy-lift,gx,gy,lift,alpha,flip,phase:p.phase,distance};
  }
  function vultures(t){
    if(MAPID!=='world')return [];
    return vulturePaths().map(p=>vulturePose(p,t)).filter(Boolean);
  }
  function scareVultures(x,y,r=96,t=tAcc){
    if(MAPID!=='world')return;
    for(const p of vulturePaths()){
      if(p.flee)continue;
      const b=vulturePose(p,t);
      if(!b||Math.min(Math.hypot(b.x-x,b.y-y),Math.hypot(b.gx-x,b.gy-y))>r)continue;
      const threat=(x-p.ax)*p.dx+(y-p.ay)*p.dy;
      let to=threat<b.distance?Math.min(p.hi,b.distance+200):Math.max(p.lo,b.distance-200);
      // With nowhere to retreat along the road, rise vertically and disappear.
      if(Math.abs(to-b.distance)<TS)to=b.distance;
      p.flee={time:t,from:b.distance,to,lift:b.lift};
    }
  }
  function drawVulture(b,t){
    const flying=b.state==='fly'||b.state==='flee';
    const s=SPR[flying||b.state==='sit'?'vulture_fly':'vulture'];if(!s)return;
    // The flight strip also contains crouch/recovery poses. Loop only wing beats.
    const frame=flying?[1,2,3,4,3,2][Math.floor(t*8+b.phase)%6]
      :b.state==='sit'?0:Math.floor(t*3+b.phase)%s[4];
    const breathe=b.state==='sit'&&Math.floor(t*2+b.phase)%8>=4?1:0;
    ctx.save();ctx.globalAlpha=b.alpha;ctx.translate(Math.round(b.x),Math.round(b.y));
    ctx.fillStyle='rgba(58,38,25,.16)';ctx.beginPath();ctx.ellipse(0,b.lift,10,3,0,0,Math.PI*2);ctx.fill();
    if(b.flip)ctx.scale(-1,1);
    drawGameImage(ctx,sheetOf(s),s[0]+frame*s[2],s[1],s[2],s[3],-s[2]/2,-s[3]+breathe,s[2],s[3]);
    ctx.restore();
  }
  function accept(from){if(source||owned())return false;source=from;atlasSyncJournal();atlasTrackedQuest='pyramid';saveGame();toast('Side quest: The Emberheart of the Sands');return true;}
  function talk(n){
    if(!['Scholar Ilyan','Sahir'].includes(n.n))return false;
    if(n.n==='Scholar Ilyan'&&typeof ThornwellDialogue!=='undefined')return false; // The school scholar uses the full, context-aware conversation.
    sayOff();P.moving=false;faceToward(n,P.x,P.y);if(n.goto)n.goto=null;
    const speak=(lines,after)=>{
      const intro=typeof NpcContextAudit!=='undefined'?NpcContextAudit.introduction(n):null;
      playScene([...(intro?.first?intro.lines:[]),...lines.map(s=>n.n+': '+s)],
        {who:n.n,npcActor:n,after:()=>{if(intro?.first)intro.done();after?.();}});
    };
    if(owned()){speak(['You recovered the Emberheart! Carry it with you and Aurelius’s Fire burns a quarter stronger. It needs no clasp or ritual.']);return true;}
    if(source){speak([won()?'The guardian has fallen. Open the chest in her chamber to claim the Emberheart.':'The Sunken Pyramid lies at the end of the winding western desert road. Burial guards still walk inside its chambers. Take Aurelius; the relic was made for dragon fire.']);return true;}
    speak([n.n==='Scholar Ilyan'?'These old records describe an Emberheart hidden in a pyramid west of Sandspire.':'Reptiles stalk the winding road west of Sandspire. Beyond them, the guards inside the Sunken Pyramid have returned.',
      'An Emberheart rests beyond those burial chambers. Simply carrying it strengthens a dragon’s Fire by a quarter. Would you and Aurelius seek it?'],()=>{
        ask={quick:1,npcActor:n,opts:[
          {n:'We’ll investigate the pyramid.',go:()=>{accept(n.n==='Scholar Ilyan'?'school':'sandspire');speak(['Follow the western desert detour to its end. Search the chambers, defeat their guardian, and open the treasure chest. I have marked the pyramid on your map.']);}},
          {n:'Not right now.',go:()=>speak(['Ask me again when you are ready. It is a dangerous journey; take time to prepare.'])}
        ]};askPick=0;askDraw();
      });return true;
  }
  return {prepare,stepScarabs,installWorld,clearApproach,vultures,drawVulture,scareVultures,houseSprite:o=>MAPID==='world'&&MD.desertHouseSprites?.[o.id],talk,accept,owned,won,rewardId:REWARD,arenas,accepted:()=>!!source,capture:()=>source,restore:value=>{source=['school','sandspire'].includes(value)?value:null;},firePower:(el,power)=>el==='fire'&&owned()?power*1.25:power};
})();
