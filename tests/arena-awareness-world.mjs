/* Exercise every published combat arena with its actual terrain and collision. */
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
await run('loadPublishedEditorLayouts()');run("applyPublishedEditorLayout(W.maps.world,'world')");
run(`buildGround=()=>{};reindex=()=>{};refreshBuild=()=>{};rebuildBuckets=()=>{};placeBirds=()=>{};
cam.x=-100000;cam.y=-100000;loadMap('world',true);`);
run(`var arenaAudit={arenas:0,entries:0,reverseRespawns:0,visibleTurns:0,failures:[]};
const checkFormation=(a,side,where)=>{
 const cx=a.x*TS+8,cy=a.y*TS+8,alive=foes.filter(f=>f.st!=='dead');
 for(const f of alive){
  const dot=(f.x-cx)*side[0]+(f.y-cy)*side[1];
  const want=side[0]?(side[0]<0?'w':'e'):side[1]<0?'u':'d';
  if(dot>=-1||foeDir(f.dir,f.flip)!==want||!canStand(f.x,f.y))arenaAudit.failures.push({id:a.id,where,kind:f.kind,dot,dir:foeDir(f.dir,f.flip),want,clear:canStand(f.x,f.y)});
 }
};
const savedCombatants=foes.filter(f=>!f.huntingArena&&!f.storyKnight&&!f.trial).map(f=>({...f}));
const savedRings=currentArenaFeatures().filter(a=>!isHuntingArena(a)&&!a.storyKnight);
const arenaListFunction=currentArenaFeatures;
EmberRiding.skip();quest=Q.DONE;mode='play';gameplayStarted=true;foesHeld=false;deadShown=false;scene=null;revealing=false;bossScene=null;dragon.on=false;
for(const a of savedRings){
 const group=savedCombatants.filter(f=>Math.hypot(f.hx/TS-a.x,f.hy/TS-a.y)<a.r+5);
 if(!group.length)continue;
 arenaAudit.arenas++;
 const b={x:a.x*TS+8,y:a.y*TS+8},range=(a.r+1.5)*TS;
 const sides=[[0,1],[0,-1],[-1,0],[1,0]].filter(([dx,dy])=>[0,.3,.6,1].every(t=>canStand(b.x+dx*range*t,b.y+dy*range*t)));
 if(!sides.length){arenaAudit.failures.push({id:a.id,where:'no walkable entrance'});continue;}
 currentArenaFeatures=()=>[a];
 for(const side of sides){
  foes=group.map(f=>({...f,st:'idle'}));EmberArenaEntry.reset();arenaLock=null;cam.x=-100000;cam.y=-100000;cam.z=2.5;VW=800;VH=600;
  P.x=b.x+side[0]*range;P.y=b.y+side[1]*range;
  EmberArenaEntry.prepare(a);checkFormation(a,side,'initial');arenaAudit.entries++;
 }
 if(sides.length>1){
  const side=sides[0];P.x=b.x+side[0]*range;P.y=b.y+side[1]*range;
  foes.forEach(f=>{f.st='dead';f.hp=0;});EmberArenaEntry.completed(a);cooling.clear();holy.clear();refillRing(a);
  if(foes.some(f=>f.st!=='dead')){checkFormation(a,side,'respawn');arenaAudit.reverseRespawns++;
   const back=sides.at(-1);P.x=b.x+back[0]*range;P.y=b.y+back[1]*range;
   cam.x=b.x-180;cam.y=b.y-180;cam.z=1;VW=600;VH=500;
   EmberArenaEntry.prepare(a);
   for(let i=0;i<100;i++){tAcc+=.05;EmberArenaEntry.step(.05);}
   checkFormation(a,back,'visible return');arenaAudit.visibleTurns++;
  }
 }
}
currentArenaFeatures=arenaListFunction;
if(arenaAudit.failures.length)throw new Error(JSON.stringify(arenaAudit));
if(arenaAudit.arenas<45||arenaAudit.entries<80||arenaAudit.reverseRespawns<40)throw new Error('Incomplete all-arena audit: '+JSON.stringify(arenaAudit));
`);
console.log('PASS: published world arena formations, entrance-facing idle poses, reverse respawns and visible restaging on real collision.');
console.log(run('JSON.stringify(arenaAudit)'));
