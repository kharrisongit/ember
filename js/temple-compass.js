/* Father’s compass. Route through temple doors, then follow walkable floors
   inside the current map. Closed combat gates never change the destination. */
const templeCompass = { owned: false, awakened: false, meatGiven: false, mapGiven: false, morningSpoken: false, morningMet: false, cache: null };
let compassTrackingStarted=null,compassTrackingReduced=false;
function compassCelebrateTracking(){
  compassTrackingStarted=performance.now();
  compassTrackingReduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}
function compassTrackingMotion(now){
  const still={spin:0,wiggle:0,glow:0};
  if(compassTrackingStarted===null)return still;
  now??=performance.now();
  const elapsed=Math.max(0,now-compassTrackingStarted),duration=compassTrackingReduced?1400:2800;
  if(elapsed>=duration){compassTrackingStarted=null;return still;}
  const fade=1-elapsed/duration,glow=fade*(.6+.4*Math.sin(Math.PI*elapsed/650)**2);
  if(compassTrackingReduced)return {...still,glow:glow*.6};
  // Two turns ease to the live bearing, then a damped wiggle settles it.
  const turn=Math.min(1,elapsed/1600),settle=Math.max(0,(elapsed-1600)/1200);
  const wiggle=Math.sin(settle*Math.PI*6)*(1-settle)**2;
  return {spin:turn<1?Math.PI*4*(1-(1-turn)**3):wiggle*.38,wiggle:wiggle*.08,glow};
}
const FATHER_COMPASS_GIFT = [
  "Nan Ferrow: Corin... is that a dragon? Where did he come from?",
  "Corin: I found an egg in the woods. It hatched by Maddock's house.",
  "Nan Ferrow: You're not hurt?",
  "Corin: No. Maddock says he chose me. He hasn't left my side since.",
  "Nan Ferrow: You were only out for the morning. I wasn't expecting this.",
  "Corin: Neither was I. Maddock thinks the old rider temple might have some answers.",
  "Nan Ferrow: Beyond Millwood, then. You have your father’s compass with you?",
  "Corin: Yes. I picked it up from my desk this morning.",
  "Nan Ferrow: He carried it everywhere. I kept it for you after we lost him and your mother, when you were born.",
  "Corin: I wish I could remember them.",
  "Nan Ferrow: I know. There is so much I want to tell you about them. Promise me you'll come home to hear it.",
  "Corin: I promise, Nan.",
  "Nan Ferrow: Follow the eastern road to Thornwell. Keep the map and compass handy if you lose your way.",
  "Corin: I will. Thank you.",
  "Nan Ferrow: Oh, and take this for your new friend, in case he gets hungry.",
  "Corin: Thank you, Nan. I think he will appreciate that.",
  "Nan Ferrow: Good. Both of you. Take care of each other, love. Stop by sometime and I’ll whip you up something special."
];
function fatherCompassGift(nan){
  if(npcSeesDragon(nan))return FATHER_COMPASS_GIFT.slice();
  return ["Nan Ferrow: There you are, love. What has kept you?",
    "Corin: I found a dragon's egg in the woods. It hatched by Maddock's house.",
    ...FATHER_COMPASS_GIFT.slice(2)];
}
function restoreFatherCompass(saved) {
  templeCompass.owned = !!saved?.owned;
  templeCompass.awakened = templeCompass.owned;
  // Earlier saves received the meat together with the compass.
  templeCompass.meatGiven = saved?.meatGiven === undefined ? templeCompass.owned : !!saved.meatGiven;
  // Preserve independently collected desk items, including saves from the older opening.
  templeCompass.mapGiven = saved?.mapGiven === undefined ? templeCompass.owned : !!saved.mapGiven;
  templeCompass.morningSpoken = !!saved?.morningSpoken;
  templeCompass.morningMet = saved?.morningMet === undefined ? quest > Q.ABED : !!saved.morningMet;
  templeCompass.cache = null;
  compassTrackingStarted = null;
  refreshMapControls();
}
function giveFatherCompass() {
  if(templeCompass.owned)return;
  templeCompass.owned = true;
  templeCompass.awakened = true;
  // Also repair older saves that reached this gift without the morning Map.
  templeCompass.mapGiven = true;bagOwned=true;
  refreshMapControls();
  saveGame();
  showReveal('inventory_travelGear', 'Corin received his Travel Gear.');
}
function worldMapUnlocked(){return templeCompass.mapGiven;}
function refreshMapControls(started=typeof gameplayStarted!=='undefined'&&gameplayStarted){
  if(typeof document==='undefined')return;
  const available=!!started&&worldMapUnlocked();
  for(const id of ['btnMapQuick','bagMap']){
    const button=document.getElementById(id);if(!button)continue;
    button.setAttribute('aria-disabled',String(!available));
    button.disabled=!available;button.style.opacity=available?'':'0.38';
    if(id==='btnMapQuick')button.textContent=available?'MAP':'';
  }
}
function nanGiftPending(){return !templeCompass.meatGiven;}
function nanMorningPending(){return !templeCompass.morningMet;}
function morningSuppliesPending(){return !bagOwned || !templeCompass.mapGiven || !templeCompass.owned;}
function startMorning(){
  if(quest!==Q.ABED||templeCompass.morningSpoken)return;
  templeCompass.morningSpoken=true;
  playScene(['Corin: Good morning, Millwood! My Travel Gear is on the desk. I should take it before I head out.'],{after:showMorningMoveHelp});
}
function startNanMorning(nan){
  if(hasDragon()||!nanMorningPending())return false;
  nan.goto=null;nan.houseWalk=null;
  const home=[nan.x,nan.y];
  const spots=[[P.x-26,P.y+8],[P.x+26,P.y+8],[P.x,P.y+30]].filter(p=>canStand(...p));
  const target=spots.sort((a,b)=>Math.hypot(a[0]-nan.x,a[1]-nan.y)-Math.hypot(b[0]-nan.x,b[1]-nan.y))[0];
  if(target&&Math.hypot(nan.x-P.x,nan.y-P.y)>34){nan.home=home;nan.stationary=false;nan.scriptWalking=true;nan.packWalk=true;nan.packDirections=true;nan.goto=target;}
  playScene([
    'Nan Ferrow: Morning, love. Hettie was looking for you. She asked if you would go and see her by the cows.',
    'Corin: I have my things. I will go and find her.',
    'Nan Ferrow: Thank you, darling. Come home when you are hungry.'
  ],{who:nan.n,npcActor:nan,nanMorning:true,after:()=>{
    templeCompass.morningMet=true;nan.scriptWalking=false;nan.goto=home;saveGame();
  }});
  return true;
}
function stepNanMorning(){
  if(MAPID!=='house26'||!gameplayStarted||mode!=='play'||!nanMorningPending()||hasDragon()||sceneHold()||sayNpc||ask||ovl||bagOpen||fadeDir||fade||doorMotion)return;
  const nan=npcs.find(n=>n.n==='Nan Ferrow');if(nan)startNanMorning(nan);
}
function morningDeskItems(){
  const desk=W.maps.house26_bedroom?.roomActors?.find(a=>a.morningDesk||a.n==='itable1');
  const x=desk?.x??65,y=(desk?.y??161)-10,sy=(desk?.sy??desk?.y??161)+1;
  return [
    {key:'travelGear',spr:'inventory_travelGear',x,y,width:24,took:'Corin picked up his Travel Gear.',owned:()=>!morningSuppliesPending()}
  ].map(it=>({...it,sy,map:'house26_bedroom',at:Q.ABED,gone:99,tx:(it.x-8)/TS,ty:(it.y-16)/TS,deskPickup:true,pickupBounds:{left:x-24,right:x+24,top:y-12,bottom:y+18}}));
}
function drawMorningSupplyGlint(o,t){
  if(!o.item.deskPickup)return;
  const pulse=Math.max(0,Math.sin(t*2.2+o.x*.15))**6;
  if(pulse<.05)return;
  ctx.save();ctx.globalAlpha=pulse*.8;ctx.fillStyle='#fff1b0';
  const x=Math.round(o.x+o.item.width*.25),y=Math.round(o.y-o.item.width*.7);
  ctx.fillRect(x-2,y,5,1);ctx.fillRect(x,y-2,1,5);ctx.restore();
}
function morningKitArt(){return 'inventory_travelGear';}
function showMorningHelp(titleText,rows){
  showReveal(morningKitArt(),titleText,1,true,()=>{revEl.classList.remove('kit-help');revArt.style.setProperty('display','');});
  revEl.classList.add('kit-help');revArt.style.setProperty('display','none','important');revCap.replaceChildren();
  const intro=document.createElement('small');intro.className='lesson-kicker';intro.textContent=titleText==='Move & Interact'?'YOUR FIRST STEPS':'READY FOR THE ROAD';revCap.appendChild(intro);
  if(titleText==='Your Travel Gear'){
    const art=document.createElement('img');art.className='lesson-art';art.alt='';art.src='assets/inventory/travel-gear.webp';revCap.appendChild(art);
  }
  const title=document.createElement('strong');title.textContent=titleText;revCap.appendChild(title);
  for(const [label,text] of rows){const row=document.createElement('p');row.className='lesson-row';row.dataset.control=label;row.textContent=label+' — '+text;revCap.appendChild(row);}
  const end=document.createElement('button');end.type='button';end.className='lesson-continue';end.textContent=titleText==='Move & Interact'?'Let’s go  ·  A':'Ready to explore  ·  A';end.addEventListener('click',event=>{event.stopPropagation();hideReveal();});revCap.appendChild(end);
}
function showMorningMoveHelp(){
  showMorningHelp('Move & Interact',[
    ['Move','Use the directional pad to walk.'],
    ['A','Talk, pick up items, and continue dialogue.'],
    ['B','Hold to run; use it to go back in menus.'],
    ['Try it','Walk to the desk and press A to pick up your Travel Gear.']
  ]);
}
function showMorningKitHelp(){
  showMorningHelp('Your Travel Gear',[
    ['Bag','Open Bag for items, equipment, and Full inventory.'],
    ['Map','Open Map to see discovered places and choose a quest.'],
    ['Compass','The needle follows the path to your next story objective automatically. Choose another quest on the Map to change it.']
  ]);
}
function takeMorningSupply(it){
  if(!it.deskPickup||!morningSuppliesPending())return;
  bagOwned=true;templeCompass.mapGiven=true;
  templeCompass.owned=true;templeCompass.awakened=true;
  refreshMapControls();refreshHandle();saveGame();
  showReveal(morningKitArt(),"Corin picked up his Travel Gear.",1,true,showMorningKitHelp);
}
function nanMorningDoorBlocked(d){return MAPID==='house26_bedroom'&&d?.to==='house26'&&morningSuppliesPending();}
function nanMorningSolid(x,y){
  if(MAPID!=='house26_bedroom'||!morningSuppliesPending())return false;
  return (MD.doors||[]).some(d=>{if(d.to!=='house26')return false;const r=doorRect(d);return x>=r.x-6&&x<=r.x+r.w+6&&y>=r.y-2&&y<=r.y+r.h+8;});
}
function nanGiftBeat(index){
  // An older save may already be outside before the desk pickups existed.
  if(index===6&&!templeCompass.owned){giveFatherCompass();return true;}
  if(index===14&&!templeCompass.meatGiven){
    templeCompass.meatGiven=true;hareMeat+=3;saveGame();
    showReveal('inventory_hareMeat', 'Corin received 3 Hare Meat.');return true;
  }
  return false;
}
function compassTempleMap(map) {
  return !!(map?.templeExpanded && map.templePlan && !map.mountainPassage);
}

