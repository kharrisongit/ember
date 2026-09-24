/* Manual edit transfer. No network requests are made by local draft saves. */
(function (root) {
  'use strict';
  const KEY = 'emberfell.editor-drafts.v1';
  const INBOX = 'https://emberfell-edit-inbox.kurtislemaster.chatgpt.site';
  const clone = value => Array.isArray(value) ? value.map(clone) : value && Object.getPrototypeOf(value) === Object.prototype ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])) : value;
  function fingerprint(value) {
    const text = JSON.stringify(value); let a = 2166136261, b = 5381;
    for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ text.charCodeAt(i); }
    return (a >>> 0).toString(16) + '-' + (b >>> 0).toString(16) + '-' + text.length;
  }
  function createStore(storage) {
    let state;
    try { state = JSON.parse(storage.getItem(KEY) || '{}'); } catch (_) { state = {}; }
    if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
    const save = () => storage.setItem(KEY, JSON.stringify(state));
    return {
      get: id => state[id] ? clone(state[id]) : null,
      put(id, value) { state[id] = clone(value); save(); },
      remove(id) { delete state[id]; save(); },
    };
  }
  let store;
  try { store = createStore(root.localStorage); } catch (_) { store = createStore({getItem:()=>null,setItem:()=>{throw Error('Local storage unavailable');}}); }
  let transfer = null;
  function send(draft, result) {
    if (transfer) { result(false, 'A send window is already open. Finish or close it first.'); return; }
    const nonce = root.crypto.randomUUID();
    const packet=btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(draft))));
    const popup = root.open(INBOX + '/?transfer=' + nonce + '#draft=' + encodeURIComponent(packet), 'emberfell-edit-inbox', 'popup,width=520,height=660');
    if (!popup) { result(false, 'Allow the send window, then tap SEND CHANGES again. Your draft is safe.'); return; }
    let sent = false;
    const finish = (ok, message) => {
      root.removeEventListener('message', receive); clearInterval(timer); transfer = null; result(ok, message);
    };
    const receive = e => {
      if (e.origin !== INBOX || e.source !== popup || e.data?.nonce !== nonce) return;
      if (e.data.type === 'emberfell-ready' && !sent) {
        sent = true; popup.postMessage({type:'emberfell-draft', nonce, draft}, INBOX);
      } else if (e.data.type === 'emberfell-received' && e.data.id === draft.id) {
        finish(true, 'Sent ' + draft.map + '. GitHub is checking and publishing your moves.');
      } else if (e.data.type === 'emberfell-send-error') finish(false, e.data.error || 'Send failed. Your local draft is safe.');
    };
    root.addEventListener('message', receive);
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 300000) finish(false, 'Publish was not confirmed. Reopen SEND CHANGES to check; your draft is safe.');
    }, 750);
    // A browser may isolate the sign-in window and remove its opener. In that
    // case the private sender asks for one explicit confirmation, and the game
    // can still recognize the completed deployment through its own public data.
    const publishPoll=setInterval(async()=>{
      if(!transfer){clearInterval(publishPoll);return;}
      try{const r=await root.fetch('assets/editor-layouts.json?submission='+draft.id+'&t='+Date.now());if(r.ok&&(await r.json()).applied?.includes(draft.id)){clearInterval(publishPoll);finish(true,'Moves published. Refresh the game when you are ready.');}}catch(_){}
    },10000);
    transfer = { popup };
  }
  root.EmberEditDrafts = { clone, fingerprint, createStore, store, send, version:'20260924-manual-edits-1', sourceRevision:'__EDITOR_SOURCE_REVISION__', inbox:INBOX };
})(globalThis);
