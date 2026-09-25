import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {publishEditorChanges} from '../tools/publish-editor-moves.mjs';
import {applyMoves} from '../tools/apply-editor-moves.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ember-publish-'));
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try{
  const remote=path.join(temp,'remote.git'),writer=path.join(temp,'writer'),editor=path.join(temp,'editor');
  git(temp,'init','--bare','--initial-branch=main',remote);git(temp,'clone',remote,writer);
  const configure=dir=>{git(dir,'config','user.name','Editor test');git(dir,'config','user.email','editor@example.invalid');git(dir,'config','commit.gpgsign','false');};
  configure(writer);fs.mkdirSync(path.join(writer,'assets'));
  const read=dir=>JSON.parse(fs.readFileSync(path.join(dir,'assets/editor-layouts.json')));
  const write=(dir,value)=>fs.writeFileSync(path.join(dir,'assets/editor-layouts.json'),JSON.stringify(value));
  write(writer,{schema:1,maps:{},applied:[]});fs.writeFileSync(path.join(writer,'game.txt'),'original');
  git(writer,'add','.');git(writer,'commit','-m','Initial');git(writer,'push','origin','main');
  git(temp,'clone',remote,editor);configure(editor);
  const draft={schema:1,id:'11111111-1111-4111-8111-111111111111',map:'a',sourceRevision:'version',
    operations:[{kind:'object',key:'0',sprite:1,fromX:40,fromY:40,x:56,y:40}]};
  let checks=0,applies=0;
  publishEditorChanges({cwd:editor,apply:()=>{applies++;write(editor,applyMoves(read(editor),draft,'version'));},check:()=>{
    if(++checks===1){fs.writeFileSync(path.join(writer,'game.txt'),'new game code');git(writer,'add','.');git(writer,'commit','-m','Concurrent code update');git(writer,'push','origin','main');}
    else assert.equal(fs.readFileSync(path.join(editor,'game.txt'),'utf8'),'new game code');
  },log:()=>{}});
  assert.equal(applies,2);assert.equal(checks,2,'The retried layout is checked against new code');
  git(writer,'pull','--ff-only');assert(read(writer).applied.includes(draft.id));
  assert.equal(fs.readFileSync(path.join(writer,'game.txt'),'utf8'),'new game code');
  const next={...draft,id:'22222222-2222-4222-8222-222222222222',operations:[{...draft.operations[0],fromX:56,x:72}]};
  checks=0;
  assert.throws(()=>publishEditorChanges({cwd:editor,apply:()=>write(editor,applyMoves(read(editor),next,'version')),check:()=>{
    if(++checks===1){const conflicting={...next,id:'33333333-3333-4333-8333-333333333333',operations:[{...next.operations[0],x:88}]};
      write(writer,applyMoves(read(writer),conflicting,'version'));git(writer,'add','.');git(writer,'commit','-m','Concurrent object move');git(writer,'push','origin','main');}
  },log:()=>{}}),/already moved/);
  assert.equal(read(writer).maps.a['object:0'].x,88,'A conflicting retry preserves the other published edit');
  assert(!read(writer).applied.includes(next.id));
  console.log('PASS: real concurrent code push retries and preserves both changes; a conflicting layout push is rejected without force-pushing.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
