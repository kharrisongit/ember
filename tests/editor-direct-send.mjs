import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const source=fs.readFileSync(new URL('../js/editor-drafts.js',import.meta.url),'utf8');
const TOKEN='emberfell.editor-github.v1',PAIR='emberfell.editor-pair.v1';
const draft={schema:1,id:'11111111-1111-4111-8111-111111111111',map:'tp1',operations:[{kind:'paint'}]};
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
function browser({local=storage(),session=storage(),hash='',run,fetcher}={}){
  const calls=[],navigation=[],reports=[];
  const location={hash,pathname:'/ember/',search:'',assign:u=>navigation.push(u)};
  const context=vm.createContext({console,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,URLSearchParams,btoa,atob,Response,
    localStorage:local,sessionStorage:session,location,history:{replaceState(_a,_b,url){location.hash='';navigation.push(url);}},
    setTimeout:f=>{f();return 1;},open(){throw Error('Sending must not open a window');},
    fetch:async(url,options)=>{
      calls.push({url,options});if(fetcher)return fetcher(url,options);
      if(url.startsWith('assets/'))return Response.json({applied:[]});
      assert(url.startsWith('https://api.github.com/repos/kharrisongit/ember/'));
      assert.equal(options.headers.Authorization,'Bearer github_pat_test');
      if(url.includes('/runs?'))return Response.json({workflow_runs:run?[run]:[]});
      if(url.endsWith('/dispatches'))return Response.json({workflow_run_id:42});
      return Response.json({status:'completed',conclusion:'success'});
    }});
  vm.runInContext(source,context);
  return {api:context.EmberEditDrafts,local,session,calls,navigation,reports,report:(...args)=>reports.push(args)};
}
const linked=()=>{const local=storage();local.setItem(TOKEN,'github_pat_test');return local;};
// Every page load discards editor drafts while preserving game progress/auth.
const oldLocal=linked(),oldSession=storage();
const resetKeys=['emberfell.editor-drafts.v1','emberfell.geometry.v1','emberfell.actor-layout.v1','emberfell.editor-send.v1'];
for(const key of resetKeys)oldLocal.setItem(key,JSON.stringify({old:true}));
oldLocal.setItem('emberfell.save','game progress');oldSession.setItem(PAIR,'old connection draft');
const clean=browser({local:oldLocal,session:oldSession});
for(const key of resetKeys)assert.equal(oldLocal.getItem(key),null);
assert.equal(oldSession.getItem(PAIR),null);assert.equal(oldLocal.getItem('emberfell.save'),'game progress');assert(clean.api.connected());
clean.api.store.put('world',{patch:'new route'});oldLocal.setItem('emberfell.geometry.v1','new geometry');
const freshReload=browser({local:oldLocal,session:oldSession});
assert.equal(freshReload.api.store.get('world'),null);assert.equal(oldLocal.getItem('emberfell.geometry.v1'),null);assert.equal(oldLocal.getItem('emberfell.editor-drafts.v1'),null);assert.equal(clean.api.store.get('world').patch,'new route','Another page cannot erase this tab\'s in-memory edits');
const installedPatch=['EMBERFELL PATCH v3','MAP world',
 'F route 9148 145 111 198 107 5 20 birch - - 145,111;145,67;198,67;198,107',
 'F route 9149 198 104 198 112 5 20 birch - -','F arena 9150 168 67 6.3 birch'].join('\n');
