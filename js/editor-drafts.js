/* Manual edit transfer. Drafts live only for the current page session. */
(function (root) {
  'use strict';
  const KEY = 'emberfell.editor-drafts.v1';
  // Every game load starts clean. Keep game progress and the GitHub connection,
  // but never restore editor drafts, geometry or a previous send's COPY text.
  try{
    for(const key of [KEY,'emberfell.geometry.v1','emberfell.actor-layout.v1','emberfell.editor-send.v1'])root.localStorage.removeItem(key);
    if(!root.location?.hash.startsWith('#editor-connect='))root.sessionStorage?.removeItem('emberfell.editor-pair.v1');
  }catch(_){}
  const INBOX = 'https://emberfell-edit-inbox.kurtislemaster.chatgpt.site';
  const clone = value => Array.isArray(value) ? value.map(clone) : value && Object.getPrototypeOf(value) === Object.prototype ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])) : value;
  function fingerprint(value) {
    const text = JSON.stringify(value); let a = 2166136261, b = 5381;
    for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ text.charCodeAt(i); }
    return (a >>> 0).toString(16) + '-' + (b >>> 0).toString(16) + '-' + text.length;
  }
  function createStore() {
    const state = Object.create(null);
    return {
      get: id => state[id] ? clone(state[id]) : null,
      put(id, value) { state[id] = clone(value); },
      remove(id) { delete state[id]; },
    };
  }
  const store = createStore();
  const TOKEN='emberfell.editor-github.v1', PAIR='emberfell.editor-pair.v1', ACTIVE='emberfell.editor-send.v1';
  const API='https://api.github.com/repos/kharrisongit/ember';
  const WORKFLOW='/actions/workflows/apply-editor-moves.yml';
  const b64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const unb64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
  const read=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null');}catch(_){return null;}};
  const connected=()=>{try{return !!root.localStorage.getItem(TOKEN);}catch(_){return false;}};
  let busy=false, connectionReturn=null;
  // Strip the sealed fragment before any requests or game initialization.
  if(root.location?.hash.startsWith('#editor-connect=')){
    try{connectionReturn=JSON.parse(decodeURIComponent(root.location.hash.slice(16)));}catch(_){}
    root.history.replaceState(null,'',root.location.pathname+root.location.search);
  }
  async function connect(draft){
    const keys=await root.crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
    const state=root.crypto.randomUUID();
    const key=b64(await root.crypto.subtle.exportKey('spki',keys.publicKey)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const pending={state,privateKey:await root.crypto.subtle.exportKey('jwk',keys.privateKey),expires:Date.now()+15*60*1000,draft};
    root.sessionStorage.setItem(PAIR,JSON.stringify(pending));
    root.location.assign(INBOX+'/connect-game?'+new URLSearchParams({state,key}));
  }
  async function request(path,body){
    const token=root.localStorage.getItem(TOKEN);
    if(!token)throw Error('GitHub is disconnected. Press SEND CHANGES to reconnect.');
    const response=await root.fetch(API+path,{method:body?'POST':'GET',credentials:'omit',cache:'no-store',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    if(response.status===401){root.localStorage.removeItem(TOKEN);throw Error('GitHub connection expired. Press SEND CHANGES to reconnect. Your edits remain in this tab.');}
    if(!response.ok)throw Error(response.status===403?'GitHub denied this request. Check Actions: Read and write on the connection. Your edits remain in this tab.':'GitHub could not accept the request ('+response.status+'). Your edits remain in this tab; try SEND CHANGES again.');
    return response.status===204?{}:response.json();
  }
  async function published(id){
    const r=await root.fetch('assets/editor-layouts.json?submission='+encodeURIComponent(id)+'&t='+Date.now(),{cache:'no-store'});
    return r.ok&&(await r.json()).applied?.includes(id);
  }
  const pause=()=>new Promise(resolve=>root.setTimeout(resolve,5000));
  async function encodeDraft(draft){
    const text=JSON.stringify(draft);
    if(new TextEncoder().encode(text).length<=48000)return text;
    if(!root.CompressionStream)throw Error('This browser needs an update to send large Build changes. Your edits remain in this tab.');
    const stream=new Blob([text]).stream().pipeThrough(new root.CompressionStream('gzip'));
    const bytes=new Uint8Array(await new Response(stream).arrayBuffer());
    if(bytes.length>44000)throw Error('This batch is larger than GitHub can receive in one send. Reduce its size before sending; your edits remain in this tab.');
    return 'gzip:'+b64(bytes);
  }
  async function monitor(record,result){
    const started=Date.now();let misses=0,waitingForPages=false;
    while(Date.now()-started<15*60*1000){
      let run;
      try{run=await request('/actions/runs/'+record.runId);misses=0;}catch(e){
        if(!connected()||++misses>=3)throw e;
        await pause();continue;
      }
      if(run.status==='completed'){
        root.localStorage.removeItem(ACTIVE);
        if(run.conclusion!=='success'&&!await published(record.id)){
          // GitHub keeps one queued Pages deployment. A newer code deploy may
          // replace ours after the editor commit; that deploy includes our data.
          if(run.conclusion==='cancelled'){
            if(!waitingForPages)result(true,'A newer game publish is finishing. Checking that your edits are live…',record);
            waitingForPages=true;await pause();continue;
          }
          throw Error('GitHub could not publish these edits. Your edits remain in this tab. Open the check for details, then retry.');
        }
        result(true,'Changes published. You can keep editing and send again.',{...record,published:true});return;
      }
      await pause();
    }
    throw Error('GitHub is still working. Press SEND CHANGES to check again. Your edits remain in this tab.');
  }
  async function send(draft,result){
    if(busy){result(false,'A send is already being checked. Your new edits remain in this tab.');return;}
    busy=true;let record=null;
    try{
      if(!connected()){
        result(false,'Connecting this device once. Your edits remain in this tab.');
        await connect(draft);return;
      }
      result(false,'Sending '+draft.map+'…');
      record={id:draft.id,map:draft.map,patch:draft.patch};
      if(await published(draft.id)){result(true,'These changes are already published. Refresh when you are ready.',{...record,published:true});return;}
      const data=await request(WORKFLOW+'/runs?event=workflow_dispatch&per_page=100');
      const runs=data.workflow_runs||[];
      // Reuse the same workflow on retries, including after a reload or lost response.
      const existing=runs.find(run=>run.display_title==='Editor moves '+draft.id);
      if(existing?.status==='completed'&&existing.conclusion==='success'){
        result(true,'These changes are already published. Refresh when you are ready.',{...record,published:true});return;
      }
      if(runs.some(run=>run.status!=='completed'&&run.id!==existing?.id))throw Error('GitHub is publishing an earlier area. Wait for it to finish, then send this area. Your edits remain in this tab.');
      let runId=existing?.status!=='completed'?existing?.id:null;
      if(!runId){
        // COPY text duplicates the structured operations and can contain very
        // large terrain/scenery listings. GitHub only needs the operations.
        const {patch,...payload}=draft;
        const dispatched=await request(WORKFLOW+'/dispatches',{ref:'main',inputs:{submission_id:draft.id,draft:await encodeDraft(payload)}});
        runId=dispatched.workflow_run_id;
      }
      if(!Number.isSafeInteger(runId)||runId<1)throw Error('Sent, but GitHub did not return its check number. Press SEND CHANGES to check again; your edits remain in this tab.');
      record={...record,runId,runUrl:'https://github.com/kharrisongit/ember/actions/runs/'+runId};
      try{root.localStorage.setItem(ACTIVE,JSON.stringify(record));}catch(_){}
      result(true,'Sent '+draft.map+'. GitHub is checking and publishing your edits. You can keep playing.',record);
      await monitor(record,result);
    }catch(e){result(false,e.message||'Could not send. Your edits remain in this tab.',record);}
    finally{busy=false;}
  }
  async function resume(result){
    if(connectionReturn){
      const packet=connectionReturn;connectionReturn=null;
      const pending=read(root.sessionStorage,PAIR);
      root.sessionStorage.removeItem(PAIR);
      try{
        if(!pending||pending.state!==packet.state||pending.expires<Date.now())throw Error('Connection handoff expired. Press SEND CHANGES to try again.');
        const key=await root.crypto.subtle.importKey('jwk',pending.privateKey,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);
        const token=new TextDecoder().decode(await root.crypto.subtle.decrypt({name:'RSA-OAEP',label:new TextEncoder().encode(pending.state)},key,unb64(packet.sealed)));
        if(!/^github_pat_[A-Za-z0-9_]+$/.test(token))throw Error('Invalid GitHub connection.');
        root.localStorage.setItem(TOKEN,token);
        await send(pending.draft,result);
      }catch(e){result(false,e.message||'Could not finish connecting. Your edits remain in this tab.');}
      return;
    }
    const record=read(root.localStorage,ACTIVE);
    if(record&&Number.isSafeInteger(record.runId)&&record.runId>0&&connected()&&!busy){
      busy=true;
      try{result(true,'GitHub is checking your previous send…',record);await monitor(record,result);}
      catch(e){result(false,e.message,record);}finally{busy=false;}
    }
  }
  root.EmberEditDrafts = {clone,fingerprint,createStore,store,send,resume,connected,encodeDraft,
    disconnect(){root.localStorage.removeItem(TOKEN);root.sessionStorage.removeItem(PAIR);},
    version:'20260925-fresh-editor',sourceRevision:'__EDITOR_SOURCE_REVISION__',inbox:INBOX};
})(globalThis);
