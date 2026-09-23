function nearLava(x, y) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const a = x + dx, b = y + dy;
    if (a < 0 || b < 0 || a >= MW || b >= MH) continue;
    if (terr[b * MW + a] === VLAVA) return true;
  }
  return false;
}
function onLava(x, y) {
  if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
  const i = y * MW + x;
  if (typeof baseTerr !== "undefined" && baseTerr && baseTerr[i] === VLAVA) return true;
  return terr[i] === VLAVA;
}
function onVBridge(x, y) {
  const B = MD.vbridges;
  if (!B) return false;
  for (const [x0, x1, yy] of B)
    if (y >= yy - 3 && y <= yy + 3 && x >= x0 && x <= x1) return true;
  return false;
}
function inVolcano(x, y) {
  if (onLava(x, y)) return true;
  const F = (typeof features !== "undefined" && features.length) ? features : MD.features;
  if (!F) return false;
  for (const f of F) {
    if (f.style !== "volcano") continue;
    if (f.kind === "route") {
      const reach = (f.band || 20) + ((f.w || 5) >> 1) + 2;
      for (const [a, b] of routeLegs(f)) {
        const vert = a[0] === b[0];
        const lo = (vert ? Math.min(a[1], b[1]) : Math.min(a[0], b[0])) - reach;
        const hi = (vert ? Math.max(a[1], b[1]) : Math.max(a[0], b[0])) + reach;
        const along = vert ? y : x, across = vert ? x : y;
        if (along >= lo && along <= hi &&
            Math.abs(across - (vert ? a[0] : a[1])) <= reach) return true;
      }
    } else if (f.x0 !== undefined &&
               x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1) return true;
  }
  const WR = MD.volcano_regions;
  if (WR) for (const r of WR)
    if (x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3]) return true;
  return false;
}
function snowGround(x, y) {
  const t = terr[y * MW + x];
  if (t !== GRASS && t !== WALL) return false;
  if (!inWinter(x, y)) return false;
  return !(typeof inVolcano === "function" && inVolcano(x, y));
}
function soilAt(x, y) {
  if (typeof inWinter === "function" && inWinter(x, y) && SPR.wp_mid0) {
    const off = (a, b) => (a < 0 || b < 0 || a >= MW || b >= MH) ||
                          terr[b * MW + a] !== DIRT || !inWinter(a, b);
    if (off(x, y - 1) || off(x, y + 1) || off(x - 1, y) || off(x + 1, y)) {
      const sn = GROUND_SETS.snow;
      const w2 = (((x * 374761393) ^ (y * 668265263)) >>> 0) % sn.length;
      if (SPR[sn[w2]]) return sn[w2];
    }
    const set = GROUND_SETS.snow_track;
    const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
    if (SPR[set[v]]) return set[v];
  }
  if (typeof inSwamp === "function" && SPR.swd0) {
    if (swampRoadAt(x, y)) {
      const set = GROUND_SETS.swamp_soil;
      const v = (((x * 2654435761) ^ (y * 1597334677)) >>> 0) % set.length;
      if (SPR[set[v]]) return set[v];
    }
  }
  return soilIn(x, y) || "dirt";
}
const realizedCache = new Map();
let editStamp = 0;
function worldChanged() { editStamp++; realizedCache.clear(); }
let featOrig = new Map();
let resetArmed = false;
let drawA = null, drawB = null;      /* live preview while a finger is down */
var drawPts = [];                   /* corners of a route bent mid-swipe */

const evn = (v) => v - (v & 1);      /* snap to the 2-tile grid everything uses */

function straighten(ax, ay, bx, by) {
  const dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  if (dx >= dy) return [evn(ax), evn(ay), evn(bx), evn(ay)];
  return [evn(ax), evn(ay), evn(ax), evn(by)];
}

function squareOf(ax, ay, bx, by) {
  let n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), TOWN_MIN);
  n = evn(n);
  const x0 = evn(Math.min(ax, bx < ax ? ax - n : ax));
  const y0 = evn(Math.min(ay, by < ay ? ay - n : ay));
  return [x0, y0, x0 + n, y0 + n];
}

function attachPoint(area, side) {
  const b = area.band || 6, r = area.road;
  const cx = r ? area.x0 + r.x : (area.x0 + area.x1) >> 1;
  const cy = r ? area.y0 + r.y : (area.y0 + area.y1) >> 1;
  return { w: [area.x0 + b, cy], e: [area.x1 - b, cy],
           n: [cx, area.y0 + b], s: [cx, area.y1 - b] }[side];
}

const RCELL = 4;

function areaRects(pad) {
  return features.filter(isArea).map(a => [a.x0 - pad, a.y0 - pad, a.x1 + pad, a.y1 + pad]);
}

function exitPoint(area, side, pad) {
  const r = area.road;
  const cx = r ? area.x0 + r.x : (area.x0 + area.x1) >> 1;
  const cy = r ? area.y0 + r.y : (area.y0 + area.y1) >> 1;
  return { w: [area.x0 - pad, cy], e: [area.x1 + pad, cy],
           n: [cx, area.y0 - pad], s: [cx, area.y1 + pad] }[side];
}

function findPath(a, b, blocks, corridors) {
  const gw = Math.ceil(MW / RCELL), gh = Math.ceil(MH / RCELL);
  const solid = new Uint8Array(gw * gh);
  for (const [x0, y0, x1, y1] of blocks)
    for (let gy = Math.max(0, y0 / RCELL | 0); gy <= Math.min(gh - 1, y1 / RCELL | 0); gy++)
      for (let gx = Math.max(0, x0 / RCELL | 0); gx <= Math.min(gw - 1, x1 / RCELL | 0); gx++)
        solid[gy * gw + gx] = 1;
  for (const [ca, cb] of corridors) {
    const x0 = Math.min(ca[0], cb[0]), x1 = Math.max(ca[0], cb[0]);
    const y0 = Math.min(ca[1], cb[1]), y1 = Math.max(ca[1], cb[1]);
    for (let gy = Math.max(0, y0 / RCELL | 0); gy <= Math.min(gh - 1, y1 / RCELL | 0); gy++)
      for (let gx = Math.max(0, x0 / RCELL | 0); gx <= Math.min(gw - 1, x1 / RCELL | 0); gx++)
        solid[gy * gw + gx] = 0;
  }
  const key = (p) => p[1] * gw + p[0];
  const sa = [Math.min(gw - 1, Math.max(0, a[0] / RCELL | 0)),
              Math.min(gh - 1, Math.max(0, a[1] / RCELL | 0))];
  const sb = [Math.min(gw - 1, Math.max(0, b[0] / RCELL | 0)),
              Math.min(gh - 1, Math.max(0, b[1] / RCELL | 0))];
  solid[key(sa)] = 0; solid[key(sb)] = 0;
  const prev = new Map([[key(sa), -1]]);
  const q = [sa];
  for (let h = 0; h < q.length; h++) {
    const [cx, cy] = q[h];
    if (cx === sb[0] && cy === sb[1]) break;
    for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]]) {
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
      const k = ny * gw + nx;
      if (solid[k] || prev.has(k)) continue;
      prev.set(k, cy * gw + cx);
      q.push([nx, ny]);
    }
  }
  if (!prev.has(key(sb))) return null;
  const cells = [];
  for (let k = key(sb); k !== -1; k = prev.get(k)) cells.push([k % gw, k / gw | 0]);
  cells.reverse();
  const pts = [a.slice()];
  for (let i = 1; i < cells.length - 1; i++)
    pts.push([cells[i][0] * RCELL + (RCELL >> 1), cells[i][1] * RCELL + (RCELL >> 1)]);
  pts.push(b.slice());
  const clean = [pts[0]];
  for (const pt of pts.slice(1)) {
    const last = clean[clean.length - 1];
    if (pt[0] !== last[0] && pt[1] !== last[1]) clean.push([pt[0], last[1]]);
    const t = clean[clean.length - 1];
    if (pt[0] !== t[0] || pt[1] !== t[1]) clean.push(pt);
  }
  const out = [];
  for (let i = 0; i < clean.length - 1; i++) out.push([clean[i], clean[i + 1]]);
  return out;
}

const _legCache = new Map();
function routeLegs(f) {
  const ck = f.id + ":" + editStamp;
  const copy = ls => ls.map(([a, b]) => [[a[0], a[1]], [b[0], b[1]]]);
  const hit = _legCache.get(ck);
  if (hit) return copy(hit);
  const res = _routeLegs(f);
  if (_legCache.size > 4096) _legCache.clear();
  _legCache.set(ck, res);
  return copy(res);
}
function _routeLegs(f) {
  if (f.pts && f.pts.length >= 2) {
    const out = [];
    for (let i = 0; i < f.pts.length - 1; i++) {
      const a = f.pts[i], b = f.pts[i + 1];
      if (a[0] !== b[0] || a[1] !== b[1]) out.push([a.slice(), b.slice()]);
    }
    if (out.length) return out;
  }
  const byId = new Map(features.map(x => [x.id, x]));
  let p0 = [f.x0, f.y0], p1 = [f.x1, f.y1];
  const s0 = f.a0, s1 = f.a1;
  const a0 = s0 && byId.get(s0.area), a1 = s1 && byId.get(s1.area);
  const facing = (me, other) => {
    const mx = (me.x0 + me.x1) / 2, my = (me.y0 + me.y1) / 2;
    const ox = (other.x0 + other.x1) / 2, oy = (other.y0 + other.y1) / 2;
    if (Math.abs(ox - mx) >= Math.abs(oy - my)) return ox > mx ? "e" : "w";
    return oy > my ? "s" : "n";
  };
  let side0 = s0 && s0.side, side1 = s1 && s1.side;
  if (a0 && a1) { side0 = facing(a0, a1); side1 = facing(a1, a0); }
  if (a0) p0 = attachPoint(a0, side0).slice();
  if (a1) p1 = attachPoint(a1, side1).slice();
  const w = f.w || 5, pad = (w >> 1) + 1 + RCELL;

  if (!a0 && !a1) {
    if (p0[0] === p1[0] || p0[1] === p1[1]) return [[p0, p1]];
    return [[p0, [p1[0], p0[1]]], [[p1[0], p0[1]], p1]];
  }
  const e0 = a0 ? exitPoint(a0, side0, pad).slice() : p0;
  const e1 = a1 ? exitPoint(a1, side1, pad).slice() : p1;
  const corridors = [];
  if (a0) corridors.push([p0, e0]);
  if (a1) corridors.push([e1, p1]);
  let mid = findPath(e0, e1, areaRects((w >> 1) + 1), corridors);
  if (!mid) mid = (e0[0] !== e1[0] && e0[1] !== e1[1])
    ? [[e0, [e1[0], e0[1]]], [[e1[0], e0[1]], e1]] : [[e0, e1]];
  const legs = [];
  if (a0) legs.push([p0, e0]);
  for (const m of mid) legs.push(m);
  if (a1) legs.push([e1, p1]);
  return legs.filter(([x, y]) => x[0] !== y[0] || x[1] !== y[1]);
}

function inClearing(x, y) {
  for (const a of features) {
    if (!isArea(a)) continue;
    if (a.wild) continue;
    if (a.meadow) {                 /* no treeline: clear to its rim and beyond */
      if (x >= a.x0 - 12 && x <= a.x1 + 12 && y >= a.y0 - 12 && y <= a.y1 + 12)
        return true;
      continue;
    }
    const b = a.band || 6;
    if (x >= a.x0 + b && x <= a.x1 - b && y >= a.y0 + b && y <= a.y1 - b) return true;
  }
  return false;
}

let lineTiles = new Set();

function realizeFeatures() {
  if (MD.bg) { rebuildSolid(); rebuildBuckets(); return; }

  const townBoxes = features.filter(f => isArea(f) && !f.wild);
  const inTownArea = (x, y) => townBoxes.some(
    f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
  const pavedTiles = new Set();
  for (let i = 0; i < (MD.scatter || []).length; i += 3)
    if (/^sett_/.test(NAMES[MD.scatter[i]]))
      pavedTiles.add(Math.floor((MD.scatter[i + 2] - 1) / TS) * MW +
                     Math.floor(MD.scatter[i + 1] / TS));
  const pavedAt = (x, y) => pavedTiles.has(y * MW + x);
  const bareAreas = features.filter(f => isArea(f) && f.bare);
  soilAreas = features.filter(f => isArea(f) && f.soil && SPR[f.soil]);
  const isBare = (x, y) => bareAreas.some(
    f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
  const mysticAreas = features.filter(f => isArea(f) &&
    /shroom|mystic|spore/i.test((f.style || "") + " " + (f.label || "")));
  const isMystic = (x, y) => mysticAreas.length
    ? mysticAreas.some(f => x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1)
    : (MD.mystic_above !== undefined && y <= MD.mystic_above);

  lineTiles = new Set();
  terr.set(baseTerr);

  const rockSet = new Set();
  const _sc = MD.scatter || [];
  for (let i = 0; i < _sc.length; i += 3) {
    const nm = NAMES[_sc[i]], sp = SPR[nm];
    if (!sp || !/^(mtn_|mts_|mtv_|vmt_|vtower|cliff_|shc_|shcap_|waterfall)/.test(nm)) continue;
    for (let ty = Math.floor((_sc[i + 2] - sp[3]) / TS); ty <= Math.floor((_sc[i + 2] - 1) / TS); ty++)
      for (let tx = Math.floor((_sc[i + 1] - (sp[2] >> 1)) / TS);
           tx <= Math.floor((_sc[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
        rockSet.add(ty * MW + tx);
  }
  const rockAt = (x, y) => rockSet.has(y * MW + x);

  rockTiles = new Set();
  const markRock = (nm, ox, oy) => {
    const sp = SPR[nm];
    if (!sp || !/^(cliff_|waterfall|cliffpool|shc_|shcap_|mtn_|mts_|mtv_|vmt_|vtower|mtd_|mtw_|mte_)/.test(nm)) return;
    for (let ty = Math.floor((oy - sp[3]) / TS); ty <= Math.floor((oy - 1) / TS); ty++)
      for (let tx = Math.floor((ox - (sp[2] >> 1)) / TS);
           tx <= Math.floor((ox + (sp[2] >> 1) - 1) / TS); tx++)
        rockTiles.add(tx + "," + ty);
  };
  blockTiles = [];
  const markBlock = (nm, ox, oy) => {
    const sp = SPR[nm];
    if (!sp || !BLOCKS.test(nm)) return;
    for (let ty = Math.floor((oy - sp[3]) / TS); ty <= Math.floor((oy - 1) / TS); ty++)
      for (let tx = Math.floor((ox - (sp[2] >> 1)) / TS);
           tx <= Math.floor((ox + (sp[2] >> 1) - 1) / TS); tx++)
        if (tx >= 0 && ty >= 0 && tx < MW && ty < MH) blockTiles.push(ty * MW + tx);
  };
  for (const o of objs) { markRock(NAMES[o.s], o.x, o.y);
                          markBlock(NAMES[o.s], o.x, o.y); }
  for (const arr of [scat, sanm])
    for (let i = 0; i < arr.length; i += 3) {
      markRock(NAMES[arr[i]], arr[i + 1], arr[i + 2]);
      markBlock(NAMES[arr[i]], arr[i + 1], arr[i + 2]);
    }
  for (const f of features) {
    if (f.kind !== "route" || f.style !== "desert") continue;
    const half = (f.w || 5) >> 1, wall = half + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - wall;
      const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + wall;
      const line = vert ? pa[0] : pa[1];
      for (let v = lo; v <= hi; v++)
        for (const d of [-wall, wall]) {
          const tx = vert ? line + d : v, ty = vert ? v : line + d;
          if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
          let onRoad = false;
          for (const g of features) {
            if (g.kind !== "route") continue;
            const gh = ((g.w || 5) >> 1) + 1;
            for (const [qa, qb] of routeLegs(g)) {
              const qv = qa[0] === qb[0];
              const ql = (qv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0])) - gh;
              const qh2 = (qv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0])) + gh;
              const al = qv ? ty : tx, ac = qv ? tx : ty, ct = qv ? qa[0] : qa[1];
              if (al >= ql && al <= qh2 && Math.abs(ac - ct) <= gh) { onRoad = true; break; }
            }
            if (onRoad) break;
          }
          if (onRoad) continue;
          blockTiles.push(ty * MW + tx);
        }
    }
  }
  const zone = MD.shroom;
  const inTown = (px, py) => features.some(
    a => isArea(a) && !a.wild && px >= a.x0 - 2 && px <= a.x1 + 2 &&
         py >= a.y0 - 2 && py <= a.y1 + 2);
  const nearRoad = (x, y) => {
    if (!zone || y < zone.y0 || y > zone.y1) return false;
    if (zone.x0 !== undefined && (x < zone.x0 || x > zone.x1)) return false;
    if ((zone.y1 - y) / Math.max(1, zone.y1 - zone.y0) < 0.35) return false;
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const t2 = T(x + dx, y + dy);
        if ((t2 === DIRT || t2 === COBBLE || t2 === PAVING2 || t2 === MARBLE || t2 === TERRACE || t2 === BRIDGE) &&
            !inTown(x + dx, y + dy)) return true;
      }
    return false;
  };
  const areaRing = [];   /* an area's treeline, planted once `plant` exists */
  const routeAt = new Set();
  for (const rf of features) {
    if (rf.kind !== "route") continue;
    const rp = rf.pts || [[rf.x0, rf.y0], [rf.x1, rf.y1]];
    const rh = (rf.w >> 1) + 1;
    for (let i = 0; i + 1 < rp.length; i++) {
      const ax = Math.min(rp[i][0], rp[i + 1][0]);
      const bx = Math.max(rp[i][0], rp[i + 1][0]);
      const ay = Math.min(rp[i][1], rp[i + 1][1]);
      const by = Math.max(rp[i][1], rp[i + 1][1]);
      for (let yy = ay - rh; yy <= by + rh; yy++)
        for (let xx = ax - rh; xx <= bx + rh; xx++)
          routeAt.add(yy * MW + xx);
    }
  }
  const onRoute = (x, y) => routeAt.has(y * MW + x);
  const NO_PLANT = [
    { map: "world", x0: 679, y0: 106, x1: 818, y1: 128 },
    { map: "world", x0: 679, y0: 130, x1: 818, y1: 137 },
    { map: "world", x0: 808, y0: 133, x1: 822, y1: 147 },
    { map: "world", x0: 810, y0: 244, x1: 824, y1: 258 },
    { map: "world", x0: 795, y0: 123, x1: 807, y1: 134 },
    { map: "world", x0: 1494, y0: 88, x1: 1508, y1: 102 },
    { map: "world", x0: 1508, y0: 108, x1: 1522, y1: 122 },
    { map: "world", x0: 1511, y0: 66, x1: 1525, y1: 80 },
    { map: "world", x0: 2013, y0: 496, x1: 2027, y1: 510 },
    { map: "world", x0: 2042, y0: 243, x1: 2133, y1: 321 },
    { map: "world", x0: 2161, y0:  77, x1: 2314, y1: 264 },
    { map: "world", x0: 2061, y0:   1, x1: 2159, y1: 135 },
    { map: "world", x0: 2014, y0: 163, x1: 2102, y1: 205 },
    { map: "world", x0: 2016, y0: 108, x1: 2043, y1: 170 },
    { map: "world", x0: 2099, y0: 165, x1: 2131, y1: 213 },
    { map: "world", x0: 2149, y0: 164, x1: 2172, y1: 237 },
  ];
  const noPlant = (x, y) => NO_PLANT.some(
    r => r.map === MAPID && x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);
  const blossomAt = new Set();
  for (const bf of features) {
    if (bf.kind !== "route" || bf.style !== "blossom") continue;
    const bp = bf.pts || [[bf.x0, bf.y0], [bf.x1, bf.y1]];
    for (let i = 0; i + 1 < bp.length; i++) {
      const vert = bp[i][0] === bp[i + 1][0];
      const pad = 12, run = 12;
      const ax = Math.min(bp[i][0], bp[i + 1][0]) - (vert ? pad : run);
      const bx = Math.max(bp[i][0], bp[i + 1][0]) + (vert ? pad : run);
      const ay = Math.min(bp[i][1], bp[i + 1][1]) - (vert ? run : pad);
      const by = Math.max(bp[i][1], bp[i + 1][1]) + (vert ? run : pad);
      for (let yy = ay; yy <= by; yy++)
        for (let xx = ax; xx <= bx; xx++)
          if (!noPlant(xx, yy)) blossomAt.add(yy * MW + xx);
    }
  }
  const onBlossom = (x, y) => blossomAt.has(y * MW + x);
  blossomBand = blossomAt;
  arenaRings = features.filter(f => (f.kind === "arena" || f.kind === "camp"))
                       .map(f => [f.x, f.y, (f.r || 6) + 1]);
  townBoxList = features.filter(f => isArea(f) && (f.place || f.label))
                        .map(f => [f.x0, f.y0, f.x1, f.y1]);
  const put = (x, y, v) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return;
    if (baseTerr && baseTerr[y * MW + x] === SAND &&
        v !== DIRT && v !== ROADSAND && v !== PAVING2) return;
    const _cur = terr[y * MW + x];
    const _was = baseTerr ? baseTerr[y * MW + x] : -1;
    if (_cur === DWATER || _was === DWATER) return;
    if (_cur === SEA || _was === SEA) return;
    if (_cur === DECK || _was === DECK) return;
    if (_cur === GRASS && v !== DIRT && inDesert(x, y)) return;
    if (v === WALL && inDesert(x, y)) return;
    if (v === GRASS && (_cur === SAND || _cur === ROADSAND
                        || _was === SAND || _was === ROADSAND)) return;
    if (v === DIRT && _was === COBBLE) { terr[y * MW + x] = COBBLE; return; }
    terr[y * MW + x] = v;
  };

  for (const f of features) {
    if (!isArea(f) || f.carve === false) continue;
    for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++) {
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE) continue;
      if (rockAt(x, y)) continue;
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;
      put(x, y, Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === f.band - 1
                ? WALL : GRASS);
    }
  }
  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1;
    for (const [pa, pb] of routeLegs(f)) {
    const vert = pa[0] === pb[0];
    const lo = vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]);
    const hi = vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]);
    const line = vert ? pa[0] : pa[1];
    for (let v = lo; v <= hi; v++)
      for (let d = -half - 1 - f.band; d <= half + 1 + f.band; d++) {
        const x = vert ? line + d : v, y = vert ? v : line + d;
        const laid = (x >= 0 && y >= 0 && x < MW && y < MH) ? baseTerr[y * MW + x] : -1;
        if (laid === BRIDGE || laid === WATER) put(x, y, laid);
        else if (laid === GRASS && inTownArea(x, y)) put(x, y, GRASS);
        else if (f.style === "volcano") {
          const vh = Math.max(1, half - 1);
          if (Math.abs(d) <= vh) put(x, y, VSTONE);
          else if (Math.abs(d) <= vh + 1 && !onVBridge(x, y)) {
            const cur = (x >= 0 && y >= 0 && x < MW && y < MH)
                        ? terr[y * MW + x] : -1;
            if (cur !== VSTONE) put(x, y, VCRACK);
          }
        }
        else if (f.style === "desert") {
          if (Math.abs(d) <= half) put(x, y, PAVING2);
          else if (Math.abs(d) === half + 1) {
            const cur = (x >= 0 && y >= 0 && x < MW && y < MH) ? terr[y * MW + x] : -1;
            if (cur !== PAVING2) put(x, y, DIRT);
          }
        }
        else if (Math.abs(d) <= half) put(x, y, DIRT);
        else if (Math.abs(d) === half + 1) {
          const cur = (x >= 0 && y >= 0 && x < MW && y < MH) ? terr[y * MW + x] : -1;
          if (cur !== DIRT && cur !== COBBLE && cur !== PAVING2 && cur !== BRIDGE) put(x, y, GRASS);
        }
        else if (Math.abs(d) === half + 2 &&
                 x >= 0 && y >= 0 && x < MW && y < MH &&
                 terr[y * MW + x] === GRASS && !inClearing(x, y))
          put(x, y, WALL);

      }
    }
  }

  const ON_PURPOSE = /^(hb_|sh_(sml|med|big|wall|fat|stalk|glow)|fence_|white_|kt_|kp_|k_|rt_|rc_|sw_stone|swpb|wf_|wt_)/;
  const CAMP = /^(wf_grave|tent|campfire|log_|torch|barrel|crate|basket|stump_|woodpile|rock\d|sh_rock|sh_sml|cart_|lantern|wf_igloo|wf_stump|wf_rock|wf_mammoth|wt_fire|wt_coals|wt_brazier|wt_torch|campfire)/;
  const arenaAt = (px, py) => features.some(
    a => (a.kind === "arena" || a.kind === "camp") && Math.hypot(px - a.x, py - a.y) <= (a.r || ARENA_R) + 1.5);
  hidden = new Set(MD.hidden || []);
  for (const o of objs) {
    const ox = Math.floor(o.x / TS), oy = Math.floor((o.y - 1) / TS);
    if (arenaAt(ox, oy) && !CAMP.test(NAMES[o.s])) { hidden.add(o.id); continue; }
    if (ON_PURPOSE.test(NAMES[o.s])) continue;
    const x = ox, y = oy;
    if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
    const now = terr[y * MW + x], was = baseTerr[y * MW + x];
    const paved = (now === DIRT || now === COBBLE || now === PAVING2 || now === MARBLE || now === TERRACE || now === BRIDGE) &&
                  !(was === DIRT || was === COBBLE || was === PAVING2 || was === MARBLE || was === TERRACE || was === BRIDGE);
    if (/^(spr_|oak_|bir_|fru_|mw_)/.test(NAMES[o.s])) continue;
    if (paved || (was === WALL && now !== WALL)) hidden.add(o.id);
  }

  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1, band = f.band;
    const legs = routeLegs(f);
    for (let i = 0; i < legs.length - 1; i++) {
      const [ex, ey] = legs[i][1];
      for (let dy = -half - 1 - band; dy <= half + 1 + band; dy++)
        for (let dx = -half - 1 - band; dx <= half + 1 + band; dx++) {
          const x = ex + dx, y = ey + dy;
          if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          const cur = terr[y * MW + x];
          if (f.style === "volcano") {
            const vh = Math.max(1, half - 1);
            if (d <= vh) put(x, y, VSTONE);
            else if (d <= vh + 1 && cur !== VSTONE) put(x, y, VCRACK);
          }
          else if (f.style === "desert") {
            if (d <= half) put(x, y, PAVING2);
            else if (d === half + 1 && cur !== PAVING2) put(x, y, DIRT);
          }
          else if (d <= half) put(x, y, DIRT);
          else if (d === half + 1) {
            if (cur !== DIRT && cur !== COBBLE && cur !== PAVING2 && cur !== BRIDGE) put(x, y, GRASS);
          } else if (d === half + 2) {
            if (cur === GRASS && !inClearing(x, y) && !onRoute(x, y)
                && !(MD.barebox || []).some(
                      bb => x >= bb.x0 && x <= bb.x1
                         && y >= bb.y0 && y <= bb.y1)) {
              put(x, y, WALL);
              if (sows(f.style))
                areaRing.push([x, y, f.style]);
            }
          }
        }
    }
  }

  for (const f of features) {
    if (f.kind !== "arena" && f.kind !== "camp") continue;
    const r = f.r || ARENA_R;
    for (let y = Math.floor(f.y - r - 4); y <= f.y + r + 4; y++)
      for (let x = Math.floor(f.x - r - 4); x <= f.x + r + 4; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        const cur = terr[y * MW + x];
        if (cur === WATER || cur === BRIDGE) continue;
        const d = Math.hypot(x - f.x, y - f.y);
        if (f.style === "volcano") {
          if (d <= r + 0.5) put(x, y, VSTONE);
          else if (d <= r + 1.5 && cur !== VSTONE) put(x, y, VCRACK);
        }
        else if (f.style === "desert") {
          if (d <= r + 0.5) put(x, y, PAVING2);
          else if (d <= r + 1.5 && cur !== PAVING2) put(x, y, DIRT);
        }
        else if (f.style === "winter" ||
                 (typeof inWinter === "function" && inWinter(f.x, f.y))) {
          if (d > r + 1.5 && d <= r + 3.5 && cur === GRASS) put(x, y, WALL);
        }
        else if (d <= r + 0.5) put(x, y, DIRT);
        else if (d <= r + 1.5) { if (cur !== DIRT) put(x, y, GRASS); }
        else if (d <= r + 3.5 && cur === GRASS) put(x, y, WALL);
      }
  }

  const taken = new Set();
  for (const o of objs) {
    if (hidden.has(o.id)) continue;
    taken.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  }
  fobjs = []; fsanim = (MD.fsanim || []).slice();
  const wobble = (x, y) => {
    const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
    return [((h >>> 3) % 15) - 7, -((h >>> 11) % 15)];
  };
  const buildingBoxes = [];
  for (const o of objs) {
    const nm = NAMES[o.s], sp = SPR[nm];
    /* rt_ and wt_ are the temples (desert and winter): without this they
       had no footprint at all, so you could walk straight under them */
    if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower|rt_|wt_)/.test(nm))
      continue;
    buildingBoxes.push([o.x - (sp[2] >> 1) - 2, o.y - sp[3] - 2,
                        o.x + (sp[2] >> 1) + 2, o.y + 2]);
  }
  const bodyTiles = new Set();
  for (const o of objs) {
    const nm = NAMES[o.s], sp = SPR[nm];
    if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower|rt_|wt_)/.test(nm))
      continue;
    const x0 = Math.floor((o.x - (sp[2] >> 1)) / TS);
    const x1 = Math.floor((o.x + (sp[2] >> 1) - 1) / TS);
    const y0 = Math.floor((o.y - sp[3] / 2) / TS), y1 = Math.floor((o.y - 1) / TS);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) bodyTiles.add(x + "," + y);
  }
  const onBody = (tx, ty) => bodyTiles.has(tx + "," + ty);
  const onBuilding = (px, py, sp) => {
    const tx0 = px - (sp ? sp[2] >> 1 : 8), tx1 = px + (sp ? sp[2] >> 1 : 8);
    const ty0 = py - (sp ? sp[3] : 16), ty1 = py;
    return buildingBoxes.some(([bx0, by0, bx1, by1]) =>
      Math.min(tx1, bx1) > Math.max(tx0, bx0) &&
      Math.min(ty1, by1) > Math.max(ty0, by0));
  };

  const glades = new Set();
  let speciesIdx = null;
  const ringTiles = new Set();
  const ringVertical = new Set();
  const townRing = new Set();

  const treeAt = new Set();
  function mayPlant(x, y, opts) {
    opts = opts || {};
    if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
    const k = x + "," + y;
    if (treeAt.has(k) || taken.has(k)) return false;
    if (felled.has(k)) return false;          /* you cut it down: it stays down */
    if (rockTiles.has(k)) return false;       /* it is a cliff, not a gap in the wood */
    if (glades.has(k)) return false;          /* left bare on purpose */
    if (inClearing(x, y)) return false;       /* a town square stays empty */
    if (!opts.edge && (x % TREE_STEP || y % TREE_STEP)) return false;
    if (opts.edge && opts.ring) {
      if (opts.tight) {
        return true;
      } else if (opts.vertical) { if (y % (TREE_STEP * 2)) return false; }
      else if (x % 3) return false;
    }
    return true;
  }
  function putTree(x, y, si, opts) {
  if (typeof inVolcano === "function" && inVolcano(x, y)) return false;
  if (typeof inWinter === "function" && !inWinter(x, y) &&
      /^wf_/.test(NAMES[si] || "")) return false;
    if (si === undefined || !mayPlant(x, y, opts)) return false;
    if (baseTerr && baseTerr[y * MW + x] === SAND
        && !/^(cactus|drock|palm|acacia|deadtree|halfdead|bones)/.test(NAMES[si]))
      return false;
    const nm = NAMES[si], sp = SPR[nm];
    if (onBuilding(x * TS + TS / 2, y * TS + TS, sp)) return false;
    const off = (opts && opts.edge) ? [0, 0] : wobble(x, y);
    if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                 x: x * TS + TS / 2 + off[0], y: y * TS + TS + off[1], feat: 1 });
    treeAt.add(x + "," + y);
    taken.add(x + "," + y);
    if (speciesIdx) speciesIdx.set(x + "," + y, si);
    return true;
  }
  const bandStyleTiles = new Set();
  for (const f of features) {
    if (!isArea(f)) continue;
    const b = f.band || 6;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++)
        if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
          bandStyleTiles.add(x + "," + y);
  }
  const plant = (x, y, style, edge, extra) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return;
    const tg = terr[y * MW + x];
    if (style === "desert") return;
    if (style === "volcano") return;
    if (typeof inVolcano === "function" && inVolcano(x, y)) return;
    if (style === "winter" && typeof inWinter === "function" && !inWinter(x, y)) return;
    if (tg !== WALL && !(tg === SAND && style === "dying")) return;
    if (!edge) {
      const hg = ((x * 374761393) ^ (y * 668265263)) >>> 0;
      if (hg % 100 < 40) { glades.add(x + "," + y); return; }
    }
    const sp0 = STYLE_TREE[style];
    let hsp = ((x * 374761393) ^ (y * 668265263)) >>> 0;
    hsp ^= hsp >>> 15; hsp = Math.imul(hsp, 2246822519) >>> 0;
    hsp ^= hsp >>> 13; hsp = Math.imul(hsp, 3266489917) >>> 0;
    hsp ^= hsp >>> 16;
    const pick = Array.isArray(sp0) ? sp0[(hsp >>> 0) % sp0.length] : sp0;
    const ok2 = putTree(x, y, NAME2I[pick],
                        Object.assign({ edge, tight: style === "desert" }, extra));
    const feet = ATLAS.styles.foot && ATLAS.styles.foot[style];
    if (ok2 && feet) {
      const hf = ((x * 2246822519) ^ (y * 3266489917)) >>> 0;
      if (hf % 100 < 34) {
        const rock = feet[(hf >>> 7) % feet.length];
        const rs = SPR[rock];
        if (rs) fobjs.push({ id: -1 - fobjs.length, s: NAME2I[rock],
                             x: x * TS + TS / 2 + ((hf >>> 3) % 9) - 4,
                             y: y * TS + TS + 1, feat: 1 });
      }
    }
  };
  for (const f of features) {
    if (isArea(f)) {
      if (f.carve === false) continue;      /* its treeline is already placed */
      for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++)
      {
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        if (e >= f.band) continue;
        if (e !== f.band - 1) { glades.add(x + "," + y); continue; }
        {
          let onRoad = false;
          for (const g of features) {
            if (isArea(g) || onRoad) continue;
            const gap = (g.w >> 1) + 2;
            for (const [qa, qb] of routeLegs(g)) {
              const vv = qa[0] === qb[0];
              const lo2 = (vv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0])) - gap;
              const hi2 = (vv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0])) + gap;
              const along = vv ? y : x, across = vv ? x : y;
              if (along >= lo2 && along <= hi2 &&
                  Math.abs(across - (vv ? qa[0] : qa[1])) <= gap) { onRoad = true; break; }
            }
          }
          if (onRoad) { glades.add(x + "," + y); continue; }
        }
        const inner2 = (e === f.band - 1);
        const vert2 = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        plant(x, y, f.style, inner2, { ring: inner2, vertical: vert2 });
      }
    } else {
      const half = f.w >> 1;
      const legsT = routeLegs(f);
      for (let i = 0; i < legsT.length - 1; i++) {
        const [ex, ey] = legsT[i][1];
        for (let dy = -half - 1 - f.band; dy <= half + 1 + f.band; dy++)
          for (let dx = -half - 1 - f.band; dx <= half + 1 + f.band; dx++) {
            const dd = Math.max(Math.abs(dx), Math.abs(dy));
            if (dd <= half + 1) continue;
            const cx2 = ex + dx, cy2 = ey + dy;
            if (nearRoad(cx2, cy2)) continue;
            if (dd >= half + 3 && dd <= half + 6) {
              glades.add(cx2 + "," + cy2);
              continue;
            }
            continue;
          }
      }
      for (const [pa, pb] of routeLegs(f)) {
        const vert = pa[0] === pb[0];
        const over = (f.w >> 1) + 2;
        const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
        const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
        const line = vert ? pa[0] : pa[1];
        for (let v = lo; v <= hi; v++)
          for (let d = -half - 1 - f.band; d <= half + 1 + f.band; d++) {
            if (Math.abs(d) <= half + 1) continue;
            const tx = vert ? line + d : v, ty = vert ? v : line + d;
            if (nearRoad(tx, ty)) continue;   /* mushrooms are the shoulder here */
            const isEdge = Math.abs(d) === half + 2;
            const isSouth2 = f.style === "swamp" && !vert && d === half + 5;
            if (!isEdge && !isSouth2) continue;
            if (isSouth2) {
              if (f.style !== "desert") plant(tx, ty, f.style, false, {});
              continue;
            }
            if (f.style === "desert" || f.style === "volcano") continue;
            if (isEdge) {
              ringTiles.add(tx + "," + ty);
              if (vert) ringVertical.add(tx + "," + ty);
            }
            if (f.style === "desert") continue;   /* sown into the map instead */
            plant(tx, ty, f.style, isEdge,
                  { ring: isEdge, vertical: vert, tight: f.style === "winter" });
          }
      }
    }
  }
