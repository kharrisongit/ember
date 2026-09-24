import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export function sourceRevision(root=process.cwd()) {
  const paths=execFileSync('git',['ls-files','-z','index.html','js','assets/interiors'],{cwd:root,encoding:'utf8'}).split('\0').filter(p=>p==='index.html'||p.endsWith('.js')||p.endsWith('.json')).sort();
  const hash=crypto.createHash('sha256');
  for(const p of paths)hash.update(p+'\0').update(fs.readFileSync(root+'/'+p)).update('\0');
  return hash.digest('hex');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const revision=sourceRevision();
  if(process.argv.includes('--stamp')){
    const path='js/editor-drafts.js',code=fs.readFileSync(path,'utf8');
    if(!code.includes('__EDITOR_SOURCE_REVISION__'))throw Error('Editor source already stamped');
    fs.writeFileSync(path,code.replace('__EDITOR_SOURCE_REVISION__',revision));
  }
  console.log(revision);
}
