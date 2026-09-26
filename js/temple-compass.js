/* Father’s compass. Route through temple doors, then follow walkable floors
   inside the current map. Closed combat gates never change the destination. */
const templeCompass = { owned: false, awakened: false, cache: null };
const FATHER_COMPASS_GIFT = [
  "Nan Ferrow: Come here a moment, love. There is something I have kept for you.",
  "Corin: A compass?",
  "Nan Ferrow: Your father's. He used to turn it over in his hand whenever he was thinking.",
  "Corin: You never told me that.",
  "Nan Ferrow: There are so many little things I still want to tell you. Your mother would sing while she worked. Your father always joined in, badly.",
  "Nan Ferrow: We lost them both when you were born. I brought you home, and I have looked after you ever since.",
  "Corin: I wish I could remember them.",
  "Nan Ferrow: I know, love. We can remember them together. Ask me whenever you like.",
  "Nan Ferrow: Here. Keep this close. It'll guide you when you need it most.",
  "Corin: I will. Thank you, Nan."
];
function restoreFatherCompass(saved) {
  templeCompass.owned = !!saved?.owned;
  templeCompass.awakened = templeCompass.owned && !!saved?.awakened;
  templeCompass.cache = null;
}
function giveFatherCompass() {
  templeCompass.owned = true;
  saveGame();
  showReveal('inventory_compass', "Corin received his father's compass.");
}
function awakenFatherCompass() {
  if (!templeCompass.owned || templeCompass.awakened) return;
  templeCompass.awakened = true;
  templeCompass.cache = null;
  saveGame();
}
function stepFatherCompass() {
  if (!templeCompass.owned || templeCompass.awakened || !gameplayStarted ||
      mode !== 'play' || !compassTempleMap(MD) || sceneHold() || sayNpc ||
      fadeDir !== 0 || fade > 0 || doorMotion || ovl || ask || bagOpen || editing || dying()) return;
  playScene([
    "Your father's compass grows warm in your pocket. A soft light shines through its face, and the needle begins to turn.",
    "Corin: Thanks, Dad."
  ], { compassReveal: true });
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

function drawTempleCompass() {
  if ((!templeCompass.owned || !templeCompass.awakened) || !gameplayStarted || mode !== 'play' || !compassTempleMap(MD)) return;
  const key = MAPID + ':' + editStamp;
  if (templeCompass.cache?.key !== key || templeCompass.cache.map !== MD) {
    const route = compassTempleRoute(W.maps, MAPID, CHESTS);
    templeCompass.cache = { key, map: MD, field: route ? compassTempleField(MD, compassTempleTarget(MD, route)) : null };
  }
  const cache = templeCompass.cache;
  if (cache.px !== P.x || cache.py !== P.y) {
    cache.guide = compassTempleGuide(cache.field, P); cache.px = P.x; cache.py = P.y;
  }
  const guide = cache.guide;
  if (!guide) return;
  const x = VW - 30, y = 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(24,20,25,.88)'; ctx.strokeStyle = guide.arrived ? '#91c6ae' : '#a28a60'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#796b57';
  for (const [tx, ty, w, h] of [[-1,-18,2,3],[-1,15,2,3],[-18,-1,3,2],[15,-1,3,2]]) ctx.fillRect(tx,ty,w,h);
  ctx.beginPath();
  if (guide.arrived) {
    ctx.fillStyle = '#9cdac2'; ctx.moveTo(0,-10); ctx.lineTo(7,0); ctx.lineTo(0,10); ctx.lineTo(-7,0);
  } else {
    ctx.rotate(Math.atan2(guide.y - P.y, guide.x - P.x));
    ctx.fillStyle = '#f2d28c'; ctx.moveTo(14,0); ctx.lineTo(-8,-7); ctx.lineTo(-4,0); ctx.lineTo(-8,7);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Use the authored town boundary, not proximity to Nan's front door.
function millwoodDepartureArea(){
  const list=typeof features!=='undefined'?features:MD?.features||[];
  return list.find(f=>f.kind==='area'&&(f.label==='Millwood'||f.place==='Millwood'))||null;
}
// Nan intercepts the return through Millwood before the journey east.
function prepareNanDeparture(){
  if(MAPID!=='world'||!hasDragon()||templeCompass.owned||npcs.some(n=>n.fatherCompassVisitor))return;
  const home=W.maps.house26?.npcs.find(n=>n.n==='Nan Ferrow');
  const door=MD.doors.find(d=>d.to==='house26');
  if(!home||!door)return;
  const r=door.triggerRect||{x:door.x*TS,y:door.y*TS,w:16,h:16};
  npcs.push({...home,x:r.x+r.w/2+26,y:r.y+r.h+9,f:'d',kf:'d',stationary:false,packWalk:true,packDirections:true,houseWalk:null,scriptWalking:true,patrol:null,goto:null,
    fatherCompassVisitor:true,editKey:'story:nan-departure',editorDeleted:false,noTalk:false});
}
function stepNanDeparture(){
  if(!gameplayStarted||mode!=='play'||MAPID!=='world'||!hasDragon()||templeCompass.owned||
     sceneHold()||sayNpc||fadeDir||fade||doorMotion||ovl||ask||bagOpen||editing||dying()||revealing)return;
  prepareNanDeparture();
  const nan=npcs.find(n=>n.fatherCompassVisitor);
  if(!nan)return;
  const town=millwoodDepartureArea();
  const inDepartureArea=town&&P.x>=(town.x0-6)*TS&&P.x<=(town.x1+10)*TS&&
    P.y>=(town.y0-6)*TS&&P.y<=(town.y1+6)*TS;
  const nearNan=Math.abs(P.x-nan.x)<=104&&Math.abs(P.y-nan.y)<=78;
  if(!inDepartureArea&&!nearNan)return;
  // Stop Corin immediately; finish landing and Nan's approach before dialogue.
  clearPadInputs();running=false;P.act=null;P.moving=false;
  if(mounted)setMounted(false,true);
  if(dragon.air||dragon.tr){
    dragon.tr=null;
    dragonGround(dragon.x,dragon.y)||dragonGround(P.x+40,P.y+24)||dragonGround(nan.x,nan.y+32);
    dragon.air=false;dragon.placed=MAPID;startTransition('down',false);
  }
  nan.stationary=false;nan.scriptWalking=true;nan.packWalk=true;nan.packDirections=true;
  nan.home=[nan.x,nan.y];
  const dx=nan.x-P.x,dy=nan.y-P.y,d=Math.hypot(dx,dy)||1;
  let target=[P.x+dx/d*22,P.y+dy/d*22];
  if(!canNpcStand(...target,nan)){
    for(let a=0;a<16;a++){
      const p=[P.x+Math.cos(a*Math.PI/8)*22,P.y+Math.sin(a*Math.PI/8)*22];
      if(canNpcStand(...p,nan)){target=p;break;}
    }
  }
  const path=maddockWalkPath(nan,target)||[target];
  nan.goto=path.shift()||target;
  playScene(['Nan Ferrow: Corin! Before you go, love.',...FATHER_COMPASS_GIFT.slice(1)],
    {who:'Nan Ferrow',hold:()=>{
      if(!nan.goto&&path.length)nan.goto=path.shift();
      if(nan.goto||dragon.tr)return false;
      faceToward(nan,P.x,P.y);return true;
    },after:()=>{if(!templeCompass.owned)giveFatherCompass();}});
}