const inScene = (x, y) => (MD.barebox || []).some(
  b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
for (const [ax, ay, st] of areaRing) plant(ax, ay, st, true, { ring: true });
for (const f of features) {
  if (f.kind !== "arena" && f.kind !== "camp" || f.style !== "desert") continue;
  const CAC = (ATLAS.styles.tree || {}).desert || [];
  if (!CAC.length) continue;
  const rr = (f.r || ARENA_R) + 2.2;
  for (let deg = 0; deg < 360; deg += 11) {
    const a = deg * Math.PI / 180;
    const x = Math.round(f.x + Math.cos(a) * rr);
    const y = Math.round(f.y + Math.sin(a) * rr);
    const h = ((x * 374761393) ^ (y * 668265263)) >>> 0;
    putTree(x, y, NAME2I[CAC[h % CAC.length]], { edge: true, ring: true, tight: true });


  }
}
{
  const dar = features.filter(f => (f.kind === "arena" || f.kind === "camp") && f.style === "desert");
  if (dar.length)
    fobjs = fobjs.filter(o => {
      if (!/^drock/.test(NAMES[o.s] || "")) return true;
      const tx = o.x / TS, ty = (o.y - 1) / TS;
      return !dar.some(f => Math.hypot(tx - f.x, ty - f.y) <= (f.r || ARENA_R) + 5);
    });
}
const FOREST = STYLE_TREE[MD.forest_style || "spruce"];
  for (const f of features) {
    if (!isArea(f) || f.wild) continue;
    if (f.ring) continue;
    const b = f.band || 6;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
        if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) >= b) continue;
        const cur = terr[y * MW + x];
        if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
          continue;                             /* a road through it is a gate */
        if (felled.has(x + "," + y)) {
          if (terr[y * MW + x] === WALL && !rockAt(x, y))
            terr[y * MW + x] = openTo(y * MW + x);
          continue;
        }
        if (!inTown(x, y) && !atOasis(x, y))
        if (!refusesTrunk(terr[y * MW + x]))
        terr[y * MW + x] = WALL;
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        const inner = (e === b - 1);
        const vertical = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        if (e !== b - 1) { glades.add(x + "," + y); continue; }
        if (!inner && (y % (TREE_STEP * 2))) { glades.add(x + "," + y); continue; }
        plant(x, y, f.style || "spruce", inner, { ring: inner, vertical });
        lineTiles.add(x + "," + y);
      }
  }

  const fillFrom = fobjs.length;
  const routeBand = new Uint8Array(MW * MH);
  for (const f of features) {
    if (f.kind !== "route") continue;
    const pad = (f.band || 8) + ((f.w || 5) >> 1) + 2;
    for (const [pa, pb] of routeLegs(f)) {
      const y0b = Math.max(0, Math.min(pa[1], pb[1]) - pad);
      const y1b = Math.min(MH - 1, Math.max(pa[1], pb[1]) + pad);
      const x0b = Math.max(0, Math.min(pa[0], pb[0]) - pad);
      const x1b = Math.min(MW - 1, Math.max(pa[0], pb[0]) + pad);
      for (let yy = y0b; yy <= y1b; yy++) {
        const row = yy * MW;
        for (let xx = x0b; xx <= x1b; xx++) routeBand[row + xx] = 1;
      }
    }
  }
  for (let y = 0; y < MH; y += TREE_STEP)
    for (let x = 0; x < MW; x += TREE_STEP) {
      if (Math.min(x, y, MW - 1 - x, MH - 1 - y) < RIM + 1) continue;
      if (nearRoad(x, y)) continue;
      if (glades.has(x + "," + y)) continue;   /* left bare on purpose */
      if (routeBand[y * MW + x]) continue;      /* the road's own wood */
      if (bandStyleTiles.has(x + "," + y)) continue;
      let ownSt = null, ownNear = false;
      for (const f of features) {
        if (f.kind !== "arena" && f.kind !== "camp" || !f.style) continue;
        const dx = x - f.x, dy = y - f.y, r = (f.r || 6) + 8;
        if (dx * dx + dy * dy <= r * r) {
          ownSt = f.style;
          ownNear = dx * dx + dy * dy <= ((f.r || 6) + 4) * ((f.r || 6) + 4);
          break;
        }
      }
      plant(x, y, ownSt === "swamp" && ownNear ? "swamp_safe"
                  : ownSt ? ownSt
                  : isMystic(x, y)
                  ? (MD.mystic_style || "mystic")
                  : (MD.forest_style || "spruce"));
    }

  fsanim = (MD.fsanim || []).filter((_, i) =>
    i % 3 !== 0 ? false : /^dtuft/.test(NAMES[MD.fsanim[i]] || "")
  ).flatMap((_, i) => []);
  {
    const keepD = [];
    const src = MD.fsanim || [];
    for (let i = 0; i < src.length; i += 3)
      if (/^dtuft/.test(NAMES[src[i]] || ""))
        keepD.push(src[i], src[i + 1], src[i + 2]);
    fsanim = keepD;
  }
  const TUFTS3 = ["agrass1", "agrass2", "agrass3"];
  for (const f of features) {
    if (!isArea(f) || f.carve === false) continue;
    for (let y = f.y0; y <= f.y1; y++) for (let x = f.x0; x <= f.x1; x++) {
      if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
      if (terr[y * MW + x] !== GRASS || taken.has(x + "," + y)) continue;
      if (inDesert(x, y)) continue;
      if (pavedAt(x, y)) continue;          /* nothing grows through paving */
      if (rockTiles && rockTiles.has(x + "," + y)) continue;
      if (inScene(x, y)) continue;            /* nor on a placed scene */
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;   /* nor on rock */
      if (inSwamp(x, y)) continue;
      if (typeof inWinter === "function" && inWinter(x, y)) continue;
      const hsh = (x * 73856093) ^ (y * 19349663);
      const r0 = ((hsh >> 4) % 100 + 100) % 100;
      const bare0 = isBare(x, y);
      if (r0 >= (bare0 ? 7 : 48)) continue;      /* far less cover on bare ground */
      const TUFT_FLOOR = 30;
      if (!bare0 && r0 < TUFT_FLOOR) continue;
      let si;
      if (bare0 || r0 < 40) si = NAME2I[TUFTS3[((hsh >> 11) % 3 + 3) % 3]];
      if (atCoast(x, y) && SPR.cyanf0) {
        const CYAN_IN = 8;
        if ((((hsh >> 21) % CYAN_IN + CYAN_IN) % CYAN_IN) === 0) {
          const cn = "cyanf" + (((hsh >> 17) % 2 + 2) % 2);
          if (NAME2I[cn] !== undefined) si = NAME2I[cn];
        }
      } else if (SPR.pinkf0 && ((hsh >> 5) % 3) === 0 && onBlossom(x, y)) {
        const pn = "pinkf" + (((hsh >> 17) % 4 + 4) % 4);
        if (NAME2I[pn] !== undefined) si = NAME2I[pn];
      }
      else {
        const FL = NAMES.filter(n => n && /^aflower/.test(n));
        const pool = (MD.mystic_above !== undefined && y <= MD.mystic_above)
                     ? FL.filter(n => !/_w$/.test(n)) : FL.filter(n => /_w$/.test(n));
        if (pool.length)
          si = NAME2I[pool[((hsh >> 13) % pool.length + pool.length) % pool.length]];
      }
      if (si === undefined) continue;
      fsanim.push(si, x * TS + 2 + (((hsh >> 3) % 13 + 13) % 13),
                  y * TS + 10 + (((hsh >> 9) % 7 + 7) % 7));
    }
  }

  {
    const FLOWERS = NAMES.filter(n => n && /^aflower/.test(n));
    const northF = FLOWERS.filter(n => !/_w$/.test(n));
    const southF = FLOWERS.filter(n => /_w$/.test(n));
    const line = MD.mystic_above;
    for (const f of features) {
      if (f.kind !== "route") continue;
      const pad = (f.band || 8) + ((f.w || 5) >> 1) + 1;
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - pad; y <= Math.max(pa[1], pb[1]) + pad; y++)
          for (let x = Math.min(pa[0], pb[0]) - pad; x <= Math.max(pa[0], pb[0]) + pad; x++) {
            if (x < 0 || y < 0 || x >= MW || y >= MH) continue;
            if (terr[y * MW + x] !== GRASS || taken.has(x + "," + y)) continue;
            if (inSwamp(x, y)) continue;
            if (pavedAt(x, y)) continue;
            if (rockTiles && rockTiles.has(x + "," + y)) continue;
      if (inScene(x, y)) continue;            /* nor on a placed scene */
      if (SCENE_WALL && SCENE_WALL.has(y * MW + x)) continue;
            const hsh = (x * 73856093) ^ (y * 19349663);
            const r = ((hsh >> 4) % 100 + 100) % 100;
            const bare1 = isBare(x, y);
            if (r >= (bare1 ? 7 : 55)) continue;
            let si;
            if (bare1 || r < 45) si = NAME2I[TUFTS3[((hsh >> 11) % 3 + 3) % 3]];
            else {
              const pool = (line !== undefined && y <= line) ? northF : southF;
              if (pool.length)
                si = NAME2I[pool[((hsh >> 13) % pool.length + pool.length) % pool.length]];
            }
            if (si === undefined) continue;
            fsanim.push(si, x * TS + 2 + (((hsh >> 3) % 13 + 13) % 13),
                        y * TS + 10 + (((hsh >> 9) % 7 + 7) % 7));
          }
    }
  }
  {
    const keep = [];
    let cut = 0;
    for (let i = 0; i < fsanim.length; i += 3) {
      const fx = Math.floor(fsanim[i + 1] / TS);
      const fy = Math.floor(fsanim[i + 2] / TS);
      if (/^dtuft/.test(NAMES[fsanim[i]] || "")) { keep.push(
            fsanim[i], fsanim[i + 1], fsanim[i + 2]); continue; }
      if (atCoast(fx, fy) && /_w$|^flower/.test(NAMES[fsanim[i]] || "")) {
        cut++;
        continue;
      }
      if (inDesert(fx, fy)) { cut++; continue; }
      keep.push(fsanim[i], fsanim[i + 1], fsanim[i + 2]);
    }
    if (cut) fsanim = keep;
  }
  if (MD.mystic_above !== undefined) {
    const wantN = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const wantS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const owner = (x, y) => {
      for (let fi = features.length - 1; fi >= 0; fi--) {
        const f = features[fi];
        if ((f.kind === "arena" || f.kind === "camp") && sows(f.style)) {
          const dx = x - f.x, dy = y - f.y, r = (f.r || 6) + 6;
          if (dx * dx + dy * dy <= r * r) return f.style;
        }
        if ((f.kind === "area" || f.kind === "town") && sows(f.style)) {
          const m2 = 4;
          if (x >= f.x0 - m2 && x <= f.x1 + m2
              && y >= f.y0 - m2 && y <= f.y1 + m2) return f.style;
        }
        if (f.kind === "route" && sows(f.style)) {
          const rp = f.pts || [[f.x0, f.y0], [f.x1, f.y1]];
          const rb = (f.band || 20);
          for (let i = 0; i + 1 < rp.length; i++) {
            const ax = Math.min(rp[i][0], rp[i + 1][0]) - rb;
            const bx = Math.max(rp[i][0], rp[i + 1][0]) + rb;
            const ay = Math.min(rp[i][1], rp[i + 1][1]) - rb;
            const by = Math.max(rp[i][1], rp[i + 1][1]) + rb;
            if (x >= ax && x <= bx && y >= ay && y <= by) return f.style;
          }
        }
      }
      return null;
    };
    for (const o of fobjs) {
      const nm = NAMES[o.s];
      if (!/^(spr|mw)_/.test(nm)) continue;
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      const own = owner(x, y);
      if (own) {
        const sp1 = STYLE_TREE[own];
        const nm1 = Array.isArray(sp1)
          ? sp1[(() => { let q = ((x * 374761393) ^ (y * 668265263)) >>> 0;
             q ^= q >>> 15; q = Math.imul(q, 2246822519) >>> 0;
             q ^= q >>> 13; q = Math.imul(q, 3266489917) >>> 0;
             return (q ^ (q >>> 16)) >>> 0; })() % sp1.length]
          : sp1;
        if (NAME2I[nm1] !== undefined) { o.s = NAME2I[nm1]; continue; }
      }
      const tgt = isMystic(x, y) ? wantN : wantS;
      if (tgt !== undefined) o.s = tgt;
    }
  }
  {
    const inSquare = (x, y) => features.some(f => {
      if (!isArea(f) || f.wild) return false;
      const b = f.band || 6;
      return x >= f.x0 + b && x <= f.x1 - b && y >= f.y0 + b && y <= f.y1 - b;
    });
    const before = fobjs.length;
    fobjs = fobjs.filter(o => !inSquare(Math.floor(o.x / TS),
                                        Math.floor((o.y - 1) / TS)));
    if (fobjs.length !== before)
      for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) {
          if (terr[y * MW + x] === WALL && inSquare(x, y))
            terr[y * MW + x] = openTo(y * MW + x);
        }
  }

  {
    for (const arr of [objs, fobjs])
      for (const o of arr)
        if (/^(spr_|oak_|bir_|fru_|mw_)/.test(NAMES[o.s]))
          treeAt.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
    const paved = (t) => t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE;
    const styleAt = new Map();
    for (const f of features) {
      if (f.kind !== "route" || !sows(f.style)) continue;
      const si = NAME2I[STYLE_TREE[f.style]];
      if (si === undefined) continue;
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - 2; y <= Math.max(pa[1], pb[1]) + 2; y++)
          styleAt.set(y, si);
    }
    const fallback = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const northSi = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const drawn = new Map();
    for (const f of features) {
      if (f.kind !== "route") continue;
      const lo2 = Math.min(f.y0, f.y1), hi2 = Math.max(f.y0, f.y1);
      for (const [pa, pb] of routeLegs(f))
        for (let y = Math.min(pa[1], pb[1]) - 2; y <= Math.max(pa[1], pb[1]) + 2; y++)
          drawn.set(y, y >= lo2 - 4 && y <= hi2 + 4);
    }
    const styleNear = (x, y) => {
      let best = null;
      for (const f of features) {
        if (f.kind !== "route" || !sows(f.style)) continue;
        const si = NAME2I[STYLE_TREE[f.style]];
        if (si === undefined) continue;
        for (const [pa, pb] of routeLegs(f)) {
          let d = null;
          if (pa[0] === pb[0]) {
            if (y >= Math.min(pa[1], pb[1]) - 26 && y <= Math.max(pa[1], pb[1]) + 26)
              d = Math.abs(x - pa[0]);
          } else if (x >= Math.min(pa[0], pb[0]) - 26 && x <= Math.max(pa[0], pb[0]) + 26)
            d = Math.abs(y - pa[1]);
          if (d !== null && d <= 26 && (best === null || d < best[0])) best = [d, si];
        }
      }
      return best ? best[1] : undefined;
    };
    const speciesFor = (y, x) => {
      if (x !== undefined) {
        const near = styleNear(x, y);
        if (near !== undefined) return near;
      }
      if (styleAt.get(y) !== undefined) return styleAt.get(y);
      if (x !== undefined) return isMystic(x, y) ? northSi : fallback;
      if (MD.mystic_above !== undefined)
        return y <= MD.mystic_above ? northSi : fallback;
      return fallback;
    };
    for (let y = 1; y < MH - 1; y++) {
      let run = -1;
      for (let x = 0; x <= MW; x++) {
        const on = x < MW && paved(terr[y * MW + x]);
        if (on && run < 0) run = x;
        if (!on && run >= 0) {
          for (const x2 of [run - 2, x + 1]) {     /* one clear of the verge */
            if (x2 < 1 || x2 >= MW - 1) continue;
            const cur = terr[y * MW + x2];
            if (paved(cur) || cur === WATER) continue;
            if (inClearing(x2, y)) continue;
            const key = x2 + "," + y;
            if (felled.has(key) &&
                (felled.has((x2 - 1) + "," + y) || felled.has((x2 + 1) + "," + y)) &&
                (felled.has(x2 + "," + (y - 1)) || felled.has(x2 + "," + (y + 1))))
              continue;
            lineTiles.delete(key);
            if (baseTerr[y * MW + x2] !== SAND)
              putTree(x2, y, speciesFor(y, x2),
                      { edge: true, ring: true, vertical: true });
          }
          run = -1;
        }
      }
    }
  }

  {
    const drop = new Set();
    for (const f of features) {
      if (f.kind !== "route") continue;
      const half = (f.w || 5) >> 1;
      for (const [pa, pb] of routeLegs(f)) {
        const vert2 = pa[0] === pb[0];
        const lo2 = vert2 ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]);
        const hi2 = vert2 ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]);
        const ln = vert2 ? pa[0] : pa[1];
        for (let v2 = lo2; v2 <= hi2; v2++) {
          if (vert2 ? (v2 % (TREE_STEP * 2) === 0) : (v2 % 3 === 0)) continue;
          for (const off of [-half - 2, half + 2])
            drop.add(vert2 ? (ln + off) + "," + v2 : v2 + "," + (ln + off));
        }
      }
    }
    if (drop.size)
      fobjs = fobjs.filter(o => !drop.has(Math.floor(o.x / TS) + "," +
                                          Math.floor((o.y - 1) / TS)));
  }

  {
    const line = MD.mystic_above;
    if (line !== undefined) {
      const wantN = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
      const wantS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
      const smallOf = new Map(), isSmall = new Set();
      for (const k of Object.keys(STYLE_TREE)) {
        const si = NAME2I[STYLE_TREE[k]];
        if (si === undefined) continue;
        if (k.endsWith("_small")) { isSmall.add(si); continue; }
        const sm = NAME2I[STYLE_TREE[k + "_small"]];
        if (sm !== undefined) smallOf.set(si, sm);
      }

      const bandStyle = new Map();
      for (const f of features) {
        if (!isArea(f)) continue;
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
              bandStyle.set(x + "," + y, f.style || "spruce");
      }

      const strayed = new Set();
      for (const f of features) {
        if (f.kind !== "route") continue;
        const legs = routeLegs(f);
        let lo = Infinity, hi = -Infinity;
        for (const [a, b] of legs) {
          lo = Math.min(lo, a[1], b[1]); hi = Math.max(hi, a[1], b[1]);
        }
        let drawnLo, drawnHi;
        if (f.drawn) {
          drawnLo = f.drawn[0]; drawnHi = f.drawn[1];
        } else if (f.pts && f.pts.length >= 2) {
          const py = f.pts.map(p => p[1]);
          drawnLo = Math.min.apply(null, py); drawnHi = Math.max.apply(null, py);
        } else {
          drawnLo = Math.min(f.y0, f.y1); drawnHi = Math.max(f.y0, f.y1);
        }
        if (lo >= drawnLo - 4 && hi <= drawnHi + 4) continue;
        const pad = (f.band || 8) + (f.w || 5);
        for (const [a, b] of legs)
          for (let y = Math.min(a[1], b[1]) - pad; y <= Math.max(a[1], b[1]) + pad; y++) {
            if (y >= drawnLo - pad && y <= drawnHi + pad) continue;
            for (let x = Math.min(a[0], b[0]) - pad; x <= Math.max(a[0], b[0]) + pad; x++)
              strayed.add(x + "," + y);
          }
      }

      for (const o of fobjs) {
        const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
        const key = x + "," + y;
        const bs = bandStyle.get(key);
        if (bs !== undefined) {
          const want = NAME2I[STYLE_TREE[bs]];
          if (want !== undefined) o.s = want;
          continue;
        }
        if (strayed.has(key)) {
          let want = isMystic(x, y) ? wantN : wantS;
          if (want !== undefined && isSmall.has(o.s))
            want = smallOf.has(want) ? smallOf.get(want) : want;
          if (want !== undefined) o.s = want;
        }
      }
    }
  }

  const refreshSpeciesIdx = () => {
    speciesIdx = new Map();
    for (const o of fobjs)
      speciesIdx.set(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS), o.s);
  };
  const speciesNear = (x, y) => {
    if (!speciesIdx) refreshSpeciesIdx();
    return speciesNearIdx(x, y, speciesIdx);
  };
  const speciesNearIdx = (x, y, byTile) => {
    for (let r = 1; r <= 6; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const si = byTile.get((x + dx) + "," + (y + dy));
          if (si !== undefined) return si;
        }
    const nS = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const sS = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    return isMystic(x, y) ? nS : sS;
  };

  {
    const covered = new Set();
    for (let i = 0; i < scat.length; i += 3) {
      const nm = NAMES[scat[i]], sp = SPR[nm];
      if (!sp || !/^(mtn_|mtd_|mtw_|mte_|shc_|shcap_|cliff_|waterfall)/.test(nm)) continue;
      for (let ty = Math.floor((scat[i + 2] - sp[3]) / TS); ty <= Math.floor((scat[i + 2] - 1) / TS); ty++)
        for (let tx = Math.floor((scat[i + 1] - (sp[2] >> 1)) / TS);
             tx <= Math.floor((scat[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
          covered.add(tx + "," + ty);
    }
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            covered.add(tx + "," + ty);
      }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        const i = y * MW + x;
        if (terr[i] !== WALL || covered.has(x + "," + y)) continue;
        if (lineTiles.has(x + "," + y)) {
          const _si = speciesNear(x, y);
          const _sand = baseTerr[y * MW + x] === SAND;
          if (!ringTiles.has(x + "," + y) &&
              (!_sand || /^cactus/.test(NAMES[_si] || "")) &&
              putTree(x, y, _si, { edge: true })) {
            covered.add(x + "," + y);
          } else if (ringTiles.has(x + "," + y)) {
            continue;            /* the ring keeps its ground and its spacing */
          } else {
            terr[i] = openTo(i);
          }
          continue;
        }
        terr[i] = openTo(i);
      }
  }
  {
    if (buildingBoxes.length) {
      const before = fobjs.length;
      const gone = [];
      fobjs = fobjs.filter(o => {
        const sp0 = SPR[NAMES[o.s]];
        const hit = sp0 && onBuilding(o.x, o.y, sp0);
        if (hit) gone.push([Math.floor(o.x / TS), Math.floor((o.y - 1) / TS)]);
        return !hit;
      });
      if (gone.length) {
        const covered = new Set();
        for (let i = 0; i < scat.length; i += 3) {
          const nm = NAMES[scat[i]], sp = SPR[nm];
          if (!sp || !/^(mtn_|mtd_|mtw_|mte_|shc_|shcap_|cliff_|waterfall)/.test(nm)) continue;
          for (let ty = Math.floor((scat[i + 2] - sp[3]) / TS); ty <= Math.floor((scat[i + 2] - 1) / TS); ty++)
            for (let tx = Math.floor((scat[i + 1] - (sp[2] >> 1)) / TS);
                 tx <= Math.floor((scat[i + 1] + (sp[2] >> 1) - 1) / TS); tx++)
              covered.add(tx + "," + ty);
        }
        for (const arr of [objs, fobjs])
          for (const o of arr) {
            const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
            for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
              for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
                   tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
                covered.add(tx + "," + ty);
          }
        for (let y = RIM + 1; y < MH - RIM - 1; y++)
          for (let x = RIM + 1; x < MW - RIM - 1; x++) {
            const k = x + "," + y;
            if (terr[y * MW + x] !== WALL || covered.has(k)) continue;
            if (ringTiles.has(k)) { terr[y * MW + x] = openTo(y * MW + x); continue; }
      if (inDesert(x, y)) continue;   /* no ring through a desert oasis */
            if (lineTiles.has(k)) {
              if (ringTiles.has(k)) continue;   /* the ring keeps its spacing */
              if (baseTerr[y * MW + x] !== SAND &&
                  putTree(x, y, speciesNear(x, y), { edge: true })) {
                covered.add(k);
              } else {
                terr[y * MW + x] = openTo(y * MW + x);
              }
              continue;
            }
            terr[y * MW + x] = openTo(y * MW + x);
          }
      }
    }
  }

  if (ringTiles.size) {
    const keep = [];
    for (const o of fobjs) {
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      const k = x + "," + y;
      if (ringTiles.has(k)) {
        const vert = ringVertical.has(k);
        if (vert ? (y % (TREE_STEP * 2)) : (x % 3)) continue;
      }
      keep.push(o);
    }
    fobjs = keep;
  }
  {
    const cov = new Set();
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            cov.add(tx + "," + ty);
      }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        if (terr[y * MW + x] !== WALL) continue;
        const k = x + "," + y;
        if (cov.has(k) || townRing.has(k)) continue;
        if (rockAt(x, y)) continue;
        terr[y * MW + x] = openTo(y * MW + x);
      }
  }

  treeAt.clear();
  for (const o of fobjs)
    treeAt.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  for (const f of features) {
    if (f.kind !== "route") continue;
    const half = f.w >> 1;
    const drawnLo = Math.min(f.y0, f.y1), drawnHi = Math.max(f.y0, f.y1);
    const nSi = NAME2I[STYLE_TREE[MD.mystic_style || "mystic"]];
    const sSi = NAME2I[STYLE_TREE[MD.forest_style || "spruce"]];
    const ownSi = sows(f.style) ? NAME2I[STYLE_TREE[f.style]] : undefined;
    const speciesAt = (y) => ownSi;
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const over = half + 2;
      const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
      const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
      const line = vert ? pa[0] : pa[1];
      for (let v = lo; v <= hi; v++) {
        if (vert ? (v % (TREE_STEP * 2)) : (v % 3)) continue;
        for (const d of [-half - 2, half + 2]) {
          const x = vert ? line + d : v, y = vert ? v : line + d;
          if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
          const cur = terr[y * MW + x];
          if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
            continue;
          const k = x + "," + y;
          if (treeAt.has(k) || felled.has(k)) continue;
          const si = speciesAt(y);
          if (si === undefined) continue;
          if (onBody(x, y)) continue;
          if (rockTiles.has(x + "," + y)) continue;   /* it is a cliff */
          if (!inTown(x, y) && !atOasis(x, y))
          if (!refusesTrunk(terr[y * MW + x]))
          terr[y * MW + x] = WALL;
          if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                       x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          treeAt.add(k);
        }
      }
    }
  }

  {
    const strays = new Set();
    for (const f of features) {
      if (!isArea(f) || f.wild || f.ring) continue;
      const b = f.band || 6;
      const onRing = (x, y) => {
        const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
        if (e !== b - 1) return false;
        const vert = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
        return vert ? !(y % (TREE_STEP * 2)) : !(x % 3);
      };
      for (let y = f.y0; y <= f.y1; y++)
        for (let x = f.x0; x <= f.x1; x++) {
          const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
          if (e < b && !onRing(x, y)) strays.add(x + "," + y);
        }
    }
    if (strays.size) {
      fobjs = fobjs.filter(o => !strays.has(Math.floor(o.x / TS) + "," +
                                            Math.floor((o.y - 1) / TS)));
      for (const k of strays) {
        const [sx, sy] = k.split(",").map(Number);
        if (rockAt(sx, sy)) continue;          /* rock is not a stray tree */
        if (terr[sy * MW + sx] === WALL) terr[sy * MW + sx] = openTo(sy * MW + sx);
      }
    }
  }
  for (const f of features) {
    if (!isArea(f) || f.wild || f.ring) continue;
    const b = f.band || 6, si = NAME2I[STYLE_TREE[f.style || "spruce"]];
    if (si === undefined) continue;
    const x0 = f.x0 + b - 1, x1 = f.x1 - b + 1;
    const y0 = f.y0 + b - 1, y1 = f.y1 - b + 1;
    if (x1 <= x0 || y1 <= y0) continue;
    const want = [];
    for (let x = x0; x <= x1; x++)
      if (!(x % 3)) want.push([x, y0], [x, y1]);
    for (let y = y0; y <= y1; y++)
      if (!(y % (TREE_STEP * 2))) want.push([x0, y], [x1, y]);
    want.push([x0, y0], [x1, y0], [x0, y1], [x1, y1]);
    for (const [x, y] of want) {
      if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
        continue;
      const k = x + "," + y;
      if (treeAt.has(k) || felled.has(k)) continue;
      if (onBody(x, y)) continue;
      if (rockTiles.has(k)) continue;                 /* it is a cliff */
      if (!inTown(x, y) && !atOasis(x, y))
      if (!refusesTrunk(terr[y * MW + x]))
      terr[y * MW + x] = WALL;
      if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                   x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
      treeAt.add(k);
    }
  }

  {
    const keep = new Set(), claimed = new Set();
    const mark = (x, y, onLine) => {
      if (x < 0 || y < 0 || x >= MW || y >= MH) return;
      claimed.add(x + "," + y);
      if (onLine) keep.add(x + "," + y);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            if (Math.hypot(dx, dy) <= r + 4)
              keep.add((f.x + dx) + "," + (f.y + dy));
          }
        continue;
      }
      if (f.kind === "route") {
        const half = f.w >> 1;
        const reach = half + 1 + (f.band || 8);
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - reach;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + reach;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo; v <= hi; v++)
            for (let d = -reach; d <= reach; d++) {
              const x = vert ? line + d : v, y = vert ? v : line + d;
              mark(x, y, Math.abs(d) === half + 2);
            }
        }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        const out = b + 6;   /* far enough to catch the last of the scatter */
        for (let y = f.y0 - out; y <= f.y1 + out; y++)
          for (let x = f.x0 - out; x <= f.x1 + out; x++) {
            const e = Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y);
            if (e < b) mark(x, y, e === b - 1);
          }
      }
    }
    for (const o of objs) {
      const nm = NAMES[o.s], sp = SPR[nm];
      if (!sp || !/^(house|sh_house|barn|shed|coop|windmill|silo|mill|tower)/.test(nm))
        continue;
      for (let ty = Math.floor((o.y - sp[3] + 1) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
        for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
             tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
          keep.delete(tx + "," + ty), claimed.add(tx + "," + ty);
    }
    if (claimed.size) {
      const gone = [];
      fobjs = fobjs.filter(o => {
        const k = Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS);
        if (claimed.has(k) && !keep.has(k)) { gone.push(k); return false; }
        return true;
      });
      for (const k of gone) {
        const [gx, gy] = k.split(",").map(Number);
        if (terr[gy * MW + gx] === WALL) terr[gy * MW + gx] = openTo(gy * MW + gx);
      }
    }
  }

  {
    const want = new Set(), band = new Set();
    const structureKeep = new Set();
    const owner = new Map();
    const claim = (x, y, on, style) => {
      if (noPlant(x, y)) return;        /* a clearing: nothing is sown here */
      const k = x + "," + y;
      band.add(k);
      if (style !== undefined && !owner.has(k)) owner.set(k, style);
      if (on) want.add(k);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            const d = Math.hypot(dx, dy);
            if (d > r + 1.5 && d <= r + 3.5)
              claim(f.x + dx, f.y + dy, false, f.style);
          }
        const rr = r + 2.5, step = 3 / rr;
        for (let a = 0; a < Math.PI * 2 - 1e-9; a += step) {
          const x = f.x + Math.round(Math.cos(a) * rr);
          const y = f.y + Math.round(Math.sin(a) * rr);
          want.add(x + "," + y);
          owner.set(x + "," + y, f.style);
          band.add(x + "," + y);
        }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++) {
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) !== b - 1) continue;
            const vert = Math.min(x - f.x0, f.x1 - x) < Math.min(y - f.y0, f.y1 - y);
            claim(x, y, vert ? !(y % (TREE_STEP * 2)) : !(x % 3), f.style);
          }
      } else if (isArea(f) && f.no_trees) {
        const bb = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === bb - 1)
              structureKeep.add(x + "," + y);
        const b = f.band || 6;
        for (let y = f.y0 - b; y <= f.y1 + b; y++)
          for (let x = f.x0 - b; x <= f.x1 + b; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) < b)
              claim(x, y, false);
      } else if (f.kind === "route") {
        const half = f.w >> 1, over = half + 2;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
          const line = vert ? pa[0] : pa[1];
          if (f.style === "desert" || f.style === "volcano") continue;
          if (f.style === "blossom" || f.style === "spruce") continue;
          for (let v = lo; v <= hi; v++)
            for (const d of [-half - 2, half + 2])
              claim(vert ? line + d : v, vert ? v : line + d,
                    vert ? !(v % (TREE_STEP * 2)) : !(v % 3),
                    f.style);          /* the verge belongs to ITS road */
        }
      }
    }
    if (band.size) {
      fobjs = fobjs.filter(o => {
        const k = Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS);
        if (!band.has(k)) return true;
        if (!want.has(k)) return false;
        const own = owner.get(k);
        if (!own) return true;
        const wantSi = NAME2I[STYLE_TREE[own]];
        return wantSi === undefined || o.s === wantSi;
      });
      const here = new Set();
      for (const o of fobjs)
        here.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
      for (const k of want) {
        if (here.has(k) || felled.has(k)) continue;
        const [x, y] = k.split(",").map(Number);
        if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
        const cur = terr[y * MW + x];
        if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
          continue;
        const own = owner.get(k);
        const si = (own && NAME2I[STYLE_TREE[own]] !== undefined)
          ? NAME2I[STYLE_TREE[own]] : speciesNear(x, y);
        if (si === undefined || onBody(x, y)) continue;
        if (rockTiles.has(x + "," + y)) continue;     /* it is a cliff */
        if (!inTown(x, y) && !atOasis(x, y))
        if (!refusesTrunk(terr[y * MW + x]))
        terr[y * MW + x] = WALL;
        if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                     x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
        here.add(k);
      }
    }
  }

  {
    const AVENUE = { blossom: "blo_big", desert: "cactus1", spruce: "spr_big" };
    const placed = features.filter(f => isArea(f) && (f.place || f.label)
                                     && !sows(f.style));
    const townEdge = (x, y) => placed.some(
      a => x >= a.x0 - 3 && x <= a.x1 + 3 && y >= a.y0 - 3 && y <= a.y1 + 3);
    const REACH = 13;
    const legs = [];
    for (const f of features) {
      if (f.kind !== "route" || !AVENUE[f.style]) continue;
      const h = (f.w || 5) >> 1;
      for (const [pa, pb] of routeLegs(f))
        legs.push([pa[0], pa[1], pb[0], pb[1], h, f.style]);
    }
    if (legs.length) {
      const taken = new Set();
      for (const o of objs.concat(fobjs)) {
        const nm = NAMES[o.s] || "";
        if (/^(spr_|oak_|bir_|fru_|mw_|sh_|blo_|kt_)/.test(nm)) continue;
        taken.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
      }
      const box = legs.map(s => [Math.min(s[0], s[2]) - REACH, Math.min(s[1], s[3]) - REACH,
                                 Math.max(s[0], s[2]) + REACH, Math.max(s[1], s[3]) + REACH]);
      const mates = legs.map((_, i) => legs.filter((__, k) =>
        box[k][0] <= box[i][2] && box[k][2] >= box[i][0] &&
        box[k][1] <= box[i][3] && box[k][3] >= box[i][1]));
      const seen = new Set();
      for (let li = 0; li < legs.length; li++) {
        const b = box[li], near = mates[li];
        const ax = Math.max(1, b[0]), ay = Math.max(1, b[1]);
        const bx = Math.min(MW - 2, b[2]), by = Math.min(MH - 2, b[3]);
        for (let y = ay; y <= by; y++) {
          for (let x = ax; x <= bx; x++) {
            const cell = y * MW + x;
            if (seen.has(cell)) continue;
            seen.add(cell);
            const ground = terr[cell];
            if (ground !== GRASS && ground !== SAND) continue;
            let best = 1e9, half = 2, style = null;
            for (const s of near) {
              const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy;
              let t = l2 ? ((x - s[0]) * dx + (y - s[1]) * dy) / l2 : 0;
              t = t < 0 ? 0 : t > 1 ? 1 : t;
              const ex = x - (s[0] + t * dx), ey = y - (s[1] + t * dy);
              const d = ex * ex + ey * ey;
              if (d < best) { best = d; half = s[4]; style = s[5]; }
            }
            if (style === null) continue;
            if (inTownArea(x, y)) continue;
            if (townEdge(x, y)) continue;
            if (style === "blossom" && ground !== GRASS) continue;
            if (style === "spruce" && ground !== GRASS) continue;
            if (style === "desert" && ground !== SAND) continue;
            const nm = AVENUE[style], si = NAME2I[nm];
            if (si === undefined || !SPR[nm]) continue;
            const off = Math.sqrt(best) - half - 2;
            let row = -1;
            if (off >= -0.6 && off < 0.6) row = 0;
            else if (off >= 2.4 && off < 3.6) row = 1;
            else if (off >= 5.4 && off < 6.6) row = 2;
            if (row < 0) continue;
            if ((x + y + row * 2) % (TREE_STEP * 2)) continue;
            const k = x + "," + y;
            if (taken.has(k)) continue;
            taken.add(k);
            fobjs = fobjs.filter(o =>
              !(Math.floor(o.x / TS) === x && Math.floor((o.y - 1) / TS) === y
                && /^(spr_|oak_|bir_|fru_|mw_|sh_|blo_|kt_)/.test(NAMES[o.s] || "")));
            fobjs.push({ id: -1 - fobjs.length, s: si,
                         x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          }
        }
      }
    }
  }

  {
    const cov = new Set();
    for (const arr of [objs, fobjs])
      for (const o of arr) {
        const nm = NAMES[o.s], sp = SPR[nm];
        if (!sp || !/^(spr_|oak_|bir_|fru_|mw_|sh_|cliff_|waterfall|mtn_|shc_|shcap_)/.test(nm)) continue;
        for (let ty = Math.floor((o.y - sp[3]) / TS); ty <= Math.floor((o.y - 1) / TS); ty++)
          for (let tx = Math.floor((o.x - (sp[2] >> 1)) / TS);
               tx <= Math.floor((o.x + (sp[2] >> 1) - 1) / TS); tx++)
            cov.add(tx + "," + ty);
      }
    const structure = new Set();
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - 4); dy <= r + 4; dy++)
          for (let dx = Math.floor(-r - 4); dx <= r + 4; dx++) {
            const d = Math.hypot(dx, dy);
            if (d > r + 1.5 && d <= r + 3.5)
              structure.add((f.x + dx) + "," + (f.y + dy));
          }
      } else if (isArea(f) && !f.wild && !f.ring) {
        const b = f.band || 6;
        for (let y = f.y0; y <= f.y1; y++)
          for (let x = f.x0; x <= f.x1; x++)
            if (Math.min(x - f.x0, y - f.y0, f.x1 - x, f.y1 - y) === b - 1)
              structure.add(x + "," + y);
      } else if (f.kind === "route") {
        const half = f.w >> 1, over = half + 2;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - over;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + over;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo; v <= hi; v++)
            for (const d of [-half - 2, half + 2])
              structure.add((vert ? line + d : v) + "," + (vert ? v : line + d));
        }
      }
    }
    for (let y = RIM + 1; y < MH - RIM - 1; y++)
      for (let x = RIM + 1; x < MW - RIM - 1; x++) {
        const k = x + "," + y;
        const mayBuild = structure.has(k) && !felled.has(k) &&
                         !onBuilding(x * TS + TS / 2, y * TS + TS, SPR["spr_big"]);
        if (terr[y * MW + x] === GRASS && mayBuild) terr[y * MW + x] = WALL;
        if (terr[y * MW + x] !== WALL) continue;
        if (cov.has(k)) continue;
        if (rockAt(x, y)) continue;            /* a cliff is not loose structure */
        if (!mayBuild) { terr[y * MW + x] = openTo(y * MW + x); continue; }
      }
  }

  {
    const gone = [];
    fobjs = fobjs.filter(o => {
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      if (!onBody(x, y)) return true;
      gone.push([x, y]);
      return false;
    });
    for (const [x, y] of gone)
      if (terr[y * MW + x] === WALL) terr[y * MW + x] = openTo(y * MW + x);
  }

  {
    const OUT = 5;
    const outside = new Map();
    const note = (x, y, d, vert, style, lo, hi, clean) => {
      if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) return;
      const slack = OUT + 4;
      const drawn = (lo === undefined) || (y >= lo - slack && y <= hi + slack);
      const k = x + "," + y;
      if (!outside.has(k) || outside.get(k)[0] > d)
        outside.set(k, [d, vert, drawn ? style : null, !!clean]);
    };
    for (const f of features) {
      if ((f.kind === "arena" || f.kind === "camp")) {
        const r = f.r || ARENA_R;
        for (let dy = Math.floor(-r - OUT - 4); dy <= r + OUT + 4; dy++)
          for (let dx = Math.floor(-r - OUT - 4); dx <= r + OUT + 4; dx++) {
            const d = Math.hypot(dx, dy) - (r + 3.5);
            if (d > 0 && d <= OUT)
              note(f.x + dx, f.y + dy, Math.round(d),
                   Math.abs(dx) > Math.abs(dy), f.style);
          }
      } else if (isArea(f) && !f.wild && !f.no_trees) {
        const b = f.band || 6;
        for (let y = f.y0 - OUT; y <= f.y1 + OUT; y++)
          for (let x = f.x0 - OUT; x <= f.x1 + OUT; x++) {
            const ox = Math.max(f.x0 - x, x - f.x1, 0);
            const oy = Math.max(f.y0 - y, y - f.y1, 0);
            let d, vert;
            if (ox || oy) {                      /* outside the rectangle */
              d = (b - 1) + Math.max(ox, oy);
              vert = ox >= oy;
            } else {                             /* inside, within the band */
              const ex = Math.min(x - f.x0, f.x1 - x);
              const ey = Math.min(y - f.y0, f.y1 - y);
              d = (b - 1) - Math.min(ex, ey);
              vert = ex <= ey;
            }
            if (d >= 1 && d <= OUT) note(x, y, d, vert, f.style);
          }
      } else if (f.kind === "route") {
        let drawnLo, drawnHi;
        if (f.drawn) {
          drawnLo = f.drawn[0]; drawnHi = f.drawn[1];
        } else if (f.pts && f.pts.length >= 2) {
          const py = f.pts.map(p => p[1]);
          drawnLo = Math.min.apply(null, py); drawnHi = Math.max.apply(null, py);
        } else {
          drawnLo = Math.min(f.y0, f.y1); drawnHi = Math.max(f.y0, f.y1);
        }
        const half = f.w >> 1, edge = half + 2;
        const cleanRoute = !f.style || f.style === "spruce" || f.style === "mystic";
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - edge;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + edge;
          const line = vert ? pa[0] : pa[1];
          for (let v = lo - OUT; v <= hi + OUT; v++)
            for (let o = 1; o <= OUT; o++)
              for (const side of [-1, 1]) {
                const dd = side * (edge + o);
                note(vert ? line + dd : v, vert ? v : line + dd, o, vert, f.style,
                     drawnLo, drawnHi, cleanRoute);
              }
        }
      }
    }
    for (const [k, [d, vert, style, clean]] of outside) {
      const [x, y] = k.split(",").map(Number);
      if (treeAt.has(k) || felled.has(k)) continue;
      if (inClearing(x, y) || onBody(x, y)) continue;
      const cur = terr[y * MW + x];
      if (cur === DIRT || cur === COBBLE || cur === PAVING2 || cur === MARBLE || cur === TERRACE || cur === BRIDGE || cur === WATER)
        continue;
      if (d !== 2 && d !== 4) continue;
      const along = vert ? y : x;            /* along the line it stands off */
      const step = vert ? TREE_STEP * 2 : 3; /* a column steps 4, a row steps 3 */
      const shift = (d === 2) ? (step >> 1) : 0;
      if (((along - shift) % step + step) % step) continue;
      if (d === 4 && !clean) {
        const hg = ((x * 374761393) ^ (y * 668265263)) >>> 0;
        if (hg % 100 >= 55) continue;        /* the outer one thins out */
      }
      const si = (style && NAME2I[STYLE_TREE[style]] !== undefined)
        ? NAME2I[STYLE_TREE[style]]
        : (mysticAreas.length || MD.mystic_above !== undefined
            ? NAME2I[STYLE_TREE[isMystic(x, y) ? (MD.mystic_style || "mystic")
                                                     : (MD.forest_style || "spruce")]]
            : speciesNear(x, y));
      if (si === undefined) continue;
      if (rockTiles.has(k)) continue;               /* it is a cliff */
      const off = wobble(x, y);
      if (!inTown(x, y) && !atOasis(x, y))
      if (!refusesTrunk(terr[y * MW + x]))
      terr[y * MW + x] = WALL;
      if (!(baseTerr && SAND !== undefined && sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })))
    fobjs.push({ id: -1 - fobjs.length, s: si,
                   x: x * TS + TS / 2 + off[0], y: y * TS + TS + off[1], feat: 1 });
      treeAt.add(k);
    }
  }

  if (MD.felled && MD.felled.length) {
    const gone = new Set(MD.felled.map(f => f[0] + "," + f[1]));
    fobjs = fobjs.filter(o =>
      !gone.has(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS)));
  }

  {
    const mystic = [];
    for (const f of features)
      if (f.kind === "area" && /shroom|mystic|spore/i.test(
            (f.style || "") + " " + (f.label || "")))
        mystic.push(f);
    const inMystic = (x, y) => mystic.some(f =>
      x >= f.x0 && x <= f.x1 && y >= f.y0 && y <= f.y1);
    fobjs = fobjs.filter(o => {
      if (!/^mw_/.test(NAMES[o.s] || "")) return true;
      return inMystic(Math.floor(o.x / TS), Math.floor((o.y - 1) / TS));
    });
  }

  {
    let opened = 0;
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const i2 = y * MW + x;
        if (terr[i2] !== WALL) continue;
        if (rockTiles && rockTiles.has(x + "," + y)) continue;
        const gapHere = (MD.gaps || []).some(
          b => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3]);
        if (!gapHere && treeAt && treeAt.has(x + "," + y)) continue;
        const road = onRoute(x, y) || gapHere || inScene(x, y);
        if (!road && !inDesert(x, y)) continue;
        terr[i2] = (baseTerr && baseTerr[i2] !== WALL) ? baseTerr[i2]
                 : (road ? GRASS : SAND);
        opened++;
      }
    globalThis.__blankWalls = opened;
  }
  for (const f of features) {
    const isA = f.kind === "area" || f.kind === "town";
    if (!isA && f.kind !== "route") continue;
    if (!f.style || !STYLE_TREE[f.style] || f.wild) continue;
    const m3 = isA ? 5 : (f.band || 20);
    const boxes = isA
      ? [[f.x0, f.y0, f.x1, f.y1]]
      : (f.pts || [[f.x0, f.y0], [f.x1, f.y1]]).slice(0, -1).map((p, i) => {
          const q = (f.pts || [[f.x0, f.y0], [f.x1, f.y1]])[i + 1];
          return [Math.min(p[0], q[0]), Math.min(p[1], q[1]),
                  Math.max(p[0], q[0]), Math.max(p[1], q[1])];
        });
    for (const o of fobjs) {
      const nm = NAMES[o.s];
      if (!/^(spr|oak|bir|fru|mw)_/.test(nm)) continue;
      const x = Math.floor(o.x / TS), y = Math.floor((o.y - 1) / TS);
      if (!boxes.some(b => x >= b[0] - m3 && x <= b[2] + m3
                        && y >= b[1] - m3 && y <= b[3] + m3))
        continue;
      const sp2 = STYLE_TREE[f.style];
      const nm2 = Array.isArray(sp2)
        ? sp2[(() => { let q = ((x * 374761393) ^ (y * 668265263)) >>> 0;
             q ^= q >>> 15; q = Math.imul(q, 2246822519) >>> 0;
             q ^= q >>> 13; q = Math.imul(q, 3266489917) >>> 0;
             return (q ^ (q >>> 16)) >>> 0; })() % sp2.length]
        : sp2;
      if (NAME2I[nm2] !== undefined) o.s = NAME2I[nm2];
    }
  }
  {
    const floor0 = MD.nogrow_below;
    const kept = [];
    let felledIn = 0;
    for (const o of fobjs) {
      const ox = Math.floor(o.x / TS), oy = Math.floor((o.y - 1) / TS);
      if (onRoute(ox, oy)) { felledIn++; continue; }
      if (ox >= 0 && oy >= 0 && ox < MW && oy < MH
          && terr[oy * MW + ox] === DECK) { felledIn++; continue; }
      if (inScene(ox, oy)) { felledIn++; continue; }
      if (oy >= 0 && ox >= 0 && ox < MW && oy < MH
          && terr[oy * MW + ox] === SEA) { felledIn++; continue; }
      const onRouteBand = features.some(rf => {
        if (rf.kind !== "route") return false;
        const reach = (rf.band || 20) + ((rf.w || 5) >> 1) + 2;
        for (const [pa, pb] of routeLegs(rf)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - reach;
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + reach;
          const along = vert ? oy : ox, across = vert ? ox : oy;
          if (along >= lo && along <= hi &&
              Math.abs(across - (vert ? pa[0] : pa[1])) <= reach) return true;
        }
        return false;
      });
      if (floor0 !== undefined && oy >= floor0 && !onRouteBand
          && !features.some(af => (af.kind === "area" || af.kind === "town")
                                  && ox >= af.x0 - 2 && ox <= af.x1 + 2
                                  && oy >= af.y0 - 2 && oy <= af.y1 + 2)) {
        felledIn++;
        continue;
      }
      kept.push(o);
    }
    if (felledIn) fobjs = kept;
  }
  {
    const swampStyles = [];
    for (const f of features)
      if (f.kind === "route" && f.style === "swamp") swampStyles.push(f);
    if (swampStyles.length && Array.isArray(STYLE_TREE.swamp)) {
      const pool = STYLE_TREE.swamp.map(n => NAME2I[n]);
      const small = (STYLE_TREE.swamp_small || []).map(n => NAME2I[n])
                      ;
      const isSw = new Set(pool.concat(small));
      const at = new Map();                     /* tile key -> species index */
      const mine = [];
      for (const o of fobjs) {
        if (!isSw.has(o.s)) continue;
        const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
        mine.push({ o: o, tx: tx, ty: ty });
      }
      mine.sort((a, b) => a.ty - b.ty || a.tx - b.tx);
      let moved = 0;
      for (const m of mine) {
        const big = pool.indexOf(m.o.s);
        const set = big >= 0 ? pool : small;
        if (set.length < 2) { at.set(m.ty * MW + m.tx, m.o.s); continue; }
        const clash = s => {
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              if (!dx && !dy) continue;
              if (at.get((m.ty + dy) * MW + (m.tx + dx)) === s) return true;
            }
          return false;
        };
        if (clash(m.o.s)) {
          const from = Math.max(0, set.indexOf(m.o.s));
          for (let k = 1; k <= set.length; k++) {
            const cand = set[(from + k) % set.length];
            if (!clash(cand)) { m.o.s = cand; moved++; break; }
          }
        }
        at.set(m.ty * MW + m.tx, m.o.s);
      }
    }
  }
  if (NAME2I.wf_pine1 !== undefined && NAME2I.wf_tree1 !== undefined) {
    const winAreas = features.filter(f => f.style === "winter" && f.kind !== "route"
                                          && f.x0 !== undefined);
    if (winAreas.length) {
      const pine = NAME2I.wf_pine1, avenue = NAME2I.wf_tree1;
      for (const o of fobjs) {
        if (o.s !== avenue) continue;
        const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
        for (const a of winAreas) {
          const b = (a.band || 6) + 2;
          if (tx >= a.x0 - b && tx <= a.x1 + b && ty >= a.y0 - b && ty <= a.y1 + b) {
            o.s = pine; break;
          }
        }
      }
    }
  }
  if (typeof inVolcano === "function") {
    const VOLC_KEEP = new RegExp("^(" + PLACED + ")");
    const sweep = (tx, ty, s) =>
      inVolcano(tx, ty) && !VOLC_KEEP.test(NAMES[s] || "");
    if (typeof scat !== "undefined" && scat && scat.length) {
      const ks = [];
      for (let i = 0; i + 2 < scat.length; i += 3) {
        const tx = Math.floor(scat[i + 1] / TS), ty = Math.floor((scat[i + 2] - 1) / TS);
        if (sweep(tx, ty, scat[i])) continue;
        ks.push(scat[i], scat[i + 1], scat[i + 2]);
      }
      if (ks.length !== scat.length) scat = ks;
    }
    if (typeof sanm !== "undefined" && sanm && sanm.length) {
      const ks = [];
      for (let i = 0; i + 2 < sanm.length; i += 3) {
        const tx = Math.floor(sanm[i + 1] / TS), ty = Math.floor((sanm[i + 2] - 1) / TS);
        if (sweep(tx, ty, sanm[i])) continue;
        ks.push(sanm[i], sanm[i + 1], sanm[i + 2]);
      }
      if (ks.length !== sanm.length) sanm = ks;
    }
    const keep = [];
    for (const o of fobjs) {
      const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
      if (sweep(tx, ty, o.s)) continue;
      keep.push(o);
    }
    if (keep.length !== fobjs.length) fobjs = keep;
    const ko = objs.filter(o => !sweep(Math.floor(o.x / TS),
                                       Math.floor((o.y - 1) / TS), o.s));
    if (ko.length !== objs.length) objs = ko;
    if (typeof fsanim !== "undefined" && fsanim && fsanim.length) {
      const ks = [];
      for (let i = 0; i + 2 < fsanim.length; i += 3) {
        const tx = Math.floor(fsanim[i + 1] / TS), ty = Math.floor((fsanim[i + 2] - 1) / TS);
        if (sweep(tx, ty, fsanim[i])) continue;
        ks.push(fsanim[i], fsanim[i + 1], fsanim[i + 2]);
      }
      if (ks.length !== fsanim.length) fsanim = ks;
    }
  }
  {
    const CLEAR = [
      [806, 132, 826, 150],          /* where Route 3 leaves Forgewick */
      [2622, 156, 2640, 170],
      [2447, 355, 2452, 408],
      [2437, 400, 2441, 408],
    ];
    const BELTS = [
      { x0: 679, y0: 118, x1: 818, y1: 152 },   /* Forgewick */
      { x0: 330, y0: 300, x1: 520, y1: 334 },   /* the range above Forgefalls */
    ];
    const onARoad = (x, y) => {
      if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
      const v = terr[y * MW + x];
      return v === DIRT || v === COBBLE || v === ROADSAND || v === PAVING2;
    };
    const BELT = BELTS[0];
    const FADE = { x0: 925, x1: 1010, y0: 120, y1: 160 };
    const isTree = (nm) =>
      /^(wf_pine|wf_tree|sw_tree|oak_|spr_|bir_|fru_|mw_|sh_|kt_|blo_|deadtree|halfdead|deadbush)/.test(nm);
    const isDead = (nm) => /^(deadtree|halfdead|deadbush)/.test(nm);
    const scat2mtn = () => {
      const out = [];
      const q = MD.scatter;
      if (!q || !q.p) return out;
      const bb = atob(q.p);
      let s2 = 0, x2 = 0, y2 = 0, i2 = 0, f2 = 0, acc = 0, sh = 0;
      while (i2 < bb.length) {
        const c = bb.charCodeAt(i2++);
        acc |= (c & 127) << sh;
        if (c & 128) { sh += 7; continue; }
        const dd = (acc >>> 1) ^ -(acc & 1); acc = 0; sh = 0;
        if (f2 === 0) { s2 += dd; f2 = 1; }
        else if (f2 === 1) { x2 += dd; f2 = 2; }
        else {
          y2 += dd; f2 = 0;
          if (/^mtn/.test(NAMES[s2] || ""))
            out.push({ x: Math.round(x2 / TS), y: Math.round(y2 / TS) });
        }
      }
      return out;
    };
    const felledAt = new Set();
    const unplant = (tx, ty) => {
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return;
      if (rockTiles && rockTiles.has(tx + "," + ty)) return;   /* real cliff */
      const i = ty * MW + tx;
      felledAt.add(i);
      if (terr[i] === WALL)
        terr[i] = (baseTerr && baseTerr[i] !== WALL) ? baseTerr[i] : GRASS;
    };
    fobjs = fobjs.filter(o => {
      const nm = NAMES[o.s] || "";
      if (!isTree(nm)) return true;
      const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
      if (CLEAR.some(c => tx >= c[0] && tx <= c[2] && ty >= c[1] && ty <= c[3])) {
        unplant(tx, ty); return false;
      }
      if (BELTS.some(b => tx >= b.x0 && tx <= b.x1 && ty >= b.y0 && ty <= b.y1)) {
        unplant(tx, ty); return false;
      }
      if (tx >= FADE.x0 && tx <= FADE.x1 && ty >= FADE.y0 && ty <= FADE.y1) {
        const t = (tx - FADE.x0) / (FADE.x1 - FADE.x0);
        const h = (((tx * 73856093) ^ (ty * 19349663)) >>> 0) % 100 / 100;
        const keep = isDead(nm) ? h < t : h > t;
        if (!keep) unplant(tx, ty);
        return keep;
      }
      return true;
    });
    {
      const si = NAME2I.oak_big;
      if (si !== undefined) {
        const artFoot = {};
        for (const o of objs.concat(fobjs)) {
          if (!/^mtn/.test(NAMES[o.s] || "")) continue;
          const ax = Math.round(o.x / TS), ay = Math.round(o.y / TS);
          if (artFoot[ax] === undefined || ay > artFoot[ax]) artFoot[ax] = ay;
        }
        {
          const sc = MD.scatter;
          const sl = (sc && sc.p) ? null : sc;
          if (Array.isArray(sl))
            for (let k = 0; k + 2 < sl.length; k += 3) {
              if (!/^mtn/.test(NAMES[sl[k]] || "")) continue;
              const ax = Math.round(sl[k + 1] / TS), ay = Math.round(sl[k + 2] / TS);
              if (artFoot[ax] === undefined || ay > artFoot[ax]) artFoot[ax] = ay;
            }
        }
        for (const o of scat2mtn()) {
          if (artFoot[o.x] === undefined || o.y > artFoot[o.x]) artFoot[o.x] = o.y;
        }
        const footOf = (x, B) => {
          B = B || BELT;
          let y = B.y0;
          while (y <= B.y1 && terr[y * MW + x] !== WALL) y++;
          if (y <= B.y1) {
            while (y <= B.y1 && terr[y * MW + x] === WALL) y++;
            if (y <= B.y1) return y;
          }
          const a = artFoot[x];
          return (a !== undefined && a >= B.y0 && a <= B.y1) ? a + 1 : -1;
        };
        const typicalNear = (x, B) => {
          const near = [];
          for (let k = x - 12; k <= x + 12; k++) {
            if (k < B.x0 || k > B.x1) continue;
            const v = footOf(k, B);
            if (v > 0) near.push(v);
          }
          if (!near.length) return -1;
          near.sort((a, b) => a - b);
          return near[near.length >> 1];
        };
        const wet = [];
        {
          const sa = MD.sanim || [];
          for (let k = 0; k + 2 < sa.length; k += 3)
            if (/waterfall|vfall/.test(NAMES[sa[k]] || ""))
              wet.push(Math.round(sa[k + 1] / TS));
        }
        const atWater = (x) => wet.some(w => Math.abs(x - w) <= 4);
        for (const B of BELTS)
        for (let x = B.x0; x <= B.x1; x += 2) {
          if (atWater(x)) continue;
          let y = footOf(x, B);
          if (y >= 0 && onARoad(x, y)) continue;
          if (y < 0) continue;
          const typical = typicalNear(x, B);
          const off = typical > 0 ? Math.abs(y - typical) : 0;
          if (typical > 0 && off > 1 && off <= 3) y = typical;
          if (onARoad(x, y)) continue;
          fobjs.push({ id: -1 - fobjs.length, s: si,
                       x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
          blockTiles.push(y * MW + x);      /* its trunk, as any tree's is */
          felledAt.delete(y * MW + x);
        }
      }
    }
    if (felledAt.size) blockTiles = blockTiles.filter(i => !felledAt.has(i));
    {
      const FACE = NAME2I["sw_tree1_2"];
      for (const f of features) {
        if (f.kind !== "route" || f.style !== "swamp") continue;
        const half = (f.w || 5) >> 1;
        for (const [pa, pb] of routeLegs(f)) {
          const vert = pa[0] === pb[0];
          const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]) - 2;
          const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]) + 2;
          const ct = vert ? pa[0] : pa[1];
          for (const o of fobjs) {
            const nm = NAMES[o.s] || "";
            if (!/^sw_tree/.test(nm) || o.s === FACE) continue;
            const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
            const al = vert ? ty : tx, ac = vert ? tx : ty;
            if (al < lo || al > hi) continue;
            const off = ac - ct;
            if (Math.abs(off) > half + 1) continue;      /* already clear */
            const side = off === 0 ? ((al % 2) ? 1 : -1) : Math.sign(off);
            let put = null;
            for (const want of [half + 3, half + 4, half + 5, half + 2]) {
              const cand = ct + side * want;
              const cx = vert ? cand : al, cy = vert ? al : cand;
              if (cx < 1 || cy < 1 || cx >= MW - 1 || cy >= MH - 1) continue;
              if (terr[cy * MW + cx] !== GRASS) continue;
              put = [cx, cy]; break;
            }
            if (!put) continue;
            o.x = put[0] * TS + TS / 2;
            o.y = (put[1] + 1) * TS;
          }
        }
      }
    }
    const SPECIES_BOX = [
      { x0: 393, y0: 165, x1: 400, y1: 248, tree: "bir_big" },
      { x0: 351, y0: 245, x1: 397, y1: 256, tree: "bir_big" },
    ];
    for (const b of SPECIES_BOX) {
      const si = NAME2I[b.tree];
      if (si === undefined) continue;
      for (const o of fobjs) {
        const nm = NAMES[o.s] || "";
        if (!/^(oak_|bir_|spr_|fru_|mw_|kt_)/.test(nm) || o.s === si) continue;
        const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
        if (tx < b.x0 || tx > b.x1 || ty < b.y0 || ty > b.y1) continue;
        o.s = si;
      }
    }
    {
      const SPECIES = /^(oak_|bir_|spr_|fru_|mw_|kt_)/;
      const SWEEP_SKIP = [
        { x0: 1, y0: 241, x1: 72, y1: 403 },      /* the Northern Woods */
        { x0: 0, y0: 404, x1: 62, y1: 453 },      /* Millwood, spruce as well */
      ];
      const skipHere = (x, y) => SWEEP_SKIP.some(
        b => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1);
      const firstOf = (v) => Array.isArray(v) ? v[0]
                           : (typeof v === "string" ? v.split(",")[0] : null);
      for (const ft of features) {
        if (ft.kind !== "route") continue;
        if (ft.style === "blossom" || ft.style === "swamp" ||
            ft.style === "desert" || ft.style === "volcano") continue;
        const want = firstOf(STYLE_TREE[ft.style]);
        const si = want && NAME2I[want];
        if (si === undefined) continue;
        const half = (ft.w || 5) >> 1, reach = half + 3;
        for (const [pa, pb] of routeLegs(ft)) {
          const vert = pa[0] === pb[0];
          const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
          const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
          const line = vert ? pa[0] : pa[1];
          for (const o of fobjs) {
            const nm = NAMES[o.s] || "";
            if (!SPECIES.test(nm) || o.s === si) continue;
            const tx = Math.round(o.x / TS), ty = Math.round((o.y - 1) / TS);
            const al = vert ? ty : tx, ac = vert ? tx : ty;
            if (al < lo || al > hi) continue;
            if (Math.abs(ac - line) > reach) continue;
            if (skipHere(tx, ty)) continue;      /* already settled */
            o.s = si;                  /* the road's own tree, in its place */
          }
        }
      }
    }
    {
      const si = NAME2I.oak_big;
      const road = features.find(f => f.kind === "route" && f.road === "Route 3" &&
                                      f.style === "oak");
      if (si !== undefined) {
        const FILL = [
          { x: 686, y0: 129, y1: 158 },
          { x: 687, y0: 129, y1: 158 },
          { x: 688, y0: 129, y1: 158 },
          { x: 689, y0: 129, y1: 158 },
          { y: 132, x0: 812, x1: 836 },   /* mountain down to the road */
          { y: 133, x0: 812, x1: 836 },
          { y: 147, x0: 812, x1: 836 },   /* the road down to the town */
          { y: 148, x0: 812, x1: 836 },
        ];
        for (const b of FILL)
          for (let v = (b.x !== undefined ? b.y0 : b.x0);
               v <= (b.x !== undefined ? b.y1 : b.x1); v++) {
            const x = b.x !== undefined ? b.x : v;
            const y = b.x !== undefined ? v : b.y;
            if ((x + y) % 2) continue;
            if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
            if (terr[y * MW + x] !== GRASS) continue;
            fobjs.push({ id: -1 - fobjs.length, s: si,
                         x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
            terr[y * MW + x] = WALL;
            blockTiles.push(y * MW + x);
          }
      }
      if (si !== undefined && road) {
        for (const [pa, pb] of routeLegs(road)) {
          const vert = pa[0] === pb[0];
          const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0]));
          const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0]));
          const line = vert ? pa[0] : pa[1];
          const half = ((road.w || 5) >> 1) + 2;
          for (let v = lo; v <= hi; v += 2)
            for (const side of [-1, 1])
              for (let row = 0; row < 2; row++) {
                const off = (half + 1 + row * 2) * side;
                const x = vert ? line + off : v;
                const y = vert ? v : line + off;
                if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
                if (terr[y * MW + x] !== GRASS) continue;
                if (inTownArea(x, y)) continue;
                if (row && (v + x) % 4) continue;
                fobjs.push({ id: -1 - fobjs.length, s: si,
                             x: x * TS + TS / 2, y: y * TS + TS, feat: 1 });
                terr[y * MW + x] = WALL;
                blockTiles.push(y * MW + x);
              }
        }
      }
    }
    {
      let cleared = 0;
      for (let y = BELT.y0; y <= BELT.y1; y++)
        for (let x = BELT.x0; x <= BELT.x1; x++) {
          const i = y * MW + x;
          if (terr[i] !== WALL) continue;
          if (rockTiles && rockTiles.has(x + "," + y)) continue;
          terr[i] = (baseTerr && baseTerr[i] !== WALL) ? baseTerr[i] : GRASS;
          cleared++;
        }
      if (cleared) blockTiles = blockTiles.filter(i => {
        const x = i % MW, y = (i - x) / MW;
        return !(x >= BELT.x0 && x <= BELT.x1 && y >= BELT.y0 && y <= BELT.y1);
      });
    }
  }
  /* A route's avenue should read as one unbroken line: forest down both
     verges with a tree every third tile. The normal passes get there by
     accident and miss in two ways -- inside a town region the route lays
     plain grass and never marks the verge as forest, and where the verge IS
     forest the planting pass can still decline the tile because something
     else claimed it. Route 4 was bare for its whole run past Forgewick and
     patchy again on the approach to the sand.

     This runs dead last, after every other terrain pass, because earlier
     attempts were laid correctly and then flattened again further down.
     Road crossings, water and clearings are left alone so junctions stay
     open. Sand keeps its own floor: a dead avenue, not a green one. */
  /* treeAt marks a tile even when the tree it stood for was never actually
     pushed, so it cannot be used to tell an occupied verge from an empty one.
     Go by what is really standing there. */
  const standing = new Set(objs.concat(fobjs).map(
    o => Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS)));
  const SWAMP_VERGE_SAFE = ["sw_tree2_3", "sw_tree3_3", "sw_tree4_3"];
  for (const f of features) {
    if (f.kind !== "route" || !sows(f.style)) continue;
    const off = (f.w >> 1) + 2;
    const sp0 = f.style === "swamp" ? SWAMP_VERGE_SAFE : STYLE_TREE[f.style];
    for (const [pa, pb] of routeLegs(f)) {
      const vert = pa[0] === pb[0];
      const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
      const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
      const axis = vert ? pa[0] : pa[1];
      for (const sgn of [-1, 1])
        for (let v = lo; v <= hi; v++) {
          const x = vert ? axis + sgn * off : v;
          const y = vert ? v : axis + sgn * off;
          if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;
          const cur = terr[y * MW + x];
          if (cur === WATER || cur === BRIDGE || cur === DIRT || cur === COBBLE ||
              cur === PAVING2 || cur === MARBLE || cur === TERRACE ||
              cur === ROADSAND) continue;
          if (inClearing(x, y)) continue;
          if (cur === GRASS) { terr[y * MW + x] = WALL; blockTiles.push(y * MW + x); }
          const k = x + "," + y;
          if (standing.has(k)) continue;
          treeAt.delete(k);
          /* The verge outranks anything that claimed the tile, including the
             felled record -- Route 4's whole run past Forgewick is marked
             chopped in the shipped world data, which is why nothing would
             grow there however the terrain was laid. Trees felled anywhere
             off the verge still stay down. */
          glades.delete(k); taken.delete(k); felled.delete(k);
          const h = ((x * 374761393) ^ (y * 668265263)) >>> 0;
          const pick = Array.isArray(sp0) ? sp0[h % sp0.length] : sp0;
          let si = NAME2I[pick];
          /* Approaching the sand the ground refuses a living tree, which left
             a bare run where the oaks give out before the dead ones start.
             The avenue changes species there instead of leaving a hole. */
          if (typeof sandRefuses === "function" &&
              sandRefuses({ s: si, x: x * TS + TS / 2, y: y * TS + TS })) {
            const dead = STYLE_TREE.dying;
            if (dead) si = NAME2I[Array.isArray(dead) ? dead[h % dead.length] : dead];
          }
          if (putTree(x, y, si, { edge: true, ring: true, vertical: vert }))
            standing.add(k);
        }
    }
  }

  repairArenaTreeEdges();
  clearForgefallsCliffTrees();
  chunks.clear();
  indexDecks();
  reindex();
  refreshBuild();
}