function compassTempleRoute(maps, start, chests) {
  if (!compassTempleMap(maps[start])) return null;
  const targets = new Map(chests.map(chest => [chest.map, chest]));
  const seen = new Set([start]), queue = [{ map: start, door: null }];
  for (let i = 0; i < queue.length; i++) {
    const step = queue[i];
    if (targets.has(step.map)) return { chest: targets.get(step.map), door: step.door };
    for (const door of maps[step.map].doors || []) {
      if (seen.has(door.to) || !compassTempleMap(maps[door.to])) continue;
      seen.add(door.to);
      queue.push({ map: door.to, door: step.door || door });
    }
  }
  return null;
}

function compassTempleTarget(map, route) {
  const ts = map.ts || 16;
  if (!route.door) return {
    x: route.chest.x * ts + ts / 2, y: route.chest.y * ts + ts + 24, heartstone: true
  };
  const d = route.door, r = d.triggerRect || { x: d.x * ts, y: d.y * ts, w: ts, h: ts };
  // Aim into the threshold, so the arrow keeps pointing through a door when
  // Corin reaches its approach tile. The normal door interaction still applies.
  return {
    x: d.dir === 'l' ? r.x + r.w : d.dir === 'r' ? r.x : r.x + r.w / 2,
    y: d.dir === 'u' ? r.y + r.h : d.dir === 'd' ? r.y + 8 : r.y + r.h / 2 + 4,
    heartstone: false
  };
}

