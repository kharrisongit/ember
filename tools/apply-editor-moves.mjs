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
  assert(Array.isArray(draft.operations)&&draft.operations.length>0&&draft.operations.length<=2000,'Send 1–2000 edit operations at a time');
  const next=structuredClone(current),map=next.maps[draft.map]||{},seen=new Set();
  for(const op of draft.operations){
    if(op.kind==='paint'){
      assert(Number.isInteger(op.start)&&op.start>=0&&Number.isInteger(op.width)&&op.width>0&&op.width<10000&&Number.isInteger(op.height)&&op.height>0&&op.height<10000,'Invalid paint dimensions');
      assert(Array.isArray(op.values)&&Array.isArray(op.before)&&op.values.length===op.before.length&&op.values.length>0&&op.values.length<=20000&&op.start+op.values.length<=op.width*op.height,'Invalid paint run');
      for(let j=0;j<op.values.length;j++){
        const value=op.values[j],before=op.before[j],index=op.start+j,key='paint:'+index;
        assert(Number.isInteger(value)&&value>=0&&value<=19&&Number.isInteger(before)&&before>=0&&before<=19,'Invalid terrain type');
        assert(!seen.has(key),'Duplicate painted tile');seen.add(key);
        const old=map[key];if(old)assert(old.value===before||old.value===value,'This tile was painted in a newer submission. Refresh and try again.');
        map[key]={kind:'paint',key:String(index),index,value,originValue:old?.originValue??before,width:op.width,height:op.height};
      }
      continue;
    }
    if(op.kind==='feature-delete'){
      assert(Number.isInteger(op.tx)&&op.tx>=0&&op.tx<10000&&Number.isInteger(op.ty)&&op.ty>=0&&op.ty<10000&&op.key===op.tx+','+op.ty,'Invalid generated-object deletion');
      const key='feature-delete:'+op.key;assert(!seen.has(key),'Duplicate deletion');seen.add(key);
      map[key]={kind:op.kind,key:op.key,tx:op.tx,ty:op.ty};continue;
    }
    assert(['actor','object','decor'].includes(op.kind),'Unsupported editor operation');
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
      assert(!old.deleted||op.deleted===true,'This object was deleted in a newer submission. Refresh and try again.');
      assert((old.x===op.fromX&&old.y===op.fromY)||(old.x===op.x&&old.y===op.y)||old.deleted&&op.deleted===true,'This object has already moved in a newer submission. Refresh and try again.');
    }
    map[key]={kind:op.kind,key:op.key,...(op.kind==='actor'?{identity:op.identity}:{sprite:op.sprite}),
      ...(op.kind==='decor'?{tag:op.tag,index:op.index}:{}),...(op.deleted===true?{deleted:true}:{}),x:op.x,y:op.y,originX:old?.originX??op.fromX,originY:old?.originY??op.fromY};
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
