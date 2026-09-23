import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const game=fs.readFileSync(new URL('../js/generated/game-part-2.js',import.meta.url),'utf8');
const assets=fs.readFileSync(new URL('../assets/game-assets.js',import.meta.url),'utf8');
const royal=JSON.parse(assets.match(/window.EMBER_ASSETS.ROYAL_DATA = (.*);/)[1]);
const W={maps:structuredClone(royal.maps)};
const ctx=vm.createContext({W,DIRT:1,terrRLE:a=>String(a.length)});
vm.runInContext(game.slice(game.indexOf('function installCastleCellar()'),game.indexOf('function tryCellarSupplies()')),ctx);
vm.runInContext('installCastleCellar()',ctx);

const hall=W.maps.royal_westhall,cellar=W.maps.royal_cellar;
const door=hall.doors.find(d=>d.to==='royal_cellar');
const actor=hall.roomActors.find(a=>a.royalDoor&&a.x===248);
assert(door&&actor);
assert.equal(door.triggerRect.x+door.triggerRect.w/2,actor.x);
assert.equal(cellar.doors[0].tx*16+8,actor.x);
assert.equal(cellar.cellarCaches.length,8);
assert.equal(cellar.roomActors.filter(a=>/^dragon75_food/.test(a.spr)).length,8);
assert.equal(W.maps.royal_armory.roomActors.filter(a=>/^dragon75_rack/.test(a.spr)).length,1);
console.log('PASS: storeroom door, return point, preserved supplies and armory rack placement.');
