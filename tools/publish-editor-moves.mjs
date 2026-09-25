import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Used in a disposable Actions checkout. Each retry starts with the latest main
// and validates the original submission again; it never force-pushes or merges
// stale generated JSON over someone else's newer layout.
export function publishEditorChanges({cwd=process.cwd(),apply,check,attempts=5,log=console.log}){
  const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  if(git('status','--porcelain'))throw Error('Editor publishing requires a clean checkout.');
  for(let attempt=1;attempt<=attempts;attempt++){
    git('fetch','origin','main');git('reset','--hard','origin/main');
    const base=git('rev-parse','HEAD');
    apply();check();git('add','assets/editor-layouts.json');
    if(git('diff','--cached','--name-only'))git('commit','-m','Apply edits submitted from the game');
    try{git('push','origin','HEAD:main');return git('rev-parse','HEAD');}
    catch(error){
      git('fetch','origin','main');
      if(git('rev-parse','origin/main')===base)throw error;
      if(attempt===attempts)throw Error('Main kept changing during publication. Retry SEND CHANGES; no newer commits were overwritten.');
      log('Main advanced during publishing. Revalidating these edits against the latest game ('+(attempt+1)+'/'+attempts+').');
    }
  }
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(process.env.GITHUB_ACTIONS!=='true')throw Error('Run the publishing command only in the dedicated GitHub Actions checkout.');
  const node=file=>execFileSync(process.execPath,[file],{stdio:'inherit'});
  publishEditorChanges({apply:()=>node('tools/apply-editor-moves.mjs'),check:()=>{
    for(const file of ['tools/check-game-scripts.mjs','tests/npc-placement.mjs','tests/editor-source-compatibility.mjs',
      'tests/editor-publish-race.mjs','tests/hunting-grounds.mjs','tests/animal-sprites.mjs','tests/overworld-return.mjs',
      'tests/temple-exit-triggers.mjs','tests/temple-arenas.mjs','tests/temple-compass.mjs'])node(file);
  }});
}
