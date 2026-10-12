// Browser/app envelope: P-256 ECDH → HKDF-SHA256 → AES-256-GCM.
// Only the in-progress native authentication session holds the decryption key.
export const encode = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
export const decode = text => {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) throw Error('Invalid sign-in key.');
  return Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')), c=>c.charCodeAt(0));
};
export async function seal(token, publicKey, state) {
  const subtle=globalThis.crypto.subtle, utf8=new TextEncoder();
  const pair=await subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);
  const peer=await subtle.importKey('raw',decode(publicKey),{name:'ECDH',namedCurve:'P-256'},false,[]);
  const secret=await subtle.deriveBits({name:'ECDH',public:peer},pair.privateKey,256);
  const material=await subtle.importKey('raw',secret,'HKDF',false,['deriveKey']);
  const key=await subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:utf8.encode(state),
    info:utf8.encode('ldr-native-sign-in-v1')},material,{name:'AES-GCM',length:256},false,['encrypt']);
  const iv=globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted=new Uint8Array(await subtle.encrypt({name:'AES-GCM',iv},key,utf8.encode(token)));
  const box=new Uint8Array(iv.length+encrypted.length);box.set(iv);box.set(encrypted,iv.length);
  return {key:encode(await subtle.exportKey('raw',pair.publicKey)),box:encode(box)};
}
