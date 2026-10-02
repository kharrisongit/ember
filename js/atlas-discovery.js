/* One saved discovery record controls artwork, labels, selection and routes. */
let atlasDiscovered=new Set(['Millwood']),atlasEncounteredBosses=new Set(),atlasFogLayer=null,atlasFogSignature='',atlasRegionCells=null;
const ATLAS_BOSS_PLACES={
  'Spider Queen':{unseen:'Pyramid Depths',foe:'spiderqueen',reward:'Emberheart',owned:()=>DesertAdventure.owned(),defeated:()=>DesertAdventure.won()},
  'Frosthorn':{unseen:'Snowbound Clearing',foe:'frosthorn',reward:'Frostheart',owned:()=>Frosthorn.owned(),defeated:()=>Frosthorn.defeatedAlready()},
  'Ice Moth':{unseen:'Frozen Glade',foe:'icemoth',reward:'Soulwing',owned:()=>houseLootTaken.has(IceMoth.rewardId),defeated:()=>IceMoth.defeatedAlready()}
};
function atlasPlaceKnown(name){return atlasDiscovered.has(name);}
function atlasRevealPlace(name){
  if(!ATLAS_LOCATIONS.some(p=>p[0]===name)||atlasPlaceKnown(name))return false;
  atlasDiscovered.add(name);return true;
}
function atlasDisplayName(name){
  const boss=ATLAS_BOSS_PLACES[name];
  return boss&&!atlasEncounteredBosses.has(name)&&!boss.defeated()?boss.unseen:name;
}
function atlasPlaceDescription(p){
  const boss=ATLAS_BOSS_PLACES[p[0]];
  if(boss){
    const discovered=atlasDisplayName(p[0])===p[0];
    return {title:atlasDisplayName(p[0]),service:discovered?'Encountered guardian':'Unexplored clearing',
      detail:boss.owned()?`You recovered the ${boss.reward} Relic here.`:boss.defeated()?'The guardian has fallen. A chest remains to be opened.':discovered?'You encountered this guardian here. Its treasure is still unknown.':p[3]};
  }
  if(p[0]==='Sunken Pyramid')return {title:p[0],service:'Ancient burial chambers',detail:DesertAdventure.owned()?'You recovered the Emberheart Relic from these chambers.':p[3]};
  return {title:p[0],service:ATLAS_PLACE_NOTES[p[0]]?.[0]||'The roads of Emberfell',detail:p[3]};
}
function atlasEnteredArea(){
  if(typeof MD==='undefined'||!MD)return null;
  if(MAPID!=='world')return atlasCurrentArea();
  // Never discover the nearest town merely by standing somewhere on the road.
  const boss=(W.maps.world.features||[]).find(f=>(f.frosthorn||f.iceMoth)&&Math.hypot(P.x/TS-f.x,P.y/TS-f.y)<=f.r);
  if(boss)return boss.frosthorn?'Frosthorn':'Ice Moth';
  const named=flightPlaceAt(P.x,P.y);if(named)return named;
  const x=P.x/TS,y=P.y/TS;
  const entrance=(W.maps.world.doors||[]).find(d=>['pyramid_entry','desert_chapel'].includes(d.to)&&Math.hypot(x-d.x,y-d.y)<=8);
  if(entrance)return entrance.to==='pyramid_entry'?'Sunken Pyramid':'Desert Church';
  for(const f of features){
    if(f.kind!=='route')continue;
    const name=atlasCanonical(f.road||roadOf(f.id));if(!name)continue;
    if(routeLegs(f).some(([a,b])=>blossomRoadDistance(x,y,{a,b})<=(f.w||5)/2+3))return name;
  }
  return typeof inSwamp==='function'&&inSwamp(x,y)?'Dreadmarsh':null;
}
function rememberAtlasVisit(){
  if(!gameplayStarted||mode!=='play'||editing||flightTravel||fadeDir||doorMotion)return false;
  const name=atlasEnteredArea(),boss=ATLAS_BOSS_PLACES[name];
  let changed=atlasRevealPlace(name);
  if(boss&&seenFoe[boss.foe]&&!atlasEncounteredBosses.has(name)){atlasEncounteredBosses.add(name);changed=true;}
  if(changed)saveGame();
  return changed;
}
function atlasSyncDiscovery(){
  // These are real recorded visits, also available when migrating older saves.
  for(const name of Object.keys(flightVisits))atlasRevealPlace(name);
  for(const key of dragonBanterSeen){
    const match=key.match(/^(?:visited:(.+)|place:(.+):(?:journey|victory))$/);
    if(match)atlasRevealPlace(atlasCanonical(match[1]||match[2]));
  }
  // A learned quest clears its destination only, never every stop en route.
  for(const q of [...atlasQuests,...atlasCompletedEntries()])atlasRevealPlace(q.place);
  const current=gameplayStarted&&!editing&&!flightTravel?atlasEnteredArea():null;
  for(const [name,boss]of Object.entries(ATLAS_BOSS_PLACES)){
    if(current===name&&seenFoe[boss.foe])atlasEncounteredBosses.add(name);
    if(atlasEncounteredBosses.has(name)||boss.defeated())atlasRevealPlace(name);
  }
  if(gameplayStarted&&!editing&&!flightTravel)atlasRevealPlace(atlasEnteredArea());
}
function restoreAtlasDiscovery(saved,encounters){
  atlasDiscovered=new Set(['Millwood']);atlasEncounteredBosses=new Set();atlasFogSignature='';
  for(const name of Array.isArray(saved)?saved:[])atlasRevealPlace(name);
  for(const name of Array.isArray(encounters)?encounters:[])if(ATLAS_BOSS_PLACES[name])atlasEncounteredBosses.add(name);
}
function atlasDiscoveryCells(){
  if(atlasRegionCells)return atlasRegionCells;
  // Clip a cell to each landmark's nearest-neighbour boundary. Separate cells
  // keep a revealed village from uncovering an adjacent boss or hidden temple.
  return atlasRegionCells=ATLAS_LOCATIONS.map((p,i)=>{
    let cell=[[0,0],[1536,0],[1536,512],[0,512]];
    for(const [j,q]of ATLAS_LOCATIONS.entries()){
      if(i===j)continue;
      const nx=q[1]-p[1],ny=q[2]-p[2],mid=(q[1]**2+q[2]**2-p[1]**2-p[2]**2)/2;
      const distance=v=>v[0]*nx+v[1]*ny-mid,next=[];
      for(let k=0;k<cell.length;k++){
        const a=cell[k],b=cell[(k+1)%cell.length],da=distance(a),db=distance(b);
        if(da<=0)next.push(a);
        if((da<=0)!==(db<=0)){const t=da/(da-db);next.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
      }
      cell=next;
    }
    return cell;
  });
}
function atlasRenderFog(){
  const signature=[...atlasDiscovered].sort().join('|');
  if(atlasFogLayer&&signature===atlasFogSignature)return;
  if(!atlasFogLayer){atlasFogLayer=document.createElement('div');atlasFogLayer.id='atlasFog';atlasFogLayer.setAttribute('aria-hidden','true');document.getElementById('atlasSurface').appendChild(atlasFogLayer);}
  atlasFogSignature=signature;
  const cells=atlasDiscoveryCells();
  const holes=ATLAS_LOCATIONS.map((p,i)=>atlasPlaceKnown(p[0])?`<polygon points="${cells[i].map(v=>v.map(n=>n.toFixed(1)).join(',')).join(' ')}"/>`:'').join('');
  // Deterministic overlapping billows span the whole map, avoiding tiled seams.
  const billows=Array.from({length:200},(_,i)=>{
    const noise=n=>{const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v);};
    const x=noise(i+1)*1640-52,y=noise(i+317)*620-54;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${42+i*17%57}" ry="${25+i*13%29}" fill="url(#atlasCloudLight)"/>`;
  }).join('');
  // Blur only the cloud edge; the remaining cloud bank is fully opaque.
  atlasFogLayer.innerHTML=`<svg viewBox="0 0 1536 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="atlasFogEdge" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
      <mask id="atlasFogMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="512"><rect width="1536" height="512" fill="white"/><g fill="black" filter="url(#atlasFogEdge)">${holes}</g></mask>
      <radialGradient id="atlasCloudLight" cx="50%" cy="45%" r="52%"><stop stop-color="#fff9ed"/><stop offset=".35" stop-color="#eaece8"/><stop offset=".7" stop-color="#d4dce0" stop-opacity=".8"/><stop offset="1" stop-color="#b3c1cd" stop-opacity="0"/></radialGradient>
    </defs><g mask="url(#atlasFogMask)"><rect width="1536" height="512" fill="#a8b8c7"/>${billows}</g></svg>`;
}
