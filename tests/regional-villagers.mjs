import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadEditorGame} from '../tools/editor-game-context.mjs';
const {run,context:c}=await loadEditorGame(process.cwd(),{log(){},warn(){}},{furniture:false});
const cast=run('REGIONAL_VILLAGERS');
assert.equal(cast.length,24);assert.equal(new Set(cast.map(n=>n.name)).size,24);
for(const town of new Set(cast.map(n=>n.town)))assert.equal(cast.filter(n=>n.town===town).length,4);
run("prepareEditorEntities(W.maps.world,'world');prepareEditorEntities(W.maps.world,'world')");
assert.equal(run("W.maps.world.npcs.filter(n=>/^regional_/.test(n.packSpr)).length"),24,'Map preparation never duplicates residents');
for(const n of cast){
 const png=fs.readFileSync('assets/sprites/regional/'+n.id+'.png');
 assert.equal(png.readUInt32BE(16),384);assert.equal(png.readUInt32BE(20),512);
}
await run('prepareRegionalVillagerArt()');
for(const n of cast)for(const dir of ['d','u','e','w'])for(const [action,frames] of [['idle',4],['walk',6]]){
 c.sprite='regional_'+n.id+'_'+action+'_'+dir;
 assert.equal(run('SPR[sprite][4]'),frames);assert.equal(run('animalSheets[sprite].spriteScale'),2);
}
await run('loadPublishedEditorLayouts()');
run("mode='play';quest=Q.DONE;thornwellRoyal.stage=7;brambleQuest=3;loadMap('world');scene=null;ask=null;sayNpc=null");
const placements=[];
for(const person of cast){
 c.person=person;
 const p=run(`(()=>{const n=npcs.find(n=>n.editKey==='npc:regional:'+person.id),s=MD.npcs.find(s=>s.editKey===n.editKey);
   return {name:n.n,x:n.x,y:n.y,placed:s.regionalPlaced,clear:canNpcStand(n.x,n.y,n),route:patrolRoute(n),vertical:northSouthPatrol(n),dialogue:n.d};})()`);
 assert(p.placed,person.name+' found a clear town location');assert(p.clear,person.name+' is outside solid art');
 assert(p.vertical,person.name+' patrols only north and south');
 assert(p.route.every(point=>point[0]===p.x),person.name+' never patrols east or west');
 assert(p.route.length>1,person.name+' has a usable patrol route');
 assert(p.dialogue[0].startsWith(person.name+':'),person.name+' has authored dialogue');
 placements.push(p);
}
// A later editor move keeps the same identity and is never reset to the default.
run("var resident=npcs.find(n=>n.editKey==='npc:regional:tilda'),source=MD.npcs.find(n=>n.editKey===resident.editKey);source.regionalPlaced=false;resident.x+=16;var editedX=resident.x;settleRegionalVillagers()");
assert.equal(run('resident.x'),run('editedX'));
console.log('PASS: 24 unique residents, four per town, all 192 directional animation strips, clear published-world placements, usable patrols, authored dialogue and preserved editor moves.');
console.log(JSON.stringify(placements.map(({name,x,y,route})=>({name,x,y,route:route.length}))));
