/* Firebase is loaded independently; a network/auth failure never blocks local play. */
(function(){
  'use strict';
  const store=window.EmberCloudState;if(!store)return;
  const config={apiKey:'AIzaSyBccWY_MTLqHIPUpf1PsX7eSSLXeKJ0GgA',authDomain:'lastdragonridergame.firebaseapp.com',projectId:'lastdragonridergame',storageBucket:'lastdragonridergame.firebasestorage.app',messagingSenderId:'541218797371',appId:'1:541218797371:web:383a05c2e1fb8087c8691e'};
  let sdk=null,auth=null,db=null,user=null,loading=null,busy=false,timer=0,retry=15000,accountBusy=false;
  let status=store.owner?'Offline saves ready · connect to sync':'Device-only saves',opened=false,deleteChoice=null;
  const playing=()=>typeof gameplayStarted!=='undefined'&&gameplayStarted;
  const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
  const dialog=el('dialog');dialog.id='cloudSaveDialog';dialog.setAttribute('aria-labelledby','cloudSaveTitle');
  const title=el('h2','Sign In');title.id='cloudSaveTitle';
  const account=el('p'),message=el('p'),actions=el('div'),slots=el('div'),guest=el('div');message.setAttribute('role','status');
  const button=(label,fn)=>{const b=el('button',label);b.type='button';b.addEventListener('click',()=>{try{Promise.resolve(fn()).catch(fail);}catch(e){fail(e);}});return b;};
  const close=button('Done',()=>dialog.close());close.className='cloud-close';
  const header=el('div');header.className='cloud-header';header.append(title,close);
  const intro=el('p','Sign into Google to save your progress to the cloud and continue on another device. You can also play and save on this device without signing in.');intro.className='cloud-help';
  const help=el('p');help.className='cloud-help';
  account.className='cloud-account';message.className='cloud-status';actions.className='cloud-actions';
  const options=el('details'),optionLabel=el('summary','Account & title screen'),secondary=el('div');secondary.className='cloud-secondary';options.append(optionLabel,secondary);
  const imports=el('details'),importLabel=el('summary','Bring an existing save');imports.append(importLabel,guest);imports.hidden=true;
  const manager=el('details'),manageLabel=el('summary','Manage saves'),saveList=el('div');manager.id='cloudSaveManager';manager.append(manageLabel,saveList);
  dialog.append(header,intro,account,message,help,actions,manager,slots,imports,options);document.body.appendChild(dialog);
  const titleButtons=el('div');titleButtons.id='bootAccountButtons';
  const titleButton=button('Sign In',()=>open());titleButton.id='bootCloud';
  titleButtons.append(titleButton);document.getElementById('bootBtns')?.after(titleButtons);
  const titleStatus=el('span');titleStatus.id='bootCloudStatus';titleButtons.after(titleStatus);
  function summary(raw){
    if(raw===null||!raw)return 'Empty slot';
    try{const s=JSON.parse(raw);return String(s.map).replaceAll('_',' ')+' · '+new Date(s.when).toLocaleString();}catch{return 'Unreadable save';}
  }
  function refreshTitle(){
    if(!playing()&&typeof BOOT!=='undefined'&&BOOT.menuOpen){
      if(BOOT.loading)BOOT.openLoad();
      else BOOT.showMenu();
    }
  }
  function render(){
    titleButton.textContent=user?'Signed In':'Sign In';
    title.textContent=user?'Signed In':'Sign In';
    titleStatus.textContent=status;
    if(!opened)return;
    account.textContent=user?(user.email||user.displayName||'Google account'):store.owner?'Account saves on this device':'Not signed in';
    help.textContent=user&&user.uid===store.owner?'Save normally while playing. Your saves upload automatically when you’re online.':store.owner?'Your saves are kept on this device. Sign in again to sync them.':'Connect Google to carry your progress between devices.';
    message.textContent=status;actions.replaceChildren();slots.replaceChildren();guest.replaceChildren();secondary.replaceChildren();saveList.replaceChildren();
    saveList.append(el('p',store.owner?'Account save slots · deletions sync to Google when connected.':'Save slots on this device.'));
    for(let slot=1;slot<=3;slot++){
      const raw=localStorage.getItem(store.key(slot)),current=playing()&&slot===activeSaveSlot;
      const box=el('section');box.append(el('h3','Slot '+slot+(current?' · Current game':'')),el('p',summary(raw)));
      if(raw!==null){
        const blocked=current||busy||accountBusy||store.conflicts.has(slot);
        if(current)box.append(el('p','Save and exit to the title screen before deleting the current game.'));
        if(store.conflicts.has(slot))box.append(el('p','Choose which version to keep below before deleting this slot.'));
        if(deleteChoice?.slot===slot&&deleteChoice.owner===store.owner){
          box.append(el('p',store.owner?'Delete this save from this device and your Google cloud saves? This cannot be undone.':'Delete this save from this device? This cannot be undone.'));
          const confirm=button('Delete slot '+slot,()=>{
            const choice=deleteChoice;
            if(!choice||choice.owner!==store.owner||localStorage.getItem(store.key(slot))!==choice.raw){deleteChoice=null;status='The save changed. Review it before deleting.';render();return;}
            if(busy||accountBusy||store.conflicts.has(slot)||(playing()&&slot===activeSaveSlot))return;
            deleteChoice=null;
            if(!deleteSaveSlot(slot)){status='Could not delete this save. Please try again.';render();return;}
            status=store.owner?'Slot '+slot+' deleted on this device · waiting to sync':'Slot '+slot+' deleted';
            refreshTitle();render();if(store.owner)flush();
          });confirm.disabled=blocked;
          box.append(confirm,button('Cancel',()=>{deleteChoice=null;render();}));
        }else{
          const remove=button('Delete…',()=>{deleteChoice={slot,owner:store.owner,raw};render();});remove.disabled=blocked;box.append(remove);
        }
      }
      saveList.append(box);
    }
    options.hidden=!user&&!playing();imports.hidden=true;
    optionLabel.textContent=playing()?'Account & title screen':'Account';
    if(!user){
      const sign=button(sdk?'Sign in with Google':loading?'Loading Google sign-in…':'Connect Google',()=>sdk?signIn():init());sign.disabled=!!loading||accountBusy||playing();actions.append(sign);
    }else{
      const sync=button('Sync now',()=>flush(true));sync.disabled=busy;actions.append(sync);
      const out=button('Sign out',signOut);out.disabled=playing()||busy||accountBusy;secondary.append(out);
    }
    if(playing()){
      secondary.append(el('p','Switch accounts or choose a cloud version at the title screen. Exiting saves on this device and reloads the game.'));
      secondary.append(button('Save & exit to title',()=>{if(saveToSlot(activeSaveSlot,true))location.reload();}));
    }
    for(const [slot,remote] of store.conflicts){
      const box=el('section');box.append(el('h3','Slot '+slot+' has two versions'),el('p','This device: '+summary(localStorage.getItem(store.key(slot)))),el('p','Cloud: '+summary(remote?.deleted?null:remote?.saveJson)));
      const local=button('Keep this device version',()=>{store.keepDevice(slot);return flush();});
      const cloud=button('Use cloud version',async()=>{await store.useCloud(slot,transport,()=>!playing());refreshTitle();render();});
      local.disabled=cloud.disabled=playing()||busy;box.append(local,cloud);slots.append(box);
    }
    if(user&&user.uid===store.owner&&!playing()&&!busy){
      for(let slot=1;slot<=3;slot++){
        const raw=localStorage.getItem(store.key(slot,''));if(!window.EmberCloudSaveValid(raw))continue;
        // Existing device-only saves are offered explicitly; never silently assigned to an account.
        imports.hidden=false;
        const box=el('section');box.append(el('h3','Device save · Slot '+slot),el('p',summary(raw)),button('Copy to account',()=>{
          const target=store.importGuest(slot);status=target?'Copied to account slot '+target:'All account slots are occupied. Your device-only save is unchanged.';render();
        }));guest.append(box);
      }
    }
  }
  function fail(error){
    console.warn('Cloud saves:',error?.code||error?.message||error);
    const code=error?.code||'';
    status=code.includes('unauthorized-domain')?'Google sign-in is not enabled for this game address yet.':
      code.includes('operation-not-allowed')?'Google sign-in still needs to be enabled in Firebase.':
      code.includes('permission-denied')?'Cloud saves need their private database rules enabled. Your local saves are safe.':
      code.includes('popup-blocked')?'Allow the Google sign-in popup, or open Ember in Safari or Chrome.':
      code.includes('popup-closed')||code.includes('cancelled-popup')?'Sign-in cancelled. Device saves are unchanged.':
      code.includes('resource-exhausted')?'Cloud quota reached. Saves remain on this device until syncing is available.':
      'Cloud unavailable · saved on this device. Try Sync now when connected.';
    render();
  }
  const transport={async transact(uid,slot,decide){
    if(!user||user.uid!==uid||auth.currentUser?.uid!==uid)throw Error('Account changed');
    const ref=sdk.doc(db,'players',uid,'saves',String(slot));
    return sdk.runTransaction(db,async tx=>{
      const snap=await tx.get(ref),result=decide(snap.exists()?snap.data():null);
      if(result.write)tx.set(ref,{...result.write,updatedAt:sdk.serverTimestamp()});
      return result;
    });
  }};
  function schedule(delay=15000){clearTimeout(timer);timer=setTimeout(()=>flush(),delay);}
  async function flush(all=false){
    if(busy||!sdk||!user||user.uid!==store.owner)return;
    if(navigator.onLine===false){status='Offline · waiting to sync';render();return;}
    busy=true;status='Syncing…';render();
    try{
      for(const slot of all?[1,2,3]:store.dirtySlots()){
        if(store.conflicts.has(slot))continue;
        await store.syncSlot(slot,transport,()=>!playing());
      }
      retry=15000;
      status=store.conflicts.size?'Choose which save to keep':store.dirtySlots().length?'Saved on device · waiting to sync':'Saved to cloud';
      refreshTitle();
    }catch(e){fail(e);retry=Math.min(retry*2,300000);}
    finally{busy=false;render();if(store.dirtySlots().some(n=>!store.conflicts.has(n)))schedule(retry);}
  }
  async function init(){
    if(loading)return loading;if(sdk)return;
    status='Connecting to Google…';render();
    loading=(async()=>{
      const base='https://www.gstatic.com/firebasejs/12.19.0/';
      const [app,a,f]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
      sdk={...a,...f};const firebaseApp=app.initializeApp(config);auth=a.getAuth(firebaseApp);db=f.getFirestore(firebaseApp);
      a.onAuthStateChanged(auth,current=>{
        user=current;
        if(current){
          if(store.owner!==current.uid){
            if(playing()){status='Return to the title screen to activate this Google account.';render();return;}
            store.activate(current.uid);
          }
          status='Connected · checking saves';render();flush(true);
        }else{status=store.owner?'Offline account saves · sign in to sync':'Device-only saves';render();}
      },fail);
      status='Google sign-in ready';render();
    })().catch(e=>{sdk=null;fail(e);}).finally(()=>{loading=null;render();});
    return loading;
  }
  function signIn(){
    if(!sdk||playing()||accountBusy)return;
    accountBusy=true;
    const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
    // The popup opens directly from the button gesture (important on mobile Safari).
    return sdk.signInWithPopup(auth,provider).catch(fail).finally(()=>{accountBusy=false;render();});
  }
  async function signOut(){
    if(playing()||busy)return;
    accountBusy=true;
    try{await sdk.signOut(auth);user=null;store.activate('');status='Signed out · device-only saves';refreshTitle();}
    finally{accountBusy=false;render();}
  }
  function open(manageOnly=false){opened=true;deleteChoice=null;dialog.showModal();render();if(!manageOnly)init();}
  function manage(){manager.open=true;open(true);manager.scrollIntoView?.({block:'nearest'});}
  dialog.addEventListener('close',()=>{opened=false;deleteChoice=null;});
  window.addEventListener('keydown',e=>{if(opened){e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();dialog.close();}}},true);
  window.addEventListener('online',()=>{if(sdk)flush(true);else if(store.owner)init();});
  window.addEventListener('storage',e=>{if(e.key?.startsWith('emberfell.account.')){render();schedule();}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();else if(user)flush(true);});
  store.onChange=()=>render();store.onDirty=()=>{status='Saved on device · waiting to sync';render();schedule();};
  window.EmberCloud={open,manage,isOpen:()=>opened,isSignedIn:()=>!!user,accountBusy:()=>accountBusy,sync:()=>flush(true)};
  render();if(store.owner)init();
})();
