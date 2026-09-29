import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const game=fs.readFileSync('js/generated/game-part-2.js','utf8');
const section=game.slice(game.indexOf('const WEATHER = ['),game.indexOf('let weatherFrameCanvas ='));
const c=vm.createContext({Math,Map,Set,MAPID:'world',TS:16,P:{x:0,y:0},features:[
 {kind:'area',label:'Sandspire',x0:1501,x1:1535,y0:74,y1:116},
 {kind:'route',road:'Route 3',w:5,pts:[[1400,95],[1501,95]]},
 {kind:'route',road:'Temple Route 2',w:5,pts:[[1515,115],[1515,205],[1600,205]]},
 {kind:'route',road:'Route 4',w:5,pts:[[1518,73],[1600,73]]},
 {kind:'route',w:5,pts:[[1515,160],[1540,160]]}
],routeLegs:f=>f.pts.slice(1).map((b,i)=>[f.pts[i],b])});
vm.runInContext(section,c);
const weather=(x,y)=>{c.P.x=x*16;c.P.y=y*16;return vm.runInContext('weatherHere()?.kind||null',c)};
for(const [x,y] of [[1498,95],[1499,95],[1501,95],[1515,115],[1515,118],[1518,73],[1540,160],[1515,160]])assert.equal(weather(x,y),null,'Storm never appears on town entrances, exits or another path');
assert.equal(weather(1515,119),'sand','Storm begins south of the town on its temple road');
assert.equal(weather(1515,150),'sand');
assert.equal(weather(1590,205),'sand','Storm follows the temple route turns');
assert.equal(weather(1515,159.8),'sand');
assert.equal(weather(1515,159.98),null,'Sub-tile movement to a crossing cannot reuse stale weather');
assert.equal(weather(2700,200),'snow','Snow regions remain intact');
c.MAPID='ds1';assert.equal(weather(1515,150),null,'Interiors have no overworld storm');
vm.runInContext(fs.readFileSync('js/blossom-routes.js','utf8'),c);
vm.runInContext(`MAPID='world';var NAMES=['sh_wall_blue0','sh_big_purple0','sh_sml_blue0','mw_stump','mw_tree'];
var features=[{kind:'area',label:'North Shroom Pass Field',x0:18,x1:42,y0:9,y1:33},
 {kind:'area',label:'Spore Hollow',x0:80,x1:110,y0:62,y1:92}];
var objs=[{id:1,s:0,x:16*TS,y:12*TS},{id:2,s:1,x:46*TS,y:42*TS},
 {id:3,s:2,x:30*TS,y:25*TS},{id:4,s:0,x:82*TS,y:65*TS},
 {id:5,s:3,x:30*TS,y:20*TS},{id:6,s:4,x:26*TS,y:22*TS},
 {id:7,s:0,x:30*TS,y:63*TS}];
var fobjs=[{id:-1,s:0,x:40*TS,y:33*TS},{id:-2,s:1,x:85*TS,y:75*TS}];
var scat=[0,20*TS,10*TS,0,90*TS,70*TS],sanm=[2,30*TS,28*TS,2,90*TS,70*TS];
var hidden=new Set(),decorGone=new Set();clearCrashFieldMushrooms();`,c);
assert.deepEqual(Array.from(c.hidden),[1,2,3],'All old mushroom sizes are removed from the crash field');
assert.deepEqual(Array.from(c.fobjs,o=>o.id),[-2],'Shroom-people mushrooms remain');
assert.deepEqual(Array.from(c.decorGone),['s0','a0'],'Static and animated field mushrooms are hidden, while town decoration remains');
assert(!c.hidden.has(5)&&!c.hidden.has(6)&&!c.hidden.has(7),'Stump, replacement tree border and mushrooms along the approach remain');
console.log('PASS: Sandspire storm stays south on its temple road, crossings and sub-tile town entrances stay clear; crash-field mushrooms are removed across all decoration layers while Sporehollow and the stump trees remain.');