function compassTempleField(map, target) {
  const step = 8, cols = Math.floor(map.w * (map.ts || 16) / step) + 1;
  const rows = Math.floor(map.h * (map.ts || 16) / step) + 1, count = cols * rows;
  const clear = (x, y) => [[x - 5.5, y - 7], [x + 5.5, y - 7], [x - 5.5, y - 1], [x + 5.5, y - 1]]
    .every(([px, py]) => map.templeFloors.some(([l, t, r, b]) => px >= l && px < r && py >= t && py < b)
      && !(map.roomBlocks || []).some(([l, t, r, b]) => px >= l && px < r && py >= t && py < b));
  const walkable = new Uint8Array(count), distance = new Int32Array(count).fill(-1), nextStep = new Int32Array(count).fill(-1);
  let root = -1, nearest = Infinity;
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const i = row * cols + col, x = col * step, y = row * step;
    if (!clear(x, y)) continue;
    walkable[i] = 1;
    const d = (x - target.x) ** 2 + (y - target.y) ** 2;
    if (d < nearest) { nearest = d; root = i; }
  }
  if (root < 0) return null;
  const neighbors = i => {
    const col = i % cols, row = Math.floor(i / cols), out = [];
    if (row > 0) out.push(i - cols);
    if (col + 1 < cols) out.push(i + 1);
    if (row + 1 < rows) out.push(i + cols);
    if (col > 0) out.push(i - 1);
    return out;
  };
  const point = i => ({ x: i % cols * step, y: Math.floor(i / cols) * step });
  const interval = (rect, a, b) => {
    let low = 0, high = 1;
    for (const [start, delta, min, max] of [[a.x,b.x-a.x,rect[0],rect[2]],[a.y,b.y-a.y,rect[1],rect[3]]]) {
      if (Math.abs(delta) < 1e-9) { if (start < min || start >= max) return null; continue; }
      const t1 = (min - start) / delta, t2 = (max - start) / delta;
      low = Math.max(low, Math.min(t1,t2)); high = Math.min(high, Math.max(t1,t2));
      if (high < low) return null;
    }
    return [low,high];
  };
  const visible = (a, b) => {
    const left=Math.min(a.x,b.x)-5.5, right=Math.max(a.x,b.x)+5.5;
    const top=Math.min(a.y,b.y)-7, bottom=Math.max(a.y,b.y)-1;
    if (map.templeFloors.some(([l,t,r,b])=>left>=l&&right<r&&top>=t&&bottom<b)
      && !(map.roomBlocks||[]).some(([l,t,r,b])=>right>=l&&left<r&&bottom>=t&&top<b)) return true;
    if (!clear(a.x,a.y) || !clear(b.x,b.y)) return false;
    // Sweep all four feet corners exactly. Sampling a diagonal can miss a
    // fraction of a pixel at an inside corner and aim the player into masonry.
    for (const [dx,dy] of [[-5.5,-7],[5.5,-7],[-5.5,-1],[5.5,-1]]) {
      const from = {x:a.x+dx,y:a.y+dy}, to = {x:b.x+dx,y:b.y+dy};
      if ((map.roomBlocks || []).some(rect => { const hit=interval(rect,from,to); return hit && hit[1]-hit[0]>1e-9; })) return false;
      const spans = map.templeFloors.map(rect=>interval(rect,from,to)).filter(Boolean).sort((a,b)=>a[0]-b[0]);
      let covered = 0;
      for (const [low,high] of spans) { if (low>covered+1e-9) return false; covered=Math.max(covered,high); }
      if (covered<1-1e-9) return false;
    }
    return true;
  };
  const queue = new Int32Array(count); queue[0] = root; distance[root] = 0;
  let tail = 1;
  for (let head = 0; head < tail; head++) {
    const i = queue[head];
    for (const next of neighbors(i)) {
      if (!walkable[next] || distance[next] >= 0 || !visible(point(i), point(next))) continue;
      distance[next] = distance[i] + 1; nextStep[next] = i; queue[tail++] = next;
    }
  }
  return { step, cols, rows, root, distance, nextStep, point, visible, clear, target };
}