/* Explicit arena rings run after route/biome cleanup so their trees survive. */
function repairArenaTreeEdges() {
  if (MAPID !== "world") return;
  const rings=features.filter(f=>f.kind==="arena"||f.kind==="camp");
  const vegetation=/^(oak_|bir_|spr_|fru_|mw_tree|kt_tree|blo_|sw_tree|wf_tree|wf_pine|cactus|deadtree|halfdead|vplant)/;
  const living=objs.filter(o=>!hidden.has(o.id)).concat(fobjs);
  const routes=features.filter(f=>f.kind==="route").flatMap(f=>routeLegs(f).map(([a,b])=>({a,b,gap:((f.w||5)>>1)+0.75})));
  const onEntrance=(x,y)=>routes.some(({a,b,gap})=>{
    const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(len||1)));
    return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)<=gap;
  });
  let nextId=Math.min(-1,...fobjs.map(o=>o.id).filter(Number.isFinite))-1;
  for(const a of rings) {
    const r=a.r||ARENA_R,rr=r+2.5;
    const style=a.style==="volcano"||a.style==="desert"?a.style:
      inWinter(a.x,a.y)?"winter":(a.style||MD.forest_style||"spruce");
    const choices=style==="volcano"?["deadtree0","halfdead0"]:
      style==="swamp"?STYLE_TREE.swamp_safe:STYLE_TREE[style];
    const names=Array.isArray(choices)?choices:[choices];
    const nearby=living.filter(o=>vegetation.test(NAMES[o.s]||"")&&Math.hypot(o.x/TS-a.x,(o.y-1)/TS-a.y)<r+7);
    const seen=new Set(),count=Math.ceil(2*Math.PI*rr/2);
    for(let j=0;j<count;j++) {
      const angle=j*2*Math.PI/count,x=Math.round(a.x+Math.cos(angle)*rr),y=Math.round(a.y+Math.sin(angle)*rr),key=x+","+y;
      if(seen.has(key))continue;seen.add(key);
      if(x<1||y<1||x>=MW-1||y>=MH-1||onEntrance(x,y))continue;
      if(rings.some(b=>b!==a&&Math.hypot(x-b.x,y-b.y)<(b.r||ARENA_R)+1.5))continue;
      if(rockTiles.has(key)||inClearing(x,y)||felledNew.includes(key))continue;
      const tile=terr[y*MW+x];
      if([WATER,DWATER,SEA,BRIDGE,DECK,COBBLE,PAVING2,MARBLE,TERRACE,ROADSAND].includes(tile))continue;
      if(nearby.some(o=>Math.hypot(o.x/TS-.5-x,o.y/TS-1-y)<1.7))continue;
      const nm=names[j%names.length],si=NAME2I[nm];if(si===undefined||!SPR[nm])continue;
      const o={id:nextId--,s:si,x:x*TS+TS/2,y:(y+1)*TS,feat:1,arenaEdge:a.id};
      if(sandRefuses(o))continue;
      // Restore shipped clearing marks at the border, not trees cut this session.
      felled.delete(key);
      fobjs.push(o);nearby.push(o);
      if(style!=="desert"&&style!=="volcano") {terr[y*MW+x]=WALL;blockTiles.push(y*MW+x);}
    }
  }
}

