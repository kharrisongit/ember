/* Native-only: the bundled game keeps its normal web behavior everywhere else. */
(() => {
  'use strict';
  window.LDRNativeApp = true;
  let pending;
  window.LDRNativeSignIn = () => {
    if (pending) return Promise.reject(new Error('Sign-in is already open.'));
    return new Promise((resolve, reject) => {
      pending = {resolve, reject};
      window.webkit.messageHandlers.ldrSignIn.postMessage('signIn');
    });
  };
  window.LDRNativeFinishSignIn = result => {
    const request = pending; pending = null;
    if (!request) return;
    if (result.error) request.reject(new Error(result.error));
    else request.resolve(result.token);
  };
  // The native app already fills the screen; preserve the game's standalone layout.
  try { Object.defineProperty(navigator, 'standalone', {value: true}); } catch {}
})();