freshReload.api.store.put('world',{patch:installedPatch});freshReload.api.store.put('house01',{patch:'different edits'});
const installedReload=browser({local:oldLocal,session:oldSession});
assert.equal(installedReload.api.store.get('world'),null,'the manually installed route patch no longer blocks editing after refresh');
assert.equal(installedReload.api.store.get('house01'),null,'Every area starts fresh on reload');
let b=browser({local:linked()});assert.equal(b.calls.length,0,'loading and local editing never auto-submit');
await b.api.send({...draft,patch:'Previous COPY history '.repeat(50000)},b.report);
const posts=b.calls.filter(c=>c.options?.method==='POST');assert.equal(posts.length,1);
assert.deepEqual(JSON.parse(posts[0].options.body),{ref:'main',inputs:{submission_id:draft.id,draft:JSON.stringify(draft)}});
assert.equal(b.navigation.length,0);assert.match(b.reports.at(-1)[1],/Changes published/);
assert.equal(b.reports.at(-1)[2].published,true);assert(b.reports.at(-1)[2].patch.startsWith('Previous COPY history'));
assert(!b.reports.find(r=>r[1].startsWith('Sent '))[2].published,'dispatch alone must not clear COPY');
assert.equal(b.local.getItem('emberfell.editor-send.v1'),null);
const existing={id:42,display_title:'Editor moves '+draft.id,status:'in_progress'};
b=browser({local:linked(),run:existing});await b.api.send(draft,b.report);
assert.equal(b.calls.filter(c=>c.options?.method==='POST').length,0,'retry monitors the existing run');
b=browser({local:linked(),run:{...existing,display_title:'Editor moves another-id'}});await b.api.send(draft,b.report);
assert.equal(b.calls.filter(c=>c.options?.method==='POST').length,0,'another area remains local while publishing');
assert.match(b.reports.at(-1)[1],/earlier area/);
b=browser({local:linked(),fetcher:async url=>url.startsWith('assets/')?Response.json({applied:[]}):new Response('{}',{status:401})});
await b.api.send(draft,b.report);assert(!b.api.connected());assert.match(b.reports.at(-1)[1],/expired/);assert.equal(b.navigation.length,0);
b=browser({local:linked(),fetcher:async url=>url.startsWith('assets/')?Response.json({applied:[]}):url.includes('/runs?')?Response.json({workflow_runs:[existing]}):Response.json({status:'completed',conclusion:'failure'})});
b.api.store.put('tp1',{patch:'saved'});await b.api.send(draft,b.report);
assert.equal(b.api.store.get('tp1').patch,'saved');assert.match(b.reports.at(-1)[1],/could not publish/);
let liveChecks=0;
b=browser({local:linked(),fetcher:async url=>url.startsWith('assets/')?Response.json({applied:++liveChecks>=3?[draft.id]:[]}):url.includes('/runs?')?Response.json({workflow_runs:[existing]}):Response.json({status:'completed',conclusion:'cancelled'})});
await b.api.send(draft,b.report);
assert(b.reports.some(r=>r[1].includes('newer game publish')),'A replaced deployment waits for the newer Pages run');
assert(b.reports.at(-1)[2].published,'Only the live receipt confirms that the newer deploy includes these edits');
// A completed return uses only this tab's private key and sends the button's
// saved draft. A copied/expired return cannot connect another browser session.
b=browser();await b.api.send(draft,b.report);assert.equal(b.calls.length,0);
const url=new URL(b.navigation[0]);assert.equal(url.origin,'https://emberfell-edit-inbox.kurtislemaster.chatgpt.site');
const state=url.searchParams.get('state'),spki=url.searchParams.get('key');
const key=await webcrypto.subtle.importKey('spki',Buffer.from(spki,'base64url'),{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
const sealed=Buffer.from(await webcrypto.subtle.encrypt({name:'RSA-OAEP',label:new TextEncoder().encode(state)},key,new TextEncoder().encode('github_pat_test'))).toString('base64');
const packet={state,sealed},hash='#editor-connect='+encodeURIComponent(JSON.stringify(packet));
assert(!hash.includes('github_pat_'));
const returned=browser({local:b.local,session:b.session,hash});
assert.equal(returned.navigation[0],'/ember/','fragment removed before requests');
await returned.api.resume(returned.report);
assert(returned.api.connected());assert.equal(returned.session.getItem(PAIR),null);
assert.equal(returned.calls.filter(c=>c.options?.method==='POST').length,1);
assert.match(returned.reports.at(-1)[1],/Changes published/);
const stranger=browser({hash});await stranger.api.resume(stranger.report);assert(!stranger.api.connected());assert.equal(stranger.calls.length,0);
const pending=browser();await pending.api.send(draft,pending.report);
const expired=JSON.parse(pending.session.getItem(PAIR));expired.expires=0;pending.session.setItem(PAIR,JSON.stringify(expired));
const stale=browser({session:pending.session,hash:'#editor-connect='+encodeURIComponent(JSON.stringify({...packet,state:expired.state}))});
await stale.api.resume(stale.report);assert.equal(stale.calls.length,0);assert(!stale.api.connected());
console.log('PASS: direct manual dispatch without windows, live result, retry, contention, expired auth, retained failed drafts, encrypted same-tab handoff and replay rejection.');