function compassTempleGuide(field, player) {
  if (!field) return null;
  const { step, cols, rows, distance, point, visible, target } = field;
  const col = Math.round(player.x / step), row = Math.round(player.y / step);
  let current = -1, nearest = Infinity;
  for (let y = Math.max(0, row - 2); y <= Math.min(rows - 1, row + 2); y++) {
    for (let x = Math.max(0, col - 2); x <= Math.min(cols - 1, col + 2); x++) {
      const i = y * cols + x;
      if (distance[i] < 0) continue;
      const p = point(i), d = Math.hypot(p.x - player.x, p.y - player.y);
      if (d < nearest && visible(player, p)) { nearest = d; current = i; }
    }
  }
  if (current < 0) return null;
  const root = point(field.root);
  if (target.heartstone && Math.hypot(player.x - target.x, player.y - target.y) <= 16 && visible(player, root))
    return { ...target, arrived: true };
  if (distance[current] <= 1 && Math.hypot(player.x - root.x, player.y - root.y) < 12)
    return { ...target, arrived: false };
  let aim = point(current);
  // Look ahead along the route only as far as Corin has a clear walking line.
  // This rounds open-room diagonals without pointing through a corridor corner.
  for (let n = 0; n < 12 && distance[current] > 0; n++) {
    const next = field.nextStep[current];
    if (next < 0 || !visible(player, point(next))) break;
    current = next; aim = point(current);
  }
  return { ...aim, arrived: false };
}

