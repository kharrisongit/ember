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

// These outlines follow the illustration, rather than slicing buildings at the
// halfway point between labels. All pixels inside a known place stay clear.
const ATLAS_REVEAL_FOOTPRINTS={
 'Millwood':[[0,295],[70,293],[133,303],[181,331],[199,403],[216,461],[215,512],[0,512]],
 'Elder’s Home':[[0,299],[72,296],[95,320],[86,378],[0,382]],
 'Thornwell':[[183,96],[254,84],[354,111],[376,177],[365,263],[332,304],[234,304],[193,277],[174,198]],
 'Forgefalls':[[364,76],[421,76],[427,184],[438,211],[443,283],[370,288],[360,228]],
 'Forgewick':[[430,102],[514,79],[574,105],[645,137],[682,211],[670,266],[648,338],[470,348],[443,283],[429,233]],
 'Forgewick Temple':[[447,372],[562,365],[626,407],[614,469],[557,491],[460,482],[430,444]],
 'Sandspire':[[711,118],[820,106],[900,123],[932,204],[915,253],[855,278],[745,270],[705,215]],
 'The Oasis':[[705,280],[760,268],[814,280],[837,311],[818,345],[757,350],[710,325]],
 'Sandspire Temple':[[820,297],[893,281],[958,306],[980,372],[942,425],[852,434],[816,391]],
 'Coralmere':[[898,393],[948,373],[1061,375],[1119,386],[1148,442],[1134,478],[997,502],[927,480],[892,454]],
 'Hollybeck':[[1240,351],[1302,337],[1370,344],[1403,401],[1405,512],[1236,512],[1223,438]],
 'Hollybeck Temple':[[1301,182],[1384,180],[1410,223],[1403,277],[1356,300],[1284,267]],
 'Hollybeck Graveyard':[[1215,261],[1299,260],[1325,300],[1302,337],[1222,335],[1205,297]],
 'Frosthorn':[[1167,9],[1242,7],[1272,41],[1260,99],[1201,105],[1162,74]],
 'Ice Moth':[[1183,113],[1251,109],[1289,143],[1291,186],[1259,216],[1191,211],[1168,166]],
 'Frostcrag':[[1270,0],[1405,0],[1413,99],[1351,136],[1272,102]],
 'Ashcrag':[[1408,25],[1536,27],[1536,169],[1462,165],[1412,130]],
 'Cinderhold Castle':[[1435,203],[1536,195],[1536,362],[1422,362],[1410,283]],
 'Sunken Pyramid':[[730,15],[812,8],[856,49],[840,105],[769,112],[728,82]],
 'Desert Church':[[675,366],[740,355],[767,404],[759,453],[703,469],[663,437]]
};
let atlasCloudArt=null,atlasCloudReady=false,atlasSilhouetteArt=null,atlasSilhouetteReady=false;
function atlasRevealAll(){
  for(const p of ATLAS_LOCATIONS)atlasDiscovered.add(p[0]);
  for(const name of Object.keys(ATLAS_BOSS_PLACES))atlasEncounteredBosses.add(name);
  atlasFogSignature='';
  if(typeof atlasOpen!=='undefined'&&atlasOpen){atlasBuildPlaces();atlasRenderFog();atlasShowDetails();}
}
function atlasRenderFog(){
  const signature=[...atlasDiscovered].sort().join('|')+':'+atlasCloudReady+':'+atlasSilhouetteReady;
  if(atlasFogLayer&&signature===atlasFogSignature)return;
  if(!atlasFogLayer){
    atlasFogLayer=document.createElement('canvas');atlasFogLayer.id='atlasFog';
    atlasFogLayer.width=1536;atlasFogLayer.height=512;
    atlasFogLayer.setAttribute('aria-hidden','true');document.getElementById('atlasSurface').appendChild(atlasFogLayer);
  }
  atlasFogSignature=signature;
  if(!atlasCloudArt){
    atlasCloudArt=new Image();
    atlasCloudArt.onload=()=>{atlasCloudReady=true;atlasRenderFog();};
    atlasCloudArt.src='assets/maps/realm-clouds-v1.webp';
  }
  if(!atlasSilhouetteArt){
    atlasSilhouetteArt=new Image();
    atlasSilhouetteArt.onload=()=>{atlasSilhouetteReady=true;atlasRenderFog();};
    atlasSilhouetteArt.src='assets/maps/location-shadows-v1.webp';
  }
  const g=atlasFogLayer.getContext('2d');g.clearRect(0,0,1536,512);
  if(ATLAS_LOCATIONS.every(p=>atlasPlaceKnown(p[0])))return;
  if(atlasCloudReady)g.drawImage(atlasCloudArt,0,0,1536,512);
  else {g.fillStyle='#ccd7dc';g.fillRect(0,0,1536,512);}
  // Opaque cloud artwork hides every unrevealed map pixel. Separate generated
  // black silhouettes hint at destinations without exposing the underlying art.
  if(atlasSilhouetteReady){
    const types={'Millwood':0,'Elder’s Home':1,'Northern Woods':2,'Sporewood':3,'Sporehollow':3,'Northern Shroom Field':3,'Shroom Pass':3,
      'Thornwell':0,'Forgefalls':5,'Forgewick':6,'Sandspire':8,'The Oasis':9,'Coralmere':0,'Witchmoor':1,'Dreadmarsh':2,
      'Hollybeck':0,'Hollybeck Graveyard':7,'Frostcrag':10,'Ashcrag':10,'Cinderhold Castle':11,'Sunken Pyramid':7,'Desert Church':7,
      'Spider Queen':10,'Frosthorn':10,'Ice Moth':10};
    const cw=atlasSilhouetteArt.width/4,ch=atlasSilhouetteArt.height/3;
    g.save();g.globalAlpha=.34;
    for(const p of ATLAS_LOCATIONS){
      if(atlasPlaceKnown(p[0]))continue;
      const index=types[p[0]]??(p[0].includes('Temple')?7:4),size=/^Route/.test(p[0])?34:60;
      g.drawImage(atlasSilhouetteArt,index%4*cw,Math.floor(index/4)*ch,cw,ch,p[1]-size/2,p[2]-size/2,size,size);
    }
    g.restore();
  }
  const mask=document.createElement('canvas');mask.width=1536;mask.height=512;
  const mg=mask.getContext('2d');mg.fillStyle='#000';mg.shadowColor='#000';mg.shadowBlur=12;
  const cells=atlasDiscoveryCells();
  ATLAS_LOCATIONS.forEach((p,i)=>{
    if(!atlasPlaceKnown(p[0]))return;
    const polygon=ATLAS_REVEAL_FOOTPRINTS[p[0]]||cells[i];
    if(!polygon.length)return;
    mg.beginPath();polygon.forEach(([x,y],j)=>j?mg.lineTo(x,y):mg.moveTo(x,y));mg.closePath();mg.fill();
  });
  // Rasterize once per discovery change. No live SVG mask/filter is repainted
  // while dragging. Solid interiors clear fully; feathering extends outward.
  g.globalCompositeOperation='destination-out';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over';
}
