import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const nodes=new Map();
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.textContent='';this.hidden=false;this.disabled=false;this.open=false;}
 set id(id){this._id=id;nodes.set(id,this);}get id(){return this._id;}
 setAttribute(){}addEventListener(type,fn){this.listeners[type]=fn;}
 append(...children){this.children.push(...children);}appendChild(child){this.append(child);}
 after(){}replaceChildren(...children){this.children=children;}scrollIntoView(){}
 showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}
 click(){if(!this.disabled)this.listeners.click?.();}
}
const storage=new Map(),save=n=>JSON.stringify({map:'world',x:728,y:5984,quest:8,when:n});
let nonce=0,authNotify,connectionCount=0,refreshes=0;
const auth={currentUser:null};
const c=vm.createContext({console:{warn(){}},crypto:{randomUUID:()=>String(++nonce)},
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
 document:{body:new Element('body'),createElement:tag=>new Element(tag),getElementById:id=>nodes.get(id),addEventListener(){}},
 navigator:{onLine:true},addEventListener(){},setTimeout(){},clearTimeout(){},gameplayStarted:false,
 activeSaveSlot:1,toast(){},refreshOvl(){refreshes++;},BOOT:{menuOpen:false,loading:false},
 loadFirebase:async()=>{connectionCount++;return [
  {initializeApp:()=>({})},
  {getAuth:()=>auth,onAuthStateChanged:(a,fn)=>{authNotify=fn;fn(null);},GoogleAuthProvider:class{setCustomParameters(){}},
   signInWithPopup:async()=>{auth.currentUser={uid:'test-account',email:'player@example.test'};authNotify(auth.currentUser);},
   signOut:async()=>{auth.currentUser=null;authNotify(null);}},
  {getFirestore:()=>({}),doc:()=>({}),serverTimestamp:()=>0,runTransaction:async(db,fn)=>fn({get:async()=>({exists:()=>false}),set(){}})}];}
});c.window=c;const run=code=>vm.runInContext(code,c);
const boot=new Element('div');boot.id='bootBtns';
run(read('js/cloud-save-core.js'));
const p3=read('js/generated/game-part-3.js');
run(p3.slice(p3.indexOf('function deleteSaveSlot('),p3.indexOf('function saveSlotItems(')));
// Inject the network boundary; exercise the actual controls and auth callbacks.
run(read('js/cloud-saves.js').replace("await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')])",'await window.loadFirebase()'));
const all=(root=c.document.body)=>[root,...root.children.flatMap(n=>all(n))];
const button=text=>all().find(n=>n.tagName==='button'&&n.textContent===text);
const tick=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
const key=slot=>c.EmberCloudState.key(slot);
assert.equal(nodes.get('bootCloud').textContent,'Sign In');
storage.set(key(1),save(1));storage.set('emberfell.save',save(1));
c.EmberCloud.manage();assert(nodes.get('cloudSaveManager').open);assert.equal(connectionCount,0);
button('Delete…').click();assert(storage.has(key(1)));button('Cancel').click();assert(storage.has(key(1)));
button('Delete…').click();storage.set(key(1),save(2));button('Delete slot 1').click();assert.equal(storage.get(key(1)),save(2),'Changed saves require a fresh confirmation');
button('Delete…').click();button('Delete slot 1').click();assert(!storage.has(key(1)));assert.equal(storage.get('emberfell.save.migrated'),'1');
assert(refreshes>0);
storage.set(key(1),save(3));c.gameplayStarted=true;c.EmberCloud.manage();assert(button('Delete…').disabled,'An active autosaving slot cannot be deleted');
c.gameplayStarted=false;c.EmberCloud.open();await tick();
assert(all().some(n=>n.textContent.includes('Sign into Google to save your progress')));
button('Sign in with Google').click();await tick();
assert.equal(nodes.get('bootCloud').textContent,'Signed In');assert.equal(nodes.get('cloudSaveTitle').textContent,'Signed In');assert(c.EmberCloud.isSignedIn());
button('Sign out').click();await tick();assert.equal(nodes.get('bootCloud').textContent,'Sign In');assert(!c.EmberCloud.isSignedIn());
console.log('PASS: offline management, delete confirmation/cancellation, stale-choice protection, active-save protection, Google explanation, and signed-in/out labels.');
