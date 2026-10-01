import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const c=vm.createContext({Math,Set,Map,routeLegs:f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b])});
for(const path of ['js/blossom-routes.js','js/side-route-adventures.js'])vm.runInContext(fs.readFileSync(path,'utf8'),c);
const run=s=>vm.runInContext(s,c);
const routes=JSON.parse(run('JSON.stringify(SideRouteAdventures.routes)'));
for(const f of routes){
 c.route=f;
 const result=JSON.parse(run('JSON.stringify(SideRouteAdventures.borderPlan([route],3500,800).points)'));
 assert(result.length>40,'Three populated border rows for '+f.id);
 assert.deepEqual([...new Set(result.map(p=>p.row))].sort(),[0,1,2]);
 for(const p of result){
  assert(p.x>=0&&p.y>=0&&p.x<3500&&p.y<800);
  for(let i=1;i<f.pts.length;i++){
   const a=f.pts[i-1],b=f.pts[i],dx=b[0]-a[0],dy=b[1]-a[1];
   const t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1)));
   assert(Math.hypot(p.x-a[0]-t*dx,p.y-a[1]-t*dy)>=f.w/2+1.96,'Trunks leave the entire path open');
  }
 }
 // The exposed outside of every right-angle turn has a planted elbow.
 for(let i=1;i<f.pts.length-1;i++){
  const a=f.pts[i-1],b=f.pts[i],d=f.pts[i+1];if((a[0]===b[0])===(b[0]===d[0]))continue;
  const dx=Math.sign(b[0]-a[0])||-Math.sign(d[0]-b[0]),dy=Math.sign(b[1]-a[1])||-Math.sign(d[1]-b[1]);
  const x=b[0]+dx*4.5,y=b[1]+dy*4.5;
  // Another nearby leg/end grove can own a tight zigzag's corner instead.
  if(x<0||y<0)continue;
  const nearOther=f.pts.slice(1).some((q,j)=>j!==i-1&&j!==i&&Math.min(Math.hypot(x-q[0],y-q[1]),Math.hypot(x-f.pts[j][0],y-f.pts[j][1]))<7);
  if(!nearOther)assert(result.some(p=>Math.hypot(p.x-x,p.y-y)<3.5),'No open outside corner on route '+f.id);
 }
}
c.simple={id:1,kind:'route',sideRoute:true,shortcut:true,style:'oak',w:5,pts:[[30,50],[130,50]]};
const a=JSON.parse(run('JSON.stringify(SideRouteAdventures.borderPlan([simple],160,120).points)'));
for(const y of [45.5,54.5,43,57,40.5,59.5]){
 const row=a.filter(p=>p.y===y).sort((a,b)=>a.x-b.x);assert(row.length>20);
 assert(row.slice(1).every((p,i)=>p.x-row[i].x===4),'Same 64-pixel spacing as the main oak route');
}
c.reverse={...c.simple,pts:[...c.simple.pts].reverse()};
assert.deepEqual(a,JSON.parse(run('JSON.stringify(SideRouteAdventures.borderPlan([reverse],160,120).points)')),'Direction cannot change tree positions');
console.log('PASS: all 28 chest/shortcut routes, three rows, even native spacing, open paths and closed outside elbows.');
