import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const read = p => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const game = read('js/generated/game-part-2.js'), assets = read('js/generated/game-part-1.js');
const W = JSON.parse(zlib.gunzipSync(Buffer.from(assets.match(/const W_GZ = "([^"]+)"/)[1], 'base64')));
const button = { classList: { toggle(name, on) { button.on = on; } }, setAttribute(name, value) { button[name] = value; } };
let menu = true, draws = 0, circles = [], rotations = [];
const ctx = Object.fromEntries(['save','restore','translate','fill','stroke','fillRect','beginPath','moveTo','lineTo','closePath'].map(name => [name, () => { draws++; }]));
ctx.arc = (...args) => circles.push(args); ctx.rotate = angle => rotations.push(angle);
const c = vm.createContext({ W, TS:16, DIRT:0, terrRLE:()=>'', window:{EMBER_ASSETS:{DOCK_ORIGINAL_ASSETS:[]}},
  WALL78_PIECES:JSON.parse(assets.match(/const WALL78_PIECES=(.*);/)[1]),
  fetch:async url=>({ok:true,json:async()=>JSON.parse(read(url.split('?')[0]))}), Image:class { async decode() {} },
  breathHas:{},chestOpen:{},ctx,gameplayStarted:true,mode:'play',editStamp:0,VW:390,VH:600,
  document:{getElementById:()=>button},setDev:on=>{menu=on;},toast(){} });
const run = source => vm.runInContext(source, c);
run(game.slice(game.indexOf('const CHESTS = ['), game.indexOf('function chestHere()')));
run(game.slice(game.indexOf('function installFirstTemple(){'), game.indexOf('const foeVisibleTopCache82')));
run('installFirstTemple();installSecondTemple();installThirdTemple();refineSecondTemple();finishTempleLayouts77();refineTemples78();finishTempleLayouts82();');
for (const name of ['first-temple','sandspire-temple','hollybeck-temple','mountain-passage','temple-compass']) run(read('js/' + name + '.js'));
for (const name of ['FirstTemple','SandspireTemple','HollybeckTemple','MountainPassage']) await run('prepareExpanded' + name + '()');
const chests = run('CHESTS'), temples = Object.entries(W.maps).filter(([,map])=>c.compassTempleMap(map));
let samples = 0, simulated = 0, backwards = 0;
const fields = new Map();
for (const [id,map] of temples) {
  const route = c.compassTempleRoute(W.maps,id,chests);
  assert(route,id+' has a route to its Heartstone');
  assert.equal(route.chest.map,id.startsWith('tp')?'tp1_sanctum':id.startsWith('ds')?'ds_sanctum':'sn_sanctum');
  assert(route.door?.to !== 'world');
  if (map.templePlan.mainRoute === false) { assert(route.door,id+' escapes its dead end'); backwards++; }
  const field = c.compassTempleField(map,c.compassTempleTarget(map,route)); fields.set(id,field);
  assert(field,id+' builds a navigation field');
  for (const [l,t,r,b] of map.templePlan.chambers) {
    for (const [x,y] of [[(l+r)/2,(t+b)/2],[l+24,t+24],[r-24,t+24]]) {
      if (!field.clear(x,y)) continue;
      const guide = c.compassTempleGuide(field,{x,y}); assert(guide,id+' routes from room '+[x,y]); samples++;
      if (Math.hypot(x-guide.x,y-guide.y)>16) assert(field.visible({x,y},guide),id+' does not point through a wall');
    }
  }
  // Actually follow the changing pointer around corners from each map's entry.
  const player = {x:map.spawn[0],y:map.spawn[1]}, root=field.point(field.root);
  let reached = false;
  for (let frame=0;frame<6000;frame++) {
    if (Math.hypot(player.x-root.x,player.y-root.y)<12) { reached=true;break; }
    const guide=c.compassTempleGuide(field,player);assert(guide,id+' keeps a pointer while moving');
    const dx=guide.x-player.x,dy=guide.y-player.y,d=Math.hypot(dx,dy);
    assert(d>.05,id+' pointer cannot stall');
    const step=Math.min(3,d),previous={...player};player.x+=dx/d*step;player.y+=dy/d*step;
    assert(field.clear(player.x,player.y),id+' simulated route stays on walkable floor '+JSON.stringify({previous,guide,player,root}));
  }
  assert(reached,id+' pointer reaches the next door or chest'); simulated++;
  if (!route.door) assert(c.compassTempleGuide(field,field.target).arrived,id+' marks arrival at chest');
}
assert.equal(temples.length,35);assert(backwards>0);
assert.equal(c.compassTempleRoute(W.maps,'world',chests),null);
assert.equal(c.compassTempleRoute(W.maps,'passage',chests),null);

// The inherited compass persists across temple maps and never draws
// over boot/the overworld. Resizing keeps the badge in the game viewport corner.
Object.assign(c,{MAPID:'tp1',MD:W.maps.tp1,P:{x:W.maps.tp1.spawn[0],y:W.maps.tp1.spawn[1]}});
c.drawTempleCompass();assert.equal(draws,0,'off by default');
c.restoreFatherCompass({owned:true,awakened:false});c.drawTempleCompass();assert.equal(draws,0,'gift remains dormant');
c.restoreFatherCompass({owned:true,awakened:true});
c.drawTempleCompass();assert(draws>0);assert.equal(circles.at(-1)[2],21);
const cache=run('templeCompass.cache.field');c.drawTempleCompass();assert.equal(run('templeCompass.cache.field'),cache,'reuse field each frame');
for (const [id,map] of [['world',W.maps.world],['passage',W.maps.passage]]) {
  const before=draws;Object.assign(c,{MAPID:id,MD:map});c.drawTempleCompass();assert.equal(draws,before,id+' hides pointer');
}
Object.assign(c,{MAPID:'sn_sanctum',MD:W.maps.sn_sanctum,P:fields.get('sn_sanctum').target});
c.gameplayStarted=false;const before=draws;c.drawTempleCompass();assert.equal(draws,before);
c.gameplayStarted=true;c.drawTempleCompass();assert.equal(ctx.fillStyle,'#9cdac2','arrival changes to Heartstone gem');
c.restoreFatherCompass();assert.equal(run('templeCompass.owned'),false);assert.equal(run('templeCompass.awakened'),false);
assert(rotations.every(Number.isFinite));
assert(!read('index.html').includes('id="bCompass"'));
assert(read('js/generated/game-part-3.js').includes('restoreFatherCompass(s.fatherCompass)'));
console.log(`PASS: Compass routes all ${temples.length} temple maps, ${samples} room positions and ${backwards} side branches; ${simulated} simulated walks reach the next door/chest, plus arrival, caching and ownership and awakening visibility.`);