function clearForgefallsCliffTrees() {
  if (MAPID !== "world") return;
  const falls = features.find(f => f.kind === "landmark" && f.label === "Forgefalls");
  if (!falls) return;
  const cliff = objs.find(o => NAMES[o.s] === "cliff_fall" &&
    Math.abs(o.x / TS - falls.x) < 2 && Math.abs(o.y / TS - falls.y) < 2);
  const art = cliff && SPR.cliff_fall;
  if (!art) return;
  const left = cliff.x - art[2] / 2, right = cliff.x + art[2] / 2;
  const top = cliff.y - art[3];
  // Later forest/verge passes can plant inside the cliff after the belt is
  // cleared. Remove those trees last; retain the intended row at its foot.
  fobjs = fobjs.filter(o => {
    const name = NAMES[o.s] || "", sp = SPR[name];
    if (!/^(oak_|bir_|spr_|fru_|mw_|wf_pine|wf_tree)/.test(name) || !sp) return true;
    return !(o.y >= top && o.y <= cliff.y &&
      o.x + sp[2] / 2 > left && o.x - sp[2] / 2 < right);
  });
  // Keep cliff terrain and collision intact: only the stray artwork is gone.
}

const MAX_SIDE = 4000;
const MAX_AREA = 4000000;

function growWorld(needW, needH) {
  let nw = Math.max(MW, Math.min(MAX_SIDE, needW));
  let nh = Math.max(MH, Math.min(MAX_SIDE, needH));
  if (nw * nh > MAX_AREA) {
    if (nw > MW) nw = Math.max(MW, Math.floor(MAX_AREA / nh));
    if (nw * nh > MAX_AREA && nh > MH) nh = Math.max(MH, Math.floor(MAX_AREA / nw));
  }
  if (nw === MW && nh === MH) {
    if (needW > MW || needH > MH)
      toast("the world is as big as it goes: " + MW + "x" + MH +
            " (" + (MW * MH / 1e6).toFixed(1) + "M tiles)");
    return needW <= MW && needH <= MH;
  }
  const opened = [];
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++) {
      const onOldRim = (x < RIM || y < RIM || x >= MW - RIM || y >= MH - RIM);
      const nowInside = (nw > MW && x >= MW - RIM) || (nh > MH && y >= MH - RIM);
      if (onOldRim && nowInside && terr[y * MW + x] === WALL) {
        terr[y * MW + x] = openTo(y * MW + x); baseTerr[y * MW + x] = GRASS;
        opened.push([x, y]);
      }
    }
  const nt = new Uint8Array(nw * nh).fill(GRASS);
  const nb = new Uint8Array(nw * nh).fill(GRASS);
  for (let y = 0; y < MH; y++) {
    nt.set(terr.subarray(y * MW, y * MW + MW), y * nw);
    nb.set(baseTerr.subarray(y * MW, y * MW + MW), y * nw);
  }
  terr = nt; baseTerr = nb;
  for (const [ox, oy] of opened) felled.add(ox + "," + oy);
  MW = nw; MH = nh; PXW = MW * TS; PXH = MH * TS;
  sealRim();
  solid = new Uint8Array(MW * MH);
  chunks.clear();
  indexDecks();
  indexScatter();
  return true;
}

function contentExtent() {
  const BUILT = [DIRT, COBBLE, PAVING2, FARM, WATER, BRIDGE];
  let rx = 0, by = 0;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++)
    if (BUILT.includes(terr[y * MW + x])) { if (x > rx) rx = x; if (y > by) by = y; }
  for (const o of objs) {
    const tx = Math.floor(o.x / TS), ty = Math.floor((o.y - 1) / TS);
    if (tx > rx) rx = tx;
    if (ty > by) by = ty;
  }
  return [rx, by];
}

const WORK_MARGIN_X = 90, WORK_MARGIN_Y = 45;
function ensureWorkspace() {
  const [rx, by] = contentExtent();
  const wantW = Math.min(MAX_SIDE, rx + 1 + WORK_MARGIN_X);
  const wantH = Math.min(MAX_SIDE, by + 1 + WORK_MARGIN_Y);
  if (wantW <= MW && wantH <= MH) return false;
  growWorld(wantW, wantH);
  realizeFeatures();
  return true;
}

const RIM = 1;
function sealRim() {
  for (let y = 0; y < MH; y++)
    for (let x = 0; x < MW; x++)
      if (x < RIM || y < RIM || x >= MW - RIM || y >= MH - RIM) {
        const i = y * MW + x;
        if (terr[i] === GRASS) { terr[i] = WALL; baseTerr[i] = WALL; }
      }
}

const SNAP = 9;

function snapRoute(x0, y0, x1, y1) {
  const vert = x0 === x1;
  const notes = [];
  let line = vert ? x0 : y0;
  let lo = vert ? Math.min(y0, y1) : Math.min(x0, x1);
  let hi = vert ? Math.max(y0, y1) : Math.max(x0, x1);
  const startWasLo = (vert ? y0 : x0) <= (vert ? y1 : x1);

  let corner = null;
  for (const f of features) {
    if (f.kind !== "route") continue;
    for (const [ex, ey] of [[f.x0, f.y0], [f.x1, f.y1]]) {
      for (const which of ["lo", "hi"]) {
        const px = vert ? line : (which === "lo" ? lo : hi);
        const py = vert ? (which === "lo" ? lo : hi) : line;
        const d = Math.abs(px - ex) + Math.abs(py - ey);
        if (Math.abs(px - ex) <= SNAP && Math.abs(py - ey) <= SNAP &&
            (!corner || d < corner.d)) corner = { d, ex, ey, which };
      }
    }
  }
  if (corner) {
    line = vert ? corner.ex : corner.ey;
    const v = vert ? corner.ey : corner.ex;
    if (corner.which === "lo") lo = v; else hi = v;
    if (lo > hi) { const t2 = lo; lo = hi; hi = t2; }
    notes.push("cornered onto the last route");
  }

  let best = null;
  for (const f of features) {
    let c = null, label = null;
    if (isArea(f)) {
      const inRun = vert ? (lo <= f.y1 && hi >= f.y0) : (lo <= f.x1 && hi >= f.x0);
      if (inRun) { c = vert ? (f.x0 + f.x1) >> 1 : (f.y0 + f.y1) >> 1; label = "town centre"; }
    } else if ((f.x0 === f.x1) === vert) {
      c = vert ? f.x0 : f.y0; label = "route";
    }
    if (c === null) continue;
    const d = Math.abs(c - line);
    if (d && d <= SNAP && (!best || d < best.d)) best = { d, c, label };
  }
  if (best && !corner) { line = best.c; notes.push("lined up with " + best.label); }

  let tie0 = null, tie1 = null;
  for (const f of features) {
    if (!isArea(f)) continue;
    const across = vert ? (line >= f.x0 && line <= f.x1) : (line >= f.y0 && line <= f.y1);
    if (!across) continue;
    const near0 = vert ? f.y0 : f.x0, near1 = vert ? f.y1 : f.x1;
    if (Math.abs(hi - near0) <= SNAP && hi < near1) {
      hi = near0 + f.band;
      tie1 = { area: f.id, side: vert ? "n" : "w" };
      notes.push("tied to " + (f.label || "area"));
    } else if (Math.abs(lo - near1) <= SNAP && lo > near0) {
      lo = near1 - f.band;
      tie0 = { area: f.id, side: vert ? "s" : "e" };
      notes.push("tied to " + (f.label || "area"));
    }
  }

  const roadAt = (x, y) => {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return false;
    const t = terr[y * MW + x];
    return t === DIRT || t === COBBLE || t === PAVING2 || t === MARBLE || t === TERRACE || t === BRIDGE;
  };
  for (const end of ["lo", "hi"]) {
    const dir = end === "hi" ? 1 : -1;
    let v = end === "hi" ? hi : lo;
    for (let k = 1; k <= SNAP; k++) {
      const p = v + dir * k;
      const x = vert ? line : p, y = vert ? p : line;
      if (roadAt(x, y)) {
        if (end === "hi") hi = p; else lo = p;
        notes.push("joined the road");
        break;
      }
    }
  }

  if (corner) {
    const half = ROUTE_W >> 1;
    if (corner.which === "lo") lo -= half; else hi += half;
  }
  const c = vert ? [line, lo, line, hi] : [lo, line, hi, line];
  const swap = !startWasLo;
  return { coords: c.map(v => v - (v & 1)),
           a0: swap ? tie1 : tie0, a1: swap ? tie0 : tie1,
           note: [...new Set(notes)].join(", ") };
}

function areaAt(wx, wy) {
  const tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
  let best = null;
  for (const f of features) {
    if (!isArea(f)) continue;
    if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
    const a = (f.x1 - f.x0) * (f.y1 - f.y0);
    if (!best || a < best.a) best = { f, a };
  }
  return best && best.f;
}

function terrRLE(a) {
  const out = [];
  let v = a[0], c = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === v) { c++; continue; }
    out.push(v + "." + c); v = a[i]; c = 1;
  }
  out.push(v + "." + c);
  return out.join("|");
}

const RUN_SPR = /^(fence_|swall_|white_|pale_|sett_|rail_|mtn_)/;

function findRuns(pts) {
  const key = (x, y) => x + "," + y;
  const at = new Map(pts.map(p => [key(p.x, p.y), p]));
  const used = new Set();
  const runs = [];
  for (const dir of [[TS, 0], [0, TS]])
    for (const p of pts) {
      if (used.has(key(p.x, p.y))) continue;
      if (at.has(key(p.x - dir[0], p.y - dir[1]))) continue;   /* not the head */
      const line = [];
      let x = p.x, y = p.y;
      while (at.has(key(x, y)) && !used.has(key(x, y))) {
        line.push(at.get(key(x, y))); x += dir[0]; y += dir[1];
      }
      if (line.length >= 3) {
        line.forEach(q => used.add(key(q.x, q.y)));
        runs.push({ dir, line });
      }
    }
  return { runs, singles: pts.filter(p => !used.has(key(p.x, p.y))) };
}

function scaleAreaContents(oldB, newB, inset) {
  const pad = (inset || 0) * TS;
  const oi = { x0: oldB.x0 + pad, y0: oldB.y0 + pad,
               x1: oldB.x1 - pad, y1: oldB.y1 - pad };
  const ni = { x0: newB.x0 + pad, y0: newB.y0 + pad,
               x1: newB.x1 - pad, y1: newB.y1 - pad };
  const sx = (ni.x1 - ni.x0) / Math.max(1, oi.x1 - oi.x0);
  const sy = (ni.y1 - ni.y0) / Math.max(1, oi.y1 - oi.y0);
  const X = (x) => Math.round((ni.x0 + (x - oi.x0) * sx) / TS) * TS;
  const Y = (y) => Math.round((ni.y0 + (y - oi.y0) * sy) / TS) * TS;
  const inside = (x, y) => x >= oldB.x0 && x <= oldB.x1 &&
                           y >= oldB.y0 && y <= oldB.y1;

  const keep = [], mine = new Map();
  for (const o of objs) {
    if (!inside(o.x, o.y)) { keep.push(o); continue; }
    if (!mine.has(o.s)) mine.set(o.s, []);
    mine.get(o.s).push(o);
  }
  for (const [sIdx, pts] of mine) {
    if (!RUN_SPR.test(NAMES[sIdx] || "")) {
      for (const o of pts) { o.x = X(o.x); o.y = Y(o.y); keep.push(o); }
      continue;
    }
    const { runs, singles } = findRuns(pts);
    for (const o of singles) { o.x = X(o.x); o.y = Y(o.y); keep.push(o); }
    for (const { dir, line } of runs) {
      const a = line[0], b = line[line.length - 1];
      const x0p = X(a.x), y0p = Y(a.y), x1p = X(b.x), y1p = Y(b.y);
      const steps = Math.max(0, Math.round(
        dir[0] ? (x1p - x0p) / TS : (y1p - y0p) / TS));
      for (let k = 0; k <= steps; k++) {
        const o = line[k] || { id: nextId++, s: sIdx };
        o.s = sIdx;
        o.x = x0p + (dir[0] ? k * TS : 0);
        o.y = y0p + (dir[1] ? k * TS : 0);
        keep.push(o);
      }
    }
  }
  objs.length = 0; for (const o of keep) objs.push(o);
  MD.objs = [];
  for (const o of objs) MD.objs.push(o.s, o.x, o.y);

  for (const p of npcs) {
    if (!inside(p.x, p.y)) continue;
    const ox = ((p.x % TS) + TS) % TS, oy = ((p.y % TS) + TS) % TS;
    p.x = X(p.x - ox) + ox;
    p.y = Y(p.y - oy) + oy;
  }
  MD.npcs = npcs.map(p => ({ ...p }));

  for (const [live, mdKey] of [[scat, "scatter"], [sanm, "sanim"]]) {
    const out = [], grp = new Map();
    for (let i = 0; i < live.length; i += 3) {
      if (!inside(live[i + 1], live[i + 2])) {
        out.push(live[i], live[i + 1], live[i + 2]); continue;
      }
      if (!grp.has(live[i])) grp.set(live[i], []);
      grp.get(live[i]).push({ x: live[i + 1], y: live[i + 2] });
    }
    for (const [sIdx, pts] of grp) {
      if (!RUN_SPR.test(NAMES[sIdx] || "")) {
        for (const p of pts) out.push(sIdx, X(p.x), Y(p.y));
        continue;
      }
      const { runs, singles } = findRuns(pts);
      for (const p of singles) out.push(sIdx, X(p.x), Y(p.y));
      for (const { dir, line } of runs) {
        const a = line[0], b = line[line.length - 1];
        const x0p = X(a.x), y0p = Y(a.y), x1p = X(b.x), y1p = Y(b.y);
        const steps = Math.max(0, Math.round(
          dir[0] ? (x1p - x0p) / TS : (y1p - y0p) / TS));
        for (let k = 0; k <= steps; k++)
          out.push(sIdx, x0p + (dir[0] ? k * TS : 0), y0p + (dir[1] ? k * TS : 0));
      }
    }
    live.length = 0; for (const v of out) live.push(v);
    MD[mdKey] = live.slice();
  }

  const tb = { x0: Math.floor(oldB.x0 / TS), y0: Math.floor(oldB.y0 / TS),
               x1: Math.floor(oldB.x1 / TS), y1: Math.floor(oldB.y1 / TS) };
  const nb = { x0: Math.floor(newB.x0 / TS), y0: Math.floor(newB.y0 / TS),
               x1: Math.floor(newB.x1 / TS), y1: Math.floor(newB.y1 / TS) };
  const src = Uint8Array.from(baseTerr);
  const ow = tb.x1 - tb.x0, oh = tb.y1 - tb.y0;
  const nw2 = nb.x1 - nb.x0, nh2 = nb.y1 - nb.y0;
  const outsideVal = src[Math.min(MH - 1, tb.y1 + 2) * MW +
                         Math.min(MW - 1, tb.x1 + 2)];
  for (let ty = Math.min(tb.y0, nb.y0); ty <= Math.max(tb.y1, nb.y1); ty++)
    for (let tx = Math.min(tb.x0, nb.x0); tx <= Math.max(tb.x1, nb.x1); tx++) {
      if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
      if (tx >= nb.x0 && tx <= nb.x1 && ty >= nb.y0 && ty <= nb.y1) {
        const sxp = tb.x0 + Math.round((tx - nb.x0) * ow / Math.max(1, nw2));
        const syp = tb.y0 + Math.round((ty - nb.y0) * oh / Math.max(1, nh2));
        baseTerr[ty * MW + tx] =
          src[Math.min(MH - 1, Math.max(0, syp)) * MW +
              Math.min(MW - 1, Math.max(0, sxp))];
      } else {
        baseTerr[ty * MW + tx] = outsideVal;   /* a shrink gives ground back */
      }
    }
  MD.base_terr = terrRLE(baseTerr);
}

function relayNorthRidge(oldB, newB) {
  const rows = new Map();
  const keep = [];
  for (let i = 0; i < scat.length; i += 3) {
    const nm = NAMES[scat[i]] || "";
    const near = scat[i + 1] >= oldB.x0 - 6 * TS && scat[i + 1] <= oldB.x1 + 6 * TS &&
                 scat[i + 2] <= oldB.y0 && scat[i + 2] >= oldB.y0 - 14 * TS;
    if (!/^mtn_/.test(nm) || !near) {
      keep.push(scat[i], scat[i + 1], scat[i + 2]); continue;
    }
    if (!rows.has(scat[i + 2])) rows.set(scat[i + 2], []);
    rows.get(scat[i + 2]).push([scat[i], scat[i + 1]]);
  }
  if (!rows.size) return 0;
  scat.length = 0; for (const v of keep) scat.push(v);

  const dx0 = newB.x0 - oldB.x0, dx1 = newB.x1 - oldB.x1;
  const dy = newB.y0 - oldB.y0;
  let laid = 0;
  for (const [y, tiles] of rows) {
    tiles.sort((a, b) => a[1] - b[1]);
    const left = tiles[0], right = tiles[tiles.length - 1];
    const tally = new Map();
    for (const [sIdx] of tiles) tally.set(sIdx, (tally.get(sIdx) || 0) + 1);
    const mid = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const nx0 = left[1] + dx0, nx1 = right[1] + dx1, ny = y + dy;
    if (nx1 < nx0) continue;                 /* squeezed out of existence */
    scat.push(left[0], nx0, ny);
    for (let x = nx0 + TS; x < nx1 - 1; x += TS) scat.push(mid, x, ny);
    if (nx1 > nx0) scat.push(right[0], nx1, ny);
    laid += Math.round((nx1 - nx0) / TS) + 1;
  }
  MD.scatter = scat.slice();
  return laid;
}

function resizeArea(by) {
  if (!pickedArea) { toast("tap an area first"); return; }
  const f = pickedArea;
  const w = f.x1 - f.x0 + 1, h = f.y1 - f.y0 + 1;
  const nw = Math.max(TOWN_MIN, w + by * 2), nh = Math.max(TOWN_MIN, h + by * 2);
  if (nw === w && nh === h) { toast("that is as small as an area goes"); return; }
  const gw = nw - w, gh = nh - h;
  const x0 = f.x0 - (gw >> 1), y0 = f.y0 - (gh >> 1);
  const x1 = x0 + nw - 1, y1 = y0 + nh - 1;
  if (x0 < 2 || y0 < 2) { toast("that would go off the north or west edge"); return; }
  for (const o of features) {
    if (o === f || !isArea(o) || o.wild || f.wild) continue;
    if (x1 >= o.x0 - 2 && x0 <= o.x1 + 2 && y1 >= o.y0 - 2 && y0 <= o.y1 + 2) {
      toast("that would land on " + (o.label || "another area")); return;
    }
  }
  if (!growWorld(x1 + 3, y1 + 3)) return;
  buildUndo.push({ kind: "resize", id: f.id,
                   was: { x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1 },
                   objs: objs.map(o => ({ ...o })),
                   scatter: scat.slice(), sanim: sanm.slice(),
                   base_terr: MD.base_terr });
  const oldB = { x0: f.x0 * TS, y0: f.y0 * TS,
                 x1: (f.x1 + 1) * TS, y1: (f.y1 + 1) * TS };
  const newB = { x0: x0 * TS, y0: y0 * TS,
                 x1: (x1 + 1) * TS, y1: (y1 + 1) * TS };
  scaleAreaContents(oldB, newB, f.band || 0);
  const ridge = relayNorthRidge(oldB, newB);
  f.x0 = x0; f.y0 = y0; f.x1 = x1; f.y1 = y1;
  realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
  toast((f.label || "area") + " is now " + nw + " by " + nh +
        (ridge ? ", ridge re-laid" : ""));
}

function fitArea() {
  if (!pickedArea) { toast("tap an area first"); return; }
  const f = pickedArea;
  let x0 = f.x1, y0 = f.y1, x1 = f.x0, y1 = f.y0, found = false;
  for (let y = f.y0; y <= f.y1; y++)
    for (let x = f.x0; x <= f.x1; x++) {
      const t = terr[y * MW + x];
      if (t !== DIRT && t !== COBBLE && t !== PAVING2) continue;
      found = true;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  if (!found) { toast("no roads inside it to fit to"); return; }
  const b = (f.band || TOWN_BAND) + 2;
  x0 -= b; y0 -= b; x1 += b; y1 += b;
  const nw = Math.max(TOWN_MIN, x1 - x0 + 1), nh = Math.max(TOWN_MIN, y1 - y0 + 1);
  x1 = x0 + nw - 1; y1 = y0 + nh - 1;
  if (x0 < 2 || y0 < 2) { toast("that would go off the north or west edge"); return; }
  buildUndo.push({ kind: "resize", id: f.id,
                   was: { x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1 } });
  f.x0 = x0; f.y0 = y0; f.x1 = x1; f.y1 = y1;
  realizeFeatures(); rebuildBuckets(); rebuildSolid(); refreshBuild();
  toast((f.label || "area") + " pulled in to " + nw + " by " + nh);
}

function moveArea(f, dx, dy, silent) {
  dx -= dx & 1; dy -= dy & 1;                 /* stay on the 2-tile grid */
  if (!dx && !dy) return;
  const nx0 = f.x0 + dx, ny0 = f.y0 + dy, nx1 = f.x1 + dx, ny1 = f.y1 + dy;
  if (!silent && (nx0 < 2 || ny0 < 2)) {
    toast("can't move an area off the north or west edge"); return;
  }
  if (nx0 < 0 || ny0 < 0) return;
  for (const o of features) {
    if (o === f || !isArea(o)) continue;
    if (o.wild || f.wild) continue;
    if (nx1 >= o.x0 - 2 && nx0 <= o.x1 + 2 && ny1 >= o.y0 - 2 && ny0 <= o.y1 + 2) {
      if (!silent) toast("that would land on " + (o.label || "another area"));
      return;
    }
  }
  if (!growWorld(nx1 + 3, ny1 + 3)) return;

  if (f.carve === false) {
    const lift = [];
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        lift.push(baseTerr[y * MW + x]);
        baseTerr[y * MW + x] = GRASS;
      }
    let i = 0;
    for (let y = f.y0; y <= f.y1; y++)
      for (let x = f.x0; x <= f.x1; x++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < MW && ny < MH)
          baseTerr[ny * MW + nx] = lift[i];
        i++;
      }
  }

  const px = dx * TS, py = dy * TS;
  const within = (wx, wy) => {
    const tx = Math.floor(wx / TS), ty = Math.floor((wy - 1) / TS);
    return tx >= f.x0 && tx <= f.x1 && ty >= f.y0 && ty <= f.y1;
  };
  let carried = 0;
  for (const o of objs)
    if (within(o.x, o.y)) {
      o.x += px; o.y += py; carried++;
      if (o.id < ORIG.length) { ORIG[o.id].x += px; ORIG[o.id].y += py; }
    }
  for (const n of npcs)
    if (within(n.x, n.y)) { n.x += px; n.y += py; carried++; }
  for (const arr of [scat, sanm])
    for (let i = 0; i < arr.length; i += 3)
      if (within(arr[i + 1], arr[i + 2])) {
        arr[i + 1] += px; arr[i + 2] += py; carried++;
      }
  for (const d of decks)
    if (d.x0 >= f.x0 && d.x1 <= f.x1 && d.y0 >= f.y0 && d.y1 <= f.y1) {
      d.x0 += dx; d.x1 += dx; d.y0 += dy; d.y1 += dy; carried++;
    }
  indexScatter();
  f.x0 = nx0; f.y0 = ny0; f.x1 = nx1; f.y1 = ny1;
  if (!silent) buildUndo.push({ kind: "move", id: f.id, dx, dy });
  realizeFeatures();
  const tied = features.filter(r => r.kind === "route" &&
    ((r.a0 && r.a0.area === f.id) || (r.a1 && r.a1.area === f.id))).length;
  toast((f.label || "area") + " moved" + (carried ? ", " + carried + " things with it" : "") +
        (tied ? ", " + tied + " road" + (tied === 1 ? "" : "s") + " followed" : ""));
}

function sowDesertRoute(f) {
  const CAC = (ATLAS.styles.tree || {}).desert || [];
  const RK = (ATLAS.styles.foot || {}).desert || [];
  if (!CAC.length) return 0;
  const half = f.w >> 1, off = half + 2, offRock = half + 4;
  let put = 0;
  const done = new Set();
  for (const o of objs)
    done.add(Math.floor(o.x / TS) + "," + Math.floor((o.y - 1) / TS));
  for (const [pa, pb] of routeLegs(f)) {
    const vert = pa[0] === pb[0];
    const lo = (vert ? Math.min(pa[1], pb[1]) : Math.min(pa[0], pb[0])) - off;
    const hi = (vert ? Math.max(pa[1], pb[1]) : Math.max(pa[0], pb[0])) + off;
    const line = vert ? pa[0] : pa[1];
    const step = 1;
    for (let v = lo; v <= hi; v += step)
      for (const d of [-off, off, -offRock, offRock]) {
        const rock = Math.abs(d) === offRock;
        if (rock && ((v + (d < 0 ? 0 : 1)) % 2)) continue;
        const tx = vert ? line + d : v, ty = vert ? v : line + d;
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        if (terr[ty * MW + tx] !== SAND) continue;
        if (done.has(tx + "," + ty)) continue;
        let inRoad = false;
        for (const [qa, qb] of routeLegs(f)) {
          const qv = qa[0] === qb[0];
          const ql = qv ? Math.min(qa[1], qb[1]) : Math.min(qa[0], qb[0]);
          const qh = qv ? Math.max(qa[1], qb[1]) : Math.max(qa[0], qb[0]);
          const along = qv ? ty : tx, across = qv ? tx : ty;
          const centre = qv ? qa[0] : qa[1];
          if (along >= ql - half - 1 && along <= qh + half + 1
              && Math.abs(across - centre) <= half + 1) { inRoad = true; break; }
        }
        if (inRoad) continue;
        const h = ((tx * 2654435761) ^ (ty * 1597334677)) >>> 0;
        let nm = rock
          ? (RK.length ? RK[(h >>> 11) % RK.length] : null)
          : CAC[(h >>> 7) % CAC.length];
        if (!nm || NAME2I[nm] === undefined) continue;
        done.add(tx + "," + ty);
        objs.push({ id: objs.length, s: NAME2I[nm],
                    x: tx * TS + TS / 2 + (rock ? ((h >>> 17) % 7) - 3 : 0),
                    y: ty * TS + TS });
        put++;
      }
  }
  return put;
}

function styleAt(tx, ty) {
  let best = null, area = 1e9;
  for (const f of features) {
    if (f.x0 === undefined || !f.style) continue;
    if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
    const a = (f.x1 - f.x0 + 1) * (f.y1 - f.y0 + 1);
    if (a < area) { area = a; best = f; }
  }
  if (best) return best.style;
  const ti = ty * MW + tx;
  if (tx >= 0 && ty >= 0 && tx < MW && ty < MH
      && (terr[ti] === SAND || (baseTerr && baseTerr[ti] === SAND)))
    return "desert";
  return buildStyle;
}

function placeArena(wx, wy) {
  let tx = Math.floor(wx / TS), ty = Math.floor(wy / TS);
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return;
  const ROADS = [DIRT, COBBLE, PAVING2, MARBLE, TERRACE, ROADSAND, DECK,
                 VSTONE, VROCK, VCRACK, BRIDGE];
  if (!ROADS.includes(terr[ty * MW + tx])) {
    toast("tap the path inside a route"); return;
  }
  const paved = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH &&
                          ROADS.includes(terr[y * MW + x]);
  let wLo = tx, wHi = tx, hLo = ty, hHi = ty;
  while (paved(wLo - 1, ty)) wLo--;
  while (paved(wHi + 1, ty)) wHi++;
  while (paved(tx, hLo - 1)) hLo--;
  while (paved(tx, hHi + 1)) hHi++;
  if ((wHi - wLo) <= (hHi - hLo)) tx = (wLo + wHi) >> 1;   /* a vertical road */
  else ty = (hLo + hHi) >> 1;                              /* a horizontal one */
  for (const f of features)
    if ((f.kind === "arena" || f.kind === "camp") && Math.hypot(f.x - tx, f.y - ty) < (f.r || ARENA_R) * 2) {
      toast("there is already an arena here"); return;
    }
  const f = { id: featSeq++, kind: "arena", x: tx, y: ty, r: ARENA_R,
              style: styleAt(tx, ty) };
  features.push(f);
  buildUndo.push({ kind: "add", id: f.id });
  realizeFeatures();
  toast("arena cleared, " + (ARENA_R * 2) + " tiles across");
}

function moveRegion(r, dx, dy, silent) {
  if (!dx && !dy) return;
  const px = dx * TS, py = dy * TS;
  const inside = (wx, wy) => {
    const tx = Math.floor(wx / TS), ty = Math.floor((wy - 1) / TS);
    return tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1;
  };
  if (r.x0 + dx < 0 || r.y0 + dy < 0) { toast("that would go off the world"); return; }
  if (!growWorld(r.x1 + dx + 3, r.y1 + dy + 3)) return;

  const lift = [];
  for (let y = r.y0; y <= r.y1; y++)
    for (let x = r.x0; x <= r.x1; x++) {
      lift.push(baseTerr[y * MW + x]);
      baseTerr[y * MW + x] = GRASS;
    }
  let i = 0;
  for (let y = r.y0; y <= r.y1; y++)
    for (let x = r.x0; x <= r.x1; x++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < MW && ny < MH) baseTerr[ny * MW + nx] = lift[i];
      i++;
    }
  let n = 0;
  for (const o of objs)
    if (inside(o.x, o.y)) {
      o.x += px; o.y += py; n++;
      if (o.id < ORIG.length) { ORIG[o.id].x += px; ORIG[o.id].y += py; }
    }
  for (const p of npcs) if (inside(p.x, p.y)) { p.x += px; p.y += py; n++; }
  for (const arr of [scat, sanm])
    for (let k = 0; k < arr.length; k += 3)
      if (inside(arr[k + 1], arr[k + 2])) { arr[k + 1] += px; arr[k + 2] += py; n++; }
  for (const d of decks)
    if (d.x0 >= r.x0 && d.x1 <= r.x1 && d.y0 >= r.y0 && d.y1 <= r.y1) {
      d.x0 += dx; d.x1 += dx; d.y0 += dy; d.y1 += dy; n++;
    }
  if (!silent) {
    regionMoves.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, dx, dy });
    buildUndo.push({ kind: "region", i: regionMoves.length - 1 });
  }
  r.x0 += dx; r.x1 += dx; r.y0 += dy; r.y1 += dy;
  indexScatter(); indexDecks();
  realizeFeatures();
  toast("moved " + n + " things and the ground under them");
}

