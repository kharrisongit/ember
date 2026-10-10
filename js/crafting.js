/* Fieldcraft: shared recipe, reward and gathering state. Save IDs stay stable. */
const Crafting=(()=>{
  const materials={
    herb:{name:'Healing Herb',source:'The northern Millwood chest trail and roads east toward Thornwell and Forgewick.',price:6,color:'#87ac67'},
    mushroom:{name:'Wild Mushroom',source:'Shroom Pass and shaded woodland roads; shroom enemies.',price:7,color:'#c29874'},
    root:{name:'Bitterroot',source:'Woodland, desert and swamp paths.',price:8,color:'#c39a64'},
    sunbloom:{name:'Sunbloom',source:'Desert paths near the Oasis and Sandspire.',price:10,color:'#efbf59'},
    reed:{name:'Marsh Reed',source:'The swamp roads beyond Coralmere.',price:9,color:'#8eac78'},
    ghostcap:{name:'Ghostcap',source:'Pale mushrooms beside the swamp roads.',price:14,color:'#c1aadf'},
    frostberry:{name:'Frostberry',source:'Red berry bushes along Hollybeck and winter routes.',price:12,color:'#d77480'},
    snowbell:{name:'Snowbell',source:'Blue flowers along Hollybeck and winter routes.',price:15,color:'#94bded'},
    mineral:{name:'Mineral Dust',source:'Golem drops, mine enemies, Ashcrag deposits and treasure chests.',price:14,color:'#a9b5bb'},
    essence:{name:'Spirit Essence',source:'Rare enemy drops, powerful foes and occasional route chests.',price:0,color:'#83dbd0'}
  };
  const recipes=[
    {id:'potion',name:'Potion',teacher:'nan',cost:{herb:2,root:1},kind:'brew',effect:'Restores 2 of Corin’s hearts.'},
    {id:'elixir',name:'Elixir',teacher:'healer',cost:{herb:3,sunbloom:2,root:1},kind:'brew',effect:'Fully restores Corin’s health.'},
    {id:'dust',name:'Madness Dust',teacher:'shroom',cost:{mushroom:3,root:1},kind:'grind',effect:'Confuses nearby enemies into fighting one another.'},
    {id:'bell',name:'Bell Stake',teacher:'smith',cost:{mineral:2,root:2},kind:'grind',effect:'Draws enemies to a ringing stake.'},
    {id:'mark',name:'Grave Marker',teacher:'smith',cost:{mineral:2,mushroom:1},kind:'grind',effect:'Recovers gold left behind after Corin falls.'},
    {id:'salt',name:'Consecration',teacher:'chapel',cost:{mineral:1,sunbloom:2},kind:'grind',effect:'Keeps a cleared battle arena from repopulating.'},
    {id:'bomb',name:'Maelis’s Curse',teacher:'witch',cost:{ghostcap:2,reed:2,essence:1},kind:'brew',effect:'Allows escape from an ordinary battle; major fights stay sealed.'},
    {id:'saint',name:'Saint’s Breath',teacher:'winter',cost:{snowbell:2,frostberry:2,essence:1},kind:'brew',effect:'Protects Corin from damage for 16 seconds.'},
    {id:'stone',name:'Resurrection Stone',teacher:'winter',cost:{mineral:3,snowbell:2,essence:1},kind:'grind',effect:'Raises a fallen enemy as a temporary ally.'}
  ];
  const foods=[['boarMeat','Boar'],['hareMeat','Hare'],['deerMeat','Venison'],['foxMeat','Fox'],['birdMeat','Bird'],['dragonFish','Fish']];
  for(const [raw,name] of foods)recipes.push({id:'cooked_'+raw,name:raw==='dragonFish'?'Herb-baked Fish':'Roast '+name,teacher:'nan',cost:{[raw]:1,herb:1},kind:'cook',raw,effect:'Restores '+(raw==='dragonFish'?45:40)+' dragon HP and revives a fallen Aurelius.'});
  const teachers={nan:{name:'Nan',where:'Millwood — your home',line:"You'll want a potion first: two healing herbs, one bitterroot. The chest trail north of Millwood has both. For supper, one piece of raw meat or fish with one herb. Use the pot or grill in the kit; write the amounts where you'll find them."},
    healer:{name:'Wren',where:'Thornwell market',line:"An elixir takes three healing herbs, two sunblooms and one bitterroot. It restores all your health. I'll put the amounts on paper; people remember the useful part and forget what goes in."},
    shroom:{name:'The Shroom King',where:'Sporehollow',line:"Three mushrooms, one bitterroot. Grind them into Madness Dust. Nearby enemies become confused and fight each other. Keep your nose away while you work; your dignity is not an ingredient."},
    smith:{name:'Dunstan',where:'Forgewick smithy',line:"Two mineral dust and two bitterroots make a Bell Stake; the ringing draws enemies. For a Grave Marker, use two mineral dust and one mushroom. That will recover gold you left when you fell. Different jobs, different mixtures."},
    chapel:{name:'A chapel preacher',where:'Forgewick chapel or the secret desert chapel',line:"One mineral dust, two sunblooms: consecration. Clear the arena before scattering it. The enemies will not return to that ground. A quiet place is worth keeping quiet."},
    witch:{name:'Maelis',where:'Witchmoor',line:"Two ghostcaps, two marsh reeds, one spirit essence. That is my Curse. Brew it and you can escape an ordinary fight. A major battle stays sealed, so don't walk into one expecting this to excuse you."},
    winter:{name:'Sverre',where:'Hollybeck',line:"Saint's Breath takes two snowbells, two frostberries and one spirit essence: sixteen seconds without damage. A Resurrection Stone needs three mineral dust, two snowbells and one essence. It raises a fallen enemy to help you. Label the recipes; those are very different surprises."}};
  const fresh=()=>({version:2,kit:false,ingredients:{},cooked:{},learned:[],harvested:{},starter:false,kills:0,mastered:{},seenHelp:false,pending:null});
  const coopStates=new Map();let coopOwner=null;
  let state=fresh(),session=null,opened=false,vendor=null,nodes=[],art=null,artReady=false;
  const clean=n=>Number.isFinite(n)?Math.max(0,Math.min(9999,Math.floor(n))):0;
  const recipe=id=>recipes.find(r=>r.id===id);
  const count=id=>materials[id]?state.ingredients[id]||0:id.startsWith('cooked_')?state.cooked[id]||0:
    ({potion:potions,elixir:elixirs,bomb:bombs,dust,bell:bells,mark:marks,saint:breaths,stone:stones,salt:salts,boarMeat,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish})[id]||0;
  function add(id,n){
    if(materials[id])state.ingredients[id]=clean(count(id)+n);
    else if(id.startsWith('cooked_'))state.cooked[id]=clean(count(id)+n);
    else switch(id){case 'potion':potions+=n;break;case 'elixir':elixirs+=n;break;case 'bomb':bombs+=n;break;case 'dust':dust+=n;break;case 'bell':bells+=n;break;case 'mark':marks+=n;break;case 'saint':breaths+=n;break;case 'stone':stones+=n;break;case 'salt':salts+=n;break;case 'boarMeat':boarMeat+=n;break;case 'hareMeat':hareMeat+=n;break;case 'deerMeat':deerMeat+=n;break;case 'foxMeat':foxMeat+=n;break;case 'birdMeat':birdMeat+=n;break;case 'dragonFish':dragonFish+=n;break;}
  }
  const known=r=>!!r&&state.learned.includes(r.teacher);
  const maxBatch=r=>known(r)?Math.max(0,Math.min(5,r.raw?9999-count(r.id):Infinity,...Object.entries(r.cost).map(([id,n])=>Math.floor(count(id)/n)))):0;
  function learn(group,quiet=false){
    if(!teachers[group])return false;
    if(!state.learned.includes(group))state.learned.push(group);
    for(const other of coopStates.values())if(!other.learned.includes(group))other.learned.push(group);
    if(group==='nan')state.starter=true;
    saveGame();if(!quiet)toast('Recipes learned: '+recipes.filter(r=>r.teacher===group).map(r=>r.name).join(', '));return true;
  }
  function eligible(){return gameplayStarted&&mode==='play'&&hasBag()&&!scene&&!revealing&&!sayNpc&&!doorMotion&&!fadeDir&&!trial&&!arenaLock&&!deadShown&&!mounted&&!ride&&!fishing&&!P.act&&!inFight()&&!flightTravel;}
  function open(person=null){
    if(opened)return true;
    if(!state.kit)return false;
    // Close a service menu only after ensuring the world itself is safe.
    if(!eligible()){toast('Find a safe place and dismount before crafting.');return false;}
    setBag(false);askShut();window.EmberConversationFlow?.shut(true);sayOff();showFace(null);
    opened=true;vendor=person;P.moving=false;P.act=null;running=false;clearPadInputs();for(const k in keys)keys[k]=0;
    loadArt();window.CraftingView?.show(person?'ingredients':'recipes');return true;
  }
  function close(){
    cancel();opened=false;vendor=null;window.CraftingView?.hide();P.moving=false;running=false;clearPadInputs();for(const k in keys)keys[k]=0;
  }
  function cancel(){
    if(state.pending){for(const [id,n]of Object.entries(state.pending.costs))add(id,n);state.pending=null;session=null;saveGame();}
    session=null;
  }
  // A completed slide confirms the reserved batch; a short animation precedes
  // the single atomic reward. Closing at any point before that refunds it.
  function start(id,qty=1){
    const r=recipe(id);if(!opened||session&&session.phase!=='result'||!r||!known(r))return false;
    qty=Math.max(1,Math.min(5,Math.floor(qty)||1));if(maxBatch(r)<qty)return false;
    const costs=Object.fromEntries(Object.entries(r.cost).map(([k,v])=>[k,v*qty]));
    for(const [k,v] of Object.entries(costs))add(k,-v);
    state.pending={id,qty,costs};session={id,qty,phase:'confirm',progress:0};
    saveGame();window.CraftingView?.play();return true;
  }
  function press(){if(session?.phase==='result'){session=null;window.CraftingView?.book();}}
  function release(){if(session?.phase==='confirm'){session.progress=0;window.CraftingView?.paint();}}
  function slide(value){if(session?.phase!=='confirm'||!Number.isFinite(value))return false;session.progress=Math.max(0,Math.min(1,value));window.CraftingView?.paint();return true;}
  function tick(dt){
    if(!opened)return false;
    const s=session;
    if(s?.phase==='crafting'&&!document.hidden&&Number.isFinite(dt)&&dt>0){
      s.age=Math.min(s.duration,s.age+Math.min(dt,.05));
      window.CraftingView?.paint();
      if(s.age>=s.duration)complete(s);
    }
    return true;
  }
  function finish(){
    const s=session;if(!s||s.phase!=='confirm'||!state.pending||s.progress<1)return false;
    s.phase='crafting';s.age=0;s.duration=4.5;
    window.CraftingView?.paint();return true;
  }
  function complete(s){
    const p=state.pending;if(session!==s||s.phase!=='crafting'||!p)return false;
    s.produced=p.qty;add(p.id,s.produced);state.mastered[p.id]=clean((state.mastered[p.id]||0)+1);state.pending=null;
    s.phase='result';s.progress=1;saveGame();window.EmberSfx?.pickup?.();window.CraftingView?.result();return true;
  }
  function capture(){return JSON.parse(JSON.stringify(state));}
  function restore(saved){
    opened=false;vendor=null;session=null;window.CraftingView?.hide();state=fresh();
    if(saved===null)return;
    if(!saved||typeof saved!=='object'){state.kit=!!templeCompass.meatGiven;return;}
    state.kit=!!saved.kit||!!templeCompass.meatGiven;
    for(const id of Object.keys(materials))state.ingredients[id]=clean(saved.ingredients?.[id]);
    for(const r of recipes.filter(r=>r.raw))state.cooked[r.id]=clean(saved.cooked?.[r.id]);
    state.learned=Array.isArray(saved.learned)?[...new Set(saved.learned.filter(k=>teachers[k]))]:[];
    state.starter=!!saved.starter;state.seenHelp=!!saved.seenHelp;state.kills=clean(saved.kills);
    for(const r of recipes)state.mastered[r.id]=clean(saved.mastered?.[r.id]);
    const now=Date.now();for(const [id,t]of Object.entries(saved.harvested||{}).filter(([id,t])=>id.startsWith('craft:intro:')&&t===-1).concat(Object.entries(saved.harvested||{}).filter(([,t])=>t!==-1).slice(-500)))if(id.startsWith('craft:')&&Number.isFinite(t)&&((id.startsWith('craft:intro:')&&t===-1)||(t>now&&t<=now+20*60*1000)))state.harvested[id]=t;
    // Costs were saved at start. Interrupted batches refund once on load.
    const p=saved.pending,r=recipe(p?.id);
    if(r){const qty=clean(p.qty);if(qty>=1&&qty<=5)for(const [id,n]of Object.entries(r.cost))add(id,n*qty);}
  }
  function teacherFor(n){
    if(n.n==='Nan Ferrow')return 'nan';if(n.n==='Wren')return 'healer';if(n.n==='The Shroom King')return 'shroom';if(n.n==='Dunstan')return 'smith';
    if(n.packSpr==='chapel_priest')return 'chapel';if(/Maelis/.test(n.n))return 'witch';if(n.n==='Sverre')return 'winter';return null;
  }
  function topics(n){
    const group=teacherFor(n);if(!state.kit||!group||n.n==='Nan Ferrow'&&!templeCompass.morningMet)return [];
    return [{title:state.learned.includes(group)?"Checking the recipe book":"A lesson for the road",category:'lead',friendship:false,go:()=>{
      askShut();window.EmberConversationFlow?.shut();sayNpc=null;scene=null;sayOff();
      playScene([n.n+': '+teachers[group].line,"Corin: Wait, I'll copy the quantities. I'd rather ask twice than get them wrong."],{npcActor:n,who:n.n,after:()=>{learn(group);open();}});
    }}];
  }
  function useFood(id){
    const r=recipe(id);if(!r?.raw||!count(id)||!hasDragon())return false;
    syncDragonVitality(false);if(dragon.hp>=dragon.maxHp&&!dragon.down){toast('Aurelius is already full.');return false;}
    add(id,-1);const down=dragon.down;dragon.hp=Math.min(dragon.maxHp,dragon.hp+(r.raw==='dragonFish'?45:40));dragon.down=down;
    dragon.revive=down?Math.min(dragon.revive||1.2,1.2):0;dragon.hurt=0;dragon.inv=1.2;
    if(dragonHere())showHeal('dragon',dragon.x,dragon.y-18);toast(r.name+' restores Aurelius.');saveGame();return true;
  }
  function buy(id){
    const m=materials[id];if(!opened||!vendor||!availableStock().includes(id)||!m.price||gold<m.price||count(id)>=9999)return false;
    gold-=m.price;add(id,1);saveGame();window.EmberSfx?.coin?.();window.CraftingView?.book('ingredients');return true;
  }
  function availableStock(){
    if(!vendor)return [];
    const all=['herb','mushroom','root','mineral'];
    if(breathHas.lightning||wonAll)all.push('sunbloom');
    if(breathHas.ice||wonAll)all.push('reed','ghostcap','frostberry','snowbell');return all;
  }
  function defeated(f){
    if(!f||f.ally||f.storyKnight||f.storyPassive||f._craftDropped||!(f.hp<=0||f.st==='dead'))return;
    f._craftDropped=true;if(f.huntingArena)return;
    state.kills++;
    let id=/^golem/.test(f.kind)?'mineral':/^shroom/.test(f.kind)&&state.kills%2===0?'mushroom':
      /^(ghost|lich|spiderqueen|frosthorn|icemoth|devil)$/.test(f.kind)?'essence':state.kills%12===0?'essence':
      /mine/.test(MAPID)&&state.kills%3===0?'mineral':null;
    if(id){add(id,/^golem/.test(f.kind)?2:1);toast('+ '+materials[id].name);saveGame();}
  }
  function chest(loot){
    if(!loot||loot.ghost||!loot.gold)return;
    const seed=[...loot.id].reduce((v,c)=>(v*31+c.charCodeAt(0))>>>0,7);
    const id=loot.id.includes('side-route')&&seed%5===0?'essence':seed%3===0?'mineral':'herb';
    add(id,2);return '+2 '+materials[id].name;
  }
  function loadArt(){
    if(art)return;art=new Image();art.onload=()=>{artReady=true;};art.onerror=()=>{art=null;};art.src='assets/crafting/ingredients.webp?v=20261005';
  }
  function regionMaterials(style,x){
    if(/winter|snow/.test(style))return ['frostberry','snowbell'];if(/swamp/.test(style))return ['reed','ghostcap','root'];
    if(/desert/.test(style))return ['sunbloom','root'];if(/volcano|lava/.test(style))return ['mineral','mineral'];
    if(/mystic|shroom/.test(style))return ['mushroom','root'];if(!style&&x>2600)return ['frostberry','snowbell'];return ['herb','mushroom','root'];
  }
  function prepareWorld(){
    nodes=[];if(MAPID!=='world')return;loadArt();
    const seen=new Set();
    for(const f of features.filter(f=>f.kind==='route')){
      if(f.id===9185)continue;
      const legs=readRouteLegs(f);if(!legs)continue;
      for(const [li,[a,b]]of legs.entries()){
        const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<10)continue;
        const total=Math.max(1,Math.floor(length/26));
        for(let j=0;j<total;j++){
          const t=(j+.5)/total,x=(a[0]+(b[0]-a[0])*t)*TS+8,y=(a[1]+(b[1]-a[1])*t)*TS+16;
          const dx=-(b[1]-a[1])/length,dy=(b[0]-a[0])/length;
          let point=null;
          for(const side of [1,-1])for(const off of [24,16]){
            const px=Math.round(x+dx*off*side),py=Math.round(y+dy*off*side);
            if(!point&&px>=80*TS&&canStand(px,py)&&!nodes.some(n=>Math.hypot(n.x-px,n.y-py)<90)&&!(MD.doors||[]).some(d=>{const r=doorRect(d);return Math.hypot(px-r.x-r.w/2,py-r.y-r.h/2)<70;}))point=[px,py];
          }
          if(!point)continue;const key='craft:'+f.id+':'+li+':'+j;if(seen.has(key))continue;seen.add(key);
          const picks=regionMaterials(f.style||f.road||'',point[0]/TS),id=picks[(Math.abs(f.id)+li+j)%picks.length];
          nodes.push({id:key,material:id,x:point[0],y:point[1]});
        }
      }
    }
    // Only this one-time potion supply appears in the opening western region.
    const trail=features.find(f=>f.kind==='route'&&f.id===9185),legs=trail&&readRouteLegs(trail);
    if(legs?.length){
      for(const [i,material,amount,t]of [[0,'herb',2,.55],[1,'root',1,.72]]){
        const [a,b]=legs[i===0?0:legs.length-1],x=(a[0]+(b[0]-a[0])*t)*TS+8,y=(a[1]+(b[1]-a[1])*t)*TS+16;
        const length=Math.hypot(b[0]-a[0],b[1]-a[1])||1,dx=-(b[1]-a[1])/length,dy=(b[0]-a[0])/length;
        const offsets=[16,-16,8,-8,0];
        for(const off of offsets){const px=Math.round(x+dx*off),py=Math.round(y+dy*off);if(canStand(px,py)){nodes.push({id:'craft:intro:'+material,material,amount,once:true,x:px,y:py});break;}}
      }
    }
  }
  const ready=n=>state.harvested[n.id]!==-1&&(!state.harvested[n.id]||Date.now()>=state.harvested[n.id]);
  function gather(){
    if(MAPID!=='world'||!hasBag()||mounted||sceneHold()||inFight())return false;
    const n=nodes.filter(n=>ready(n)&&Math.hypot(n.x-P.x,n.y-P.y)<34).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];
    if(!n)return false;const amount=n.amount||2;
    if(count(n.material)+amount>9999){toast('Make room for '+amount+' '+materials[n.material].name+' before gathering.');return false;}
    add(n.material,amount);state.harvested[n.id]=n.once?-1:Date.now()+20*60*1000;
    for(const [id,t]of Object.entries(state.harvested))if(t!==-1&&t<Date.now())delete state.harvested[id];
    window.EmberSfx?.pickup?.();toast('+'+amount+' '+materials[n.material].name+' · Bag → Craft');saveGame();return true;
  }
  function addDraw(draw){
    if(MAPID!=='world')return;
    const w=VW/cam.z,h=VH/cam.z;
    for(const n of nodes)if(ready(n)&&n.x>=cam.x-32&&n.x<=cam.x+w+32&&n.y>=cam.y-32&&n.y<=cam.y+h+32)draw.push({craftNode:n,x:n.x,y:n.y});
  }
  function draw(o,t){
    if(!o.craftNode)return false;const n=o.craftNode,i=Object.keys(materials).indexOf(n.material);
    ctx.save();ctx.fillStyle='#16211944';ctx.beginPath();ctx.ellipse(n.x,n.y,7,2.5,0,0,Math.PI*2);ctx.fill();
    if(artReady){const w=art.width/5,h=art.height/2;ctx.drawImage(art,i%5*w,Math.floor(i/5)*h,w,h,n.x-9,n.y-17,18,18);}
    else{ctx.fillStyle=materials[n.material].color;ctx.fillRect(n.x-3,n.y-8,6,6);}
    if(Math.hypot(P.x-n.x,P.y-n.y)<50&&!scene&&!ask&&!inFight()){
      ctx.fillStyle='#fff4b5';ctx.font='bold 8px sans-serif';ctx.textAlign='center';ctx.fillText('A · Gather',n.x,n.y-22);
    }else{ctx.fillStyle='#fff4b5';ctx.globalAlpha=.45+.3*Math.sin(t*2+n.x);ctx.fillRect(n.x+4,n.y-16,2,2);}
    ctx.restore();return true;
  }
  function skip(){state.kit=true;for(const k of Object.keys(teachers))if(!state.learned.includes(k))state.learned.push(k);state.starter=true;for(const id of Object.keys(materials))state.ingredients[id]=Math.max(count(id),20);for(const r of recipes.filter(r=>r.raw))state.cooked[r.id]=Math.max(count(r.id),3);}
  BAG.push({key:'craftingKit',kind:'key',name:'Crafting Kit',tell:"Nan's well-worn tools for brewing, cooking and making useful things. Choose Craft in a safe place. Yours to keep.",has:()=>state.kit,icon:()=> 'inventory_craftingKit'});
  for(const r of recipes.filter(r=>r.raw)){
    USABLE[r.id]=1;
    HEALS[r.id]=HEALS[r.raw]+.5;
    BAG.push({key:r.id,name:()=>r.name+(count(r.id)>1?' ×'+count(r.id):''),tell:r.effect,has:()=>count(r.id)>0,icon:()=> 'inventory_'+r.id});
  }
  function coopSelect(id){
    if(coopOwner===id)return;
    if(coopOwner)coopStates.set(coopOwner,state);
    if(!coopStates.has(id))coopStates.set(id,{...fresh(),kit:state.kit,learned:[...state.learned],starter:state.starter});
    coopOwner=id;state=coopStates.get(id);
  }
  function coopRestore(id,saved){
    const owner=coopOwner,previous=state;restore(saved);coopStates.set(id,state);
    if(owner!==id)state=previous;
    coopOwner=owner;
  }
  return {coopSelect,coopRestore,materials,recipes,teachers,recipe,count,known,maxBatch,learn,topics,open,close,cancel,start,press,release,tick,capture,restore,useFood,buy,availableStock,defeated,chest,prepareWorld,gather,addDraw,draw,skip,
    giveKit:()=>{state.kit=true;for(const other of coopStates.values())other.kit=true;learn('nan',true);},hasKit:()=>state.kit,active:()=>opened,current:()=>session,slide,finish,merchant:()=>vendor,help:()=>{const fresh=!state.seenHelp;state.seenHelp=true;return fresh;},inspect:()=>({nodes,ingredients:state.ingredients,learned:state.learned,pending:state.pending})};
})();
