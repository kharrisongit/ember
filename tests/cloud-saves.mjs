import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../js/cloud-save-core.js',import.meta.url),'utf8');
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
const c=vm.createContext({console,localStorage:storage(),crypto:{randomUUID:()=>String(Math.random())}});vm.runInContext(source,c);
let nonce=0;
const make=()=>new c.EmberCloudSaveStore(storage(),{makeId:()=>String(++nonce)});
const save=n=>JSON.stringify({map:'world',quest:9,x:100,y:100,when:n,gold:n});
const database=new Map();let writes=0;
const backend={async transact(uid,slot,decide){const key=uid+'/'+slot,result=decide(database.get(key)||null);if(result.write){database.set(key,{...result.write});writes++;}return result;}};
const put=(store,slot,n)=>{store.storage.setItem(store.key(slot),save(n));store.saved(slot);};
const a=make();a.storage.setItem(a.key(1),save(1));a.activate('alice');assert.equal(a.storage.getItem(a.key(1)),null);assert.equal(a.importGuest(1),1);
await a.syncSlot(1,backend);assert.equal(a.meta(1).dirty,false);assert.equal(database.get('alice/1').saveJson,save(1));
const b=make();b.activate('alice');await b.syncSlot(1,backend);assert.equal(b.storage.getItem(b.key(1)),save(1));
// Divergent devices must never silently overwrite each other.
put(a,1,2);put(b,1,3);await a.syncSlot(1,backend);await b.syncSlot(1,backend);assert(b.conflicts.has(1));assert.equal(database.get('alice/1').saveJson,save(2));assert.equal(b.storage.getItem(b.key(1)),save(3));
b.keepDevice(1);await b.syncSlot(1,backend);assert.equal(database.get('alice/1').saveJson,save(3));assert(b.storage.getItem(b.key(1)+'.backups').includes('gold'));
// An acknowledgement lost on reload is idempotent.
put(b,1,4);const pending=b.meta(1);await b.syncSlot(1,backend);const count=writes;b.setMeta(1,pending);await b.syncSlot(1,backend);assert.equal(writes,count);assert.equal(b.meta(1).dirty,false);
// A save made while uploading is not accidentally marked synced or discarded.
put(b,1,5);await b.syncSlot(1,{async transact(uid,slot,decide){const result=await backend.transact(uid,slot,decide);put(b,1,6);return result;}});assert(b.meta(1).dirty);await b.syncSlot(1,backend);assert.equal(database.get('alice/1').saveJson,save(6));
// Do not download over an active game, even if that game's slot is still empty.
const d=make();d.activate('alice');await d.syncSlot(1,backend,()=>false);assert(d.conflicts.has(1));assert.equal(d.storage.getItem(d.key(1)),null);
await d.useCloud(1,backend);assert.equal(d.storage.getItem(d.key(1)),save(6));
// A second cloud change invalidates an old conflict choice.
put(d,1,7);put(b,1,8);await b.syncSlot(1,backend);await d.syncSlot(1,backend);put(b,1,9);await b.syncSlot(1,backend);assert.equal(await d.useCloud(1,backend),false);assert.equal(d.storage.getItem(d.key(1)),save(7));assert.equal(await d.useCloud(1,backend),true);assert.equal(d.storage.getItem(d.key(1)),save(9));
// Versioned deletion and stale offline progress also produce a conflict.
b.storage.removeItem(b.key(1));b.saved(1);await b.syncSlot(1,backend);assert(database.get('alice/1').deleted);put(d,1,10);await d.syncSlot(1,backend);assert(d.conflicts.has(1));await d.useCloud(1,backend);assert.equal(d.storage.getItem(d.key(1)),null);
// Network failure leaves both data and the pending marker intact across reload.
put(d,2,11);await assert.rejects(d.syncSlot(2,{transact:async()=>{throw Error('offline');}}));const restored=new c.EmberCloudSaveStore(d.storage);assert.equal(restored.owner,'alice');assert(restored.meta(2).dirty);await restored.syncSlot(2,backend);assert.equal(database.get('alice/2').saveJson,save(11));
// Another account sees only its own local slots and cloud documents.
restored.activate('bob');assert.equal(restored.storage.getItem(restored.key(2)),null);await restored.syncSlot(2,backend);assert(!database.has('bob/2'));put(restored,1,12);await restored.syncSlot(1,backend);assert.equal(database.get('bob/1').saveJson,save(12));restored.activate('alice');assert.equal(restored.storage.getItem(restored.key(2)),save(11));
// Reject malformed cloud payloads and preserve the local save.
database.set('alice/3',{format:1,revision:'bad',deleted:false,saveJson:'{"map":null}'});await assert.rejects(restored.syncSlot(3,backend));assert.equal(restored.storage.getItem(restored.key(3)),null);
assert.throws(()=>restored.key(4));
console.log('PASS: account isolation, guest import, two-device conflicts, idempotent retry, in-flight saves, active-game protection, conflict revalidation, deletions, offline recovery and malformed data rejection.');
