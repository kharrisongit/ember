import assert from 'node:assert/strict';
export function verifyCraftingWorld(run){
 const stats=JSON.parse(run(`JSON.stringify((()=>{const nodes=Crafting.inspect().nodes;return {counts:nodes.reduce((a,n)=>(a[n.material]=(a[n.material]||0)+1,a),{}),blocked:nodes.filter(n=>!canStand(n.x,n.y)).map(n=>n.id),unique:new Set(nodes.map(n=>n.id)).size,total:nodes.length};})())`));
 for(const id of ['herb','mushroom','root','sunbloom','reed','ghostcap','frostberry','snowbell','mineral'])assert(stats.counts[id]>0,'Gatherable source exists: '+id);
 assert.equal(stats.blocked.length,0,'Every gathering patch is on walkable ground');assert.equal(stats.unique,stats.total,'Gathering patch IDs are unique');
 console.log('PASS: '+stats.total+' reachable ingredient patches cover every gatherable ingredient.');
}