function compassQuestRoute(maps,start,target){
 if(!target||!maps[start])return null;
 if(start===target.map)return {...target,heartstone:true};
 const queue=[{map:start,door:null}],seen=new Set([start]);
 for(let i=0;i<queue.length;i++){
  const step=queue[i];
  for(const d of maps[step.map].doors||[]){
   // Crossing the mountain must follow its halls, not shortcut back through the overworld.
   if(maps[start].mountainPassage&&maps[target.map]?.mountainPassage&&d.to==='world')continue;
   if(seen.has(d.to)||!maps[d.to]||maps[d.to].templeLegacy)continue;
   const door=step.door||d;
   if(d.to===target.map)return compassTempleTarget(maps[start],{door});
   seen.add(d.to);queue.push({map:d.to,door});
  }
 }
 return null;
}
function compassSelectedTarget(){
 const options=atlasQuestOptions();
 const selected=options.find(q=>q.id===atlasTrackedQuest&&!atlasQuestTrackLock(q))||options[0];
 if(selected&&selected.id!==atlasTrackedQuest)atlasTrackedQuest=selected.id;
 return atlasQuestTarget(selected);
}
// Incremental A* follows actual walkable ground, including authored bends and
// editor collision. Work is time-sliced so a distant destination cannot stall
// gameplay. The completed route is reused as Corin walks along it.
function compassWalkClear(x,y){
  const old=arenaPass;arenaPass=true;
  try{return [[-5.5,-7],[5.5,-7],[-5.5,-1],[5.5,-1]].every(([dx,dy])=>!isSolid(x+dx,y+dy,true,true));}
  finally{arenaPass=old;}
}
function compassWalkVisible(a,b){
  const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));
  for(let i=1;i<=count;i++)if(!compassWalkClear(a.x+(b.x-a.x)*i/count,a.y+(b.y-a.y)*i/count))return false;
  return true;
}
function compassWalkSearch(player,target){
  const step=MAPID==='world'?16:8,cols=Math.ceil(PXW/step),rows=Math.ceil(PXH/step);
  const point=k=>({x:k%cols*step+step/2,y:Math.floor(k/cols)*step+step});
  const key=p=>Math.max(0,Math.min(rows-1,Math.round((p.y-step)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((p.x-step/2)/step)));
  const samples=new Map(),stride=PXW+1;
  const sample=p=>{const k=p.y*stride+p.x;if(!samples.has(k))samples.set(k,compassWalkClear(p.x,p.y));return samples.get(k);};
  const visible=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));
    for(let i=1;i<=n;i++)if(!sample({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;};
  const clear=k=>sample(point(k));
  const near=(p,visible=false)=>{
    const base=key(p),cx=base%cols,cy=Math.floor(base/cols),candidates=[];
    for(let y=Math.max(0,cy-4);y<=Math.min(rows-1,cy+4);y++)for(let x=Math.max(0,cx-4);x<=Math.min(cols-1,cx+4);x++){
      const k=y*cols+x,q=point(k);candidates.push({k,q,d:Math.hypot(q.x-p.x,q.y-p.y)});
    }
    candidates.sort((a,b)=>a.d-b.d);
    return candidates.find(v=>clear(v.k)&&(!visible||compassWalkVisible(p,v.q)))?.k;
  };
  const start=near(player,true),goal=near(target);
  if(start===undefined||goal===undefined)return {failed:true,path:[],start:{...player}};
  const gx=goal%cols,gy=Math.floor(goal/cols),heap=[];
  const heuristic=k=>(Math.abs(k%cols-gx)+Math.abs(Math.floor(k/cols)-gy))*1.15;
  function push(k,cost){
    const item={k,cost,score:cost+heuristic(k)},n=heap.push(item)-1;let i=n;
    while(i){const parent=(i-1)>>1;if(heap[parent].score<=item.score)break;heap[i]=heap[parent];i=parent;}heap[i]=item;
  }
  function pop(){
    const top=heap[0],last=heap.pop();if(heap.length){let i=0;
      while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].score<heap[child].score)child++;
        if(last.score<=heap[child].score)break;heap[i]=heap[child];i=child;}heap[i]=last;
    }return top;
  }
  const nav={start:{...player},target,point,cols,rows,clear,visible,heap,push,pop,goal,
    costs:new Map([[start,0]]),previous:new Map([[start,-1]]),closed:new Set(),path:null,cursor:0,failed:false};
  push(start,0);return nav;
}
function compassWalkAdvance(nav){
  if(!nav||nav.path||nav.failed)return;
  const until=performance.now()+2;
  for(let count=0;count<220&&performance.now()<until;count++){
    const item=nav.pop();if(!item){nav.failed=true;return;}
    const {k,cost}=item;if(nav.closed.has(k)||cost!==nav.costs.get(k))continue;
    if(k===nav.goal){
      const path=[];for(let at=k;at!==-1;at=nav.previous.get(at))path.push(nav.point(at));path.reverse();
      if(compassWalkVisible(path.at(-1),nav.target))path.push(nav.target);
      nav.path=path;return;
    }
    nav.closed.add(k);
    if(nav.closed.size>180000){nav.failed=true;return;}
    const x=k%nav.cols,y=Math.floor(k/nav.cols);
    for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1]]){
      const nx=x+dx,ny=y+dy,next=ny*nav.cols+nx;
      if(nx<0||ny<0||nx>=nav.cols||ny>=nav.rows||nav.closed.has(next)||cost+1>=(nav.costs.get(next)??Infinity)||!nav.clear(next))continue;
      if(!nav.visible(nav.point(k),nav.point(next)))continue;
      nav.costs.set(next,cost+1);nav.previous.set(next,k);nav.push(next,cost+1);
    }
  }
}
function compassWalkGuide(cache,player){
  const target=cache.target;if(!target)return null;
  if(Math.hypot(target.x-player.x,target.y-player.y)<144&&compassWalkVisible(player,target))
    return {...target,arrived:target.heartstone&&Math.hypot(target.x-player.x,target.y-player.y)<24};
  let nav=cache.navigation;
  if(!nav||nav.failed&&tAcc>cache.retry||!nav.path&&Math.hypot(player.x-nav.start.x,player.y-nav.start.y)>2048){
    nav=cache.navigation=compassWalkSearch(player,target);cache.retry=tAcc+2;
  }
  compassWalkAdvance(nav);
  if(!nav.path)return null;
  let nearest=-1,distance=Infinity;
  const end=nav.located?Math.min(nav.path.length,nav.cursor+32):nav.path.length;
  for(let i=Math.max(0,nav.cursor-8);i<end;i++){
    const p=nav.path[i],d=Math.hypot(p.x-player.x,p.y-player.y);
    if(d<=96&&d<distance&&compassWalkVisible(player,p)){nearest=i;distance=d;}
  }
  if(nearest<0||distance>96){cache.navigation=null;return null;}
  nav.cursor=nearest;nav.located=true;let aim=nav.path[nearest];
  for(let i=nearest+1;i<Math.min(nav.path.length,nearest+9);i++){
    if(!compassWalkVisible(player,nav.path[i]))break;aim=nav.path[i];
  }
  return {...aim,arrived:false};
}