function unfell(x0, y0, x1, y1, pad) {
  let n = 0;
  for (let y = y0 - pad; y <= y1 + pad; y++)
    for (let x = x0 - pad; x <= x1 + pad; x++)
      if (felled.delete(x + "," + y)) {
        n++;
        const i = felledNew.indexOf(x + "," + y);
        if (i >= 0) felledNew.splice(i, 1);
      }
  return n;
}

function commitFeature() {
  const [ax, ay] = drawA, [bx, by] = drawB;
  const bend = drawPts.slice();
  drawA = drawB = null; drawPts = [];
  if (buildTool === "route") {
    if (bend.length > 1) {
      const path = bend.concat([[bx, by]]);
      for (let i = 1; i < path.length; i++) {      /* square every leg off */
        const a = path[i - 1], b = path[i];
        if (Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1])) b[1] = a[1];
        else b[0] = a[0];
      }
      const xs = path.map(p => p[0]), ys = path.map(p => p[1]);
      if (Math.min.apply(null, xs.concat(ys)) < (ROUTE_W >> 1) + 3) {
        toast("can't build off the north or west edge -- ask me to extend it");
        return;
      }
      const pad = ROUTE_W + ROUTE_BAND + 2;
      if (!growWorld(Math.max.apply(null, xs) + pad,
                     Math.max.apply(null, ys) + pad)) return;
      const nf = { id: featSeq++, kind: "route",
                   x0: path[0][0], y0: path[0][1],
                   x1: path[path.length - 1][0], y1: path[path.length - 1][1],
                   pts: path, w: ROUTE_W, band: ROUTE_BAND,
                   style: styleAt(Math.round(path[0][0]),
                                  Math.round(path[0][1])),
                   a0: null, a1: null };
      features.push(nf);
      buildUndo.push({ kind: "add", id: nf.id });
      if (nf.style === "desert") sowDesertRoute(nf);
      unfell(Math.min.apply(null, xs), Math.min.apply(null, ys),
             Math.max.apply(null, xs), Math.max.apply(null, ys), pad);
      worldChanged(); realizeFeatures(); rebuildBuckets(); rebuildSolid();
      toast("route drawn, " + (path.length - 1) + " legs in one line");
      return;
    }
    let [x0, y0, x1, y1] = straighten(ax, ay, bx, by);
    if (Math.min(x0, x1, y0, y1) < (ROUTE_W >> 1) + 3) {
      toast("can't build off the north or west edge -- ask me to extend it");
      return;
    }
    if (Math.abs(x1 - x0) + Math.abs(y1 - y0) < 6) { toast("route too short"); return; }
    const snapped = snapRoute(x0, y0, x1, y1);
    [x0, y0, x1, y1] = snapped.coords;
    const pad = ROUTE_W + ROUTE_BAND + 2;
    if (!growWorld(Math.max(x0, x1) + pad, Math.max(y0, y1) + pad)) return;
    features.push({ id: featSeq++, kind: "route", x0, y0, x1, y1,
                    w: ROUTE_W, band: ROUTE_BAND, style: buildStyle,
                    a0: snapped.a0 || null, a1: snapped.a1 || null });
    unfell(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1),
           ROUTE_W + ROUTE_BAND + 2);
    buildUndo.push({ kind: "add", id: features[features.length - 1].id });
    toast("route drawn, " + (Math.abs(x1 - x0) + Math.abs(y1 - y0)) + " tiles" +
          (snapped.note ? " -- " + snapped.note : ""));
  } else {
    let [x0, y0, x1, y1] = squareOf(ax, ay, bx, by);
    for (const f of features) {
      if (f.kind !== "route") continue;
      const vert = f.x0 === f.x1;
      const cx = (x0 + x1) >> 1, cy = (y0 + y1) >> 1;
      if (vert && Math.abs(f.x0 - cx) <= SNAP &&
          Math.max(f.y0, f.y1) >= y0 - SNAP && Math.min(f.y0, f.y1) <= y1 + SNAP) {
        const d = f.x0 - cx; x0 += d; x1 += d;
      } else if (!vert && Math.abs(f.y0 - cy) <= SNAP &&
                 Math.max(f.x0, f.x1) >= x0 - SNAP && Math.min(f.x0, f.x1) <= x1 + SNAP) {
        const d = f.y0 - cy; y0 += d; y1 += d;
      }
    }
    if (Math.min(x0, y0) < 2) {
      toast("can't build off the north or west edge -- ask me to extend it");
      return;
    }
    if (!growWorld(x1 + 3, y1 + 3)) return;
    features.push({ id: featSeq++, kind: "area", label: KINDS[areaKind],
                    x0, y0, x1, y1, band: TOWN_BAND, style: buildStyle,
                    houses: "wood" });
    unfell(x0, y0, x1, y1, 2);
    buildUndo.push({ kind: "add", id: features[features.length - 1].id });
    toast(KINDS[areaKind] + " drawn, " + (x1 - x0 + 1) + " tiles square");
  }
  realizeFeatures();
}

const NAME_A = ["Ash","Briar","Cold","Dun","Elder","Fen","Grey","Hollow","Iron",
                "Kelp","Mire","Nor","Oak","Pine","Quill","Raven","Stone","Thorn",
                "West","Yew"];
const NAME_B = ["fen","hold","mere","wick","ford","gate","barrow","reach",
                "crest","moor","vale","hollow"];
const GENERIC = ["town","graveyard","temple","camp","ruin","farmstead","area"];
const placeName = (id) =>
  NAME_A[id % NAME_A.length] + NAME_B[((id / NAME_A.length) | 0) % NAME_B.length];

function standNear(x, y) {
  if (!solid[y * MW + x]) return { x, y };
  for (let r = 1; r < 40; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue;
        if (!solid[ny * MW + nx]) return { x: nx, y: ny };
      }
  return { x, y };
}

function placesOf() {
  const nameFor = (f) => {
    const lbl = f.label || "Area";
    return GENERIC.includes(lbl.toLowerCase()) ? placeName(f.id) : lbl;
  };
  const byId = new Map(features.map(f => [f.id, f]));
  const out = [];
  for (const f of features) {
    if (isArea(f))
      out.push({ name: nameFor(f), kind: f.label || "Area",
                 ...standNear((f.x0 + f.x1) >> 1, (f.y0 + f.y1) >> 1) });
    else if (f.kind === "landmark")
      out.push({ name: f.label || "Landmark", kind: "Landmark",
                 ...standNear(f.x, f.y) });
  }
  for (const [id, md] of Object.entries(W.maps || {})) {
    if (id === MAPID || !md.travel || !storyTeleport(id)) continue;
    out.push({ name: md.title || id, kind: md.travel_kind || "Underground",
               map: id, x: (md.spawn[0] / TS) | 0, y: ((md.spawn[1] - 1) / TS) | 0 });
  }

  const routes = features.filter(f => f.kind === "route");
  const parent = new Map(routes.map(f => [f.id, f.id]));
  const find = (a) => { while (parent.get(a) !== a) a = parent.get(a); return a; };
  const ends = (f) => [[f.x0, f.y0], [f.x1, f.y1]];
  for (let i = 0; i < routes.length; i++)
    for (let j = i + 1; j < routes.length; j++) {
      const a = routes[i], b = routes[j];
      const near = ends(a).some(pa => ends(b).some(
        pb => Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]) <= (a.w || 5)));
      if (near) parent.set(find(b.id), find(a.id));
    }
  const chains = new Map();
  for (const f of routes) {
    const r = find(f.id);
    if (!chains.has(r)) chains.set(r, []);
    chains.get(r).push(f);
  }
  for (const legs of chains.values()) {
    const touched = [];
    for (const f of legs)
      for (const k of ["a0", "a1"]) {
        const t = f[k];
        if (!t || !byId.get(t.area)) continue;
        const nm = nameFor(byId.get(t.area));
        if (!touched.includes(nm)) touched.push(nm);
      }
    if (touched.length < 2) continue;      /* not a road anywhere yet */
    const mid = legs[legs.length >> 1];
    out.push({ name: touched[0] + "\u2013" + touched[1] + " Road", kind: "Road",
               x: (mid.x0 + mid.x1) >> 1, y: (mid.y0 + mid.y1) >> 1 });
  }
  if(MAPID==='world')for(const pl of out)if(!pl.map&&/Hollybeck Temple|Snow Temple|Winter Temple/i.test(pl.name)){pl.x=2814;pl.y=84;}
  return out;
}

function buildTravel() {
  const list = document.getElementById("tvList");
  list.innerHTML = "";
  const places = placesOf();
  if (!places.length) {
    const d = document.createElement("div");
    d.className = "mini off";
    d.textContent = "nowhere named yet";
    list.appendChild(d);
    return;
  }
  for (const pl of places) {
    const b = document.createElement("div");
    b.className = "mini";
    b.textContent = pl.name;
    const jump = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (pl.map && pl.map !== MAPID) loadMap(pl.map);
      P.x = pl.x * TS + TS / 2; P.y = pl.y * TS + TS;
      recoverTempleArrival(!!pl.map);
      camFree = false; cam.z = playZoom();
      cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2;
      clampCam();
      lastArea = null; checkArea();
      setTravel(false); setDevTitle(null);
      toast("travelled to " + pl.name);
    };
    b.addEventListener("click", jump);
    b.addEventListener("touchstart", jump, { passive: false });
    list.appendChild(b);
  }
}

function refreshBuild() {
  const u = document.getElementById("tUndo");
  u.classList.toggle("off", buildUndo.length === 0);
  u.textContent = buildUndo.length ? "UNDO " + buildUndo.length : "UNDO";
  document.getElementById("tStyle").textContent = buildStyle.toUpperCase();
  document.getElementById("tKind").textContent = KINDS[areaKind].toUpperCase();
  document.getElementById("tAreas").classList.toggle("on", areaMode);
  if (arenaMode) {
    document.getElementById("bHint").textContent =
      "ARENA: tap the path inside a route to clear a battle ring";
    return;
  }
  if (areaMode) {
    document.getElementById("bHint").textContent = pickedArea
      ? "drag " + (pickedArea.label || "area") + " -- its roads will follow"
      : "AREAS: drag any highlighted area to move it";
    return;
  }
  document.getElementById("bHint").textContent = !drawArmed
    ? "PAN: drag to move, pinch to zoom -- tap PAN to start drawing"
    : buildTool === "route"
      ? "DRAWING a ROUTE -- it straightens itself"
      : "DRAWING a TOWN -- it squares itself up";
}

const TCHAR = { 0: "g", 1: "d", 2: "c", 3: "f", 4: "w", 5: "b", 6: "W", 7: "p", 8: "v", 9: "m",
                10: "t", 11: "s", 12: "R", 13: "D", 14: "S", 15: "K",
                16: "k", 17: "j", 18: "L", 19: "V" };

function paintAt(wx, wy) {
  const fine = brush === 1;
  const cx = fine ? Math.floor(wx / TS) : (Math.floor(wx / TS) & ~1);
  const cy = fine ? Math.floor(wy / TS) : (Math.floor(wy / TS) & ~1);
  let any = false;
  for (let y = cy; y < cy + brush; y++) for (let x = cx; x < cx + brush; x++) {
    if (x < 1 || y < 1 || x >= MW - 1 || y >= MH - 1) continue;   /* keep the rim */
    const i = y * MW + x;
    if (terr[i] === paintT) continue;
    if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
    terr[i] = paintT;
    any = true;
  }
  if (any) groundDirty = true;
  return any;
}

const UNDRAWABLE = new Set([5, 7, 10, 11, 13, 14, 15]);
function tidyGround(scope) {
  let look = new Set();
  for (const i of scope) {
    const x = i % MW, y = (i / MW) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && ny > 0 && nx < MW - 1 && ny < MH - 1) look.add(ny * MW + nx);
    }
  }
  let fixed = 0;
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    for (const i of look) {
      const x = i % MW, y = (i / MW) | 0;
      if (terr[i] === WATER) {
        if (stroke && stroke.has(i)) continue;
        const wet = (a, b) => T(a, b) === WATER || T(a, b) === BRIDGE || T(a, b) === DECK;
        const mk = (wet(x, y - 1) ? 0 : 8) | (wet(x + 1, y) ? 0 : 4) |
                   (wet(x, y + 1) ? 0 : 2) | (wet(x - 1, y) ? 0 : 1);
        if (UNDRAWABLE.has(mk)) {
          if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
          terr[i] = openTo(i); painted.set(i, GRASS); changed = true; fixed++;
        }
      } else if (terr[i] === DIRT && brush > 1) {
        const gr = (a, b) => T(a, b) === GRASS || T(a, b) === WALL;
        const mk = (gr(x, y - 1) ? 8 : 0) | (gr(x + 1, y) ? 4 : 0) |
                   (gr(x, y + 1) ? 2 : 0) | (gr(x - 1, y) ? 1 : 0);
        if (UNDRAWABLE.has(mk)) {
          if (stroke && !stroke.has(i)) stroke.set(i, terr[i]);
          terr[i] = openTo(i); painted.set(i, GRASS); changed = true; fixed++;
        }
      }
    }
    if (!changed) break;
  }
  return fixed;
}

function notePainted(i) {
  baseTerr[i] = terr[i];
  if (terr[i] === terrOrig[i]) painted.delete(i);
  else painted.set(i, terr[i]);
}

window.__emberUndoStroke = function undoStroke() {
  const st = undoStack.pop();
  if (!st) { toast("nothing to undo"); return; }
  for (const [i, was] of st) { terr[i] = was; notePainted(i); }
  invalidateTiles([...st.keys()]);
  reindex();
  refreshUndo();
  toast("undid " + st.size + " tile" + (st.size === 1 ? "" : "s") +
        (undoStack.length ? " -- " + undoStack.length + " left" : ""));
}

function refreshUndo() {
  const el = document.getElementById("pUndo");
  el.classList.toggle("off", undoStack.length === 0);
  el.textContent = undoStack.length ? "UNDO " + undoStack.length : "UNDO";
}

function finishPaint() {
  const fixed = tidyGround(stroke ? stroke.keys() : []);
  if (stroke && stroke.size) {
    for (const i of stroke.keys()) notePainted(i);
    undoStack.push(stroke);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }
  const touched = stroke ? [...stroke.keys()] : [];
  stroke = null;
  refreshUndo();
  refreshToolbar();
  invalidateTiles(touched);
  reindex();
  if (fixed) toast("tidied " + fixed + " tile" + (fixed === 1 ? "" : "s") +
                   " the tileset cannot draw");
}

function wanderStep(o, d, dt) {
  if (o.wx === undefined) {
    o.wx = 0; o.wy = 0; o.tx = 0; o.ty = 0;
    o.wt = Math.random() * 3; o.face = 1;
  }
  o.wt -= dt;
  if (o.wt <= 0) {
    const rest = d.wp || 2.5;
    o.wt = rest * (0.6 + Math.random() * 0.9);
    for (let k = 0; k < 6; k++) {
      const a = Math.random() * Math.PI * 2;
      const r = d.wd * (0.45 + Math.random() * 0.55);
      const nx = Math.cos(a) * r, ny = Math.sin(a) * r * 0.6;
      if (!isSolid(o.x + nx, o.y + ny)) { o.tx = nx; o.ty = ny; break; }
    }
  }
  const dx = o.tx - o.wx, dy = o.ty - o.wy;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.6) { o.moving = false; return; }
  const sp = Math.min(dist, (d.ws || 11) * dt);
  const nx = o.wx + dx / dist * sp, ny = o.wy + dy / dist * sp;
  if (isSolid(o.x + nx, o.y + ny)) { o.tx = o.wx; o.ty = o.wy; o.moving = false; return; }
  o.wx = nx; o.wy = ny; o.moving = true;
  if (Math.abs(dx) > 0.4) o.face = dx < 0 ? -1 : 1;
}

let bannerName = null, bannerT = 0, lastArea = null;

function areaUnder(px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS);
  let best = null;
  const take = (name, weight) => {
    if (name && (!best || weight < best.w)) best = { name, w: weight };
  };
  for (const f of features) {
    if (isArea(f)) {
      if (f.hidden) continue;
      if (tx < f.x0 || tx > f.x1 || ty < f.y0 || ty > f.y1) continue;
      const lbl = f.label || "Area";
      const area = (f.x1 - f.x0) * (f.y1 - f.y0);
      take(GENERIC.includes(lbl.toLowerCase()) ? placeName(f.id) : lbl,
           f.wild ? 2e9 : area);
    } else if (f.kind === "landmark") {
      const r = f.r || 10;
      if (Math.abs(tx - f.x) <= r && Math.abs(ty - f.y) <= r)
        take(f.label || "Landmark", 1);
    } else if (f.kind === "route") {
      if (f.entrance) continue;
      const j = f.joins || [];
      if (j.length < 2) continue;
      const half = (f.w || 5) >> 1, reach = half + 3;
      let on = false;
      for (const [pa, pb] of routeLegs(f)) {
        const vert = pa[0] === pb[0];
        const lo = Math.min(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
        const hi = Math.max(vert ? pa[1] : pa[0], vert ? pb[1] : pb[0]);
        const ln = vert ? pa[0] : pa[1];
        const v = vert ? ty : tx, d = Math.abs((vert ? tx : ty) - ln);
        if (v >= lo && v <= hi && d <= reach) { on = true; break; }
      }
      if (on) take(j[0] + "\u2013" + j[1] + " Road", 1e9);   /* beats wild country */
    }
  }
  return best && best.name;
}

const PLACES = {
  "Millwood":       { kind: "spruce", of: "the farming village Corin is from" },
  "Northern Woods": { kind: "spruce", of: "the road north, where the King's men stand" },
  "Shroom Pass":    { kind: "mystic", of: "the trail up to the mushroom folk" },
  "Sporehollow":    { kind: "mystic", of: "the mushroom folk's hollow" },
  "Thornwell":      { kind: "oak",    of: "the school village -- cider, bees, herbs" },
  "Forgewick":      { kind: "birch",  of: "the mining town, its smithy and glassblower" },
  "Forgewick":        { kind: "temple", of: "the temple east, where Maddock sends him" },

  "Coralmere":  { kind: "coast",  of: "a seaside town" },
  "Dreadmarsh": { kind: "swamp",  of: "a swamp" },
  "Infernia":   { kind: "ash",    of: "Halvard's own country" },
  "Sandspire":  { kind: "desert", of: "a desert town" },
  "Hollybeck":  { kind: "snow",   of: "a snow town -- the snow portraits are for here",
                  keeps: ["lamp_grey"] },
};
const SIGNED = Object.keys(PLACES);
function worthASign(name) {
  return !!name && SIGNED.some(p => name === p);
}
let arenaLock = null, arenaT = 0, arenaGoing = false;
const ARENA_REST = 300;                  /* seconds before it fills again */
const cooling = new Map(), holy = new Set();
function ringKey(a) { return MAPID + ":" + (a ? a.id : "?"); }
function refillRing(a) {
  if (!a || cooling.has(ringKey(a)) || holy.has(ringKey(a))) return;
  let n = 0;
  for (const spec of (MD.foes || [])) {
    if (Math.hypot(spec.x - a.x, spec.y - a.y) > (a.r || 6) + 2) continue;
    /* a ring fills again, but the thing that made it a boss fight does not */
    if (BOSS_KIND.test(spec.k || "")) continue;
    const kind = FOE[spec.k] ? spec.k : "boneguard";
    const k = FOE[kind];
    if (!k) continue;
    const x = spec.x * TS + 8, y = spec.y * TS + 16;
    if (foes.some(q => q.st !== "dead" && Math.hypot(q.x - x, q.y - y) < 6)) continue;
    foes.push({ kind, x, y, hx: x, hy: y, hp: enemyMaxHp(kind, x),
                st: "idle", t: 0, dir: "d", flip: false, hurt: 0 });
    n++;
  }
  if (n) { rebuildBuckets(); a._wave = 0; }
}
function stepArenas(dt) {
  for (const [k, v] of cooling) {
    const t = v - dt;
    if (t <= 0) cooling.delete(k); else cooling.set(k, t);
  }
}
let falling = null;
function releaseArena() {
  settleGraves();
  if(arenaLock && !arenaFoesLeft(arenaLock)) recoverStrandedDragon();
  if (arenaLock && arenaT > 0.2) falling = { ring: arenaLock, t: 0, life: 1.0 };
  arenaLock = null; arenaT = 0; arenaGoing = false;
}
function stepFall(dt) {
  if (!falling) return;
  falling.t += dt;
  if (falling.t >= falling.life) falling = null;
}
function drawFall() {
  if (!falling) return;
  const fn = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
  if (!fn) return;
  const sp = SPR[fn];
  const p = falling.t / falling.life;
  const TALL = 2;
  const full = sp[3] * TALL;
  let k = 0;
  for (const [tx, ty] of arenaRim(falling.ring)) {
    k++;
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    const ix = tx * TS + TS / 2, iy = ty * TS + TS;
    if (ix < cam.x - 64 || ix > cam.x + VW / cam.z + 64 ||
        iy < cam.y - 96 || iy > cam.y + VH / cam.z + 96) continue;
    const lag = ((k * 0.037) % 0.42);
    const e = Math.max(0, Math.min(1, (p - lag) / (1 - lag)));
    const h = Math.round(full * (1 - e * e));
    if (h > 0) {
      const px = Math.round(ix - sp[2] / 2), py = Math.round(iy - h);
      ctx.save();
      ctx.beginPath(); ctx.rect(px, py, sp[2], h); ctx.clip();
      for (let t2 = 0; t2 < TALL; t2++)
        drawGameImage(ctx, atlasImg, sp[0], sp[1], sp[2], sp[3],
                      px, iy - full + t2 * sp[3] + (full - h), sp[2], sp[3]);
      ctx.restore();
    }
    if (e > 0.05 && e < 0.85) {
      ctx.save();
      ctx.globalAlpha = (1 - e) * 0.4;
      ctx.fillStyle = "#b9ab8e";
      for (let d = 0; d < 3; d++) {
        const a = (k + d) * 2.1;
        ctx.beginPath();
        ctx.arc(ix + Math.cos(a) * (4 + e * 10),
                iy - 2 + Math.sin(a) * 3, 2.2 * (1 - e), 0, 6.283);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
function arenaFoesLeft(a) {
  for (const f of foes) {
    if (f.storyKnight && !f.storyEscaped && Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= a.r + 8) return true;
    if (f.st === "dead" || f.ally) continue;
    if (Math.hypot(f.x / TS - a.x, f.y / TS - a.y) <= a.r + 5) return true;
  }
  return false;
}
let lastChunk = "", chunkQ = [], chunkWarmTask = null, chunkWarmMap = "";
function resetChunkWarm() {
  chunkQ.length = 0; lastChunk = ""; chunkWarmMap = MAPID;
  if (!chunkWarmTask) return;
  if (chunkWarmTask.idle && window.cancelIdleCallback) cancelIdleCallback(chunkWarmTask.id);
  else clearTimeout(chunkWarmTask.id);
  chunkWarmTask = null;
}
function runChunkWarm() {
  chunkWarmTask = null;
  if (chunkWarmMap !== MAPID) { chunkQ.length = 0; return; }
  while (chunkQ.length) {
    const [qx, qy] = chunkQ.shift();
    if (qx < 0 || qy < 0 || qx * CHUNK >= PXW || qy * CHUNK >= PXH) continue;
    if (!chunks.has(chunkKey(qx, qy))) { try { getChunk(qx, qy); } catch (_) {} }
    break;
  }
  scheduleChunkWarm();
}
function scheduleChunkWarm() {
  if (chunkWarmTask || !chunkQ.length) return;
  chunkWarmMap = MAPID;
  if (window.requestIdleCallback)
    chunkWarmTask = { idle:true, id:requestIdleCallback(runChunkWarm, {timeout:120}) };
  else chunkWarmTask = { idle:false, id:setTimeout(runChunkWarm, 34) };
}
function warmAhead() {
  const cx = Math.floor(P.x / CHUNK), cy = Math.floor(P.y / CHUNK);
  const k = cx + "," + cy;
  if (k !== lastChunk) {
    lastChunk = k;
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        if (!dx && !dy) continue;
        const key = chunkKey(cx + dx, cy + dy);
        if (chunks.has(key)) continue;
        const q = [cx + dx, cy + dy, Math.abs(dx) + Math.abs(dy)];
        if (!chunkQ.some(e => e[0] === q[0] && e[1] === q[1])) chunkQ.push(q);
      }
    chunkQ.sort((p, q) => p[2] - q[2]);        /* nearest ground first */
    if (chunkQ.length > 32) chunkQ.length = 32;
  }
  scheduleChunkWarm();
}
let arenaFeatureSource = null, arenaFeatureList = [];
function currentArenaFeatures() {
  if (arenaFeatureSource !== features) {
    arenaFeatureSource = features;
    arenaFeatureList = features.filter(f => f.kind === "arena");
  }
  return arenaFeatureList;
}
function knightArena() {
  return MAPID === "world" ? features.find(f => f.id === KNIGHT_ARENA_ID) : null;
}
function knightFoe() { return foes.find(f => f.storyKnight && !f.storyEscaped); }
function beginKnightFight(ring, f) {
  knightEncounterPhase = "intro";
  knightEncounter = { ring, foe:f, t:0 };
  f.storyPassive = true; f.st = "idle"; f.t = 0; f.dir = "d"; f.flip = false;
  arenaLock = ring; arenaT = Math.max(arenaT, .05); arenaGoing = false;
  faceCorinAt(f.x, f.y); f.dir = "u";
  playScene([
    "King's Knight: Hold there. I know you. You were in Millwood when His Majesty came through.",
    "King's Knight: So the rumors are true. You found a dragon.",
    "King's Knight: By order of King Halvard, hand it over. The creature belongs to the Crown.",
    "Corin: She belongs to no one.",
    "King's Knight: Then you leave me no choice.",
    "Corin: I won't let you take her.",
    "King's Knight: Draw your sword."
  ], { stay:true, after:() => {
    knightEncounterPhase = "fight";
    f.storyPassive = false; f.st = "walk"; f.t = 0; f.cool = .35;
  }});
}
function stepKnightEncounter(dt) {
  if (foesHeld) return;
  if (MAPID !== "world") return;
  const ring = knightArena();
  if (!ring) return;
  if (knightEncounterDone) { holy.add(ringKey(ring)); return; }
  const f = knightFoe();
  if (!f) return;
  if (knightEncounterPhase === "waiting") {
    if (!hasDragon() || scene || Math.hypot(P.x / TS - ring.x, P.y / TS - ring.y) > ring.r - 1.2) return;
    beginKnightFight(ring, f); return;
  }
  if (knightEncounterPhase === "fight" && f.st === "dead") {
    knightEncounterPhase = "down"; f.st = "down"; f.storyPassive = true; f.storyT = 0; f.hurt = 0;
    hunt = null; claw = null; breath = null; return;
  }
  if (knightEncounterPhase === "down") {
    f.storyT += dt;
    if (f.storyT >= .9 && !scene) {
      knightEncounterPhase = "yield";
      playScene([
        "King's Knight: Enough... I yield.",
        "Corin: Go. Tell Halvard the dragon chose me.",
        "King's Knight: You have made yourself an enemy of the Crown."
      ], { stay:true, after:() => {
        knightEncounterPhase = "rise"; f.st = "rise"; f.storyT = 0;
      }});
    }
    return;
  }
  if (knightEncounterPhase === "rise") {
    f.storyT += dt;
    if (f.storyT >= .65) {
      knightEncounterPhase = "escape"; f.st = "escape"; f.storyT = 0; f.dir = "d"; f.flip = false;
      holy.add(ringKey(ring)); releaseArena();
    }
    return;
  }
  if (knightEncounterPhase === "escape") {
    f.storyT += dt; f.t += dt;
    const tx = ring.x * TS + TS / 2, ty = (ring.y + ring.r + 11) * TS;
    const dx = tx - f.x, dy = ty - f.y, d = Math.hypot(dx,dy) || 1;
    f.dir = Math.abs(dx) > Math.abs(dy) ? "s" : (dy < 0 ? "u" : "d");
    f.flip = dx < 0;
    const step = Math.min(d, 112 * dt);
    f.x += dx / d * step; f.y += dy / d * step;
    if (d < 5 || Math.hypot(f.x / TS - ring.x, f.y / TS - ring.y) > ring.r + 9) {
      f.storyEscaped = true; f.st = "dead";
      knightEncounterDone = true; knightEncounterPhase = "done"; knightEncounter = null;
      holy.add(ringKey(ring)); recoverStrandedDragon(); saveGame();
      toast("The knight flees toward Coralmere");
    }
  }
}
function stepArena(dt) {
  if (foesHeld) { arenaLock=null;arenaT=0;arenaGoing=false;falling=null;return; }
  if (trial) { stepTrial(dt); return; }
  stepChest(dt);
  const mapArenas = currentArenaFeatures();
  if (!MD || !mapArenas.length) {
    if (MAPID !== "world") { arenaLock = null; arenaT = 0; return; }
  }
  if (!arenaLock) {
    for (const f of mapArenas) {
      if (Math.hypot(P.x / TS - f.x, P.y / TS - f.y) > f.r - 1) continue;
      if (cooling.has(ringKey(f)) || holy.has(ringKey(f))) continue;
      if (!arenaFoesLeft(f)) { refillRing(f); if (!arenaFoesLeft(f)) continue; }
      arenaLock = f; arenaT = 0; arenaGoing = false;
      break;
    }
  } else {
    const ring = arenaLock;
    const waves = ring.waves
      || (ring.wave2 ? [{ say: "Oh no! There's more!", at: ring.wave2 }] : []);
    if (ring._wave === undefined) ring._wave = 0;
    if (!arenaGoing && !arenaFoesLeft(ring) && !ring._waving && ring._wave < waves.length) {
      const w0 = waves[ring._wave];
      ring._waving = true;
      playScene([w0.say], { after: () => {
        ring._wave++;
        ring._waving = false;
        for (const w of w0.at) {
          foes.push({ kind: w.k || "ghost",
                      x: w.x * TS + TS / 2, y: w.y * TS + TS,
                      hx: w.x * TS + TS / 2, hy: w.y * TS + TS,
                      st: "idle", t: 0,
                      hp: enemyMaxHp(w.k || "ghost", w.x * TS + TS / 2),
                      dir: "d", flip: false, hurt: 0 });
        }
        rebuildBuckets();
      } });
    }
    if (!arenaGoing && !arenaFoesLeft(ring) &&
        ring._wave >= waves.length && !scene) arenaGoing = true;
    arenaT += dt * (arenaGoing ? -2.2 : 3.0);
    if (arenaT > 1) arenaT = 1;
    if (arenaT < 0) {
      if (!bossRing(arenaLock) && !holy.has(ringKey(arenaLock)))
        cooling.set(ringKey(arenaLock), ARENA_REST);
      recoverStrandedDragon();
      arenaLock = null; arenaT = 0; arenaGoing = false;
      twinSpent = false; twinKills = 0;   /* ready for the next ring */
      for (const f of foes) if (f.raised) { f.ally = 0; f.raised = 0; f.st = "dead"; f.t = 0; }
    }
  }
}
function arenaRim(a) {
  const cacheKey = MAPID + ":" + a.x + "," + a.y + "," + a.r + ":" + ((MD.doors || []).length);
  if (a._rimCacheKey === cacheKey && a._rimCache) return a._rimCache;
  if (MAPID !== "world") {
    const out = [];
    for (const d of (MD.doors || [])) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = d.x + dx, ty = d.y;
        if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
        if (!out.some(p => p[0] === tx && p[1] === ty)) out.push([tx, ty]);
      }
    }
    a._rimCacheKey = cacheKey; a._rimCache = out; return out;
  }
  const out = [];
  const rr = a.r + 1;
  for (let ang = 0; ang < 6.2832; ang += 0.04) {
    const tx = Math.round(a.x + Math.cos(ang) * rr);
    const ty = Math.round(a.y + Math.sin(ang) * rr);
    if (!out.some(p => p[0] === tx && p[1] === ty)) out.push([tx, ty]);
  }
  a._rimCacheKey = cacheKey; a._rimCache = out; return out;
}
let lastAreaTile = "";
function checkArea() {
  const tile = MAPID + ":" + Math.floor(P.x / TS) + "," + Math.floor((P.y - 1) / TS);
  if (tile === lastAreaTile) return;
  lastAreaTile = tile;
  const now = areaUnder(P.x, P.y);
  if (now !== lastArea) {
    lastArea = now;
    if (worthASign(now)) { bannerName = now; bannerT = 0; }
  }
}

function drawBanner(dt) {
  if (!bannerName) return;
  bannerT += dt;
  const IN = 0.45, HOLD = 2.0, OUT = 0.5;
  if (bannerT > IN + HOLD + OUT) { bannerName = null; return; }
  let k = 1;                                   /* 0 hidden .. 1 fully down */
  if (bannerT < IN) k = bannerT / IN;
  else if (bannerT > IN + HOLD) k = 1 - (bannerT - IN - HOLD) / OUT;
  const ease = 1 - Math.pow(1 - k, 3);
  ctx.save();
  const pad = 10, h = 34;
  ctx.font = "700 13px ui-monospace, Menlo, monospace";
  const w = Math.max(96, ctx.measureText(bannerName).width + pad * 2 + 14);
  const x = VW - w - 12;
  const y = VH - h - 16;
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(1, Math.max(0.04, ease));
  ctx.translate(-w / 2, -h / 2);

  const boards = 3, bh = h / boards;
  for (let i = 0; i < boards; i++) {
    const by = i * bh;
    ctx.fillStyle = ["#6b4a2b", "#5f4126", "#periodo"][i] || "#654529";
    ctx.fillStyle = ["#6b4a2b", "#5f4126", "#654529"][i];
    ctx.fillRect(0, by, w, bh);
    ctx.strokeStyle = "rgba(40,24,12,.35)";
    ctx.lineWidth = 1;
    for (let gline = 0; gline < 2; gline++) {
      const gy = by + bh * (0.32 + 0.36 * gline);
      ctx.beginPath();
      ctx.moveTo(6, gy);
      ctx.bezierCurveTo(w * 0.3, gy - 1.4, w * 0.7, gy + 1.4, w - 6, gy);
      ctx.stroke();
    }
    if (i < boards - 1) {
      ctx.fillStyle = "rgba(28,16,8,.55)";
      ctx.fillRect(0, by + bh - 1, w, 1.4);
      ctx.fillStyle = "rgba(255,226,180,.10)";
      ctx.fillRect(0, by + bh + 0.4, w, 1);
    }
  }
  ctx.fillStyle = "rgba(255,232,190,.16)";
  ctx.fillRect(0, 0, w, 2);
  ctx.fillStyle = "rgba(24,14,7,.45)";
  ctx.fillRect(0, h - 2.5, w, 2.5);

  ctx.strokeStyle = "#3a2716";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(1, 1, w - 2, h - 2, 4);
  else ctx.rect(1, 1, w - 2, h - 2);
  ctx.stroke();

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(22,12,5,.75)";
  ctx.fillText(bannerName, w / 2, h / 2 + 2.2);
  ctx.fillStyle = "#f4e9d4";
  ctx.fillText(bannerName, w / 2, h / 2 + 1);
  ctx.textAlign = "left";

  ctx.fillStyle = "#2e2116";
  for (const [nx, ny] of [[8, 7], [8, h - 7], [w - 8, 7], [w - 8, h - 7]]) {
    ctx.beginPath(); ctx.arc(nx, ny, 2.2, 0, 7); ctx.fill();
  }
  ctx.fillStyle = "rgba(226,206,170,.5)";
  for (const [nx, ny] of [[8, 7], [8, h - 7], [w - 8, 7], [w - 8, h - 7]]) {
    ctx.beginPath(); ctx.arc(nx - 0.7, ny - 0.7, 0.9, 0, 7); ctx.fill();
  }
  ctx.restore();
}

let last = 0, tAcc = 0, runtimeFrameErrors = 0;
function showRuntimeFrameError(error) {
  runtimeFrameErrors++;
  const message = String(error && (error.stack || error.message) || error);
  window.__lastFrameError = message;
  try { localStorage.setItem("emberfell.lastFrameError", message); } catch (_) {}
  let box = document.getElementById("runtimeFrameError");
  if (!box) {
    box = document.createElement("div"); box.id = "runtimeFrameError";
    box.setAttribute("style", "position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;background:#3a0d0de8;color:#ffd9d9;border:2px solid #ef9b74;border-radius:7px;padding:8px;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap;max-height:35%;overflow:auto;pointer-events:none");
    (document.body || document.documentElement).appendChild(box);
  }
  box.textContent = "EMBERFELL RECOVERED FROM AN ERROR (" + runtimeFrameErrors + ")\n" + message;
  if (MAPID === "world" && quest === Q.NOISE) {
    scene = null; sayNpc = null; walker = null; goingIn = false;
    const her = npcs.find(n => n.n === "Hettie");
    if (her) { her.goto = null; her.stationary = true; }
    const mad = npcs.find(n => n.n === "Elder Maddock");
    if (mad) { mad.goto = null; mad.away = 1; }
  }
  fade = 0; fadeDir = 0; pendingDoor = null; pendingActorStage = null; doorMotion = null;
  mode = "play"; P.moving = false;
  try { rebuildSolid(); } catch (_) {}
}
function frame(ms) {
  try {
    frameCore(ms);
    const box = document.getElementById("runtimeFrameError");
    if (box && runtimeFrameErrors) { box.remove(); runtimeFrameErrors = 0; }
  }
  catch (error) { showRuntimeFrameError(error); }
  finally { requestAnimationFrame(frame); }
}
function updateDeckHealth(){
  const corin=document.getElementById("deckCorinHearts"), dg=document.getElementById("deckDragonHearts"), dr=document.getElementById("deckDragonRow");
  const box=document.getElementById("deckHealth"), cp=document.getElementById("deckCorinPortrait"), dp=document.getElementById("deckDragonPortrait");
  const paint=(el,cur,max,kind)=>{
    if(!el)return;
    const slots=6, ratio=Math.max(0,Math.min(1,max?cur/max:0)), filled=ratio*slots;
    let html="";
    for(let i=0;i<slots;i++){
      const f=Math.max(0,Math.min(1,filled-i));
      html+='<span class="deckHeart '+kind+'"><i style="width:'+(f*100).toFixed(0)+'%"></i></span>';
    }
    if(el._hpMarkup!==html){el.innerHTML=html;el._hpMarkup=html;}
  };
  const cur=(typeof pHp!=="undefined"&&Number.isFinite(pHp))?pHp:0;
  const max=(typeof pMax!=="undefined"&&pMax)?pMax:1;
  paint(corin,cur,max,"corin");
  const portrait=(cv,sp,img,faceZoom)=>{
    if(!cv||!sp||!img)return; const x=cv.getContext("2d"); x.clearRect(0,0,cv.width,cv.height); x.imageSmoothingEnabled=false;
    try{
      let crop=Math.min(sp[2],sp[3]), sx=sp[0]+Math.max(0,(sp[2]-crop)/2), sy=sp[1]+Math.max(0,(sp[3]-crop)/2);
      if(faceZoom){
        /* Corin HUD portrait: extreme close-up on the eye band. */
        crop=Math.max(7,Math.floor(Math.min(sp[2],sp[3])*.34));
        sx=sp[0]+Math.floor((sp[2]-crop)/2);
        /* Shift the source crop farther down the sprite so the eye band,
           not the crown of the hair, fills the circular portrait. */
        sy=sp[1]+Math.max(0,Math.floor(sp[3]*.30));
      }
      drawGameImage(x,img,sx,sy,crop,crop,0,0,cv.width,cv.height);
    }catch(e){}
  };
  if(typeof SPR!=="undefined"){const cs=SPR[corinKit()+"idle_d"];portrait(cp,cs,atlasImg,true);}

  const hatched=(typeof hasDragon==="function"&&hasDragon());
  if(typeof dragon!=="undefined"&&hatched)paint(dg,Number.isFinite(dragon.hp)?dragon.hp:dragon.maxHp,dragon.maxHp||1,"dragon");
  if(dr)dr.style.display=hatched?"flex":"none";
  if(hatched&&typeof SPR!=="undefined"){const ds=SPR.dr5_pose_south||SPR.dr5_idle_s;portrait(dp,ds,ds?sheetOf(ds):dragonImg);}
  if(box){
    box.classList.toggle("solo",!hatched);
    /* Never show party vitals on the boot/start screen. They become visible
       only after gameplay has actually begun. */
    const playing=gameplayStarted && (typeof mode!=="undefined"&&mode==="play");
    box.style.visibility=playing?"visible":"hidden";
    box.style.pointerEvents=playing?"auto":"none";
  }
}
function frameCore(ms) {
  window.__firstFrame = true;
  updateDeckHealth();
  if (ovl === "atkm") updateBreathRefills();
  const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms;
  if(atlasOpen)return;
  if(fishing){
    stepFishing(dt);
    drawWorld(tAcc,0);drawDark();drawHearts();drawFishing();
    return;
  }
  tAcc += dt;
  if (mode === "play") { stepAct(dt); stepPlayer(dt); useDoors(dt); checkArea(); stepKnightEncounter(dt); stepArena(dt); warmAhead(); stepCombat(dt); }
  const dgx0 = dragon.x, dgy0 = dragon.y;
  stepScene(dt);
  if (sayNpc) { faceToward(sayNpc, P.x, P.y); faceCorinAt(sayNpc.x, sayNpc.y); }
  if (walker && scene) faceCorinAt(walker.x, walker.y);
  if (scene && quest <= Q.KING && typeof guards === "function")
    for (const g of guards()) {
      if (g.goto) continue;
      g.f = "d"; g.kf = "d"; g.flip = false;
    }
  stepType(dt);
  stepBirds(dt);
  odoTurnsYouBack();
  stepShake(dt);
  greenFly(dt);
  stepWalkers(dt);
  stepElder();
  stepHatchCamera(dt);
  stepKingsMen(dt);
  stepQuest(dt);
  stepBreath(dt);
  stepDragon(dt);
  noteDragonMotion(dgx0, dgy0, dt);
  stepClaw(dt);
  stepAnims(dt);   /* one-shot animations run in the editor too */
  if (mode === "play") stepBolts(dt);
  stepFerry(dt);
  stepDeflectCamera(dt);
  drawWorld(tAcc, dt);
  drawDark();           /* the deep workings, before the hearts go on top */
  drawCollide();
  drawDoorTriggers();
  drawHearts();
  drawBanner(dt);
  drawFade();
  drawBossBlack(); if (typeof drawArenaNumberOverlay === "function") drawArenaNumberOverlay();
  refreshHandle();      /* the delete button rides with the camera */
}

let doorCooldown = 0;

function doorAt(tx,ty){return (MD.doors||[]).find(d=>{const r=doorRect(d);return tx*TS<r.x+r.w&&(tx+1)*TS>r.x&&ty*TS<r.y+r.h&&(ty+1)*TS>r.y})||null;}

let fade = 0, fadeDir = 0, pendingDoor = null, arrivedDoor = null, arriveT = 0;
let pendingActorStage = null;
let doorMotion = null; // A short opening or stair descent, then the normal room fade.
let collideView = false, badTiles = {};
const FADE_T = 0.22;

function useDoors(dt) {
  if (bossScene && !foesHeld) return;
  if (doorMotion && !doorMotion.started) {
    doorMotion.t += dt;
    if (doorMotion.t < doorMotion.duration) return;
    doorMotion.started = true;
    pendingDoor = doorMotion.d; fadeDir = 1;
  }
  if (fadeDir !== 0) {
    fade += fadeDir * (dt / FADE_T);
    if (fadeDir > 0 && fade >= 1) {           /* fully dark: make the swap */
      fade = 1;
      if (pendingActorStage) {
        const stage = pendingActorStage; pendingActorStage = null;
        fadeDir = 0;
        if(stage()!==true)fadeDir = -1; return;
      }
      const d = pendingDoor; pendingDoor = null;
      if (!d || !W.maps[d.to]) { doorMotion = null; fadeDir = -1; return; }
      const cameFrom = MAPID;          /* the map we are leaving */
      doorMotion = null;
      if (quest === Q.ABED && cameFrom !== "world" && d.to === "world") quest = Q.ERRAND;
      loadMap(d.to);
      P.x = d.tx * TS + TS / 2;
      P.y = d.ty * TS + TS;
      recoverTempleArrival(!!MD.templeContinuous);
      P.dir = "d"; P.dir8="s"; P.flip = false;
      arriveT = 0.33;
      cam.x = P.x - (VW / cam.z) / 2;
      cam.y = P.y - (VH / cam.z) / 2;
      clampCam();
          bolts.length = 0;               /* nothing in flight follows you out */
      arrivedDoor = cameFrom;
      const nm = W.maps[d.to].title;
      if (nm) { bannerName = nm; bannerT = 0; }
      fadeDir = -1;
    } else if (fadeDir < 0 && fade <= 0) { fade = 0; fadeDir = 0; }
    return;
  }
  if (!P.moving) return;
  if (arriveT > 0) return;
  const movingDir = P.dir === "s" ? (P.flip ? "l" : "r") : P.dir;
  // Measure against the actual doorway, not the player's modulo-tile position.
  // The feet may stop at collision before crossing the visual threshold.
  let d = null, best = Infinity;
  for (const candidate of (MD.doors || [])) {
    if (!W.maps[candidate.to]) continue;
    const want = candidate.explicitDir ? candidate.dir : MAPID === "world" ? (candidate.dir || "u") : "d";
    if (movingDir !== want) continue;
    const r=doorRect(candidate),x0=r.x,y0=r.y;
    const horizontal=want==='l'||want==='r';
    const lateral=horizontal?P.y-4:P.x,center=horizontal?y0+r.h/2:x0+r.w/2;
    const half=(horizontal?r.h:r.w)/2+4;
    if(Math.abs(lateral-center)>half)continue;
    const gap=want==='u'?P.y-7-(y0+r.h):want==='d'?y0-(P.y-1):want==='l'?P.x-5.5-(x0+r.w):x0-(P.x+5.5);
    if(gap>TS/2||gap<-(horizontal?r.w:r.h)-7)continue;
    const score = Math.abs(gap) + Math.abs(lateral - center) * 0.1;
    if (score < best) { best = score; d = candidate; }
  }
  if (!d) return;
  if(!foesHeld && MD.royal && foes.some(f=>(f.kind==="royalguard"||f.kind==="treasuryknight")&&f.st!=="dead")){toast("Defeat the guards to clear this passage.");return;}
  if(!foesHeld && MD.firstTemple && d.templeForward && foes.some(f=>f.st!=="dead" && !f.ally)){toast("Defeat the guardians to open the next room.");return;}
  const animated = d.stairDown || MD.roomArt || ["school", "tavern", "inn", "smithy", "glasshouse", "glasswork"].includes(d.to);
  if (animated) {
    doorMotion = { map: MAPID, d, t: 0, duration: d.stairDown ? 0.65 : 0.42, started: false };
    P.moving = false; P.act = null;
  } else { pendingDoor = d; fadeDir = 1; }
}

function drawArena(half) {
  if (!arenaLock || arenaT <= 0) return;
  const a = arenaLock;
  const nm = SPR["vfence0_0"] ? "vfence0_0" : (SPR["swall_post"] ? "swall_post" : null);
  if (!nm) return;
  const sp = SPR[nm];
  const TALL = 2;                 /* posts stacked, so it reads as a wall */
  const rise = Math.min(1, arenaT);
  ctx.save();
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
  for (const [tx, ty] of arenaRim(a)) {
    if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) continue;
    if (MAPID !== "world") {
      if (half === "back") continue;
    } else {
      const behind = ty <= Math.floor(P.y / TS);
      if (half === "back" && !behind) continue;
      if (half === "front" && behind) continue;
    }
    const px = Math.round(tx * TS + TS / 2 - sp[2] / 2);
    const py = Math.round(ty * TS + TS);
    const full = sp[3] * TALL;
    const h = Math.round(full * rise);
    if (h <= 0) continue;
    for (let k = 0; k < TALL; k++) {
      const top = (TALL - 1 - k) * sp[3];        /* px from the top of the stack */
      const vis = Math.max(0, Math.min(sp[3], h - top));
      if (vis <= 0) continue;
      drawGameImage(ctx, sheetOf(sp), sp[0], sp[1] + (sp[3] - vis), sp[2], vis,
                    px, py - top - vis, sp[2], vis);
    }
  }
  ctx.restore();
}

