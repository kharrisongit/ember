import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const c=vm.createContext({Math,Set});
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
const features=[
 {id:1,kind:'route',style:'oak',w:5,pts:[[30,50],[30,130]]},
 {id:2,kind:'route',style:'temple',joins:['Forgewick','Forgewick Temple'],w:5,pts:[[100,50],[100,130]]},
 {id:3,kind:'route',style:'temple',joins:['Other Temple'],w:5,pts:[[160,50],[160,130]]},
 {id:4,kind:'arena',style:'oak',x:30,y:110,r:6.3},
 {id:5,kind:'arena',x:100,y:110,r:6.3},
 {id:6,kind:'arena',style:'spruce',x:100,y:75,r:6.3}
];
const scope=c.treeBorderScope(features,f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b]));
assert.equal(scope.roads.find(r=>r.id===1).tree,'oak_big');
assert.equal(scope.roads.find(r=>r.id===2).tree,'kt_tree_a');
assert.equal(scope.roads.find(r=>r.id===3).blossom,false,'Other temple paths remain untouched');
assert.deepEqual(Array.from(scope.arenas,a=>a.id),[4,5],'Only matching arena borders are rebuilt');
const plan=c.planBlossomLayout(scope.roads,scope.arenas,[]);
for(const [region,xs,step] of [['oak',[21,23.5,26,34,36.5,39],64],
 ['forgewick-temple',[89,92.5,96,104,107.5,111],80]]){
 for(const x of xs){
  const row=plan.filter(p=>p.region===region&&p.kind==='route'&&p.x===x&&p.y>=55&&p.y<=85).sort((a,b)=>a.y-b.y);
  assert(row.length>=5,'Every route band is filled');
  assert(row.slice(1).every((p,i)=>(p.y-row[i].y)*16===step),'Even spacing retains visible trunks');
  assert(row.every(p=>p.y*16%step===p.row%2*step/2),'Bands alternate by half a tree spacing');
 }
}
for(let i=0;i<plan.length;i++)assert(plan.slice(i+1).every(q=>Math.hypot(plan[i].x-q.x,plan[i].y-q.y)>=Math.max(c.treeBorderSpacing(plan[i]).clearance,c.treeBorderSpacing(q).clearance)-.04),'Arena joins never crowd the trees');
console.log('PASS: oak and Forgewick temple route bands use native trees, visible trunks, even spacing, stagger and clean arena joins.');
