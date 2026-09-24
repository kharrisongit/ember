import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),html=fs.readFileSync(new URL('index.html',root),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"?#]+)(?:[^\"]*)"[^>]*>/g)].map(m=>m[1]).filter(p=>!/^https?:/.test(p));
assert(scripts.length>0,'Game loader has no scripts');
const bodies=[];
for(const path of scripts){
 const code=fs.readFileSync(new URL(path,root),'utf8');
 new vm.Script(code,{filename:path});bodies.push(code);
}
// Classic scripts share one global lexical scope. Check the combination too.
new vm.Script(bodies.join('\n;\n'),{filename:'combined-game-scripts.js'});
console.log(`PASS: ${scripts.length} loaded scripts exist and parse, individually and in their shared scope.`);