function drawFade() {
  if (fade <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = Math.min(1, fade);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.restore();
}
function drawBossBlack() {
  const a = bossScene && bossScene.black;
  if (!a) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.restore();
}

function stepPlayer(dt) {
  if(atlasOpen)return;
  if (bossScene) return;
  if (hatchCamera) { P.moving = false; P.t += dt; return; }
  if (doorMotion) { P.moving = false; P.t += dt; return; }
  if (P.act) { P.moving = false; return; }
  {
    let dx = padDx, dy = padDy;
    if (keys.arrowleft || keys.a) dx = -1;
    if (keys.arrowright || keys.d) dx = 1;
    if (keys.arrowup || keys.w) dy = -1;
    if (keys.arrowdown || keys.s) dy = 1;
    if ((dx || dy) && mapGesturesAllowed()) {
      const m2 = Math.hypot(dx, dy) || 1;
      const sp = 900 / Math.max(cam.z, 0.05);
      cam.x += (dx / m2) * sp * dt;
      cam.y += (dy / m2) * sp * dt;
      camFree = true;
      clampCam();
      P.moving = false; P.t += dt;
      return;
    }
    let m = Math.hypot(dx, dy);
    if (arriveT > 0) {
      arriveT = Math.max(0, arriveT - dt);
      dx = dy = 0;
      m = 0;  /* do not carry held-input movement into the final locked frame */
    }
    P.moving = m > 0.01 && arriveT <= 0 && !sayNpc && !sceneHold();
    if (P.moving) {
      dx /= m; dy /= m;
      P.dir8 = direction4(dx,dy,playerFacing4());
      movePlayer(dx, dy, dt);
      if (Math.abs(dx) > Math.abs(dy)) { P.dir = "s"; P.flip = dx < 0; }
      else P.dir = dy < 0 ? "u" : "d";
      P.t += dt;
    } else P.t += dt;
    if (!editing && !camFree && !deflectCamera) {
      const vw = VW / cam.z, vh = VH / cam.z;
      cam.x = P.x - vw / 2; cam.y = P.y - vh / 2;
    }
    clampCam();
  }
}

atlasImg.onload = () => {
  if (!W) {
    try { BOOT.step(12, "unpacking the world"); } catch (e) {}
    inflateWorld().then(() => atlasImg.onload())
                  .catch((e) => { window.__boot = "INFLATE FAILED: " + e; });
    return;
  }
  const step = (m) => { try { window.__boot = (window.__boot || "") + m + "\n"; } catch (e) {} };
  try {
    step("atlas loaded " + atlasImg.width + "x" + atlasImg.height);
    try { BOOT.step(45, "laying out the world"); } catch (e) {}
    try { buildSkinTones(); step("skin tones built"); }
    catch (e) { step("skin tones failed: " + e); }
    step("world inflated, " + W.names.length + " names");
    try { buildHouseFurnitureLayers(); step("furniture layers " + (window.__houseFurnitureCount||0)); } catch(e) { step("furniture layers failed: " + e); }
    resize();            step("resize ok, canvas " + cv.width + "x" + cv.height);
    if (!cv.width || !cv.height) {
      let tries = 0;
      const again = () => {
        tries++;
        try { resize(); } catch (e) {}
        if ((cv.width && cv.height) || tries > 40) {
          step("canvas settled at " + cv.width + "x" + cv.height +
               " after " + tries + " tries");
          return;
        }
        setTimeout(again, 100);
      };
      setTimeout(again, 100);
    }
    loadMap(W.start);    step("loadMap ok, " + MW + "x" + MH + " tiles");
    P.x = MD.spawn[0]; P.y = MD.spawn[1];
    step("spawn " + P.x + "," + P.y);
    step("objs " + objs.length + " fobjs " + fobjs.length);
    requestAnimationFrame(frame);
    step("first frame requested");
    (async () => {
      try {
        await BOOT.to(26, 700, "warming the ground");
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { BOOT.step(62, "warming the ground"); } catch (e) {}
      try {
        const cx0 = Math.floor(P.x / CHUNK), cy0 = Math.floor(P.y / CHUNK);
        let warmed = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            try { getChunk(cx0 + dx, cy0 + dy); warmed++; } catch (e) {}
          }
          BOOT.step(62 + warmed, "warming the ground");
          await new Promise(r => setTimeout(r, 0));
        }
        step("warmed " + warmed + " ground chunks");
      } catch (e) { step("chunk warm failed: " + e); }
      try { rebuildSolid(); step("collision built"); }
      catch (e) { step("collision failed: " + e); }
      await BOOT.to(58, 800, "waking the world");
      try {
        const here = MAPID;
        const out = (MD.doors || []).find(d => d.to === "world");
        if (out) {
          loadMap("world", true);
          buildGround();
          const wx = out.tx * TS, wy = out.ty * TS;
          const cx1 = Math.floor(wx / CHUNK), cy1 = Math.floor(wy / CHUNK);
          let n2 = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              try { getChunk(cx1 + dx, cy1 + dy); n2++; } catch (e) {}
            }
            BOOT.step(78 + n2, "waking the world");
            await new Promise(r => setTimeout(r, 0));
          }
          rebuildSolid();
          step("warmed " + n2 + " chunks outside the door");
          loadMap(here, true);          /* back indoors, as if nothing happened */
          buildGround();
        }
      } catch (e) { step("outdoor warm failed: " + e); }
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { BOOT.step(90, "drawing the map"); } catch (e) {}
      await new Promise(r => setTimeout(r, 24));   /* let the bar paint */
      try { bootBind(); BOOT.ready(); } catch (e) {}
      } catch (e) { step("boot tail threw: " + (e && (e.stack || e.message))); }
    })();
  } catch (e) {
    step("THREW: " + (e && (e.stack || e.message)));
  }
  setTimeout(() => {
    if (window.__firstFrame) return;      /* it drew: nothing to report */
    try { console.warn("EMBERFELL: no first frame\n" + (window.__boot || "")); } catch (e) {}
    if (!window.__bootBanner) return;
    const d = document.createElement("div");
    d.setAttribute("style", "position:fixed;left:0;top:0;right:0;z-index:99999;" +
      "background:#3a0d0d;color:#ffd9d9;font:12px ui-monospace,Menlo,monospace;" +
      "padding:10px;white-space:pre-wrap;max-height:70%;overflow:auto");
    d.textContent = "EMBERFELL: NO FIRST FRAME\n\n" + (window.__boot || "(nothing)");
    (document.body || document.documentElement).appendChild(d);
  }, 20000);
};
atlasImg.onerror = (err) => { document.body.innerHTML = "<p style='color:#fff;padding:20px'>atlas failed to load<br><span style='font-size:12px;color:#aaa;'>" + (err && err.message || "Unknown error details") + "</span></p>"; };
atlasImg.onerror.debug = true;
loadAtlasPages().then(() => atlasImg.onload()).catch((err) => atlasImg.onerror(err));

window.__H = { get cv(){return cv;}, get ctx(){return ctx;}, sowDesertRoute, W_GZ, applyWorld, W, SPR, DEFS, NAMES, P, loadMap, buildPatch, fitZoom, overviewZoom,
               get NAMES2(){return NAMES;}, get W2(){return W;}, movePlayer, canStand,
               setBag, refreshBag, bagTick, drawBagIcon, drawBagBig, get bagAnim(){return bagAnim;},
               inClearing, refillRing, stepArena, get foes(){return foes;}, get arenaLock(){return arenaLock;},
               stepPlayer, checkArea, useDoors, interact, startAct, stepAct, inFight, foeDir, breatheFire, canBreathe, stepBreath, mouthOf, fireNow, drawWorld, loadMap2: loadMap, get breath(){return breath;}, set breath(v){breath=v;}, set breathT(v){breathT=v;}, beamLength, BREATH, get dragonFacingLocked(){return dragonFacingLocked;}, get breathT(){return breathT;}, get hunt(){return hunt;}, get dragon(){return dragon;}, stepDragon,
               dragonSprite, dragonFps, dragonAirborne, dragonBob, dragonHover,
               dragonCanStand, dragonGround, dragonStep, noteDragonMotion,
               setDragonAir, refreshWingBtn, startTransition, stepTransition,
               MOUTH, MOUTH_GND, DRAGON_ANIM, DRAGON_SPR, SM_SPR, ACT, dying,
               castSkull, stepSpell, drawSpell, get spell(){return spell;},
               drawBell, stepBell, get bell(){return bell;}, set bell(v){bell=v;},
               showHeal, stepHeal, drawHeal, get heal(){return heal;},
               showRise, stepRise, drawRise, get risings(){return risings;},
               plantRing, stepBlooms, drawBlooms, get blooms(){return blooms;},
               showDust, stepDust, drawDust, get dustPuff(){return dustPuff;},
               useMark, stepGraves, drawGraves, settleGraves, get graves(){return graves;},
               dropGold, get gold(){return gold;}, set gold(v){gold=v;},
               useSaint, get saintT(){return saintT;}, set saintT(v){saintT=v;},
               flyGold, stepFly, drawFly, stepFall, drawFall, drawDying, releaseArena, get arenaT(){return arenaT;}, set arenaT(v){arenaT=v;},
               get flying(){return flying;}, get falling(){return falling;},
               startLastFight, secondPhase, risePhase, stepGrief, get grief(){return grief;}, lastFightHold, winGame, get wonAll(){return wonAll;}, get lastFight(){return lastFight;},
               get smReady() { return smReady; },
               set smReady(v) { smReady = v; },
               get pInv() { return pInv; }, set pInv(v) { pInv = v; },
               set pHp(v) { pHp = v; }, smDir,
               get dragonReady() { return dragonReady; },
               set dragonReady(v) { dragonReady = v; }, get claw(){return claw;}, stepClaw, stepBolts, setDev, mapGesturesAllowed, get devUnlocked(){return devUnlocked;}, get devSafe(){return devSafe;}, get bolts(){return bolts;}, get P2(){return P;}, get foes(){return foes;}, stepCombat, spawnFoes, doorAt, useDoors, stepArena, arenaRim, stepFoes, warmAhead, get arenaLock(){return arenaLock;}, set arenaLock(v){arenaLock=v;}, get marks(){return marks;}, set marks(v){marks=v;}, get arenaT(){return arenaT;}, ATLAS, NAME2I, routeLegs, getChunk, rebuildSolid, padSet: (a,b)=>{padDx=a;padDy=b;}, ROAD_NET, roadOf, roadLegs, set foesHeld(v){foesHeld=v;}, get foesHeld(){return foesHeld;}, get pHp(){return pHp;}, hurtPlayer, get anims(){return anims;},  stepAnims, mapTouchEnd, poolTile, poolCorners, POOL_T,  mapTouchStart, mapTouchMove, buildTravel, get scat(){return scat;}, set editing(v){editing=v;}, set dragObj(v){dragObj=v;}, get finePlace(){return finePlace;}, set finePlace(v){finePlace=v;}, weatherHere, drawWeather, whyBlocked, peekTile, stampedBy, get blockTiles(){return blockTiles;}, fenceAt2:()=>fenceAt, blockedByGuard, odoShuts, blockedByItem, get bannerName() { return bannerName; },
               get padDx() { return padDx; }, get padDy() { return padDy; },
               get running() { return running; },
               get features() { return features; }, get fobjs() { return fobjs; },
               get hidden() { return hidden; }, get objs() { return objs; }, get rockTiles() { return rockTiles; },
               get buildUndo() { return buildUndo; }, moveArea, placesOf,
               get drawArmed() { return drawArmed; }, get building() { return building; },
               get deckPlank() { return deckPlank; }, get decks() { return decks; },
               growWorld, realizeFeatures, buildGround, groundTile, fringeTile,
               GREEN, greenAt, playZoom, notePainted, Q, playScene,
               get quest(){return quest;}, set quest(v){quest=v;},
               get scene(){return scene;}, set scene(v){scene=v;},
               advanceScene, stepQuest,
               hasSword, hasDragon, SPOT, stepKingsMen, stepScene,
               ITEMS, itemAt, takeItem, itemHere, stepWalkers,
               showReveal, hideReveal, get revealing(){return revealing;},
               questTalk, typeAll, stepType, npcHere, stepElder,
               odoTurnsYouBack, odoBlocks, ODO_BRIDGE,
               faceFor, FACE_OF, get faceShown(){return shownFace;},
               get faceSide(){return faceEl.className;},
               get nameSide(){return nameEl.className;},
               get sayVisible(){return sayEl.classList.contains("on");},
               hideSay: () => sayOff(),
               greenFly, greenOffset, get greenT(){return greenT;},
               get greenPhase(){return greenPhase;}, get greenP(){return greenP;},
               BIRDS, scatterBirds, stepBirds, stepShake,
               get shake(){return shake;},
               get birdsUp(){return birdsUp;},
               dragonHere, indoors,
               faceCorinAt,
               comeOut, goBackIn, elder,
               get warnedNorth(){return warnedNorth;},
               set eggWarned(v){eggWarned=v;}, get eggWarned(){return eggWarned;},
               set eggGate(v){eggGate=v;}, set fieldGate(v){fieldGate=v;},
               set warnedNorth(v){warnedNorth=v;},
               get typedAll(){return typeDone();},
               canMoveNow: () => !sceneHold(),
               blockedByHerd, herdHere, HERD, HERD_Y, get MAPID(){return MAPID;},
               banishKingsMen, kingsMen, get walker(){return walker;},
               greenInView, followCam, sayNarr: () => sayIsNarr, resizeArea, terrRLE,
               scaleAreaContents, relayNorthRidge, findRuns,
               get pickedArea(){return pickedArea;},
               set pickedArea(v){pickedArea=v;},
               get features(){return features;},
               get objs(){return objs;}, get scat(){return scat;},
               get baseTerr(){return baseTerr;}, get MD(){return MD;}, get painted() { return painted; },
               get sanm() { return sanm; }, get fsanim() { return fsanim; },
               copyText, pickObject, deleteSelected, deleteGrabbed,
               areaUnder, worthASign, placeArena, styleAt, unfell, resizeArea, fitArea,
               routeLegs, get MD() { return MD; },
               get buckets() { return buckets; }, soilAt, get scatterChunks() { return scatterChunks; }, chunkKey, get sbuckets() { return sbuckets; }, get sanm() { return sanm; },
               get CELL() { return CELL; }, scatterFits,
               get pickedArea() { return pickedArea; },
               set pickedArea(v) { pickedArea = v; },
               get fobjs() { return fobjs; },
               get felled() { return felled; },
               get decorGone() { return decorGone; },
               get decorDel() { return decorDel; },
               get selected() { return selected; }, set selected(v) { selected = v; },
               get grabRect() { return grabRect; }, set grabRect(v) { grabRect = v; },
               get terrOrig() { return terrOrig; }, get baseTerr() { return baseTerr; },
               get painting() { return painting; },
               get terr() { return terr; }, get MW() { return MW; },
               get PXW() { return PXW; }, get PXH() { return PXH; },
               get cam() { return cam; },
               get MAPID() { return MAPID; }, get terr() { return terr; },
               get solid() { return solid; }, get objs() { return objs; }, get rockTiles() { return rockTiles; },
               rebuildSolid, set npcs(v) { npcs = v; }, get npcs() { return npcs; },
               isSolid, canStand, T, GRASS, DIRT, COBBLE, FARM, WATER, BRIDGE, WALL,
               TS, get MW() { return MW; }, get MH() { return MH; } };

let heartKnown = false;
const BAG = [
  { key: "hs_light", kind: "key", name: "Heartstone of the Storm",
    tell: "Cut from the first dragon. It wakes the lightning in her.",
    has: () => breathHas.lightning,
    icon: () => (SPR.it_hs_light ? "it_hs_light" : null) },
  { key: "hs_shadow", kind: "key", name: "Heartstone of the Shadow",
    tell: "Cut from the first dragon. It takes the light out of what it touches.",
    has: () => breathHas.shadow,
    icon: () => (SPR.it_hs_shadow ? "it_hs_shadow" : null) },
  { key: "hs_ice", kind: "key", name: "Heartstone of the Ice",
    tell: "Cut from the first dragon. The last of the four.",
    has: () => breathHas.ice,
    icon: () => (SPR.it_hs_ice ? "it_hs_ice" : null) },
  { key: "saint", name: () => "Saint's Breath" + (breaths > 1 ? " x" + breaths : ""),
    tell: "Sixteen seconds in which nothing touches him.",
    has: () => breaths > 0,
    icon: () => (SPR.it_saint ? "it_saint" : null) },
  { key: "stone", name: () => "Resurrection Stone" + (stones > 1 ? " x" + stones : ""),
    tell: "The nearest of the dead gets up on his side, half as strong as it "
        + "was, until the fighting stops.",
    has: () => stones > 0,
    icon: () => (SPR.it_res ? "it_res" : null) },
  { key: "salt", name: () => "Consecration" + (salts > 1 ? " x" + salts : ""),
    tell: "Scatter it in a ring he has cleared and nothing will rise there again.",
    has: () => salts > 0,
    icon: () => (SPR.it_salt ? "it_salt" : null) },
  { key: "bell", name: () => "Bell Stake" + (bells > 1 ? " x" + bells : ""),
    tell: "Drive it in and it rings. Everything goes to the bell instead of to him.",
    has: () => bells > 0,
    icon: () => (SPR.it_bell ? "it_bell" : null) },
  { key: "mark", name: () => "Grave Marker" + (marks > 1 ? " x" + marks : ""),
    tell: () => (dropped && dropped.gold
                 ? "There is " + dropped.gold + " gold lying where he fell."
                 : "He has not dropped anything anywhere.")
              + " " + marks + " in the pack.",
    has: () => marks > 0,
    icon: () => (SPR.it_mark ? "it_mark" : null) },
  { key: "dust", name: () => "Madness Dust" + (dust > 1 ? " x" + dust : ""),
    tell: "Throw it up and for a little while they cannot tell one another from him.",
    has: () => dust > 0,
    icon: () => (SPR.it_dust ? "it_dust" : null) },
  { key: "bomb", name: () => "Maelis's Curse" + (bombs > 1 ? " x" + bombs : ""),
    tell: "Throw it down and walk away from a fight. It will not save him "
        + "from the things that matter.",
    has: () => bombs > 0,
    icon: () => (SPR.it_bomb ? "it_bomb" : SPR.sh_glow ? "sh_glow" : null) },
  { key: "elixir", name: () => "Elixir" + (elixirs > 1 ? " x" + elixirs : ""),
    tell: "Fills him to the brim. Whatever is in it, it is not for asking about.",
    has: () => elixirs > 0,
    icon: () => (SPR.it_elixir ? "it_elixir" : null) },
  { key: "potion", name: () => "Potion" + (potions > 1 ? " x" + potions : ""),
    tell: "Two hearts back, and no waiting about for it.",
    has: () => potions > 0,
    icon: () => (SPR.it_potion ? "it_potion" : null) },
  { key: "boarMeat", name: () => "Boar Meat" + (boarMeat > 1 ? " x" + boarMeat : ""),
    tell: "A heavy cut for the dragon. Restores " + BOAR_MEAT_HEAL + " HP and gets it back on its feet.",
    has: () => boarMeat > 0,
    icon: () => (SPR.pig_graze ? "pig_graze" : null) },
  { key: "dragonFish", name: () => "Fresh Fish" + (dragonFish > 1 ? " x" + dragonFish : ""),
    tell: "A fresh catch for the dragon. Restores " + DRAGON_FISH_HEAL + " HP and gets it back on its feet.",
    has: () => dragonFish > 0,
    icon: () => (SPR.hb_fish1 ? "hb_fish1" : null) },
  {key:'fishingPole',name:'Fishing Pole',kind:'key',has:()=>fishingPole,
    tell:'A gift from Liora at Forgefalls. Face water and press A; stop the marker in the green arc to catch dragon-healing fish.',icon:()=> 'fishing_rod'},
  { key: "glassShield", name: "Glass Shield", kind: "key",
    tell: "Sela's clear-glass focus. Tap/hold B to raise a brief force field. Move with B held to run. Orange flashes warn of blockable attacks; red flashes warn of unblockable attacks.",
    has: () => glassShield,
    icon: () => (SPR.it_ward ? "it_ward" : SPR.sh_glow ? "sh_glow" : null) },
  { key: "wake", name: "Book of the Dead", kind: "key",
    tell: "Taken from the Hollybeck graves. Carry it and two of them rise at "
        + "your call -- there is no need to wear it.",
    has: () => charm.wake,
    icon: () => (SPR.it_wake ? "it_wake" : SPR.it_stone ? "it_stone" : null) },
  { key: "flame", kind: "charm", name: "Twin Flame",
    tell: "Won in the last gallery. With the Twin Heart worn, four kills and the heart beats again.",
    has: () => charm.flame, charm: "flame",
    icon: () => (SPR.it_twinflame ? "it_twinflame" : SPR.fire_s ? "fire_s" : null) },
  { key: "lamp", kind: "key", name: "Hollybeck Lantern",
    tell: "Torvald trimmed the wick himself. It has never once gone out, and the deep workings can be walked with it.",
    has: () => charm.lamp,
    icon: () => (SPR.it_lamp ? "it_lamp" : SPR.wt_torch1 ? "wt_torch1" : null) },
  { key: "twin", kind: "charm", name: "Twin Heart",
    tell: "Once in each fight the dragon steps into a blow meant for Corin.",
    has: () => charm.twin, charm: "twin",
    icon: () => (SPR.it_twin ? "it_twin" : SPR.dr5_idle_e ? "dr5_idle_e" : null) },
  { key: "brand", kind: "charm", name: "Fire Slash",
    tell: "A rune cut into stone and still burning. Every third swing catches fire and bites harder.",
    has: () => charm.brand, charm: "brand",
    icon: () => (SPR.it_brand ? "it_brand" : SPR.fslash_d ? "fslash_d" : null) },
  { key: "spore", kind: "charm", name: "Spore of the deep ring",
    tell: "The Shroom King's gift. Worn, it feeds a heart back for every kill.",
    has: () => charm.spore, charm: "spore",
    icon: () => (SPR.it_spore ? "it_spore" : SPR.ms3_idle_d ? "ms3_idle_d" : null) },
  { key: "ward", kind: "charm", name: "Witch's Ward",
    tell: "Maelis strung it herself. Worn, it turns a quarter of any blow.",
    has: () => charm.ward, charm: "ward",
    icon: () => (SPR.it_ward ? "it_ward" : SPR.it_stone ? "it_stone" : null) },
  { key: "edge", kind: "charm", name: "Dunstan's Whetstone",
    tell: "He put an edge on it every morning for forty years. Every blow lands a little heavier.",
    has: () => charm.edge, charm: "edge",
    icon: () => (SPR.it_edge ? "it_edge" : null) },
  { key: "sword", kind: "key", name: "Sword",
    tell: "Taken from the Elder's hall. Heavier than it looks.",
    has: () => hasSword(),
    icon: () => (SPR.it_sword ? "it_sword" : SPR.sm_atk_d ? "sm_atk_d" : null) },
  { key: "smithEquipment", kind: "key", name: "Forgewick armor and sword",
    tell: "Fitted by Dunstan. A stronger blade and armor that softens heavy blows.",
    has: () => smithUpgrade && hasSword(),
    icon: () => "corin_armor_idle_d" },
  { key: "cinderSeal", kind: "key", name: "Cinderhold Seal",
    tell: "Given by the demon after Halvard's defeat. Place it in the chamber adjoining the throne room, then speak to the demon there to begin the trials.",
    has: () => cinderSeal,
    icon: () => "it_cinderseal" },
  { key: "egg", name: "Dragon's egg",
    tell: "Warm to the touch. Maddock said there had not been one in fifty years.",
    has: () => quest >= Q.CARRY && quest < Q.DONE,
    icon: () => (SPR.it_egg ? "it_egg" : SPR.nest1 ? "nest1" : null) },
  { key: "heart", kind: "key",
    name: () => (heartKnown ? "Heartstone of the Flame" : "Mysterious stone"),
    tell: () => heartKnown
      ? "The first of the four, and the one she was born with. Aldric says "
        + "this is what binds a rider to a dragon."
      : "It was inside the shell. Smooth, and warmer than it ought to be.",
    has: () => quest >= Q.DONE,
    icon: () => (SPR.it_hs_flame ? "it_hs_flame" : SPR.it_egg ? "it_egg" : null) },
  { key: "eggs", name: "Six brown eggs",
    tell: "Gathered for the errand. Do not run.",
    has: () => quest >= Q.KING && quest < Q.ELDER,
    icon: () => (SPR.nest2 ? "nest2" : null) },
];
let bagOpen = false, bagPick = 0;