function drawTempleCompass() {
  if (!templeCompass.owned || !gameplayStarted || mode !== 'play') return;
  let cache=templeCompass.cache;
  if(!cache||cache.map!==MD||cache.edit!==editStamp||cache.quest!==atlasTrackedQuest||tAcc>=cache.refresh){
    const destination=compassSelectedTarget(),target=compassQuestRoute(W.maps,MAPID,destination);
    const key=JSON.stringify(target);
    const field=cache?.map===MD&&cache.edit===editStamp&&cache.key===key?cache.field:
      target&&MD.templeExpanded?compassTempleField(MD,target):null;
    const navigation=cache?.map===MD&&cache.edit===editStamp&&cache.key===key?cache.navigation:null;
    cache=templeCompass.cache={map:MD,edit:editStamp,quest:atlasTrackedQuest,key,target,field,navigation,retry:cache?.retry||0,refresh:tAcc+.5};
  }
  if (!cache.field || cache.px !== P.x || cache.py !== P.y) {
    cache.guide=cache.field?compassTempleGuide(cache.field,P):compassWalkGuide(cache,P);
    cache.px=P.x;cache.py=P.y;
  }
  const guide=cache.guide||(cache.target?{...cache.target,arrived:false}:{x:P.x,y:P.y-1,inactive:true});
  const attention=compassTrackingMotion();
  const x = VW - 30, y = 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(attention.wiggle);
  if(attention.glow){
    ctx.shadowColor='#ffe6a0';ctx.shadowBlur=12*attention.glow;
    ctx.strokeStyle='rgba(255,226,153,'+attention.glow+')';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.stroke();
  }
  ctx.fillStyle = 'rgba(24,20,25,.88)'; ctx.strokeStyle = guide.arrived ? '#91c6ae' : '#a28a60'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur=0;
  ctx.fillStyle = '#796b57';
  for (const [tx, ty, w, h] of [[-1,-18,2,3],[-1,15,2,3],[-18,-1,3,2],[15,-1,3,2]]) ctx.fillRect(tx,ty,w,h);
  ctx.beginPath();
  if (guide.arrived) {
    ctx.rotate(attention.spin);
    ctx.fillStyle = '#9cdac2'; ctx.moveTo(0,-10); ctx.lineTo(7,0); ctx.lineTo(0,10); ctx.lineTo(-7,0);
  } else {
    ctx.rotate(Math.atan2(guide.y - P.y, guide.x - P.x)+attention.spin);
    ctx.fillStyle = guide.inactive?'#796b57':'#f2d28c'; ctx.moveTo(14,0); ctx.lineTo(-8,-7); ctx.lineTo(-4,0); ctx.lineTo(-8,7);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Meet Corin just south of Millwood's houses after the hatch.
function millwoodDepartureArea(){
  const list=typeof features!=='undefined'?features:MD?.features||[];
  return list.find(f=>f.kind==='area'&&(f.label==='Millwood'||f.place==='Millwood'))||null;
}
// Nan intercepts the return through Millwood before the journey east.
function prepareNanDeparture(){
  if(MAPID!=='world'||!hasDragon()||!nanGiftPending()||npcs.some(n=>n.fatherCompassVisitor))return;
  const home=W.maps.house26?.npcs.find(n=>n.n==='Nan Ferrow');
  const door=MD.doors.find(d=>d.to==='house26');
  if(!home||!door)return;
  const r=door.triggerRect||{x:door.x*TS,y:door.y*TS,w:16,h:16};
  const visitor={...home,x:r.x+r.w/2+26,y:r.y+r.h+9,f:'d',kf:'d',stationary:false,packWalk:true,packDirections:true,houseWalk:null,scriptWalking:true,patrol:null,goto:null,
    fatherCompassVisitor:true,away:true,editKey:'story:nan-departure',editorDeleted:false,noTalk:false};
  npcs.push(visitor);
}
function stepNanDeparture(){
  if(!gameplayStarted||mode!=='play'||MAPID!=='world'||!hasDragon()||!nanGiftPending()||
     sceneHold()||sayNpc||fadeDir||fade||doorMotion||ovl||ask||bagOpen||editing||dying()||revealing)return;
  const town=millwoodDepartureArea();
  const inTown=town&&P.x>=town.x0*TS&&P.x<=town.x1*TS&&P.y>=town.y0*TS&&P.y<=town.y1*TS;
  if(!inTown)return;
  const houses=(MD.doors||[]).filter(d=>/^house\d+$/.test(d.to)&&
    d.x>=town.x0&&d.x<=town.x1&&d.y>=town.y0&&d.y<=town.y1);
  // The first house on each side of the north path forms the town entrance.
  // Houses farther into Millwood (including Nan's home) do not move this line.
  const pathX=(town.road?.x??(town.x0+town.x1)/2)*TS;
  const center=d=>d.triggerRect?d.triggerRect.x+d.triggerRect.w/2:(d.x+.5)*TS;
  const bottom=d=>d.triggerRect?d.triggerRect.y+d.triggerRect.h:(d.y+1)*TS;
  const entranceHouses=[houses.filter(d=>center(d)<pathX),houses.filter(d=>center(d)>=pathX)]
    .map(side=>side.sort((a,b)=>bottom(a)-bottom(b)||Math.abs(center(a)-pathX)-Math.abs(center(b)-pathX))[0]).filter(Boolean);
  const houseBottom=Math.max(town.y0*TS,...entranceHouses.map(bottom));
  if(P.y<houseBottom+TS)return; // One tile past the two flanking doorsteps.
  prepareNanDeparture();
  const nan=npcs.find(n=>n.fatherCompassVisitor);
  if(!nan)return;
  startNanFarewell(nan);
}
function placeDragonBehindCorin(target){
  if(!dragonHere()||!dragon.on)return;
  const back=Math.atan2(P.y-target[1],P.x-target[0]);
  for(const distance of [56,72,88,40])for(const offset of [0,Math.PI/8,-Math.PI/8,Math.PI/4,-Math.PI/4]){
    const x=P.x+Math.cos(back+offset)*distance,y=P.y+Math.sin(back+offset)*distance;
    if(!dragonCanStand(x,y))continue;
    dragon.x=x;dragon.y=y;dragon.dir=direction4(target[0]-x,target[1]-y,'s');return;
  }
}
function startNanFarewell(nan){
  clearPadInputs();running=false;P.act=null;P.moving=false;
  if(mounted){setMounted(false,true);[P.x,P.y]=standableNear(P.x,P.y);}
  dragon.air=false;dragon.tr=null;dragon.moving=false;dragon.placed=MAPID;
  refreshWingBtn();
  nan.stationary=false;nan.scriptWalking=true;nan.packWalk=true;nan.packDirections=true;
  const target=[P.x,P.y+36];
  placeDragonBehindCorin(target);
  // Start fully below both the current and following camera views, then
  // walk north to Corin without moving him or cutting away.
  const sprite=SPR[nan.packSpr+'_walk_u']||SPR[nan.packSpr+'_idle_d'];
  const height=sprite?.[3]||64;
  nan.x=P.x;nan.y=Math.max(cam.y+VH/cam.z,P.y+VH/cam.z/2)+height+1;
  nan.home=[nan.x,nan.y];
  nan.goto=target;nan.straightSceneWalk=true;nan.away=false;
  faceToward(nan,...target);faceCorinAt(nan.x,nan.y);
  playScene(fatherCompassGift(nan),
    {who:'Nan Ferrow',npcActor:nan,nanGifts:true,i:0,after:()=>{
      clearPadInputs();running=false;P.act=null;P.moving=false;
      nan.straightSceneWalk=false;nan.goto=null;nan.nanDeparting=true;
      nan.scriptWalking=true;nan.noTalk=true;
      faceToward(nan,nan.x,nan.y+32);
      // The farewell still owns input while Nan walks away.
      // Only release Corin after the whole sprite has left the screen.
      playScene([],{silent:true,nanGifts:true,npcActor:nan,
        until:()=>!nan.nanDeparting,after:()=>{
          npcs=npcs.filter(n=>n!==nan||!n.fatherCompassVisitor);
          clearPadInputs();P.moving=false;
        }});
    },hold:()=>{
      if(nan.goto)return false;
      nan.scriptWalking=false;
      faceToward(nan,P.x,P.y);faceCorinAt(nan.x,nan.y);return true;
    }});
}
function finishNanDeparture(nan){
  nan.away=true;nan.nanDeparting=false;nan.scriptWalking=false;nan.goto=null;
  // Her indoor actor retains its published position; the outdoor visitor is
  // removed after this beat instead of walking visibly back through scenery.
  const home=W.maps.house26?.npcs.find(n=>n.n==='Nan Ferrow');
  if(home){home.away=false;home.noTalk=false;}
}
