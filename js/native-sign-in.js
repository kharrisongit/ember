import {seal,decode} from './native-sign-in-crypto.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
const button=document.getElementById('signIn'),status=document.getElementById('status'),back=document.getElementById('back');
const params=new URLSearchParams(location.hash.slice(1)),state=params.get('state'),key=params.get('key');
const config={apiKey:'AIzaSyBccWY_MTLqHIPUpf1PsX7eSSLXeKJ0GgA',authDomain:'lastdragonridergame.firebaseapp.com',projectId:'lastdragonridergame',storageBucket:'lastdragonridergame.firebasestorage.app',messagingSenderId:'541218797371',appId:'1:541218797371:web:383a05c2e1fb8087c8691e'};
// Use the same existing Firebase project and Google web sign-in as the game.
try {
  if(!state||!/^[A-Fa-f0-9-]{72}$/.test(state)||!key||decode(key).length!==65)throw Error('Open Sign In from the installed game to continue.');
  const auth=getAuth(initializeApp(config));
  button.disabled=false;status.textContent='After Google sign-in, you will return to the game.';
  button.onclick=async()=>{
    button.disabled=true;status.textContent='Waiting for Google…';
    try {
      const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
      const result=await signInWithPopup(auth,provider);
      const token=GoogleAuthProvider.credentialFromResult(result)?.idToken;
      if(!token)throw Error('Google did not return a sign-in credential. Please try again.');
      const encrypted=await seal(token,key,state);
      const fragment=new URLSearchParams({state,...encrypted});
      const callback='com.kharrison.lastdragonrider://signin#'+fragment;
      back.href=callback;back.hidden=false;status.textContent='Signed in. Returning to The Last Dragonrider…';
      location.replace(callback);
    } catch(error) {
      status.textContent=error.code==='auth/popup-closed-by-user'?'Sign-in cancelled. You can try again.':
        'Sign-in did not finish. Allow the Google sign-in window and try again.';
      button.disabled=false;
    }
  };
} catch(error) { status.textContent=error.message; }