/* Animated bag icons. refreshBag() rebuilds the slots as DOM canvases and only
   runs on open or click, so anything with more than one frame registers its
   canvas here and a rAF loop repaints just those. Redrawing them in place
   rather than calling refreshBag() keeps the click handlers and the DOM alive. */
let bagFrame = 0, bagAnim = [], bagRAF = 0;
const BAG_FPS = 9;

function drawBagBig(big, spriteName, f) {
  const bg = big.getContext("2d");
  bg.clearRect(0, 0, big.width, big.height);
  const sp = spriteName && SPR[spriteName];
  if (!sp) return;
  const fr = sp[4] > 1 ? ((f | 0) % sp[4]) : 0;
  bg.imageSmoothingEnabled = false;
  /* The canvas is 260px square. The original scaled to fit 88 and then centred
     in the full width, so every icon sat stranded at a third of its size. */
  const room = Math.min(big.width, big.height) - 24;
  const sc = Math.max(1, Math.floor(Math.min(room / sp[2], room / sp[3])));
  const img = sp[5] === 2 ? smImg : sp[5] ? dragonImg : atlasImg;
  drawGameImage(bg, img, sp[0] + fr * sp[2], sp[1], sp[2], sp[3],
               (big.width - sp[2] * sc) / 2, (big.height - sp[3] * sc) / 2,
               sp[2] * sc, sp[3] * sc);
}

function bagTick() {
  bagRAF = 0;
  if (!bagOpen || !bagAnim.length) return;
  const f = Math.floor(performance.now() / (1000 / BAG_FPS));
  if (f !== bagFrame) {
    bagFrame = f;
    for (const [cv, nm, big] of bagAnim) {
      if (!cv.isConnected) continue;
      if (big) drawBagBig(cv, nm, f); else drawBagIcon(cv, nm, f);
    }
  }
  bagRAF = requestAnimationFrame(bagTick);
}
function bagName(it) { return typeof it.name === "function" ? it.name() : it.name; }
function bagTell(it) { return typeof it.tell === "function" ? it.tell() : it.tell; }
const BAG_ORDER = { key: 0, charm: 1, use: 2 };
function bagKind(it) { return it.kind || (it.charm ? "charm" : "use"); }
function bagHeld() {
  const held = BAG.filter(it => { try { return !!it.has(); } catch (e) { return false; } });
  held.sort((a, b) => BAG_ORDER[bagKind(a)] - BAG_ORDER[bagKind(b)]);
  return held;
}
function drawBagIcon(cv, spriteName, f) {
  const g = cv.getContext("2d"), s = SPR[spriteName];
  g.clearRect(0, 0, cv.width, cv.height);
  if (!s) return;
  const room = Math.min(cv.width, cv.height) - 6;
  const fit = Math.min(room / s[2], room / s[3]);
  const sc = fit >= 1 ? Math.min(3, Math.floor(fit)) : fit;
  const fr = s[4] > 1 ? ((f | 0) % s[4]) : 0;
  g.imageSmoothingEnabled = false;
  drawGameImage(g, sheetOf(s), s[0] + fr * s[2], s[1], s[2], s[3],
              (cv.width - s[2] * sc) / 2, (cv.height - s[3] * sc) / 2,
              s[2] * sc, s[3] * sc);
}
let bookOpen = false, bookPick = 0;
function drawBookArt(cv, ent, known) {
  const g = cv.getContext("2d");
  g.clearRect(0, 0, cv.width, cv.height);
  const kinds = [ent.k];
  const sps = kinds.map(k => {
    const art = FOE_ART[k];
    return art && (SPR[art + "_idle_d"] || SPR[art + "_walk_d"]
                || SPR[art + "_idle"]   || SPR[art + "_walk"]);
  }).filter(Boolean);
  if (!sps.length) return;
  g.imageSmoothingEnabled = false;
  const n = sps.length;
  const small = cv.width < 150;      /* a tile, however big; not the portrait */
  const pad = small ? 8 : 6;
  if (small) {
    const slot = cv.width / n;
    sps.forEach((sp, i) => {
      const fit = Math.min((slot - pad) / sp[2], (cv.height - pad) / sp[3]);
      const sc = fit >= 1 ? Math.floor(fit) : fit;
      const dw = sp[2] * sc, dh = sp[3] * sc;
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round(slot * i + (slot - dw) / 2),
                  Math.round((cv.height - dh) / 2), dw, dh);
    });
  } else {
    const share = n > 2 ? 1 / n : n > 1 ? 0.74 : 1;
    sps.forEach((sp, i) => {
      const sc = Math.max(1, Math.floor(Math.min((cv.width * share - pad) / sp[2],
                                                 (cv.height * share - pad) / sp[3])));
      const dw = sp[2] * sc, dh = sp[3] * sc;
      const off = n > 2 ? (i - (n - 1) / 2) * cv.width / n
                : n > 1 ? (i === 0 ? -1 : 1) * cv.width * 0.13 : 0;
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round((cv.width - dw) / 2 + off),
                  Math.round((cv.height - dh) / 2 + (n > 1 ? (i === 0 ? -6 : 6) : 0)),
                  dw, dh);
    });
  }
  if (!known) {
    g.globalCompositeOperation = "source-atop";
    g.fillStyle = "#0a0b10";
    g.fillRect(0, 0, cv.width, cv.height);
    g.globalCompositeOperation = "source-over";
  }
}
function refreshBook() {
  const rows = document.getElementById("bagRows");
  const desc = document.getElementById("bagDesc");
  if (!rows || !desc) return;
  if (bookPick < 0) bookPick = BESTIARY.length - 1;
  if (bookPick >= BESTIARY.length) bookPick = 0;
  rows.innerHTML = "";
  const PAGES = bookOrder();
  PAGES.forEach((ent, k) => {
    const known = !!seenFoe[ent.k];
    const d = document.createElement("div");
    d.className = "slot" + (k === bookPick ? " on" : "") + (known ? "" : " empty");
    const cv = document.createElement("canvas");
    cv.width = 96; cv.height = 96;
    cv.style.cssText = "image-rendering:pixelated;width:100%;height:auto";
    d.appendChild(cv);
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      if (bagDragged()) return;
      bookPick = k; refreshBook();
    });
    rows.appendChild(d);
    drawBookArt(cv, ent, known);
  });
  const ent = PAGES[bookPick], known = !!seenFoe[ent.k];
  const big = document.getElementById("bagBig");
  if (big) drawBookArt(big, ent, known);
  desc.innerHTML = known
    ? "<b>" + ent.n + "</b><span>" + ent.t + "</span><span style='opacity:.65'>Found in "
      + ent.w + ".</span>"
    : "<b>?????</b><span>He has not met this one.</span>";
  const n = BESTIARY.filter(e => seenFoe[e.k]).length;
  const g2 = document.getElementById("bagGold");
  if (g2) { const i = g2.querySelector("i");
            if (i) i.textContent = n + "/" + BESTIARY.length; }

}
function refreshBag() {
  bagAnim = [];
  const bk = document.getElementById("bagBook");
  if (bk && !bk._wired) {
    bk._wired = 1;
    bk.addEventListener("click", (e) => {
      e.stopPropagation(); bookOpen = !bookOpen; refreshBag();
    });
  }
  if (bk) {
    const lab = bk.querySelector("i");
    if (lab) lab.textContent = bookOpen ? "CLOSE" : "BESTIARY";
    else bk.textContent = bookOpen ? "CLOSE" : "BESTIARY";
    const bi = document.getElementById("bagBookIcon");
    const bsp = (bookOpen && SPR.it_book_open) ? SPR.it_book_open : SPR.it_book;
    if (bi && bsp) {
      const bg = bi.getContext("2d");
      bg.clearRect(0, 0, bi.width, bi.height);
      bg.imageSmoothingEnabled = false;
      const bs = Math.min(bi.width / bsp[2], bi.height / bsp[3]);
      drawGameImage(bg, atlasImg, bsp[0], bsp[1], bsp[2], bsp[3],
                   Math.round((bi.width - bsp[2] * bs) / 2),
                   Math.round((bi.height - bsp[3] * bs) / 2),
                   bsp[2] * bs, bsp[3] * bs);
    }
  }
  const bagEl = document.getElementById("bag");
  if (bagEl) bagEl.classList.toggle("book", !!bookOpen);
  if (bookOpen) { refreshBook(); return; }
  const g = document.getElementById("bagGold");
  if (g) { const i = g.querySelector("i"); if (i) i.textContent = gold; }
  const cn = document.getElementById("bagCoin");
  if (cn) {
    const sp = SPR.it_coin || SPR.gold_p2;
    const cg = cn.getContext("2d");
    cg.clearRect(0, 0, cn.width, cn.height);
    if (sp) {
      cg.imageSmoothingEnabled = false;
      const sc = Math.min(cn.width / sp[2], cn.height / sp[3]);
      drawGameImage(cg, atlasImg, sp[0], sp[1], sp[2], sp[3],
                   Math.round((cn.width - sp[2] * sc) / 2),
                   Math.round((cn.height - sp[3] * sc) / 2),
                   sp[2] * sc, sp[3] * sc);
    }
  }
  const rows = document.getElementById("bagRows");
  const desc = document.getElementById("bagDesc");
  const held = bagHeld();
  rows.innerHTML = "";
  if (bagPick >= held.length) bagPick = held.length - 1;
  if (bagPick < 0) bagPick = 0;
  const SLOTS = Math.max(8, Math.ceil((held.length + 1) / 4) * 4);
  let lastKind = null;
  for (let k = 0; k < SLOTS; k++) {
    const it = held[k];
    if (it) {
      const kind = bagKind(it);
      if (kind !== lastKind) {
        if (lastKind !== null) {
          while (rows.querySelectorAll(".slot").length % 4) {
            const pad = document.createElement("div");
            pad.className = "slot empty";
            rows.appendChild(pad);
          }
        }
        lastKind = kind;
        const h = document.createElement("div");
        h.style.cssText = "grid-column:1/-1;font-size:10px;letter-spacing:2px;"
          + "opacity:.6;margin:6px 0 0;text-transform:uppercase";
        h.textContent = kind === "key" ? "carried"
                      : kind === "charm" ? "charms" : "supplies";
        rows.appendChild(h);
      }
    }
    const d = document.createElement("div");
    d.className = "slot" + (it ? "" : " empty") + (it && k === bagPick ? " on" : "");
    if (it) {
      const cv = document.createElement("canvas");
      cv.width = 46; cv.height = 46;
      d.appendChild(cv);
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        if (bagDragged()) return;
        bagPick = k; refreshBag();
      });
      const ic = it.icon();
      if (ic) { drawBagIcon(cv, ic, bagFrame); if (SPR[ic] && SPR[ic][4] > 1) bagAnim.push([cv, ic]); }
    }
    rows.appendChild(d);
  }
  desc.innerHTML = held.length
    ? "<b>" + bagName(held[bagPick]) + "</b><span>" + bagTell(held[bagPick]) + "</span>"
    : "<span>Corin is not carrying anything yet.</span>";
  const big = document.getElementById("bagBig");
  if (big) {
    const ic = held.length && held[bagPick].icon();
    drawBagBig(big, ic, bagFrame);
    if (ic && SPR[ic] && SPR[ic][4] > 1) bagAnim.push([big, ic, 1]);
  }
  const pickIt = held[bagPick];
  if (pickIt && (pickIt.key === "potion" || pickIt.key === "elixir")) {
    const b = document.createElement("div");
    b.className = "equipBtn";
    b.textContent = pickIt.key === "elixir" ? "DRINK -- full health (A)"
                                            : "DRINK -- two hearts (A)";
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (pickIt.key === "elixir") drinkElixir(); else drinkPotion();
      refreshBag();
    });
    desc.appendChild(b);
  }
  if (pickIt && pickIt.charm) {
    const b = document.createElement("div");
    b.className = "equipBtn" + (worn[pickIt.charm] ? " on" : "");
    const full = !worn[pickIt.charm] && wornCount() >= WORN_MAX;
    b.textContent = worn[pickIt.charm] ? "EQUIPPED -- A to unequip"
                  : full ? "EQUIP (" + wornCount() + "/" + WORN_MAX + " -- full)"
                  : "EQUIP (" + wornCount() + "/" + WORN_MAX + ")";
    if (full) b.className += " full";
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = worn[pickIt.charm];
      if (!on && wornCount() >= WORN_MAX) {
        toast("three at a time -- take one off first");
        return;
      }
      worn[pickIt.charm] = !on;
      refreshBag();
    });
    desc.appendChild(b);
  }
}
let ask = null, askPick = 0;
function askBack(){const back=ask?.back;askShut();if(back)back();}
function askShut() {
  if(fishing&&fishing.phase==='prompt')endFishing();
  ask = null;
  const el = document.getElementById("bagAsk");
  if (el) el.style.display = "none";
}
function askDraw() {
  const el = document.getElementById("bagAsk");
  const rows = document.getElementById("askRows");
  if (!el || !rows) return;
  if (!ask) { el.style.display = "none"; return; }
  el.style.display = "block";
  wireBagDrag("bagAsk");
  el.style.width=ask.quantity?'200px':ask.confirmation?'260px':'';
  rows.innerHTML = "";
  if(ask.quantity){
    const q=ask.quantity,item=STOCK[q.key];
    const title=document.createElement('div');title.textContent=item.n;
    title.style.cssText='text-align:center;font-size:14px;font-weight:bold;padding:6px';rows.appendChild(title);
    const controls=document.createElement('div');controls.style.cssText='display:flex;align-items:center;justify-content:center;gap:14px;padding:4px';
    for(const [label,delta]of [['▼',-1],['▲',1]]){
      const b=document.createElement('button');b.type='button';b.textContent=label;
      b.setAttribute('aria-label',delta>0?'Increase quantity':'Decrease quantity');
      b.style.cssText='width:44px;height:44px;font-size:18px';b.disabled=delta>0?q.qty>=q.max:q.qty<=1;
      b.addEventListener('click',e=>{e.stopPropagation();changePurchaseQuantity(delta);});controls.appendChild(b);
      if(delta<0){const value=document.createElement('span');value.textContent=q.qty;value.setAttribute('aria-live','polite');value.style.cssText='font-size:28px;font-weight:bold;min-width:32px;text-align:center';controls.appendChild(value);}
    }
    rows.appendChild(controls);
    const detail=document.createElement('div');detail.textContent='Total: '+q.qty*item.cost()+'g · Gold: '+gold;
    detail.style.cssText='text-align:center;font-size:13px;padding:6px';rows.appendChild(detail);
    const hint=document.createElement('div');hint.textContent='D-pad ↑ / ↓: quantity';hint.style.cssText='text-align:center;font-size:12px;padding:3px';rows.appendChild(hint);
  }
  ask.opts.forEach((o, i) => {
    const d = document.createElement("div");
    if (o.head) {
      const heal = o.n === "HEALTH";
      d.style.cssText = "margin:5px 2px 3px;padding:3px 8px;border-radius:5px;"
        + "font-size:10px;font-weight:700;letter-spacing:3px;"
        + "text-transform:uppercase;"
        + (heal ? "color:#4a6b3d;background:rgba(120,170,100,.28);"
                + "border-left:3px solid #6f9c58;"
                : "color:#7a3f3a;background:rgba(190,110,95,.26);"
                + "border-left:3px solid #b0685c;");
      d.textContent = o.n;
      if(ask.confirmation)d.style.cssText='padding:8px;font-size:14px;line-height:1.45;font-weight:bold;white-space:normal;overflow-wrap:anywhere';
      rows.appendChild(d);
      return;
    }
    d.style.cssText = "padding:8px;border-radius:6px;white-space:normal;overflow-wrap:anywhere;"
      + (i === askPick ? "background:#d8c9a4;font-weight:700" : "");
    if (o.icon && SPR[o.icon]) {
      d.style.cssText += ";display:flex;align-items:center;gap:6px";
      const cv = document.createElement("canvas");
      cv.width = 18; cv.height = 18;
      cv.style.cssText = "image-rendering:pixelated;width:18px;height:18px;flex:0 0 auto";
      d.appendChild(cv);
      const sp = SPR[o.icon], g = cv.getContext("2d");
      g.imageSmoothingEnabled = false;
      const sc = Math.max(1, Math.min(Math.floor(18 / sp[2]), Math.floor(18 / sp[3])));
      drawGameImage(g, atlasImg, sp[0], sp[1], sp[2], sp[3],
                  Math.round((18 - sp[2] * sc) / 2), Math.round((18 - sp[3] * sc) / 2),
                  sp[2] * sc, sp[3] * sc);
      const t = document.createElement("span");
      t.textContent = (i === askPick ? "\u25B8 " : "  ") + o.n;
      d.appendChild(t);
    } else {
      d.textContent = (i === askPick ? "\u25B8 " : "  ") + o.n;
    }
    d.dataset.askIndex = i;
    d.addEventListener("click", (e) => { e.stopPropagation(); if(el.moved)return; askPick = i; askTake(); });
    rows.appendChild(d);
  });
}
function askStep(d) {
  if (!ask) return;
  if(ask.quantity){changePurchaseQuantity(-d);return;}
  const n = ask.opts.length;
  let k = askPick;
  for (let i = 0; i < n; i++) {
    k = (k + d + n) % n;
    if (!ask.opts[k].head) break;
  }
  askPick = k;
  askDraw();
  const box=document.getElementById("bagAsk"), row=box.querySelector('[data-ask-index="'+askPick+'"]');
  if(row){const a=row.getBoundingClientRect(),b=box.getBoundingClientRect();
    if(a.top<b.top+6)box.scrollTop-=b.top+6-a.top;
    else if(a.bottom>b.bottom-6)box.scrollTop+=a.bottom-b.bottom+6;}
}
const USE_SAID = {
  mark:   ["it_mark",   "Corin planted the Grave Marker!"],
  salt:   ["it_salt",   "Corin consecrated the ground!"],
};
function askTake() {
  if (!ask) return;
  const o = ask.opts[askPick];
  if (!o || o.head) return;              /* a header does nothing */
  const key = ask.key, quick = ask.quick;
  askShut();
  if (quick) { if (o.go) o.go(); return; }   /* the on-screen list does its own box */
  const done = o.go ? o.go() : null;
  if (!o.go || done === false) { refreshBag(); return; }
  if (USABLE[key]) setBag(false);
  const said = USE_SAID[key];
  if (said) {
    setBag(false);                       /* out of the pack and back to it */
    flashReveal(SPR[said[0]] ? said[0] : "it_potion", said[1]);
    return;
  }
  refreshBag();
}
const HEALS = { potion: 0, elixir: 1, boarMeat: 2, dragonFish: 3 };
const USABLE = { potion: 1, elixir: 1, boarMeat: 1, dragonFish: 1, bomb: 1, dust: 1, bell: 1,
                 mark: 1, saint: 1, stone: 1, salt: 1 };
function bagUsable() {
  const list = BAG.filter(it => {
    if (!USABLE[it.key]) return false;
    try { return !!it.has(); } catch (e) { return false; }
  });
  list.sort((a, b) => {
    const ha = HEALS[a.key] !== undefined, hb = HEALS[b.key] !== undefined;
    if (ha !== hb) return ha ? -1 : 1;
    if (ha) return HEALS[a.key] - HEALS[b.key];
    return 0;
  });
  return list;
}
function useAsk() {
  const list = bagUsable();
  if (!list.length) { toast("nothing to use"); return; }
  const opts = [];
  let lastHeal = null;
  for (const it of list) {
    const heal = HEALS[it.key] !== undefined;
    if (heal !== lastHeal) {
      lastHeal = heal;
      opts.push({ n: heal ? "HEALTH" : "BATTLE", head: 1 });
    }
    opts.push({
      n: (typeof it.name === "function" ? it.name() : it.name).toUpperCase(),
      icon: it.icon ? it.icon() : null,
      go: () => doUse(it),
    });
  }
  opts.push({ n: "CANCEL", go: null });
  ask = { opts, quick: 1 };
  askPick = opts.findIndex(o => !o.head);   /* never start on a header */
  if (askPick < 0) askPick = 0;
  askDraw();
}
function doUse(it) {
  const act = it.key === "potion" ? drinkPotion
            : it.key === "elixir" ? drinkElixir
            : it.key === "boarMeat" ? () => feedDragon("meat")
            : it.key === "dragonFish" ? () => feedDragon("fish")
            : it.key === "bomb"   ? useBomb
            : it.key === "dust"   ? useDust
            : it.key === "bell"   ? useBell
            : it.key === "mark"   ? useMark
            : it.key === "saint"  ? useSaint
            : it.key === "stone"  ? useStone
            : it.key === "salt"   ? useSalt
            : null;
  if (!act) return false;
  const done = act();
  if (done === false) return false;
  setBag(false);setOvl(null);
  const said = USE_SAID[it.key];
  if (said) flashReveal(SPR[said[0]] ? said[0] : "it_potion", said[1]);
  return true;
}
function bagUse() {
  if (ask) { askTake(); return; }
  if (bookOpen) { bookOpen = false; refreshBag(); return; }
  const held = bagHeld();
  const it = held[bagPick];
  if (!it) { setBag(false); return; }
  const opts = [];
  if (it.key === "saint") opts.push({ n: "BREATHE IT", go: useSaint });
  else if (it.key === "stone") opts.push({ n: "RAISE ONE", go: useStone });
  else if (it.key === "salt") opts.push({ n: "SCATTER IT", go: useSalt });
  else if (it.key === "bell") opts.push({ n: "DRIVE IT IN", go: useBell });
  else if (it.key === "mark") opts.push({ n: "PLANT THEM", go: useMark });
  else if (it.key === "dust") opts.push({ n: "THROW IT", go: useDust });
  else if (it.key === "bomb") opts.push({ n: "SPEAK IT", go: useBomb });
  else if (it.key === "potion") opts.push({ n: "USE", go: drinkPotion });
  else if (it.key === "elixir") opts.push({ n: "USE", go: drinkElixir });
  else if (it.key === "boarMeat") opts.push({ n: "FEED DRAGON", go: () => feedDragon("meat") });
  else if (it.key === "dragonFish") opts.push({ n: "FEED DRAGON", go: () => feedDragon("fish") });
  else if (it.charm) {
    const on = worn[it.charm];
    if (!on && wornCount() >= WORN_MAX) { toast("three at a time -- take one off first"); return; }
    opts.push({ n: on ? "UNEQUIP" : "EQUIP",
                go: () => { worn[it.charm] = !on; toast(!on ? "worn" : "taken off"); } });
  } else { toast("nothing to do with it"); return; }
  opts.push({ n: "CANCEL", go: null });
  ask = { opts, key: it.key }; askPick = 0;
  askDraw();
}
function bagStep(d) {
  if (ask) { askStep(d > 0 ? 1 : -1); return; }   /* the box has the pad */
  if (bookOpen) {
    bookPick += (Math.abs(d) >= 4) ? (d > 0 ? 2 : -2) : d;
    const n = BESTIARY.length;
    if (Math.abs(d) >= 4) bookPick = Math.max(0, Math.min(n - 1, bookPick));
    else { while (bookPick < 0) bookPick += n; bookPick %= n; }
    refreshBook();
    bagShow();                 /* and bring the choice into view */
    return;
  }
  const held = bagHeld();
  if (!held.length) return;
  const cells = bagGrid(held);
  const at = cells.indexOf(bagPick);
  if (at < 0) { bagPick = 0; refreshBag(); bagShow(); return; }
  if (Math.abs(d) >= 4) {
    const step = d > 0 ? 4 : -4;
    let k = at + step;
    while (k >= 0 && k < cells.length && cells[k] === null) k += (d > 0 ? 1 : -1);
    if (k >= 0 && k < cells.length && cells[k] !== null) bagPick = cells[k];
  } else {
    let k = at + d;
    while (k >= 0 && k < cells.length && cells[k] === null) k += d;
    if (k < 0) k = cells.length - 1;
    if (k >= cells.length) k = 0;
    while (cells[k] === null) k = (k + (d > 0 ? 1 : -1) + cells.length) % cells.length;
    bagPick = cells[k];
  }
  refreshBag();
  bagShow();
}
function bagGrid(held) {
  const cells = [];
  let lastKind = null;
  held.forEach((it, i) => {
    const kind = bagKind(it);
    if (kind !== lastKind) {
      if (lastKind !== null) while (cells.length % 4) cells.push(null);
      lastKind = kind;
    }
    cells.push(i);
  });
  return cells;
}
function bagShow() {
  const rows = document.getElementById("bagRows");
  const left = document.getElementById("bagLeft");
  if (!rows || !left) return;
  const on = rows.querySelector(".slot.on");
  if (!on) return;
  const a = on.getBoundingClientRect(), b = left.getBoundingClientRect();
  if (a.top < b.top) left.scrollTop -= (b.top - a.top) + 8;
  else if (a.bottom > b.bottom) left.scrollTop += (a.bottom - b.bottom) + 12;
}
function wireBagDrag(id = "bagLeft") {
  var left = document.getElementById(id);
  if (!left || left._wired) return;
  left._wired = 1;
  var y0 = 0, top0 = 0, on = false;
  left.moved = 0;
  function yOf(e) {
    if (e.touches && e.touches.length) return e.touches[0].clientY;
    return e.clientY || 0;
  }
  left.addEventListener("touchstart", function (e) {
    on = true; y0 = yOf(e); top0 = left.scrollTop; left.moved = 0;
  }, { passive: true });
  left.addEventListener("touchmove", function (e) {
    if (!on) return;
    var dy = yOf(e) - y0;
    if (dy > 3 || dy < -3) left.moved = 1;
    var max = left.scrollHeight - left.clientHeight;
    if (max < 0) max = 0;
    var t = top0 - dy;
    left.scrollTop = t < 0 ? 0 : (t > max ? max : t);
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  }, { passive: false });
  function done() {
    on = false;
    setTimeout(function () { left.moved = 0; }, 30);
  }
  left.addEventListener("touchend", done, { passive: true });
  left.addEventListener("touchcancel", done, { passive: true });
}
function bagDragged() {
  var left = document.getElementById("bagLeft");
  return !!(left && left.moved);
}
function setBag(on) {
  if(on&&fishing)return;
  if (!on) { bookOpen = false; askShut(); }      /* both shut with the pack */
  bagOpen = on;
  document.getElementById("bag").style.display = on ? "flex" : "none";
  if (on) { bagPick = 0; refreshBag(); wireBagDrag(); if (!bagRAF) bagRAF = requestAnimationFrame(bagTick); }
  else if (bagRAF) { cancelAnimationFrame(bagRAF); bagRAF = 0; bagAnim = []; }
}
const bagCloseBtn = document.getElementById("bagClose");
const bagSaveBtn = document.getElementById("bagSave");
const bagMusicBtn = document.getElementById("bagMusic");
if (bagCloseBtn) bagCloseBtn.addEventListener("pointerup", e => { e.preventDefault(); e.stopPropagation(); setBag(false); });
if (bagSaveBtn) bagSaveBtn.addEventListener("pointerup", e => {
  e.preventDefault(); e.stopPropagation();
  setBag(false);
  setOvl("savePrompt");
});
if (bagMusicBtn) bagMusicBtn.addEventListener("pointerup", e => {
  e.preventDefault(); e.stopPropagation();
  setBag(false);
  setOvl("sound");
  setTimeout(syncSoundDial,0);
});


const WM_ABOUT = {
  "Millwood":            "The mill village where Corin began. Waterwheel, a few roofs, and the road east.",
  "Thornwell":           "A woodland town of thorn hedges and close-set houses, second on the road.",
  "Forgewick":           "Forge town at the woodland's edge. Its mine runs deep under the hills.",
  "Forgewick Temple":    "Quiet hall south-east of the forge, kept by its own order.",
  "Sandspire":           "Spire city of the deep desert, built where the sand road meets the dunes.",
  "Sandspire Temple":    "Sandstone temple standing alone in the southern desert.",
  "The Oasis":           "Green water in the middle of the sand. Everything that crosses stops here.",
  "Coralmere":           "Harbour on the blue bay, where the desert gives way to the wet country.",
  "Hollybeck":           "Snowbound town below the crags, last settlement before the mountains.",
  "Hollybeck Temple":    "High temple north-east of the town, above the snowline.",
  "Hollybeck Graveyard": "Old stones west of Hollybeck, older than the town itself.",
  "Northern Woods":      "Deep timber north of Millwood. No road runs through it.",
  "Shroom Pass":         "A gorge grown over with mushrooms, north of the mill.",
  "North Shroom Pass Field": "Open ground at the head of the pass.",
  "Spore Hollow":        "A dell in the northern woods, thick with spores.",
  "Elders Home":         "The witch's cottage south of Millwood. A light in the window, always.",
  "Forgefalls":       "Water off the moor, south of the road.",
  "Witchmoor":      "A landing on the swamp water, east of Coralmere.",
  "Frostcrag":           "Snow mountain at the eastern edge. A pass runs under it.",
  "Ashcrag":             "Volcanic mountain, the far mouth of the pass. Lava road beyond.",
  "Cinderhold":          "Dark keep on an island in the lava, at the end of the last road.",
};
let gameplayStarted = false;
const BOOT = {
  at: 0, timer: 0,
  paint() {
    const f = document.getElementById("bootFill");
    if (f) f.style.width = BOOT.at.toFixed(1) + "%";
  },
  say(msg) {
    const m = document.getElementById("bootMsg");
    if (m && msg) m.textContent = msg;
  },
  to(pct, ms, msg) {
    BOOT.say(msg);
    return new Promise((res) => {
      const from = BOOT.at, span = pct - from, t0 = Date.now();
      if (BOOT.timer) clearInterval(BOOT.timer);
      BOOT.timer = setInterval(() => {
        let p = (Date.now() - t0) / ms;
        if (p > 1) p = 1;
        BOOT.at = from + span * (1 - Math.pow(1 - p, 2));
        BOOT.paint();
        if (p >= 1) { clearInterval(BOOT.timer); BOOT.timer = 0; res(); }
      }, 16);
    });
  },
  step(pct, msg) { BOOT.say(msg); },
  waiting: false,
  async ready() {
    await BOOT.to(100, 900, "");
    BOOT.waiting = true;
    const m = document.getElementById("bootMsg");
    const b = document.getElementById("bootBtns");
    const l = document.getElementById("bootLoad");
    const bar = document.getElementById("bootFill");
    if (bar) bar.style.width = "100%";
    if (m) m.textContent = "";
    if (b) b.style.display = "flex";
    const lbl = document.getElementById("bootLabel");
    if (lbl) { lbl.textContent = "LOADED!"; lbl.style.color = "#f0c060"; }
    const h = document.getElementById("bootHint");
    if (h) h.textContent = "press A to start";
    let has = false;
    try { migrateLegacySave(); has = !!(readSaveSlot(1)||readSaveSlot(2)||readSaveSlot(3)); } catch (e) { has = false; }
    if (l) { l.style.opacity = has ? "1" : ".35"; l.dataset.on = has ? "1" : ""; }
  },
  close() {
    gameplayStarted = true;
    BOOT.waiting = false;
    const el = document.getElementById("boot");
    if (el) el.style.display = "none";
  },
};
function bootStart() { try { BOOT.to(9, 450, "waking the embers"); } catch (e) {} }
bootStart();

function bootBind() {
  const nw = document.getElementById("bootNew");
  const ld = document.getElementById("bootLoad");
  if (nw && nw.addEventListener)
    nw.addEventListener("click", () => { BOOT.close(); });
  if (ld && ld.addEventListener)
    ld.addEventListener("click", () => {
      if (!ld.dataset.on) return;
      BOOT.close();
      try { setOvl("loadSlots"); } catch (e) {}
    });
}

