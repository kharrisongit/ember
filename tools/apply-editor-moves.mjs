import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {sourceRevision} from './editor-source-version.mjs';
const keyOK=k=>typeof k==='string'&&k.length>0&&k.length<200&&!['__proto__','prototype','constructor'].includes(k);
export function applyMoves(current,draft,revision) {
  assert.equal(draft.schema,1,'Unsupported edit format');
  assert.match(draft.id,/^[a-f0-9-]{36}$/,'Invalid submission ID');
  assert(keyOK(draft.map)&&/^[a-zA-Z0-9_-]+$/.test(draft.map),'Invalid map');
  assert.equal(current.schema,1);
  if(current.applied.includes(draft.id))return current;
  assert.equal(draft.sourceRevision,revision,'Game code has changed. Refresh before making more moves; the old draft remains saved.');
  assert(Array.isArray(draft.operations)&&draft.operations.length>0&&draft.operations.length<=500,'Send 1–500 moves at a time');
  const next=structuredClone(current),map=next.maps[draft.map]||{},seen=new Set();
  for(const op of draft.operations){
    assert(['actor','object','decor'].includes(op.kind),'Only moves can be published automatically');
    assert(keyOK(op.key),'Invalid object identity');
    for(const field of ['x','y','fromX','fromY'])assert(Number.isFinite(op[field])&&op[field]>=0&&op[field]<=100000,'Invalid move coordinates');
    assert(Number.isInteger(op.x)&&Number.isInteger(op.y),'Move destinations must be whole pixels');
    if(op.kind==='actor')assert(typeof op.identity==='string'&&op.identity.length<200,'Missing actor identity');
    else assert(Number.isInteger(op.sprite)&&op.sprite>=0,'Missing sprite identity');
    if(op.kind==='object')assert(/^\d+$/.test(op.key),'Invalid object index');
    if(op.kind==='decor')assert(['s','a'].includes(op.tag)&&Number.isInteger(op.index)&&op.index>=0&&op.index%3===0&&op.key===op.tag+op.index,'Invalid scenery identity');
    const key=op.kind+':'+op.key;assert(!seen.has(key),'Duplicate move');seen.add(key);
    const old=map[key];
    if(old){
      assert.equal(old.identity,op.identity,'Actor identity changed');assert.equal(old.sprite,op.sprite,'Sprite identity changed');
      assert((old.x===op.fromX&&old.y===op.fromY)||(old.x===op.x&&old.y===op.y),'This object has already moved in a newer submission. Refresh and try again.');
    }
    map[key]={kind:op.kind,key:op.key,...(op.kind==='actor'?{identity:op.identity}:{sprite:op.sprite}),
      ...(op.kind==='decor'?{tag:op.tag,index:op.index}:{}),x:op.x,y:op.y,originX:old?.originX??op.fromX,originY:old?.originY??op.fromY};
  }
  next.maps[draft.map]=map;next.applied.push(draft.id);
  return next;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
  const draft=JSON.parse(event.inputs.draft);
  const path='assets/editor-layouts.json',current=JSON.parse(fs.readFileSync(path,'utf8'));
  const next=applyMoves(current,draft,sourceRevision());
  fs.writeFileSync(path,JSON.stringify(next,null,2)+'\n');
  console.log('Validated '+draft.operations.length+' moves for '+draft.map);
}
