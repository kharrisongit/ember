import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('js/blossom-routes.js','utf8');
const indexed=vm.createContext({Math}),linear=vm.createContext({Math});
vm.runInContext(source,indexed);vm.runInContext(source,linear);
vm.runInContext('treeBorderLookup=items=>(()=>items)',linear);
// Compare complete layouts with the original exhaustive search, including
// negative coordinates, cell boundaries, crossings and all regional spacing.
const regions=['oak','birch','forgewick-temple','shroom','dying','desert','swamp','millwood','blossom'];
const roads=[],arenas=[],towns=[];
for(let i=0;i<regions.length;i++){
  const x=(i%3)*192-192,y=Math.floor(i/3)*192-192,region=regions[i];
  roads.push({id:i*2,a:[x-65,y],b:[x+65,y],half:i%4+1,band:20,blossom:true,region},
    {id:i*2+1,a:[x,y-65],b:[x,y+65],half:2,band:8,blossom:i%2===0,region});
  arenas.push({id:100+i,x:x+32,y:y+32,r:6+i/2,region,tree:'test',northTree:i%2?'north':undefined});
  towns.push({id:200+i,x0:x-60,y0:y-60,x1:x-20,y1:y-20,band:6,region,northInset:i%2?4:undefined});
}
const plain=x=>JSON.parse(JSON.stringify(x));
const allowed=p=>!((Math.round(p.x)+Math.round(p.y))%11===0);
const actual=plain(indexed.planBlossomLayout(roads,arenas,towns,allowed));
assert(actual.length>500);
assert.deepEqual(actual,plain(linear.planBlossomLayout(roads,arenas,towns,allowed)),
  'Spatial filtering preserves exact tree positions, order, species, ownership and spacing');
const boxes=Array.from({length:80},(_,i)=>({id:i,x0:i*20-800,y0:i%5*20-40,x1:i*20-770,y1:i%5*20-10}));
const lookup=indexed.treeBorderLookup(boxes,b=>[b.x0,b.y0,b.x1,b.y1]);
let indexedVisits=0,linearVisits=0;
for(let y=-65;y<=80;y+=7.25)for(let x=-825;x<=825;x+=15.5){
  const inside=b=>x>=b.x0&&x<=b.x1&&y>=b.y0&&y<=b.y1;
  const nearby=lookup(x,y);indexedVisits+=nearby.length;linearVisits+=boxes.length;
  assert.deepEqual(Array.from(nearby.filter(inside),b=>b.id),boxes.filter(inside).map(b=>b.id));
}
assert(indexedVisits<linearVisits/10,'Distant shapes are excluded rather than scanned');
console.log('PASS: indexed world borders match exhaustive layout and bounds searches, with over 90% fewer candidate checks.');