const MENUS = {
  savePrompt: { rows: "savePromptRows", desc: "savePromptDesc", pick: 0, items: () => [
    { name: "Overwrite existing save", tell: "Choose an existing save slot to overwrite.", go: () => setOvl("saveSlots") },
    { name: "Create new save", tell: "Use the first empty save slot.", go: () => { const slot=firstEmptySaveSlot(); if(!slot){toast("all save slots are full — overwrite one instead");setOvl("saveSlots");return;} saveToSlot(slot); setOvl(null); } },
    { name: "Back", tell: "Close the save menu.", go: () => setOvl(null) }
  ] },
  saveSlots: { rows: "saveSlotRows", desc: "saveSlotDesc", pick: 0, items: () => saveSlotItems("overwrite") },
  loadSlots: { rows: "loadSlotRows", desc: "loadSlotDesc", pick: 0, items: () => saveSlotItems("load") },
  manageSaves: { rows: "manageSaveRows", desc: "manageSaveDesc", pick: 0, items: () => saveSlotItems("manage") },
  sound: { rows: "soundRows", desc: "soundDesc", pick: 0, items: () => [
    ...[0,25,50,75,100].map(v => ({
      name: () => (v === 0 ? "Music off" : "Music " + v + "%") + ((window.EmberAudio && window.EmberAudio.percent() === v) ? "  ✓" : ""),
      tell: v === 0 ? "Mute the background music." : "Set background music volume to " + v + "%.",
      go: () => { if (window.EmberAudio) window.EmberAudio.set(v); refreshOvl(); }
    })),
    { name: "Back", tell: "Close sound settings.", go: () => setOvl(null) }
  ] },
  atkm: { rows: "atkRows", desc: "atkDesc", pick: 0, items: () => ATTACKS.filter(a=>breathHas[EL_BREATH[a.el]]) },
  itemm: { rows: "itemRows", desc: "itemDesc", pick: 0, items: () => bagUsable().map(it => ({
    name: () => typeof it.name === "function" ? it.name() : it.name,
    el: it.key === "potion" ? "potion" : it.key === "elixir" ? "elixir" : "item",
    icon: it.icon ? it.icon() : null,
    tell: it.tell || "Use this item.",
    dim: () => { try { return !it.has(); } catch(e) { return true; } },
    go: () => doUse(it)
  })) },
  airm: { rows: "airRows", desc: "airDesc", pick: 0, items: () => [
    { name: mounted ? "Dismount" : "Mount", el: "ride",
      tell: mounted ? "Slide down off its back."
                    : "Climb onto its shoulders and fly with it.",
      go: () => { const on = !mounted;
              setMounted(on); setOvl(null);
              showReveal(on ? "corinride_" + (smithUpgrade ? "armor_" : "sword_") + "idle_s" : "dr5_idle_s",
                         on ? "CORIN TAKES THE REINS" : "CORIN SLIDES DOWN", undefined, true);
              setTimeout(hideReveal, 1400); } },    { name: dragon.air ? "Land" : "Take off", el: "wing",
      tell: dragon.air ? "Come down to the ground." : "Beat upward and fly.",
      go: () => { setDragonAir(!dragon.air); setOvl(null); } },
    { name: "Summon", el: "wake",
      dim: () => !charm.wake || wakeCool > 0 || wakeCount() >= 2,
      tell: () => !charm.wake ? "He is not carrying the Book of the Dead."
                : wakeCount() >= 2 ? "Two of them are already with him."
                : wakeCool > 0 ? "The dead are not ready. " + Math.ceil(wakeCool) + "s."
                : "Wake two of the Hollybeck dead to walk with you.",
      go: () => { if (wakeTheDead()) setOvl(null); } },

  ] },
};
const EL_BREATH = { claw: "slash", fire: "fire", ice: "ice", bolt: "lightning", shadow: "shadow" };
function breathMenuTell(el, text) {
  const wait = breathWait(el);
  return text + (wait > 0 ? " Ready in " + wait.toFixed(1) + "s." : " Ready.");
}
const ATTACKS = [
  { name: "Slash",     el: "claw",
    tell: "A swipe of the claws. Close range." },
  { name: "Fire",      el: "fire", cd: 12,
    tell: () => breathMenuTell("fire", "A heavy blast. 8 damage; 12 second cooldown.") },
  { name: "Lightning", el: "bolt", cd: 18,
    tell: () => breathMenuTell("bolt", "A crackling orb. 12 damage; 18 second cooldown.") },
  { name: "Shadow",    el: "shadow", cd: 24,
    tell: () => breathMenuTell("shadow", "A crushing violet orb. 16 damage; 24 second cooldown.") },
  { name: "Ice",       el: "ice", cd: 30,
    tell: () => breathMenuTell("ice", "The strongest breath. 20 damage; 30 second cooldown.") },
].map(a => Object.assign(a, {
  dim: () => !breathHas[EL_BREATH[a.el]] || (a.el !== "claw" && (dragon.down || breathWait(a.el) > 0)),
  go: () => { if (!breathHas[EL_BREATH[a.el]]) { toast("not unlocked yet"); return; }
              setOvl(null);
              if (a.el === "claw") { clawNow(); return; }
              if (dragon.down) { toast("the dragon is hurt -- feed it first"); return; }
              const wait = breathWait(a.el);
              if (wait > 0) { toast((DRAGON_BREATH[a.el]?.name || "breath") + " ready in " + wait.toFixed(1) + "s"); return; }
              dragonEl = a.el; breatheFire(); },
}));
const EL_COLOUR = { claw: "#d8d2c4", fire: "#ff8a2b", ice: "#4fb4ff",
                    bolt: "#ffd23c", shadow: "#a074e0",
                    wing: "#79d18a", ride: "#e0a35c",
                    wake: "#8fd8ff",      /* the risen: cold blue */
                    potion: "#e05a4a",    /* the flask: red */
                    elixir: "#f0c250", item: "#c6a97a" }; /* general usable item */
let ovl = null;
function setOvl(which) {
  if(which&&fishing)return;
  for (const k in MENUS) {
    const el = document.getElementById(k);
    if (!el) continue;
    if (k === "menu") el.classList.toggle("on", k === which);
    else el.style.display = (k === which) ? "block" : "none";
  }
  ovl = which || null;
  if (ovl) { MENUS[ovl].pick = 0; refreshOvl(); }
}
function refreshOvl() {
  if (!ovl) return;
  const M = MENUS[ovl], items = M.items();
  const rows = document.getElementById(M.rows);
  const desc = document.getElementById(M.desc);
  rows.innerHTML = "";
  if (!items.length) { rows.innerHTML = "<div class='row'>nothing here</div>";
                       desc.textContent = ""; return; }
  if (M.pick >= items.length) M.pick = items.length - 1;
  if (M.pick < 0) M.pick = 0;
  items.forEach((it, k) => {
    const d = document.createElement("div");
    d.className = "row" + (k === M.pick ? " on" : "");
    if (ovl === "atkm" || ovl === "airm") {
      const n = items.length;
      const angle = (-Math.PI / 2) + (Math.PI * 2 * k / n);
      const radius = n >= 5 ? 62 : 56;
      d.style.setProperty("--rx", (Math.cos(angle) * radius).toFixed(2) + "px");
      d.style.setProperty("--ry", (Math.sin(angle) * radius).toFixed(2) + "px");
      d.setAttribute("aria-label", (typeof it.name === "function") ? it.name() : it.name);
    }
    if (ovl === "itemm" && it.icon && SPR[it.icon]) {
      const sp = SPR[it.icon], ic = document.createElement("canvas");
      ic.width = 32; ic.height = 32; ic.className = "itemQuickIcon";
      const ig = ic.getContext("2d"); ig.imageSmoothingEnabled = false;
      try {
        drawBagIcon(ic, it.icon, Math.floor(performance.now() / (1000 / BAG_FPS)));
      } catch (e) { /* text remains as a safe fallback */ }
      d.appendChild(ic);
    }
    if (ovl === "atkm" && it.el !== "claw" && it.cd) {
      const wait = breathWait(it.el), ready = Math.max(0, Math.min(1, 1 - wait / it.cd));
      d.style.setProperty("--refill", (ready * 100).toFixed(1) + "%"); d.style.setProperty("--ring", (ready * 100).toFixed(1) + "%");
      d.classList.add("breathRefill");
      const fill = document.createElement("span");
      fill.className = "breathFill";
      d.appendChild(fill);
      if (wait > 0) {
        const sec = document.createElement("span");
        sec.className = "breathSecs";
        sec.textContent = Math.ceil(wait);
        d.appendChild(sec);
      }
    }
    if (it.el && EL_COLOUR[it.el]) {
      d.style.setProperty("--el", EL_COLOUR[it.el]);
      const dot = document.createElement("span");
      dot.className = "dot";
      d.appendChild(dot);
      if (it.dim && it.dim()) d.style.opacity = ".42";
      const nm = document.createElement("span");
      nm.textContent = (typeof it.name === "function") ? it.name() : it.name;
      d.appendChild(nm);
    } else {
      const label = (typeof it.name === "function") ? it.name() : it.name;
      d.textContent = (k === M.pick ? "\u25B8 " : "  ") + label;
    }
    const takeMenuRow = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      M.pick = k;
      if (it.go && !(it.dim && it.dim())) it.go();
    };
    /* Fullscreen requests must run directly inside the user's pointer gesture.
       On iOS/Chrome a synthetic/delayed click can lose transient activation. */
    if (ovl === "menu" && ((typeof it.name === "function" ? it.name() : it.name) === "Full screen")) {
      d.addEventListener("pointerup", takeMenuRow, { passive:false });
    } else {
      d.addEventListener("click", takeMenuRow);
    }
    rows.appendChild(d);
  });
  desc.textContent = typeof items[M.pick].tell === "function" ? items[M.pick].tell() : items[M.pick].tell || "";
  if (ovl === "itemm") {
    const on = rows.querySelector(".row.on");
    if (on) on.scrollIntoView({block:"nearest", inline:"nearest"});
  }
}
function updateBreathRefills(){
  const M=MENUS.atkm, rows=document.getElementById(M.rows);
  if(!rows)return;
  const items=M.items(), nodes=rows.querySelectorAll(".row");
  items.forEach((it,k)=>{
    if(it.el==="claw"||!it.cd||!nodes[k])return;
    const d=nodes[k],wait=breathWait(it.el),ready=Math.max(0,Math.min(1,1-wait/it.cd));
    d.style.setProperty("--refill",(ready*100).toFixed(1)+"%");d.style.setProperty("--ring",(ready*100).toFixed(1)+"%");
    d.style.opacity=(it.dim&&it.dim())?".42":"";
    let sec=d.querySelector(".breathSecs");
    if(wait>0){
      if(!sec){sec=document.createElement("span");sec.className="breathSecs";d.appendChild(sec);}
      sec.textContent=Math.ceil(wait);
    }else if(sec)sec.remove();
  });
}
function ovlStep(d) {
  if (!ovl) return;
  const M = MENUS[ovl], n = M.items().length;
  if (!n) return;
  M.pick = (M.pick + d + n) % n;
  refreshOvl();
}
function ovlTake() {
  if (!ovl) return;
  const M = MENUS[ovl], items = M.items();
  if (items[M.pick] && items[M.pick].go) items[M.pick].go();
}
const atkCloseBtn=document.getElementById("atkCloseBtn");
if(atkCloseBtn)atkCloseBtn.addEventListener("pointerup",e=>{e.preventDefault();e.stopPropagation();setOvl(null);});
const airCloseBtn=document.getElementById("airCloseBtn");
if(airCloseBtn)airCloseBtn.addEventListener("pointerup",e=>{e.preventDefault();e.stopPropagation();setOvl(null);});
bindHold("btnL", () => {
                         trigHold("l", true);
                         if (hasDragon()) setOvl(ovl === "atkm" ? null : "atkm"); },
                 () => { trigHold("l", false); });
bindHold("btnR", () => {
                         trigHold("r", true);
                         if (hasDragon()) setOvl(ovl === "airm" ? null : "airm"); },
                 () => { trigHold("r", false); });
bindHold("btnItems", () => {
                         setOvl(ovl === "itemm" ? null : "itemm");
                         if (ovl === "itemm") setTimeout(() => wireBagDrag("itemRows"), 0); }, null);
bindHold("btnMapQuick", () => { if (atlasOpen) closeAtlas(); else openAtlas(); }, null);
const itemCloseBtn = document.getElementById("itemCloseBtn");
const itemFullBtn = document.getElementById("itemFullBtn");
if (itemCloseBtn) itemCloseBtn.addEventListener("pointerup", e => { e.preventDefault(); e.stopPropagation(); setOvl(null); });
if (itemFullBtn) itemFullBtn.addEventListener("pointerup", e => { e.preventDefault(); e.stopPropagation(); setOvl(null); setBag(true); });

function soundPercent(){ return (window.EmberAudio && window.EmberAudio.percent) ? window.EmberAudio.percent() : 35; }
function syncSoundDial(){
  const v=Math.max(0,Math.min(100,soundPercent()));
  const knob=document.getElementById("soundKnob"), pct=document.getElementById("soundPct");
  const fill=document.querySelector("#soundTrack>i"), mute=document.getElementById("soundMute");
  if(knob){knob.style.setProperty("--vol",v);knob.setAttribute("aria-valuenow",v);}
  if(pct)pct.textContent=Math.round(v)+"%";
  if(fill)fill.style.width=v+"%";
  if(mute)mute.textContent=v===0?"UNMUTE":"MUTE";
}
(function wireSoundDial(){
  const knob=document.getElementById("soundKnob"),track=document.getElementById("soundTrack");
  const mute=document.getElementById("soundMute"),close=document.getElementById("soundClose");
  let lastNonZero=35,drag=false;
  const setV=v=>{v=Math.max(0,Math.min(100,Math.round(v)));if(v>0)lastNonZero=v;if(window.EmberAudio)window.EmberAudio.set(v);syncSoundDial();};
  const fromPointer=e=>{const r=track.getBoundingClientRect();setV((e.clientX-r.left)/Math.max(1,r.width)*100);};
  if(track){track.addEventListener("pointerdown",e=>{e.preventDefault();drag=true;track.setPointerCapture?.(e.pointerId);fromPointer(e);});track.addEventListener("pointermove",e=>{if(drag)fromPointer(e);});track.addEventListener("pointerup",e=>{drag=false;track.releasePointerCapture?.(e.pointerId);});}
  if(knob){knob.addEventListener("pointerdown",e=>{e.preventDefault();drag=true;track?.setPointerCapture?.(e.pointerId);});}
  if(mute)mute.addEventListener("pointerup",e=>{e.preventDefault();const v=soundPercent();setV(v===0?(lastNonZero||35):0);});
  if(close)close.addEventListener("pointerup",e=>{e.preventDefault();setOvl(null);});
})();


const SAVE_SLOT_COUNT = 3;
let activeSaveSlot = 1;
function saveKey(slot){ return "emberfell.save." + slot; }
function readSaveSlot(slot){ try{return JSON.parse(localStorage.getItem(saveKey(slot))||"null");}catch(e){return null;} }
function migrateLegacySave(){
  try{
    if(!readSaveSlot(1)){
      const legacy=JSON.parse(localStorage.getItem("emberfell.save")||"null");
      if(legacy)localStorage.setItem(saveKey(1),JSON.stringify(legacy));
    }
  }catch(e){}
}
migrateLegacySave();
function firstEmptySaveSlot(){ for(let i=1;i<=SAVE_SLOT_COUNT;i++)if(!readSaveSlot(i))return i; return 0; }
function saveSummary(slot){
  const s=readSaveSlot(slot); if(!s)return "Slot "+slot+" — Empty";
  const map=(W.maps[s.map]&&W.maps[s.map].name)||String(s.map||"Unknown").replaceAll("_"," ");
  const d=s.when?new Date(s.when):null;
  const stamp=d&&!isNaN(d)?d.toLocaleString():"saved game";
  return "Slot "+slot+" — "+map+" — "+stamp;
}
function captureSave(){return {
  quest, smithUpgrade, glassShield, wonAll, cinderSeal, trialSealPlaced, trialWins, thornwellMet, brambleQuest, knightEncounterDone, royalDefeated, gold, treasuryTaken:[...treasuryTaken],
  breathHas:{...breathHas}, dragonHp:dragon.hp, boarMeat, dragonFish, fishingPole,
  map:MAPID, x:trial?160:P.x, y:trial?464:P.y, when:Date.now()
};}
function saveToSlot(slot,quiet=false){
  try{
    localStorage.setItem(saveKey(slot),JSON.stringify(captureSave()));
    activeSaveSlot=slot;
    /* Keep the old key mirrored for backward compatibility with older Emberfell builds. */
    localStorage.setItem("emberfell.save",localStorage.getItem(saveKey(slot)));
    if(!quiet)toast("saved to slot "+slot);
    return true;
  }catch(e){if(!quiet)toast("could not save on this device");return false;}
}
/* Story/autosave calls continue silently into the currently active slot. */
function saveGame(){ saveToSlot(activeSaveSlot,true); }
function deleteSaveSlot(slot){
  try{localStorage.removeItem(saveKey(slot)); if(activeSaveSlot===slot)activeSaveSlot=1; toast("slot "+slot+" deleted"); refreshOvl();}
  catch(e){toast("could not delete save");}
}
function saveSlotItems(mode){
  const items=[];
  for(let slot=1;slot<=SAVE_SLOT_COUNT;slot++){
    const data=readSaveSlot(slot), label=saveSummary(slot);
    if(mode==="overwrite"){
      if(data)items.push({name:label,tell:"Overwrite this save with Corin's current progress.",go:()=>{saveToSlot(slot);setOvl(null);}});
    }else if(mode==="load"){
      items.push({name:label,tell:data?"Load this save.":"This slot is empty.",dim:()=>!readSaveSlot(slot),go:()=>{if(loadGame(slot))setOvl(null);}});
    }else{
      items.push({name:label,tell:data?"Press A again to delete this save slot.":"This slot is empty.",dim:()=>!readSaveSlot(slot),go:()=>{if(data)deleteSaveSlot(slot);}});
    }
  }
  if(mode==="overwrite"&&!items.length)items.push({name:"No saves to overwrite",tell:"Create a new save first.",dim:()=>true});
  items.push({name:"Back",tell:mode==="overwrite"?"Return to save options.":"Close this menu.",go:()=>setOvl(mode==="overwrite"?"savePrompt":null)});
  return items;
}
function loadGame(slot=activeSaveSlot) {
  try {
    migrateLegacySave();
    const s = readSaveSlot(slot);
    if (!s) { toast("save slot "+slot+" is empty"); return false; }
    activeSaveSlot=slot;
    if (trial) stopTrial("");
    wonAll = s.wonAll ? 1 : 0; cinderSeal = !!s.cinderSeal && !!wonAll; trialSealPlaced=!!s.trialSealPlaced&&cinderSeal; trialWins = s.trialWins || 0;
    if (s.breathHas) for (const k in breathHas) if (s.breathHas[k] !== undefined) breathHas[k] = !!s.breathHas[k];
    syncDragonVitality(false);
    dragon.hp = Number.isFinite(s.dragonHp) ? Math.max(0, Math.min(dragon.maxHp, s.dragonHp)) : dragon.maxHp;
    dragon.down = dragon.hp <= 0; dragon.revive=0;dragon.inv=0;dragon.knockdown=0;
    boarMeat=Math.max(0,s.boarMeat|0);dragonFish=Math.max(0,s.dragonFish|0);fishingPole=!!s.fishingPole;fishing=null;
    thornwellMet=!!s.thornwellMet;brambleQuest=Number.isInteger(s.brambleQuest)?Math.max(0,Math.min(3,s.brambleQuest)):0;brambleMap="";brambleDeparture=null;thornwellArrival=null;thornwellReturn=null;
    knightEncounterDone=!!s.knightEncounterDone;knightEncounterPhase=knightEncounterDone?"done":"waiting";knightEncounter=null;
    for(const k in royalDefeated)delete royalDefeated[k];Object.assign(royalDefeated,s.royalDefeated||{});
    treasuryTaken.clear();for(const id of s.treasuryTaken||[])treasuryTaken.add(id);if(Number.isFinite(s.gold))gold=Math.max(0,s.gold);
    quest=s.quest;smithUpgrade=!!s.smithUpgrade&&hasSword();glassShield=!!s.glassShield;glassShieldHeld=false;
    const retiredRoyalRoom={royal_archive:'royal_study',royal_lookout:'royal_guardroom',royal_pantry:'royal_westhall'}[s.map];if(retiredRoyalRoom)s.map=retiredRoyalRoom;
    if(s.map&&W.maps[s.map])loadMap(s.map,true);P.x=s.x;P.y=s.y;recoverTempleArrival(!!W.maps[s.map]?.templeLegacy);
    if(MD.royal&&(retiredRoyalRoom||!canStand(P.x,P.y))){P.x=MD.spawn[0];P.y=MD.spawn[1];}
    cam.x=P.x;cam.y=P.y;clampCam();chunks.clear();toast("loaded slot "+slot);return true;
  } catch (e) { toast("could not load"); return false; }
}


let mounted = false;
const MOUNT_DX = 22, MOUNT_DY = -12;
function setMounted(on, quiet = false) {
  if(fishing)return;
  if (on && !dragonHere()) { toast("the dragon is not here"); return; }
  if (on && dragon.down) { toast("the dragon is too hurt to ride"); return; }
  if (on && dragon.knockdown > 0) { toast("the dragon is still getting up"); return; }
  mounted = on;
  if (on) { if (!dragon.air) setDragonAir(true); if (!quiet) toast("you climb onto its back"); }
  else if (!quiet) toast("you slide down");
  chunks.clear();
}

tap(document.getElementById("deadBtn"), () => { getUp(); });
tap(document.getElementById("bSafe"), () => {
  devSafe = !devSafe;
  const b = document.getElementById("bSafe");
  if (b) b.classList.toggle("on", devSafe);
  toast(devSafe ? "nothing can touch him" : "he can be hurt again");
});
tap(document.getElementById("bNoDrag"), () => {
  dragonOff = !dragonOff;
  const b = document.getElementById("bNoDrag");
  if (b) b.classList.toggle("on", dragonOff);
  toast(dragonOff ? "the dragon stands down" : "the dragon is back");
});
tap(document.getElementById("bDragonPassive"), () => {
  devDragonPassive=!devDragonPassive;
  if(devDragonPassive){hunt=null;breath=null;claw=null;dragonBreak=null;dragonRecall=false;clawT=0;}
  const b=document.getElementById("bDragonPassive");
  if(b)b.classList.toggle("on",devDragonPassive);
  toast(devDragonPassive?"dragon attacks disabled — enemies can still hurt it":"dragon attacks enabled");
});
function markKingCompleteForTest() {
  if (window.EmberKingMusic) window.EmberKingMusic.stop();
  if (trial) stopTrial("");
  if (MAPID === "cinderhold") {
    clearTrialCombat();
    scene = null; sayNpc = null; sayOff(); showFace(null);
    P.act = null; P.moving = false;
    camFree = false; cam.z = playZoom();
    cam.x = P.x - VW / cam.z / 2; cam.y = P.y - VH / cam.z / 2;
    clampCam();
  }
  quest = Math.max(quest, Q.DONE);
  glassShield = true;
  wonAll = 1;
  if (MAPID === "cinderhold") npcs = npcs.filter(n => !/Halvard/.test(n.n || ""));
  rebuildSolid(); rebuildBuckets();
  saveGame();
  toast("King marked complete. Visit the witch and talk to the demon for the seal.");
}
tap(document.getElementById("bKingDone"), markKingCompleteForTest);
tap(document.getElementById("bSkip"), () => {
  skipBrambleForTest();
  devItemTest = true;
  leavingNow = false;
  kingWalk = 0;
  guardsAside = false;
  quest = Q.DONE;
  smithUpgrade = true;
  glassShield = true;
  dragon.on = true;
  dragon.placed = MAPID;
  dragon.air = !dragonGround(P.x - 24, P.y);
  dragon.x = P.x - 24; dragon.y = P.y - 26;
  greenPhase = "gone"; greenT = -1; greenP = 1; greenGone = true;
  for (const m of kingsMen()) { m.goto = null; m.leaving = 0; }
  for (const k in charm) charm[k] = true;
  let n = 0;
  for (const k in worn) worn[k] = (n++ < WORN_MAX);
  for (const k in breathHas) breathHas[k] = true;
  syncDragonVitality(true); dragon.hp = dragon.maxHp; dragon.down = false;
  heartKnown = true;
  if (potions < 5) potions = 5;
  if (elixirs < 3) elixirs = 3;
  if (boarMeat < 3) boarMeat = 3;
  if (dragonFish < 3) dragonFish = 3;
  if (bombs < 3) bombs = 3;
  if (dust < 3) dust = 3;
  if (bells < 3) bells = 3;
  if (marks < 3) marks = 3;
  if (breaths < 3) breaths = 3;
  if (stones < 3) stones = 3;
  if (salts < 3) salts = 3;
  if (gold < 500) gold = 500;
  for (const e of BESTIARY) if (!seenFoe[e.k]) seenFoe[e.k] = ++seenCount;
  rebuildBuckets();
  if (typeof refreshWingBtn === "function") refreshWingBtn();
  reindex(); chunks.clear();
  if (typeof refreshBag === "function" && typeof bagOpen !== "undefined" && bagOpen)
    refreshBag();
  saveGame();
  toast("Everything granted; Hunter and Bramble completed. Ready to explore.");
});

let bothHeldSince = -1, lHeld = false, rHeld = false;
function trigHold(which, down) {
  if (which === "l") lHeld = down; else rHeld = down;
  const now = () => (typeof performance !== "undefined" && performance.now)
                  ? performance.now() : Date.now();
  if (lHeld && rHeld) { if (bothHeldSince < 0) bothHeldSince = now(); }
  else bothHeldSince = -1;
}
setInterval(() => {
  if (devUnlocked || bothHeldSince < 0) return;
  const t = (typeof performance !== "undefined" && performance.now)
            ? performance.now() : Date.now();
  if (t - bothHeldSince >= 3000) {
    devUnlocked = true; bothHeldSince = -1;
    toast("dev unlocked -- map panning and zoom are live");
    
  }
}, 120);

setInterval(() => {
  const started = !!gameplayStarted;
  const on = started && hasDragon();
  const dragonBtn = document.getElementById("btnL");
  const commandBtn = document.getElementById("btnR");
  const itemsBtn = document.getElementById("btnItems");
  const mapBtn = document.getElementById("btnMapQuick");
  if (dragonBtn) {
    dragonBtn.textContent = on ? "DRAGON" : "";
    dragonBtn.style.opacity = on ? "" : "0.38";
  }
  if (commandBtn) {
    commandBtn.textContent = on ? "COMMAND" : "";
    commandBtn.style.opacity = on ? "" : "0.38";
  }
  if (itemsBtn) itemsBtn.textContent = started ? "ITEMS" : "";
  if (mapBtn) mapBtn.textContent = started ? "MAP" : "";
  if (ovl === "atkm") refreshOvl();
}, 400);

const SKIN_BAND = { y: 831, h: 142 };
const SKIN  = [[0xf6,0xca,0x9f],[0xf9,0xe6,0xcf],[0xd2,0x9f,0x70]];
const STRAW = [[0xff,0xc8,0x25],[0xfe,0xe7,0x61],[0xff,0xa2,0x14]];  /* the hat */
const DENIM = [[0x00,0x69,0xaa],[0x00,0x98,0xdc]];                   /* dungarees */
const TONE = {
  dark:  [[0x6d,0x42,0x2c],[0x8b,0x5c,0x40],[0x4c,0x2b,0x1b]],
  desert:[[0xc2,0x86,0x55],[0xdd,0xab,0x7f],[0x93,0x5e,0x3a]],
};
const HAT = {
  brown: [[0xa8,0x7a,0x3f],[0xcb,0xa1,0x64],[0x77,0x54,0x29]],
};
const HAIR_LIGHT = [[0xe6,0x9c,0x69],[0xbf,0x6f,0x4a]];
const HAIR_DARK  = [[0x3f,0x2a,0x1e],[0x2a,0x1a,0x12]];
const SHIRT = {
  rust:  [[0xa8,0x4a,0x28],[0xd0,0x70,0x46]],
  moss:  [[0x3f,0x74,0x4a],[0x60,0x9c,0x6c]],
  plum:  [[0x6b,0x3c,0x72],[0x95,0x5f,0x9c]],
  ochre: [[0xa8,0x82,0x28],[0xd0,0xa8,0x46]],
};
const DESERT_VARIANT = 4;
const VARIANTS = [null, { skin: "dark" },
                  { hat: "brown" },
                  { skin: "dark", hat: "brown" },
                  { skin: "desert" }];   /* index 4, used by rule only */
const skinSheets = [];
function swapsFor(v) {
  const out = [];
  if (v.skin  && TONE[v.skin])   SKIN .forEach((f,i) => out.push([f, TONE[v.skin][i]]));
  if (v.skin === "dark" || v.hair === "dark")
    HAIR_LIGHT.forEach((f,i) => out.push([f, HAIR_DARK[i]]));
  if (v.hat   && HAT[v.hat])     STRAW.forEach((f,i) => out.push([f, HAT[v.hat][i]]));
  if (v.shirt && SHIRT[v.shirt]) DENIM.forEach((f,i) => out.push([f, SHIRT[v.shirt][i]]));
  return out;
}
function buildVariant(n) {
  const v = VARIANTS[n];
  if (!v) return null;
  const c = document.createElement("canvas");
  c.width = atlasImg.width; c.height = SKIN_BAND.h;
  const g = c.getContext("2d", { willReadFrequently: true });
  drawGameImage(g, atlasImg, 0, SKIN_BAND.y, c.width, SKIN_BAND.h, 0, 0, c.width, SKIN_BAND.h);
  let d;
  try { d = g.getImageData(0, 0, c.width, c.height); } catch (e) { return null; }
  const px = d.data, sw = swapsFor(v);
  for (let i = 0; i < px.length; i += 4) {
    if (!px[i + 3]) continue;
    for (let k = 0; k < sw.length; k++) {
      const f = sw[k][0];
      if (px[i] === f[0] && px[i+1] === f[1] && px[i+2] === f[2]) {
        px[i] = sw[k][1][0]; px[i+1] = sw[k][1][1]; px[i+2] = sw[k][1][2];
        break;
      }
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}
function buildSkinTones() { /* built lazily now; nothing to do up front */ }
const DESERT_LOOK = /^desert\d/;
function npcSheetFor(o, s) {
  let t = o.tone | 0;
  if (!o.desertNative && DESERT_LOOK.test(o.sk || "") && t !== 1) t = DESERT_VARIANT;
  if (!t || t >= VARIANTS.length) return null;
  if (skinSheets[t] === undefined) skinSheets[t] = buildVariant(t);
  if (!skinSheets[t]) return null;
  return { img: skinSheets[t], dy: SKIN_BAND.y };
}

const PATROL_REST = 5000;                 /* how long they linger, in ms */
setInterval(() => {
  if (typeof npcs === "undefined" || editing || fishing) return;
  const now = Date.now();
  for (const n of npcs) {
    if (!n.patrol || n.goto) continue;
    if (typeof sayNpc !== "undefined" && sayNpc === n) continue;
    if (n.patrolFrom !== undefined && quest < n.patrolFrom) continue;
    if (n.restUntil === undefined) n.restUntil = 0;
    if (n.arrived === undefined) n.arrived = true;
    if (n.arrived) { n.restUntil = now + (n.patrolRest || PATROL_REST); n.arrived = false; }
    if (now < n.restUntil) continue;      /* still standing about */
    if (!n.desertNative) {
      if (!n.route) n.route = patrolRoute(n);
      if (n.route.length < 2) continue;
      n.leg = ((n.leg || 0) + 1) % n.route.length;
      n.goto = n.route[n.leg].slice(); n.arrived = true; continue;
    }
    n.leg = ((n.leg || 0) + 1) % 4;
    const box = n.patrol;                 /* [x0,y0,x1,y1] in tiles */
    const pt = [[box[0], box[3]], [box[2], box[3]],
                [box[2], box[1]], [box[0], box[1]]][n.leg];
    n.goto = [pt[0] * TS + TS / 2, pt[1] * TS + TS];
    n.arrived = true;                     /* rest again once this leg ends */
  }
}, 400);

function clawNow() {
  if(fishing)return;
  if(devDragonPassive){toast("dragon attacks are disabled in dev tools");return;}
  if (!dragonHere() || !dragon.on) { toast("the dragon is not here"); return; }
  if (dragon.down) { toast("the dragon is hurt -- feed it first"); return; }
  if (dragon.knockdown > 0) { toast("the dragon is still getting up"); return; }
  const rid = typeof mounted !== "undefined" && mounted;
  if (rid) {
    if (P.act) return;
    P.act = { kind: "swing", t: 0, dir: P.dir, flip: P.flip, dir8: playerFacing4(), hit: true };
    dragon.x = P.x; dragon.y = P.y;
  }
  let best = null, bd = 1e9;
  for (const f of foes) {
    if (f.st === "dead") continue;
    const d = Math.hypot(f.x - dragon.x, f.y - dragon.y);
    if (d < 150 && d < bd) { bd = d; best = f; }
  }
  if (best) {
    const dx = best.x - dragon.x, dy = best.y - dragon.y;
    dragon.dir = direction4(dx,dy,dragon.dir);
  } else {
    dragon.dir = playerFacing4();
  }
  if (rid) dragon.dir = playerFacing4();
  claw = { dir: dragon.dir, t: 0, x: dragon.x, y: dragon.y - 8 };
  /* It used to sweep a full circle of CLAW_REACH round the dragon, so a rider
     could stand anywhere in a ring and clear it by spamming the swing. It is
     a claw: it reaches in front, and not as far. */
  const RIDE_REACH = 46, RIDE_ARC = 0.42;   /* cos of about 65 degrees */
  const [fx,fy] = directionVector(dragon.dir);
  for (const f of foes) {
    if (f.st === "dead" || f.ally) continue;
    const body = foeBodyProfile(f);
    const ax = body.x - dragon.x, ay = body.y - dragon.y;
    const d = Math.hypot(ax, ay);
    if (d > RIDE_REACH + body.r) continue;
    if (d > 8 && (ax / d) * fx + (ay / d) * fy < RIDE_ARC) continue;
    if ((f.kind === "kdragon" || f.kind === "lich") && f.swordGuard > 0) {
      kingDeflect(f, dragon);
      continue;
    }
    f.hp -= CLAW.dmg; f.hurt = 0.25;
    if (f.hp <= 0) { f.st = "dead"; f.t = 0; markBossGone(f); }
  }
}

tap(document.getElementById("bTrace"),()=>setGeometryTool(collideView?null:'collision'));

(function () {
  const b = document.getElementById("btnDev");
  if (!b) return;
  const go = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setDev(!devOpen);
    b.classList.toggle("on", devOpen);
  };
  b.addEventListener("click", go);
  b.addEventListener("touchstart", go, { passive: false });
})();
bindAtlasAndGeometry();
