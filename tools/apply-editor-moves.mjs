import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {sourceRevision} from './editor-source-version.mjs';
import {gunzipSync} from 'node:zlib';
import '../js/editor-build-data.js';
const Build=globalThis.EmberBuildData;
const keyOK=k=>typeof k==='string'&&k.length>0&&k.length<200&&!['__proto__','prototype','constructor'].includes(k);
export function applyMoves(current,draft,revision) {
  assert.equal(draft.schema,1,'Unsupported edit format');
  assert.match(draft.id,/^[a-f0-9-]{36}$/,'Invalid submission ID');
  assert(keyOK(draft.map)&&/^[a-zA-Z0-9_-]+$/.test(draft.map),'Invalid map');
  assert.equal(current.schema,1);
  if(current.applied.includes(draft.id))return current;
  assert.equal(draft.sourceRevision,revision,'Game code has changed. Refresh before making more moves; the old draft remains saved.');
  assert(Array.isArray(draft.operations)&&(draft.operations.length>0||draft.session)&&draft.operations.length<=200000,'Invalid number of editor operations');
  const next=structuredClone(current),seen=new Set();let map=next.maps[draft.map]||{};
  let receipt=null;
  if(draft.session){
    const session=draft.session,prior=current.sessions?.[draft.map];
    assert(typeof session.id==='string'&&/^[a-f0-9-]{36}$/.test(session.id),'Invalid editor session');
    assert(Number.isSafeInteger(session.sequence)&&session.sequence>0,'Invalid session sequence');
    assert(typeof session.baseHash==='string'&&session.baseHash.length<100,'Invalid session baseline');
    assert(typeof draft.baseFingerprint==='string'&&draft.baseFingerprint.length<120,'Invalid map baseline');
    if(prior?.id===session.id){
      assert.equal(session.baseHash,prior.baseHash,'Editor session baseline changed');
      assert.equal(draft.baseFingerprint,prior.baseFingerprint,'Editor map baseline changed');
      assert.equal(prior.resultHash,Build.hash(map),'Another editing session changed this area. Refresh before sending.');
      assert(session.sequence>prior.sequence,'An earlier edit cannot replace your newer changes.');
      receipt={...prior,sequence:session.sequence};
      // Every send is the complete draft relative to this session's starting
      // map. Reapply it there so repeated moves, paint and undo stay cumulative.
      map=structuredClone(prior.base);
    }else{
      assert.equal(session.baseHash,Build.hash(map),'This area changed in another editing session. Refresh before sending.');
      receipt={...session,baseFingerprint:draft.baseFingerprint,base:structuredClone(map)};
    }
  }

  for(const op of draft.operations){
    if(op.kind==='build'){
      assert(!seen.size,'Build data must precede other edits');
      assert.equal(op.layout,Build.hash(map),'This area was published since your Build changes. Refresh before sending.');
      assert(typeof op.before==='string'&&typeof op.after==='string'&&op.before.length<100&&op.after.length<100,'Invalid Build baseline');
      Build.validate(op.changes);
      map={build:{kind:'build',previous:map,before:op.before,after:op.after,changes:structuredClone(op.changes)}};seen.add('build');continue;
    }
    if(op.kind==='door'){
      assert(Number.isInteger(op.index)&&op.index>=0&&op.index<10000&&op.key===String(op.index),'Invalid door index');
      assert(keyOK(op.to),'Invalid door destination');
      for(const r of [op.before,op.rect])for(const k of ['x','y','w','h'])assert(Number.isFinite(r?.[k])&&r[k]>=0&&r[k]<=100000&&(!['w','h'].includes(k)||r[k]>=1),'Invalid door rectangle');
      const key='door:'+op.key;assert(!seen.has(key),'Duplicate door edit');seen.add(key);
      const old=map[key];if(old){assert.equal(old.to,op.to,'Door destination changed');assert(Build.hash(old.rect)===Build.hash(op.before)||Build.hash(old.rect)===Build.hash(op.rect),'Door was edited in a newer submission');}
      map[key]={kind:'door',key:op.key,index:op.index,to:op.to,rect:{...op.rect}};continue;
    }
    if(op.kind==='collision'){
      assert(/^\d+,\d+$/.test(op.key)&&op.key.split(',').every(v=>Number(v)<10000),'Invalid collision cell');
      assert(typeof op.blocked==='boolean'&&(op.before===null||typeof op.before==='boolean'),'Invalid collision edit');
      const key='collision:'+op.key;assert(!seen.has(key),'Duplicate collision edit');seen.add(key);
      const old=map[key];if(old)assert(old.blocked===op.before||old.blocked===op.blocked,'Collision was edited in a newer submission');
      map[key]={kind:'collision',key:op.key,blocked:op.blocked};continue;
    }
    if(op.kind==='object-add'){
      assert(typeof op.key==='string'&&/^[a-f0-9-]{36}$/.test(op.key),'Invalid added-object identity');
      assert(Number.isInteger(op.sprite)&&op.sprite>=0&&op.sprite<100000,'Invalid added-object sprite');
      for(const field of ['x','y'])assert(Number.isInteger(op[field])&&op[field]>=0&&op[field]<=100000,'Invalid added-object coordinates');
      const key='object-add:'+op.key;assert(!seen.has(key),'Duplicate added object');seen.add(key);
      const old=map[key];
      if(old)assert(old.sprite===op.sprite&&old.x===op.x&&old.y===op.y,'This object was already published. Refresh before moving it again.');
      map[key]={kind:op.kind,key:op.key,sprite:op.sprite,x:op.x,y:op.y};continue;
    }
    if(op.kind==='paint'){
      assert(Number.isInteger(op.start)&&op.start>=0&&Number.isInteger(op.width)&&op.width>0&&op.width<10000&&Number.isInteger(op.height)&&op.height>0&&op.height<10000,'Invalid paint dimensions');
      assert(Array.isArray(op.values)&&Array.isArray(op.before)&&op.values.length===op.before.length&&op.values.length>0&&op.values.length<=4000000&&op.start+op.values.length<=op.width*op.height,'Invalid paint run');
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
  if(receipt)(next.sessions||={})[draft.map]={...receipt,resultHash:Build.hash(map)};
  else if(next.sessions)delete next.sessions[draft.map];
  return next;
}
export function decodeDraft(input){
  assert(typeof input==='string'&&Buffer.byteLength(input)<=65000,'Invalid submission size');
  return JSON.parse(input.startsWith('gzip:')?gunzipSync(Buffer.from(input.slice(5),'base64'),{maxOutputLength:16000000}).toString('utf8'):input);
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
  const input=event.inputs.draft;
  const draft=decodeDraft(input);
  const path='assets/editor-layouts.json',current=JSON.parse(fs.readFileSync(path,'utf8'));
  let next;
  try{next=applyMoves(current,draft,sourceRevision());}
  catch(error){
    // Data-only editor payloads contain no credentials. Keep rejected edits
    // recoverable from the run so the owner never has to copy them out again.
    console.error('EDITOR_DRAFT_RECOVERY '+JSON.stringify({schema:draft.schema,id:draft.id,map:draft.map,sourceRevision:draft.sourceRevision,baseFingerprint:draft.baseFingerprint,session:draft.session,operations:draft.operations}));
    throw error;
  }
  fs.writeFileSync(path,JSON.stringify(next,null,2)+'\n');
  console.log('Validated '+draft.operations.length+' edits for '+draft.map);
}
