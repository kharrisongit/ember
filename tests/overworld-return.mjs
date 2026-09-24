import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {performance} from 'node:perf_hooks';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('js/generated/game-part-2.js'),part3=read('js/generated/game-part-3.js');
const packed=read('js/generated/game-part-1.js');
const source=JSON.parse(zlib.gunzipSync(Buffer.from(packed.match(/const W_GZ = "([^"]+)"/)[1],'base64')));
const disk=new Map(),c=vm.createContext({console,crypto:webcrypto,performance,atob:s=>Buffer.from(s,'base64').toString('binary'),
 localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)},setTimeout:()=>0,clearTimeout(){},
 document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},
 tap(){},toast(){},saveGeometry(){},fetch(){throw Error('Map transitions must not publish edits');}});
const run=s=>vm.runInContext(s,c);
run(`let W=JSON.parse(${JSON.stringify(JSON.stringify(source))});`);
run(game.slice(game.indexOf('  for (const mid in W.maps) {'),game.indexOf('  installKnightEncounter(); numberAllArenas();')));
run(`W.maps.room={w:8,h:8,terr:'0.64',objs:[0,32,32],npcs:[],doors:[],scatter:[],sanim:[],features:[]};
 let actorLayouts={},geometryEdits={},MD=null,MAPID='',TS=16,MW=0,MH=0,PXW=0,PXH=0,NAMES=W.names,DEFS={};
 let terr,terrOrig,baseTerr,solid,SCENE_WALL,ORIG=[],objs=[],added=[],deleted=new Set(),nextId=0,painted=new Map(),undoStack=[];
 let features=[],featOrig=new Map(),featSeq=1,regionMoves=[],clearedBoxes=[],felled=new Set(),felledNew=[],decorGone=new Set(),decorDel=[],decorMoved=new Map();
 let fobjs=[],fsanim=[],hidden=new Set(),scat=[],sanm=[],decks=[],deckFix=new Map(),deckWet=null,deckPlank=new Map(),deckCover=new Set();
 let blockTiles=[],lineTiles=new Set(),rockTiles=new Set(),soilAreas=[],arenaRings=null,blossomBand=null,townBoxList=null;
 let chunks=new Map(),chunkClock=0,scatterChunks=new Map(),CW=0,CH=0,buckets=[],sbuckets=[],fenceAt=null,mapDirty=false;
 let buildUndo=[],grabRect=null,grabDrag=null,stroke=null,chestAnim=null,fishing=null,pendingActorStage=null,brambleMap='',doorMotion=null;
 let arenaLock=null,arenaT=0,arenaGoing=false,trial=null,wonAll=false,lastFight=0,edits={},camFree=true,mode='test',cam={};
 let loot=[],spell=null,risings=[],blooms=[],consecrationTrails=[],dustPuff=null,graves=null,flying=[],falling=null,npcs=[],selected=null;
 let editing=false,building=false,painting=false,doorEdit=false,collideView=false,quest=0,Q={KING:99},dragon={},foes=[];
 let GRASS=0,DIRT=1,COBBLE=2,FARM=3,WATER=4,BRIDGE=5,WALL=6,DECK=15,DWATER=7,SEA=12,POOL_T=11,VLAVA=18,CELL=256;
 let TCHAR={0:'g',1:'d',4:'w'},stats={generate:0,solid:0,lava:0,ground:0,foes:0,birds:0};
 function seedTreasuryGold(){}function stopTrial(){}function setPaint(on){painting=on}function refreshSel(){}
 function resetChunkWarm(){}function placeBirds(){stats.birds++}function openClearings(){}function beginHettieWalk(){}
 function spawnFoes(){stats.foes++;foes=[{hp:10}]}
 function indexScatter(){scatterChunks=new Map()}function indexDecks(){deckPlank=new Map();deckCover=new Set()}
 function buildGround(){stats.ground++;rebuildLavaNear();chunks.clear();indexScatter();indexDecks()}
 function realizeFeatures(){stats.generate++;fobjs=[{id:-1,s:0,x:80,y:80}];reindex()}
`);
run(read('js/editor-build-data.js'));run(read('js/editor-drafts.js'));run(read('js/published-editor-layouts.js'));
for(const [start,end]of [['function geometryPatch(','// Illustrated atlas:'],['function editorActorInfo(','function pickEditorActor('],['function buildPatch(','const dumpEl ='],['function decodeRLE(','let lavaNear ='],['let lavaNear =','function lavaDist('],['function rebuildSolid(','let arenaPass ='],['function rebuildBuckets(','const P =']])run(game.slice(game.indexOf(start),game.indexOf(end)));
run(part3.slice(part3.indexOf('const realizedCache ='),part3.indexOf('let featOrig =')));
run(part3.slice(part3.indexOf('function terrRLE('),part3.indexOf('const RUN_SPR =')));
run(read('js/editor-draft-integration.js'));
run(`const originalSolid=rebuildSolid,originalLava=rebuildLavaNear;
 rebuildSolid=function(){stats.solid++;return originalSolid()};rebuildLavaNear=function(){stats.lava++;return originalLava()};
 const start=performance.now();loadMap('world');globalThis.coldMs=performance.now()-start;
 // Keep observable markers in every heavy derived system and the render cache.
 chunks.set(123,{cv:{marker:'outside'},used:1});solid[0]=1;terrOrig[2]=0;painted.set(2,4);terr[2]=4;
 objs[0].x+=8;rebuildBuckets();foes[0].hp=1;
 globalThis.retained={terr,terrOrig,baseTerr,solid,objs,fobjs,buckets,sbuckets,lavaNear,scatterChunks,chunks,deckPlank,rockTiles};
 const npcStart=MD.npcs[0].x;npcs[0].x+=100;
 loadMap('room');chunks.set(999,{cv:{marker:'inside'}});objs[0].x+=4;saveEditorDraft();
 globalThis.before={...stats};const warmStart=performance.now();loadMap('world');globalThis.warmMs=performance.now()-warmStart;
 globalThis.after={...stats};
 for(const key of Object.keys(retained))if(eval(key)!==retained[key])throw Error(key+' was unnecessarily rebuilt');
 if(!chunks.has(123)||chunks.has(999))throw Error('World and interior ground caches crossed');
 if(terr[2]!==4||terrOrig[2]!==0||solid[0]!==1)throw Error('Terrain, paint baseline or collision changed');
 if(npcs[0].x!==npcStart||foes[0].hp!==10)throw Error('Dynamic actors were not reset');
`);
for(const key of ['generate','solid','lava','ground'])assert.equal(c.after[key],c.before[key],key+' must not run on a warm return');
assert.equal(c.after.foes,c.before.foes+1);assert.equal(c.after.birds,c.before.birds+1);
run(`saveEditorDraft();globalThis.saved=EmberEditDrafts.store.get('world');loadMap('room');loadMap('world');saveEditorDraft();`);
assert.equal(run("JSON.stringify(EmberEditDrafts.store.get('world').operations)"),JSON.stringify(c.saved.operations),'repeat visits preserve publishable edits');
// A new/reset draft, changed map object, or changed dimensions must use the normal loader.
for(const change of ["const d=EmberEditDrafts.store.get('world');d.state.painted.push([3,1]);EmberEditDrafts.store.put('world',d);",'W.maps.world={...W.maps.world};',"EmberEditDrafts.store.remove('world');"]){
 run(`loadMap('room');{${change}}globalThis.before={...stats};loadMap('world');globalThis.after={...stats};`);
 assert(c.after.ground>c.before.ground,'changed data must rebuild');
}
run(`loadMap('room');globalThis.before={...stats};loadMap('world',true,true);globalThis.after={...stats};`);
assert(c.after.ground>c.before.ground,'RESET bypasses retained state');
assert.equal(run('painted.size'),0,'RESET removes local paint');
// Build data uses normalized saved state while the live objects keep their IDs.
run(`features.push({id:99999,kind:'arena',x:400,y:160,r:6,style:'forest'});saveEditorDraft();
 globalThis.built=EmberEditDrafts.store.get('world');loadMap('room');globalThis.before={...stats};loadMap('world');saveEditorDraft();globalThis.after={...stats};`);
assert.equal(c.after.ground,c.before.ground,'unchanged Build draft also returns without rebuilding');
assert.equal(run("EmberEditDrafts.store.get('world').operations[0].after"),c.built.operations[0].after,'cached Build state publishes the same result');
console.log('PASS: actual overworld loader reuses terrain, collision, spatial indexes and ground images; resets NPCs/enemies; preserves Move/Paint/Build drafts and rejects stale/reset state.');
console.log('Overworld load benchmark (terrain decode and real collision/index work; feature generator stubbed): '+c.coldMs.toFixed(1)+' ms cold, '+c.warmMs.toFixed(1)+' ms retained.');
